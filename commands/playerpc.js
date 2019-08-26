const rp = require("request-promise");
const r = require("rethinkdb");
const pool = require("../functions/rethinkdb");
const AsciiTable = require('ascii-table');
const uniqid = require('uniqid');
const Discord = require("discord.js");
const asyncRedis = require("async-redis");
const { redis } = require('../config');
redis.db = 2;
const clientRedis = asyncRedis.createClient(redis);

clientRedis.on("error", (err) => {
    console.log(`${err}`);
})

exports.run = async (client, message, args) => {
    let url;
    const channel = message.channel;
    const user = message.author;
    const guild = message.guild;
    const rarityString = await getRarityString();
    const filter = m => m.author.id === user.id;

    switch (true) {
        case args.length === 1:
            url = `https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22name%22:%22${args[0]}%22,%22quality%22:%22${rarityString}%22%7D`;
            break;
        case args.length === 2:
            if (isFinite(args[1])) url = `https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22name%22:%22${args[0]}%22,%22quality%22:%22${rarityString}%22,%22ovr%22:%22${args[1]}%22%7D`;
            if (isNaN(args[1])) url = `https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22name%22:%22${args[0]}%20${args[1]}%22,%22quality%22:%22${rarityString}%22%7D`;
            break;
        case args.length > 2:
            if (isNaN(args[2])) return channel.send("Your 3th argument is incorrect, it must be a number.");
            url = `https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22name%22:%22${args[0]}%20${args[1]}%22,%22quality%22:%22${rarityString}%22,%22ovr%22:%22${args[2]}%22%7D`;
            break;
        default:
            return channel.send("Your request does not meet the requirements of the command.");
    };

    const request = await requestPlayerData(url);
    const uid = uniqid();
    let playerData;
    let prices;
    let embed;

    switch (true) {
        case request.totalResults === 1:
            if (await getDataRedis(request.items[0].id)) {
                playerData = await getDataRedis(request.items[0].id);
                embed = await fillInEmbed(playerData);
            } else {
                prices = await getPlayerPrices(request.items[0].id);
                playerData = await formatPlayerData(request, prices);
                await clientRedis.setex(`${playerData.id}`, 300, JSON.stringify(playerData))
            }

            embed = await fillInEmbed(playerData);

            break;
        case request.totalResults > 1:
            const arr = await makeArrOfRemainingPlayers(request);
            let checkCrit;
            let checkTime;

            channel.send(await makeOptionMenu(arr), {
                split: true,
                code: true
            }).then(m => m.delete(25000));

            channel.send("Make a choice by entering a number... This will expire within 25 seconds...\nType `cancel` to cancel the request.", {
                split: true
            }).then(m => m.delete(25000));

            await channel.awaitMessages(filter, {
                max: 1,
                time: 25000
            }).then(async collected => {
                const res = collected.first().content.toLowerCase();

                if (res === 'cancel') return channel.send("Cancelled.");

                if (1 <= res && res <= request.totalResults) {
                    let choice = 0;
                    for (n = 0; n < arr.length; n++) {
                        choice++;
                        if (choice == res) {
                            const opt = {
                                baseId: `${arr[n].baseId}`,
                                playerId: `${arr[n].playerId}`,
                                guildId: guild.id
                            };
                            await clientRedis.setex(`${uid}`, 5, JSON.stringify(opt))
                            break;
                        }
                    }
                    collected.first().delete();
                } else {
                    throw "#1721";
                }
            }).catch(err => {
                if (err === "#1721") return checkCrit = true;

                console.log(err);

                return checkTime = true;
            });

            if (checkCrit) return channel.send("Message does not match the criteria, request cancelled...");
            if (checkTime) return channel.send("Cancelled, time expired...");

            const playerIdTemp = await getDataRedis(uid);

            if (await getDataRedis(playerIdTemp.playerId)) {
                playerData = await getDataRedis(playerIdTemp.playerId);
            } else {
                prices = await getPlayerPrices(playerIdTemp.playerId);
                playerData = await getPlayerDataById(playerIdTemp.playerId, prices);
                await clientRedis.setex(`${playerData.id}`, 300, JSON.stringify(playerData))
            }

            embed = await fillInEmbed(playerData);

            break;
        default:
            console.log("error");
    }

    return channel.send(embed);

};

async function fillInEmbed(playerData) {
    const embed = new Discord.RichEmbed();
    const fullName = playerData.commonName ? playerData.commonName : `${playerData.firstName} ${playerData.lastName}`;
    const ratingNames = makeArrRatings(playerData.position);

    embed.setColor(0x2FF37A);
    embed.setThumbnail(playerData.headshot);
    embed.setAuthor(`${fullName} - ${playerData.ovr} ${playerData.position}`, playerData.club.logo);
    embed.setTitle(await getRarityName(playerData.rarity));
    embed.setDescription(`**${ratingNames[0]}**: ${playerData.ratings.pac} **${ratingNames[1]}**: ${playerData.ratings.sho} **${ratingNames[2]}**: ${playerData.ratings.pas} **${ratingNames[3]}**: ${playerData.ratings.dri} **${ratingNames[4]}**: ${playerData.ratings.def} **${ratingNames[5]}**: ${playerData.ratings.phy}`);
    embed.setFooter("FUTBot v.2.0.0 | Prices from FUTBIN | Made by Tjird, inspired by ajpiano", "https://tjird.nl/futbot.jpg");
    embed.addField("Nation", playerData.nationName, true);
    embed.addField("Club", `${playerData.club.name} (${playerData.leagueName})`, true);

    const psPrices = playerData.prices.pc;

    embed.addField("PC", `**5 lowest BIN prices**\n- ${psPrices.LCPrice}\n- ${psPrices.LCPrice2}\n- ${psPrices.LCPrice3}\n- ${psPrices.LCPrice4}\n- ${psPrices.LCPrice5}\n**Updated**: ${psPrices.updated}\n**Range**: ${psPrices.MinPrice} - ${psPrices.MaxPrice}\n**RPR**: ${psPrices.PRP}%\n`, true);

    return embed;
};

