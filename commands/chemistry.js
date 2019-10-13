const Discord = require('discord.js');
const r = require("rethinkdb");
const pool = require("../functions/rethinkdb");
const html = require("../functions/htmlscraper");

exports.run = async (client, message, args) => {
    const channel = message.channel;
    const url = `https://www.futbin.com/consumables/Chemistry%20Styles`;

    let htmlData = await getHtmlData(url);

    const title = `Prices chemistry consumables items`;
    const description = `This is a list with all 23 chemistry consumables items and there prices.`;
    const author = `All chemistry consumables items prices`;

    const xboxprices = [];
    const psprices = [];

    for (var i = 0; i < 23; ++i) {
        xboxprices[i] = `- ${htmlData[1][i][0]} ${htmlData[1][i][1]}`;
        psprices[i] = `- ${htmlData[0][i][0]} ${htmlData[0][i][1]}`;
    }

    const field1 = `${psprices[0]}\n${psprices[1]}\n${psprices[2]}\n${psprices[3]}\n${psprices[4]}\n${psprices[5]}\n${psprices[6]}\n${psprices[7]}\n${psprices[8]}\n${psprices[9]}\n${psprices[10]}\n${psprices[11]}\n${psprices[12]}\n${psprices[13]}\n${psprices[14]}\n${psprices[15]}\n${psprices[16]}\n${psprices[17]}\n${psprices[18]}\n${psprices[19]}\n${psprices[20]}\n${psprices[21]}\n${psprices[22]}`;
    const field2 = `${xboxprices[0]}\n${xboxprices[1]}\n${xboxprices[2]}\n${xboxprices[3]}\n${xboxprices[4]}\n${xboxprices[5]}\n${xboxprices[6]}\n${xboxprices[7]}\n${xboxprices[8]}\n${xboxprices[9]}\n${xboxprices[10]}\n${xboxprices[11]}\n${xboxprices[12]}\n${xboxprices[13]}\n${xboxprices[14]}\n${xboxprices[15]}\n${xboxprices[16]}\n${xboxprices[17]}\n${xboxprices[18]}\n${xboxprices[19]}\n${xboxprices[20]}\n${xboxprices[21]}\n${xboxprices[22]}`;

    const embed = new Discord.RichEmbed()
        .setColor(0x2FF37A)
        .setTitle(title)
        .setAuthor(author)
        .setURL(url)
        .setDescription(description)
        .setFooter("FUT Searcher v.2.0.0 | Prices from FUTBIN | Made by Tjird#0001", "https://tjird.nl/futbot.jpg")
        .addField("PS", field1, true)
        .addField("XBOX", field2, true);

    return message.reply("here is your requested list:", { embed });
};

async function getHtmlData(url) {
    const res = await requestData(url);

    return res;
};

async function requestData(url) {
    const [proxy, port] = await getRandomProxy();
    const reqOpts = {
        url: url,
        host: proxy,
        port: port,
        method: "GET",
        headers: { "Cache-Control": "no-cache" }
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