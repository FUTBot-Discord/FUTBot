const { general } = require("../config");
const raritiesList = require("../rarities.json");
const AsciiTable = require('ascii-table');
const rp = require("request-promise");

const r = require("rethinkdb");
const pool = require("../functions/rethinkdb");

const { GraphQLClient } = require('graphql-request');
const url = general.graphql;
const clientGraphQL = new GraphQLClient(general.graphql, { headers: {} });


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

async function getUrlData(url) {
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

function checkGoalkeeper(position) {
    if (position === "GK") return true;

    return false;
};

function getPreferredFoot(foot) {
    if (foot == 1) return "Right";
    return "Left";
};

function getWorkrateCharacter(workrate) {
    switch (workrate) {
        case 0:
            return "M";
        case 1:
            return "L";
        case 2:
            return "H";
        default:
            return "Unknown";
    };
};

function getRarityName(rarity) {
    if (raritiesList.find(x => x.id == rarity)) return raritiesList.find(x => x.id === rarity).rarity;

    return "Unknown cardtype";
};

function getAge(dateString) {
    var today = new Date()
    var birthDate = new Date(dateString)
    var age = today.getUTCFullYear() - birthDate.getUTCFullYear()
    var month = today.getUTCMonth() - birthDate.getUTCMonth()
    if (month < 0 || (month === 0 && today.getUTCDate() < birthDate.getUTCDate())) {
        age--
    }
    return age
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

function getQuality(rating) {
    if (rating < 65) return "bronze";
    if (rating < 75) return "silver";

    return "gold";
};

async function getPlayerPrices(playerId) {
    const url = `https://www.futbin.com/21/playerPrices?player=${playerId}&_=1604102337790`;
    const res = await getUrlData(url);

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

function formatPlayerData(data, prices, option) {
    let playerData;

    if (option == 1) {
        playerData = {
            id: data[0].card_versions[0].id,
            assetId: data[0].card_versions[0].assetId,
            headshot: data[0].img,
            commonName: data[0].common_name,
            firstName: data[0].first_name,
            lastName: data[0].last_name,
            leagueName: data[0].card_versions[0].league_info.abbr_name,
            nationName: data[0].card_versions[0].nation_info.name,
            club: {
                name: data[0].card_versions[0].club_info.name,
                logo: data[0].card_versions[0].club_info.img
            },
            position: data[0].card_versions[0].preferred_position,
            height: data[0].height,
            age: getAge(new Date(data[0].birthday * 1000)),
            weakFoot: data[0].card_versions[0].weakfootabilitytypecode,
            skillMoves: data[0].card_versions[0].skillmoves,
            foot: getPreferredFoot(data[0].card_versions[0].preferred_foot),
            rarity: `${data[0].card_versions[0].rareflag}-${getQuality(data[0].card_versions[0].rating)}`,
            ovr: data[0].card_versions[0].rating,
            atkWorkRate: getWorkrateCharacter(data[0].card_versions[0].att_workrate),
            defWorkRate: getWorkrateCharacter(data[0].card_versions[0].def_workrate),
            ratings: {
                pac: data[0].card_versions[0].pac,
                sho: data[0].card_versions[0].sho,
                pas: data[0].card_versions[0].pas,
                dri: data[0].card_versions[0].dri,
                def: data[0].card_versions[0].def,
                phy: data[0].card_versions[0].phy,
            },
            prices: prices
        };
    } else {
        playerData = {
            id: data.id,
            assetId: data.assetId,
            headshot: data.meta_info.img,
            commonName: data.meta_info.common_name,
            firstName: data.meta_info.first_name,
            lastName: data.meta_info.last_name,
            leagueName: data.league_info.abbr_name,
            nationName: data.nation_info.name,
            club: {
                name: data.club_info.name,
                logo: data.club_info.img
            },
            position: data.preferred_position,
            height: data.meta_info.height,
            age: getAge(new Date(data.meta_info.birthday * 1000)),
            weakFoot: data.weakfootabilitytypecode,
            skillMoves: data.skillmoves,
            foot: getPreferredFoot(data.preferred_foot),
            rarity: `${data.rareflag}-${getQuality(data.rating)}`,
            ovr: data.rating,
            atkWorkRate: getWorkrateCharacter(data.att_workrate),
            defWorkRate: getWorkrateCharacter(data.def_workrate),
            ratings: {
                pac: data.pac,
                sho: data.sho,
                pas: data.pas,
                dri: data.dri,
                def: data.def,
                phy: data.phy,
            },
            prices: prices
        };
    }

    return playerData;
};

function makeArrOfRemainingPlayers(data) {
    const arr = []
    const limit = 15;
    let choiceNumber = 1;

    for (var i = 0; i < data.length; i++ , choiceNumber++) {
        if (i == limit) break;

        let playerName = `${data[i].first_name} ${data[i].last_name}`;

        if (data[i].common_name) playerName = data[i].common_name;

        let rarity = `${data[i].rareflag}-${getQuality(data[i].rating)}`;
        rarity = getRarityName(rarity);

        arr.push({ choice: choiceNumber, name: playerName, ovr: data[i].rating, version: rarity, playerId: data[i].id });
    }

    return arr;
};

async function requestPlayerData(option, args) {
    let queryPlayer;
    let requestPlayer;

    switch (option) {
        case 1:
            queryPlayer = `{ FUTBotGetPlayersByName(name: "${args[0]}") { rating rareflag common_name id first_name last_name } }`;
            requestPlayer = await clientGraphQL.request(queryPlayer);
            return requestPlayer.FUTBotGetPlayersByName;
        case 2:
            queryPlayer = `{ FUTBotGetPlayersByName(name: "${args[0]}", rating: ${args[1]}) { rating rareflag common_name id first_name last_name } }`;
            requestPlayer = await clientGraphQL.request(queryPlayer);
            return requestPlayer.FUTBotGetPlayersByName;
        case 3:
            queryPlayer = `{ FUTBotGetPlayersByName(name: "${args[0]} ${args[1]}") { rating rareflag common_name id first_name last_name } }`;
            requestPlayer = await clientGraphQL.request(queryPlayer);
            return requestPlayer.FUTBotGetPlayersByName;
        case 4:
            queryPlayer = `{ FUTBotGetPlayersByName(name: "${args[0]} ${args[1]}", rating: ${args[2]}) { rating rareflag common_name id first_name last_name } }`;
            requestPlayer = await clientGraphQL.request(queryPlayer);
            return requestPlayer.FUTBotGetPlayersByName;
    }
};

async function insertCommandLog(username, discriminator, userid, guildid, guildname, channelname, channelid, command, args) {
    username = `${username}#${discriminator}`;
    command = `${command} ${args.join(" ")}`;

    let logItem = `mutation { addCommandLog(command: "${command}", guildId: "${guildid}", channelId: "${channelid}", userId: "${userid}", guildName: "${guildname}", channelName: "${channelname}", userName: "${username}") { id } }`;

    try {
        await clientGraphQL.request(logItem);
    } catch (e) {
        console.log(e);
        return false;
    }

    return true;
};

async function insertCommandWhitelist(command, guildId) {
    let query = `mutation { addCommandWhitelist(command: "${command}", guildId: "${guildId}") { id } }`;

    try {
        await clientGraphQL.request(query);
    } catch (e) {
        console.log(e);
        return false;
    }

    return true;
};

async function removeCommandWhitelist(command, guildId) {
    let query = `mutation { removeCommandWhitelist(command: "${command}", guildId: "${guildId}") { id } }`;

    try {
        await clientGraphQL.request(query);
    } catch (e) {
        console.log(e);
        return false;
    }

    return true;
};

async function clearFlippingList(pConsole, guildId) {
    let query = `mutation { removeItemFlippingList(pConsole: "${pConsole}", guildId: "${guildId}") { id } }`;

    try {
        await clientGraphQL.request(query);
    } catch (e) {
        console.log(e);
        return false;
    }

    return true;
};

async function removeItemFlippingList(pConsole, guildId, player_id) {
    let query = `mutation { removeItemFlippingList(pConsole: "${pConsole}", guildId: "${guildId}", player_id: ${player_id}) { id } }`;

    try {
        await clientGraphQL.request(query);
    } catch (e) {
        console.log(e);
        return false;
    }

    return true;
};

async function getItemFlippingList(pConsole, guildId, player_id) {
    let query = `{ getFlippingListItem(console: "${pConsole}", guild_id: "${guildId}", player_id: ${player_id}) { id } }`;
    let res;

    try {
        res = await clientGraphQL.request(query);
    } catch (e) {
        console.log(e);
        return false;
    }

    if (!res.getFlippingListItem || res.getFlippingListItem == undefined || res.getFlippingListItem.length < 1) return false;

    return true;
};

async function addItemFlippingList(pConsole, guildId, player_id, buy_price, sell_price, sold_price) {
    let query = `mutation { addItemFlippingList(pConsole: "${pConsole}", guildId: "${guildId}", player_id: ${player_id}, buy_price: ${buy_price}, sell_price: ${sell_price}, sold_price: ${sold_price}) { id } }`;

    try {
        await clientGraphQL.request(query);
    } catch (e) {
        console.log(e);
        return false;
    }

    return true;
};

async function updateItemFlippingList(pConsole, guildId, player_id, buy_price, sell_price, sold_price) {
    let query = `mutation { updateItemFlippingList(pConsole: "${pConsole}", guildId: "${guildId}", player_id: ${player_id}, buy_price: ${buy_price}, sell_price: ${sell_price}, sold_price: ${sold_price}) { id } }`;

    try {
        await clientGraphQL.request(query);
    } catch (e) {
        console.log(e);
        return false;
    }

    return true;
};


async function getCommandWhitelist(command, guildId) {
    let query = `{ getCommandWhitelist(command: "${command}", guild_id: "${guildId}") { id command guild_id } }`;
    let res;

    try {
        res = await clientGraphQL.request(query);
    } catch (e) {
        console.log(e);
        return false;
    }

    if (res.getCommandWhitelist === undefined || res.getCommandWhitelist.length < 1) return false;

    return true;
};

async function getCommandsList() {
    let query = `{ getCommandsPublic { id command } }`;
    let res;
    let array = [];

    try {
        res = await clientGraphQL.request(query);
    } catch (e) {
        console.log(e);
        return false;
    }

    for (command of res.getCommandsPublic) {
        array.push(command.command);
    }

    return array;
};

async function getFlippingList(g, c) {
    let query = `{ getFlippingList(guild_id: "${g}", console: "${c}") { player_id console buy_price sell_price sold_price player_info { meta_info { first_name last_name common_name } } } }`;
    let res;

    try {
        res = await clientGraphQL.request(query);
    } catch (e) {
        console.log(e);
        return false;
    }

    return res.getFlippingList;
};

async function getPlayerDataById(id) {
    queryPlayer = `{ getPlayerVersionById(id: ${id}) { rating asset_id att_workrate cardsubtypeid def def_workrate dri id league_info { abbr_name img } nation_info { name img } club_info { name img } pac pas phy preferred_position preferred_foot rareflag rating sho skillmoves weakfootabilitytypecode meta_info { common_name img birthday height first_name last_name } } }`;
    playerData = await clientGraphQL.request(queryPlayer);

    return playerData.getPlayerVersionById;
};

async function getActiveTOTWPlayers() {
    queryPlayer = `{ getActiveTOTWPlayers{ preferred_position rating meta_info { common_name first_name last_name } } }`;
    playerData = await clientGraphQL.request(queryPlayer);

    return playerData.getActiveTOTWPlayers;
};

async function getPlayerPriceHistory(playerId, dateType) {
    const url = `https://www.futbin.com/21/playerGraph?type=${dateType}&year=21&player=${playerId}`;
    const res = await getUrlData(url);

    return res;
};

async function makeObjPriceHistory(playerId) {
    const obj = {};
    const dateTypes = [
        "today",
        "yesterday",
        "da_yesterday",
        "daily_graph"
    ];

    for (const dateType of dateTypes) {
        let data = await getPlayerPriceHistory(playerId, dateType);
        obj[dateType] = data;
    }

    return obj;
};

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function checkPermissionAdmin(guildMember) {
    return guildMember.permissions.has("ADMINISTRATOR");
};

module.exports = {
    getRandomInt,
    getRandomProxy,
    getUrlData,
    checkGoalkeeper,
    getWorkrateCharacter,
    getPreferredFoot,
    getRarityName,
    getAge,
    makeArrRatings,
    getQuality,
    getPlayerPrices,
    makeOptionMenu,
    formatPlayerData,
    makeArrOfRemainingPlayers,
    requestPlayerData,
    getPlayerDataById,
    makeObjPriceHistory,
    numberWithCommas,
    insertCommandLog,
    insertCommandWhitelist,
    removeCommandWhitelist,
    getCommandWhitelist,
    getCommandsList,
    checkPermissionAdmin,
    getFlippingList,
    clearFlippingList,
    removeItemFlippingList,
    getItemFlippingList,
    addItemFlippingList,
    updateItemFlippingList,
    getActiveTOTWPlayers
};