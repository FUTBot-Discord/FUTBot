const Discord = require('discord.js');
const r = require("rethinkdb");
const pool = require("../functions/rethinkdb");
const html = require("../functions/htmlscraper");

exports.run = async (client, message, args) => {
    const channel = message.channel;
    const platformList = [
        "pc",
        "ps",
        "xbox"
    ];

    if (args[1]) {
        args[1] = args[1].toString().toLowerCase();
    } else {
        return message.reply("Fill in a console as second argument please.");
    }

    if (!platformList.includes(args[1])) return message.reply("Fill in a valid console as second argument please.");

    const url = `https://www.futbin.com/21/players?page=1&${args[1]}_price=200-100000000&player_rating=${args[0]}&sort=${args[1]}_price&order=asc`;
    console.log(url);

    let htmlData = await getHtmlData(url, args[1]);
    console.log(htmlData);
    htmlData = htmlData[2];

    const title = `${args[0]} overall rating players`;
    const count = htmlData.length >= 9 ? 10 : htmlData.length + 1;
    const description = `This is a list of the ${count} cheapest players\n from ${args[0]} overall rating on the platform ${args[1].toUpperCase()}.`;

    let markersprice = [];
    let markersplayer = [];

    for (var i = 0; i < 11; ++i) {
        let con;
        switch (args[1]) {
            case "pc":
                con = htmlData[i].PC;
                break;
            case "ps":
                con = htmlData[i].PS;
                break;
            case "xbox":
                con = htmlData[i].XB;
                break;
        }

        markersprice[i] = " ".repeat(1) + con;
        markersplayer[i] = `- ${htmlData[i].Name} ${htmlData[i].POS}/${htmlData[i].VER.substring(0, 10)} ${htmlData[i].RAT} `;
    }

    const field1 = markersplayer.join(" \n ");
    const field2 = markersprice.join(" \n ");

    const embed = new Discord.RichEmbed()
        .setColor(0x2FF37A)
        .setAuthor(`Cheapest players per overall rating list`)
        .setTitle(title)
        .setURL(url)
        .setDescription(description)
        .setFooter("FUTBot v.2.0.0 | Prices from FUTBIN | Made by Tjird#0001", "https://tjird.nl/futbot.jpg")
        .addField("Name", field1, true)
        .addField("Price", field2, true);

    return channel.send("Here is your requested list:", { embed });
};

async function getHtmlData(url, platform) {
    let pf;
    switch (platform) {
        case "pc":
            pf = "pc";
            break;
        case "ps":
            pf = "ps4";
            break;
        case "xbox":
            pf = "xone";
            break;
    }
    const res = await requestData(url, pf);

    return res;
};

async function requestData(url, platform) {
    const [proxy, port] = await getRandomProxy();
    const reqOpts = {
        url: url,
        host: proxy,
        port: port,
        method: "GET",
        headers: {
            "Cache-Control": "no-cache",
            "Cookie": `platform=${platform}`
        }
    };
    const data = await html.get(reqOpts);

    return data;
};

async function getRandomProxy() {
    var again = true;
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