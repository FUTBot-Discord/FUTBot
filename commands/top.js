const Discord = require('discord.js');
const r = require("rethinkdb");
const pool = require("../functions/rethinkdb");
const html = require("../functions/htmlscraper");

exports.run = async (client, message, args) => {
    const channel = message.channel;

    if (!await checkWhitelist(message.guild.id)) return channel.send("This server is not whitelisted for the feature.")

    const platformList = [
        "pc",
        "ps",
        "xbox"
    ];

    if (args[0]) {
        args[0] = args[0].toString().toLowerCase();
    } else {
        return message.reply("Fill in a console as an argument please.");
    }

    if (!platformList.includes(args[0])) return message.reply("Fill in a valid console as an argument please.");

    let url;

    switch (args[1]) {
        case "icon":
            url = "https://www.futbin.com/market/Icons";
            break;
        case "icons":
            url = "https://www.futbin.com/market/Icons";
            break;
        case "gold":
            url = "https://www.futbin.com/market/Gold";
            break;
        case "golds":
            url = "https://www.futbin.com/market/Gold";
            break;
        case "otw":
            url = "https://www.futbin.com/market/OnesToWatch";
            break;
        case "otws":
            url = "https://www.futbin.com/market/OnesToWatch";
            break;
        default:
            url = "https://www.futbin.com/market/";
    }

    let data = await getHtmlData(url, args[0]);

    const topUp = data[0];
    const topDown = data[1];
    const obj = {
        "topUp": {
            "name": [],
            "price": []
        },
        "topDown": {
            "name": [],
            "price": []
        }
    };

    let temp;
    let name;
    let price;
    let percentage;

    for (player of topUp) {
        temp = Object.values(player);
        percentage = temp[0].replace(/ /g, '');
        name = temp[1].split("\n");
        price = name[1].replace(/ /g, '').replace(/\(|\)/g, '').replace(/,/g, '.');
        name = name[0];

        obj.topUp.name.push(name);
        obj.topUp.price.push(`${price} (${percentage})`);
    }

    for (player of topDown) {
        temp = Object.values(player);
        percentage = temp[0].replace(/ /g, '');
        name = temp[1].split("\n");
        price = name[1].replace(/ /g, '').replace(/\(|\)/g, '').replace(/,/g, '.');
        name = name[0];

        obj.topDown.name.push(name);
        obj.topDown.price.push(`${price} (${percentage})`);
    }

    const title = `Link to website version.`;
    const description = `This is a list of the most increased and decreased players\n since UK time 00:00 on the platform ${args[0].toUpperCase()}.`;

    const fieldUpNames = obj.topUp.name.join("\n");
    const fieldUpPrices = obj.topUp.price.join("\n");
    const fieldDownNames = obj.topDown.name.join("\n");
    const fieldDownPrices = obj.topDown.price.join("\n");

    const embed = new Discord.RichEmbed()
        .setColor(0x2FF37A)
        .setAuthor(`Most increased and decreased players`)
        .setTitle(title)
        .setURL(url)
        .setDescription(description)
        .setFooter("FUTBot v.2.0.0 | Data from FUTBIN | Made by Tjird#0001", "https://tjird.nl/futbot.jpg")
        .addField("Increased names", fieldUpNames, true)
        .addField("Increased prices", fieldUpPrices, true)
        .addBlankField()
        .addField("Decreased names", fieldDownNames, true)
        .addField("Decreased prices", fieldDownPrices, true);

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

async function checkWhitelist(guildId) {
    let data = await pool.run(r.table("whitelist").get(parseInt(guildId, 10)));

    if (data === null) return false;
    return true;
}