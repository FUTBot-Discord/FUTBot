const Discord = require('discord.js');
const tabletojson = require('tabletojson');
const r = require("rethinkdb");
const pool = require("../functions/rethinkdb");

exports.run = async (client, message, args) => {
    return;
    const channel = message.channel;
    const url = `https://www.futbin.com/19/players?page=1&${args[1]}_price=200-100000000&player_rating=${args[0]}&sort=${args[1]}_price&order=asc`;

    if (args[1]) {
        args[1] = args[1].toString().toUpperCase();
    } else {
        message.reply("Fill in a console as second argument please.")
    }

    const [proxy, port] = await getRandomProxy();
    console.log(proxy + ":" + port);

    tabletojson.convertUrl(url, {
        request: {
            proxy: `http://${proxy}:${port}`,
            method: "GET",
            headers: { "Cache-Control": "no-cache" },
            tunnel: false,
            strictSSL: false
        }
    }, function (tablesAsJson) {
        console.log(tablesAsJson)
        tableinjson(tablesAsJson);
    });

    function tableinjson(table) {
        console.log(table);
        const title = `${args[0]} overall rating players`;
        const description = `This is a list of the 10 cheapest players\n from ${args[0]} overall rating on the platform ${args[1]}`;

        var markersprice = [];
        var markersplayer = [];
        for (var i = 0; i < 11; ++i) {
            markersprice[i] = `${table[i].PS}`;
            markersplayer[i] = `- ${table[i].Name} ${table[i].POS}/${table[i].VER} ${table[i].RAT}`;
        }

        const field1 = `${markersplayer[0]}\n${markersplayer[1]}\n${markersplayer[2]}\n${markersplayer[3]}\n${markersplayer[4]}\n${markersplayer[5]}\n${markersplayer[6]}\n${markersplayer[7]}\n${markersplayer[8]}\n${markersplayer[9]}`;
        const field2 = `${markersprice[0]}\n${markersprice[1]}\n${markersprice[2]}\n${markersprice[3]}\n${markersprice[4]}\n${markersprice[5]}\n${markersprice[6]}\n${markersprice[7]}\n${markersprice[8]}\n${markersprice[9]}`;

        const embed = new Discord.RichEmbed()
            .setColor(0x2FF37A)
            .setAuthor(`Cheapest players per overall rating list`)
            .setTitle(title)
            .setURL(url)
            .setDescription(description)
            .setFooter("FUTBot v.2.0.0 | Prices from FUTBIN | Made by Tjird, inspired by ajpiano", "https://tjird.nl/futbot.jpg")
            .addField("Name", field1, true)
            .addField("Price", field2, true)
        channel.send("Here is your requested list:", { embed });
    };

}

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