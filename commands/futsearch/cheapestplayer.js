const commando = require('discord.js-commando');
const Discord = require('discord.js');
const tabletojson = require('tabletojson');

class CheapestSearchCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'cheapest',
            group: 'fut_cheapest',
            memberName: 'cheapest',
            description: 'Zoekt de goedkoopste per rating'
        });
    }

    async run(message, args) {
        if (message.author.bot) return;
        var split = args.split(" ");
        var slice = split.slice(0, 1);
        var slice2 = split.slice(1, 2);

        var url = `https://www.futbin.com/19/players?page=1&${slice2}_price=200-100000000&player_rating=${slice}&sort=${slice2}_price&order=asc`;

        if (slice2[0]) {
            var slice2 = slice2[0].toString().toUpperCase();
        } else {
            message.reply("Fill in a console as second argument please.")
        }
        tabletojson.convertUrl(
            url,
            function (tablesAsJson) {
                tableinjson(tablesAsJson[2]);
            }
        );

        function tableinjson(table) {
            const title = `${slice} overall rating players`;
            const description = `This is a list of the 10 cheapest players\n from ${slice} overall rating on the platform ${slice2}`; 

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
                .setFooter("FUT Searcher v.1.0.0 | Prices from FUTBIN | Made by Tjird, inspired by ajpiano", "https://tjird.nl/fut1.jpg")
                .addField("Name", field1, true)
                .addField("Price", field2, true)
            message.reply("here is your requested list:", { embed });
        };

    }
}

module.exports = CheapestSearchCommand;