function checkGoalkeeper(position) {
    if (position === "GK") return true;

    return false;
};

function makeArrRatings(position) {
    let arr;

    if (checkGoalkeeper(position)) {
        arr = [
            "DIV",
            "HAN",
            "KIC",
            "REF",
            "SPE",
            "POS"
        ];
    } else {
        arr = [
            "PAC",
            "SHO",
            "PAS",
            "DRI",
            "DEF",
            "PHY"
        ];
    }

    return arr;
};

async function getRarityString() {
    const d = await pool.run(r.table("rarities"));
    const arr = [];

    for (let i in d) {
        arr.push(d[i].id);
    }

    const s = arr.join(",");

    return s;
};

async function getRandomProxy() {
    var again = true;
    while (again) {
        var d = await pool.run(r.table("proxies"));
        var random = getRandomInt(0, d.length);
        if (d[random].address) again = false;
        var address = d[random].address.split(":");
    }

    return address;
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function formatPlayerData(data, prices) {
    const playerData = {
        id: data.items[0].id,
        baseId: data.items[0].baseId,
        headshot: data.items[0].headshot.imgUrl,
        commonName: data.items[0].commonName,
        firstName: data.items[0].firstName,
        lastName: data.items[0].lastName,
        leagueName: data.items[0].league.abbrName,
        nationName: data.items[0].nation.abbrName,
        club: {
            name: data.items[0].club.name,
            logo: data.items[0].club.imageUrls.dark.small
        },
        position: data.items[0].position,
        height: data.items[0].height,
        weight: data.items[0].weight,
        age: data.items[0].age,
        weakFoot: data.items[0].weakFoot,
        skillMoves: data.items[0].skillMoves,
        foot: data.items[0].foot,
        rarity: `${data.items[0].rarityId}-${data.items[0].quality}`,
        ovr: data.items[0].rating,
        ratings: {
            pac: data.items[0].attributes[0].value,
            sho: data.items[0].attributes[1].value,
            pas: data.items[0].attributes[2].value,
            dri: data.items[0].attributes[3].value,
            def: data.items[0].attributes[4].value,
            phy: data.items[0].attributes[5].value,
        },
        prices: prices

    };

    return playerData;
};

async function requestPlayerData(url) {
    const [proxy, port] = await getRandomProxy();
    const reqOpts = {
        url: url,
        host: proxy,
        port: port,
        method: "GET",
        headers: { "Cache-Control": "no-cache" }
    };
    const data = JSON.parse(await rp(reqOpts));

    return data;
};

async function getPlayerDataById(baseId, prices) {
    const url = `https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22id%22:%22${baseId}%22,%22link%22:1%7D`;
    let playerData = await requestPlayerData(url);
    playerData = await formatPlayerData(playerData, prices);

    return playerData;
};

async function getPlayerPrices(playerId) {
    const url = `https://www.futbin.com/19/playerPrices?player=${playerId}&_=1545322911135`;
    const res = await requestPlayerData(url);

    return res[playerId].prices;
};

function makeOptionMenu(arr) {
    const t = new AsciiTable();
    t.setHeading('Choice', 'Name', 'OVR', 'Version');
    t.setAlign(1, AsciiTable.LEFT);
    t.setAlign(2, AsciiTable.CENTER);
    t.setAlign(3, AsciiTable.LEFT);

    for (i = 0; i < arr.length; i++) {
        let c = arr[i];
        t.addRow(c.choice, c.name, c.ovr, c.version);
    }

    return t;
};

async function makeArrOfRemainingPlayers(data) {
    const arr = []
    const limit = 15;
    let choiceNumber = 1;

    for (var i = 0; i < data.items.length; i++ , choiceNumber++) {
        if (i == limit) break;

        let playerName = `${data.items[i].firstName} ${data.items[i].lastName}`;

        if (data.items[i].commonName) playerName = data.items[i].commonName;

        let rarity = `${data.items[i].rarityId}-${data.items[i].quality}`;
        rarity = await getRarityName(rarity) ? await getRarityName(rarity) : rarity;

        arr.push({ choice: choiceNumber, name: playerName, ovr: data.items[i].rating, version: rarity, playerId: data.items[i].id, baseId: data.items[i].baseId });
    }

    return arr;
};

async function getRarityName(rarity) {
    const d = await pool.run(r.table("rarities").get(rarity));
    if (!d) return false;

    return d.rarity;
};

async function getDataRedis(id) {
    const res = await clientRedis.get(id);

    if (!res || res == null) return false;

    return JSON.parse(res);
};
