const rp = require("request-promise");
const r = require("rethinkdb");
const pool = require("../functions/rethinkdb");
const AsciiTable = require('ascii-table');

exports.run = async (client, message, args) => {
    let url;
    const channel = message.channel;
    const user = message.author;
    const rarityString = await getRarityString();

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
    let playerData;

    switch (true) {
        case request.totalResults === 1:
            const prices = await getPlayerPrices(request.items[0].id);
            playerData = formatPlayerData(request, prices);
            console.log(playerData);
        case request.totalResults > 1:
            return makeOptionMenu(request);
        default:
            console.log("error");
    }

    console.log(playerData);

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
    let again = true;
    while (again) {
        var d = await pool.run(r.table("proxies"));
        var random = getRandomInt(0, d.length);
        var address = d[random].address.split(":");
        if (address) again = false;
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
        ratings: {
            ovr: data.items[0].rating,
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

async function getPlayerDataById(baseId) {
    const url = `https://www.easports.com/nl/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22baseid%22:%22${baseId}%22,%22link%22:1%7D`;
    let playerData = await requestPlayerData(url);
    playerData = await formatPlayerData(playerData);

    return playerData;
};

async function getPlayerPrices (playerId) {
    const url = `https://www.futbin.com/19/playerPrices?player=${playerId}&_=1545322911135`;
    const res = await requestPlayerData(url);

    return res[playerId].prices;
}

function makeOptionMenu() {

}