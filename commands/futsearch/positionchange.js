const commando = require('discord.js-commando');
const Discord = require('discord.js');
const tabletojson = require('tabletojson');

class CheapestSearchCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'position',
            group: 'fut_position',
            memberName: 'position',
            description: 'Geeft prijzelijst van alle positie wijzingen'
        });
    }

    async run(message, args) {
        if (message.author.bot) return;

        var url = `https://www.futbin.com/consumables/Position%20Change`;

        tabletojson.convertUrl(
            url,
            function (tablesAsJson) {
                tableinjson(tablesAsJson);
            }
        );

        function tableinjson(table) {
            const title = `Prices position consumables items`;
            const description = `Dit is een lijst met alle 20 positie wijziging verbruikitmes hun prijzen.`;
            const author = `Alle prijzen van de positie wijzigingen verbruiksitems`;

            var xboxprices = [];
            var psprices = [];
            for (var i = 0; i < 20; ++i) {
                xboxprices[i] = `- ${table[1][i][0]} ${table[1][i][1]}`;
                psprices[i] = `- ${table[0][i][0]} ${table[0][i][1]}`;
            }

            const field1 = `${psprices[0]}\n${psprices[1]}\n${psprices[2]}\n${psprices[3]}\n${psprices[4]}\n${psprices[5]}\n${psprices[6]}\n${psprices[7]}\n${psprices[8]}\n${psprices[9]}\n${psprices[10]}\n${psprices[11]}\n${psprices[12]}\n${psprices[13]}\n${psprices[14]}\n${psprices[15]}\n${psprices[16]}\n${psprices[17]}\n${psprices[18]}\n${psprices[19]}`;
            const field2 = `${xboxprices[0]}\n${xboxprices[1]}\n${xboxprices[2]}\n${xboxprices[3]}\n${xboxprices[4]}\n${xboxprices[5]}\n${xboxprices[6]}\n${xboxprices[7]}\n${xboxprices[8]}\n${xboxprices[9]}\n${xboxprices[10]}\n${xboxprices[11]}\n${xboxprices[12]}\n${xboxprices[13]}\n${xboxprices[14]}\n${xboxprices[15]}\n${xboxprices[16]}\n${xboxprices[17]}\n${xboxprices[18]}\n${xboxprices[19]}`;

            const embed = new Discord.RichEmbed()
                .setColor(0x2FF37A)
                .setTitle(title)
                .setAuthor(author)
                .setURL(url)
                .setDescription(description)
                .setFooter("FUT Searcher v.1.0.0 | Prices from FUTBIN | Made by Tjird, inspired by ajpiano", "https://tjird.nl/fut1.jpg")
                .addField("PS", field1, true)
                .addField("XBOX", field2, true)
            message.reply("here is your requested list:", { embed });
        };

    }
}

module.exports = CheapestSearchCommand;