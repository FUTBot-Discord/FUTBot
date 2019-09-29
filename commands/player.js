const Discord = require("discord.js");
const uniqid = require('uniqid');

const general = require("../functions/general");

const asyncRedis = require("async-redis");
const { redis } = require('../config');
redis.db = 0;
const clientRedis = asyncRedis.createClient(redis);

clientRedis.on("error", (err) => {
    console.log(`${err}`);
})

exports.run = async (client, message, args) => {
    let request;
    const channel = message.channel;
    const user = message.author;
    const guild = message.guild;
    const filter = m => m.author.id === user.id;

    switch (true) {
        case args.length === 1:
            request = await general.requestPlayerData(1, args);
            break;
        case args.length === 2:
            if (isFinite(args[1])) request = await general.requestPlayerData(2, args);
            if (isNaN(args[1])) request = await general.requestPlayerData(3, args);
            break;
        case args.length > 2:
            if (isNaN(args[2])) return channel.send("Your 3th argument is incorrect, it must be a number.");
            request = await general.requestPlayerData(4, args);
            break;
        default:
            return channel.send("Your request does not meet the requirements of the command.");
    };

    const uid = uniqid();
    let playerData;
    let prices;
    let embed;

    if (request == null || request.length == 0) return channel.send("No players where found with this search.");

    let cardCount = request.length;

    switch (true) {
        case cardCount === 1:
            if (await getDataRedis(request[0].id)) {
                playerData = await getDataRedis(request[0].id);
                embed = await fillInEmbed(playerData);
            } else {
                playerData = await general.getPlayerDataById(request[0].id);
                prices = await general.getPlayerPrices(playerData.id);
                playerData = await general.formatPlayerData(playerData, prices, 2);
                await clientRedis.setex(`${playerData.id}`, 300, JSON.stringify(playerData))
            }

            embed = await fillInEmbed(playerData);

            break;
        case cardCount > 1:
            const arr = await general.makeArrOfRemainingPlayers(request);
            let checkCrit;
            let checkTime;

            channel.send(await general.makeOptionMenu(arr), {
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

                if (1 <= res && res <= cardCount) {
                    let choice = 0;
                    for (n = 0; n < arr.length; n++) {
                        choice++;
                        if (choice == res) {
                            const opt = {
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
                playerData = await general.getPlayerDataById(playerIdTemp.playerId);
                prices = await general.getPlayerPrices(playerIdTemp.playerId);
                playerData = await general.formatPlayerData(playerData, prices, 2);
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
    const ratingNames = general.makeArrRatings(playerData.position);

    embed.setColor(0x2FF37A);
    embed.setThumbnail(playerData.headshot);
    embed.setAuthor(`${fullName} - ${playerData.ovr} ${playerData.position}`, playerData.club.logo);
    embed.setTitle(general.getRarityName(playerData.rarity));
    embed.setDescription(`**${ratingNames[0]}**: ${playerData.ratings.pac} **${ratingNames[1]}**: ${playerData.ratings.sho} **${ratingNames[2]}**: ${playerData.ratings.pas} **${ratingNames[3]}**: ${playerData.ratings.dri} **${ratingNames[4]}**: ${playerData.ratings.def} **${ratingNames[5]}**: ${playerData.ratings.phy}\n**WR**: ${playerData.atkWorkRate} / ${playerData.defWorkRate} **SM**: ${playerData.skillMoves}★ **WF**: ${playerData.weakFoot}★\n:footprints: ${playerData.foot} :straight_ruler: ${playerData.height.toString().substring(0, 1)},${playerData.height.toString().substring(1)} M :calendar_spiral: ${playerData.age} years`);
    embed.setFooter("FUTBot v.2.0.0 | Prices from FUTBIN | Made by Tjird, inspired by ajpiano", "https://tjird.nl/futbot.jpg");
    embed.addField("Nation", playerData.nationName, true);
    embed.addField("Club", `${playerData.club.name} (${playerData.leagueName})`, true);

    const psPrices = playerData.prices.ps;
    const xboxPrices = playerData.prices.xbox;

    embed.addField("PS", `**5 lowest BIN prices**\n- ${psPrices.LCPrice}\n- ${psPrices.LCPrice2}\n- ${psPrices.LCPrice3}\n- ${psPrices.LCPrice4}\n- ${psPrices.LCPrice5}\n**Updated**: ${psPrices.updated}\n**Range**: ${psPrices.MinPrice} - ${psPrices.MaxPrice}\n**RPR**: ${psPrices.PRP}%\n`, true);
    embed.addField("XBOX", `**5 lowest BIN prices**\n- ${xboxPrices.LCPrice}\n- ${xboxPrices.LCPrice2}\n- ${xboxPrices.LCPrice3}\n- ${xboxPrices.LCPrice4}\n- ${xboxPrices.LCPrice5}\n**Updated**: ${xboxPrices.updated}\n**Range**: ${xboxPrices.MinPrice} - ${xboxPrices.MaxPrice}\n**RPR**: ${xboxPrices.PRP}%\n`, true);

    return embed;
};

async function getDataRedis(id) {
    const res = await clientRedis.get(id);

    if (!res || res == null) return false;

    return JSON.parse(res);
};
