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
            message.reply("Vul aub een console in als 2de argument.")
        }
        tabletojson.convertUrl(
            url,
            function (tablesAsJson) {
                tableinjson(tablesAsJson[2]);
            }
        );

        function tableinjson(table) {
            const title = `${slice} overal rating spelers`;
            const description = `Dit is een lijst met de 10 goedkoopste spelers\n van ${slice} overal rating voor het platform ${slice2}`;

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
                .setAuthor(`Goedkoopste spelers per overal rating lijst`)
                .setTitle(title)
                .setURL(url)
                .setDescription(description)
                .setFooter("FUT Searcher v.1.0.0 | Prijzen van FUTBIN | Made by Tjird, inspired by ajpiano", "https://tjird.nl/fut1.jpg")
                .addField("Naam", field1, true)
                .addField("Prijs", field2, true)
            message.reply("hier is jou aangevraagde lijst:", { embed });
        };

    }
}

module.exports = CheapestSearchCommand;