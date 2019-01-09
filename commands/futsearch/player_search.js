const commando = require('discord.js-commando');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const AsciiTable = require('ascii-table');
const Discord = require('discord.js');

class PlayerSearchCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'player',
            group: 'fut_playersearch',
            memberName: 'player',
            description: 'Zoekt een speler van de FUT market'
        });
    }

    async run(message, args) {
        if (message.author.bot) return;
        var quality = "0-gold,0-silver,1-bronze,1-gold,1-silver,10-gold,11-gold,12-gold,16-gold,17-gold,21-gold,22-gold,23-gold,24-gold,25-gold,26-gold,28-gold,3-bronze,3-gold,3-silver,30-gold,32-gold,37-gold,4-gold,42-gold,43-gold,44-gold,45-gold,46-gold,47-gold,48-gold,49-gold,5-gold,50-gold,51-gold,52-bronze,52-gold,52-silver,53-gold,54-gold,55-gold,56-gold,57-gold,58-gold,59-gold,6-gold,60-gold,61-gold,62-gold,63-gold,64-gold,65-gold,66-gold,67-gold,68-gold,69-gold,7-gold,70-gold,71-gold,78-gold,79-gold,8-gold,80-gold,9-gold";

        const filter = m => m.author.id === message.author.id;

        var urlrarities = "https://www.easports.com/fifa/ultimate-team/api/fut/display";

        var split = args.split(" ");
        var slice = split.slice(0, 1);
        var slice2 = split.slice(1, 2);
        var slice3 = split.slice(2, 3);

        if (split.length == 1) {
            var url = `https://www.easports.com/nl/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22name%22:%22${slice}%22,%22quality%22:%22${quality}%22%7D`;
        } else if (split.length == 2 && isFinite(slice2.toString())) {
            var url = `https://www.easports.com/nl/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22name%22:%22${slice}%22,%22quality%22:%22${quality}%22,%22ovr%22:%22${slice2}%22%7D`;
        } else if (split.length == 2 && isNaN(slice2.toString())) {
            var url = `https://www.easports.com/nl/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22name%22:%22${slice} ${slice2}%22,%22quality%22:%22${quality}%22%7D`;
        } else if (split.length == 3 && isFinite(slice3.toString())) {
            var url = `https://www.easports.com/nl/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22name%22:%22${slice} ${slice2}%22,%22quality%22:%22${quality}%22,%22ovr%22:%22${slice3}%22%7D`;
        } else {
            message.reply("Je commando voldoet niet aan de eisen van het commando.");
            return;
        }
        function httpGet(theUrl) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", theUrl, false); // false for synchronous request
            xmlHttp.send(null);
            return JSON.parse(xmlHttp.responseText);
        }

        let raritiesjson = httpGet(urlrarities);
        let a = httpGet(url);

        function searchPlayer(playerid) {
            let idurl = "https://www.easports.com/nl/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22id%22:%22" + playerid + `%22,%22quality%22:%22${quality}%22%7D`;
            let searchbyid = httpGet(idurl);

            let pricesurl = "https://www.futbin.com/19/playerPrices?player=" + playerid + "&_=1545322911135";
            let futbinprices = httpGet(pricesurl);

            const psLCPrice1 = futbinprices[playerid].prices.ps.LCPrice.toString();
            const psLCPrice2 = futbinprices[playerid].prices.ps.LCPrice2.toString();
            const psLCPrice3 = futbinprices[playerid].prices.ps.LCPrice3.toString();
            const psLCPrice4 = futbinprices[playerid].prices.ps.LCPrice4.toString();
            const psLCPrice5 = futbinprices[playerid].prices.ps.LCPrice5.toString();
            var psupdated = futbinprices[playerid].prices.ps.updated.toString();
            const psminprice = futbinprices[playerid].prices.ps.MinPrice.toString();
            const psmaxprice = futbinprices[playerid].prices.ps.MaxPrice.toString();
            const psprp = futbinprices[playerid].prices.ps.PRP.toString();

            const xbLCPrice1 = futbinprices[playerid].prices.xbox.LCPrice.toString();
            const xbLCPrice2 = futbinprices[playerid].prices.xbox.LCPrice2.toString();
            const xbLCPrice3 = futbinprices[playerid].prices.xbox.LCPrice3.toString();
            const xbLCPrice4 = futbinprices[playerid].prices.xbox.LCPrice4.toString();
            const xbLCPrice5 = futbinprices[playerid].prices.xbox.LCPrice5.toString();
            const xbupdated = futbinprices[playerid].prices.xbox.updated.toString();
            const xbminprice = futbinprices[playerid].prices.xbox.MinPrice.toString();
            const xbmaxprice = futbinprices[playerid].prices.xbox.MaxPrice.toString();
            const xbprp = futbinprices[playerid].prices.xbox.PRP.toString();

            if (xbupdated == "Never") {
                var psupdated = "Never";
            }

            const psbinmessage1 = `- ${psLCPrice1}\n- ${psLCPrice2}\n- ${psLCPrice3}\n- ${psLCPrice4}\n- ${psLCPrice5}\n`;
            const psbinmessage2 = `**Updated**: ${psupdated}\n`;
            const psbinmessage3 = `**Range**: ${psminprice} - ${psmaxprice}\n`;
            const psbinmessage4 = `**RPR**: ${psprp}%`;

            const xbbinmessage1 = `- ${xbLCPrice1}\n- ${xbLCPrice2}\n- ${xbLCPrice3}\n- ${xbLCPrice4}\n- ${xbLCPrice5}\n`;
            const xbbinmessage2 = `**Updated**: ${xbupdated}\n`;
            const xbbinmessage3 = `**Range**: ${xbminprice} - ${xbmaxprice}\n`;
            const xbbinmessage4 = `**RPR**: ${xbprp}%`;

            if (searchbyid.items[0].position.toString() == "DM") {
                var snl = "DUI";
                var sch = 'BEH';
                var pas = 'TRP';
                var dri = 'REF';
                var vrd = 'SNL';
                var fys = 'POS';
            } else {
                var snl = "SNL";
                var sch = 'SCH';
                var pas = 'PAS';
                var dri = 'DRI';
                var vrd = 'VRD';
                var fys = 'FYS';
            }

            if (searchbyid.items[0].commonName !== '') {
                var fullname = `${searchbyid.items[0].commonName.toString()}`;
            } else {
                var fullname = `${searchbyid.items[0].firstName.toString()} ${searchbyid.items[0].lastName.toString()}`;
            }
            const rating = searchbyid.items[0].rating.toString();
            const position = searchbyid.items[0].position.toString();
            const author = `${fullname} - ${rating} ${position}`;
            var title1 = searchbyid.items[0].rarityId + "-" + searchbyid.items[0].quality;
            var title = raritiesjson.dynamicRarities[title1].toString();
            switch (title1.toString()) {
                case "70-gold":
                    var title = "Champions League TOTGS Rare";
                    break;
                case "32-gold":
                    var title = "FUTMas-SBC";
                    break;
                case "46-gold":
                    var title = "Europa League Live Rare";
                    break;
                case "50-gold":
                    var title = "Champions League Live Rare";
                    break;
                case "68-gold":
                    var title = "Europa League TOTGS Rare";
                    break;

            }
            var height = searchbyid.items[0].height.toString().substring(0, 1) + "." + searchbyid.items[0].height.toString().substring(1, 4) + "m";
            const description = `**${snl}**: ${searchbyid.items[0].attributes[0].value} **${sch}**: ${searchbyid.items[0].attributes[1].value} **${pas}**: ${searchbyid.items[0].attributes[2].value} **${dri}**: ${searchbyid.items[0].attributes[3].value} **${vrd}**: ${searchbyid.items[0].attributes[4].value} **${fys}**: ${searchbyid.items[0].attributes[5].value}\n**WT**: ${searchbyid.items[0].atkWorkRate.charAt(0)}/${searchbyid.items[0].defWorkRate.charAt(0)} **SM**: ${searchbyid.items[0].skillMoves}★ **ZB**: ${searchbyid.items[0].weakFoot}★\n:footprints: ${searchbyid.items[0].foot.charAt(0)} :straight_ruler: ${height} :scales:️ ${searchbyid.items[0].weight}kg :calendar_spiral: ${searchbyid.items[0].age}`;
            const embed = new Discord.RichEmbed()
                .setColor(0x2FF37A)
                .setThumbnail(searchbyid.items[0].headshot.imgUrl.toString())
                .setAuthor(author, searchbyid.items[0].club.imageUrls.dark.small.toString())
                .setTitle(title)
                .setDescription(description)
                .setFooter("FUT Searcher v.1.0.0 | Prijzen van FUTBIN | Made by Tjird, inspired by ajpiano", "https://tjird.nl/fut1.jpg")
                .addField("Nationaliteit", searchbyid.items[0].nation.abbrName.toString(), true)
                .addField("Club", `${searchbyid.items[0].club.name} (${searchbyid.items[0].league.abbrName})`, true)
                .addField("PS", `**5 laagste NK prijzen**\n${psbinmessage1}${psbinmessage2}${psbinmessage3}${psbinmessage4}\n\n**Verandering sinds**\nComing soon...`, true)
                .addField("XBOX", `**5 laagste NK prijzen**\n${xbbinmessage1}${xbbinmessage2}${xbbinmessage3}${xbbinmessage4}\n\n**Verandering sinds**\nComing soon...`, true)
            message.reply("hier is jou aangevraagde speler:", { embed });
        }
        if (a.totalResults > 1) {
            var n = 20;
            var resultsPlayer = [];
            var table = new AsciiTable()
            table.setHeading('Keuze', 'Naam', 'OVR', 'Versie');
            for (var i = 0; i < a.items.length; i++) {
                if (i == n) break;
                var j = i + 1;
                if (a.items[i].commonName !== '') {
                    var playerName = a.items[i].commonName;
                } else {
                    var playerName = a.items[i].firstName + " " + a.items[i].lastName;
                }
                var version1 = a.items[i].rarityId + "-" + a.items[i].quality;
                var version = raritiesjson.dynamicRarities[version1];
                switch (version1.toString()) {
                    case "70-gold":
                        var version = "Champions League TOTGS Rare";
                        break;
                    case "32-gold":
                        var version = "FUTMas-SBC";
                        break;
                    case "46-gold":
                        var version = "Europa League Live Rare";
                        break;
                    case "50-gold":
                        var version = "Champions League Live Rare";
                        break;
                    case "68-gold":
                        var version = "Europa League TOTGS Rare";
                        break;
    
                }
                resultsPlayer.push({ choice: j, name: playerName, ovr: a.items[i].rating, version: version, playerid: a.items[i].id });
                table.addRow(j, playerName, a.items[i].rating, version);
            }
            table.setAlign(1, AsciiTable.LEFT);
            table.setAlign(2, AsciiTable.CENTER);
            table.setAlign(3, AsciiTable.LEFT);
            var datasend = "```" + table.toString() + "```";
            message.channel.send(datasend);
            message.reply("maak een keuze door een nummer in te toetsen... Dit zal binnen 15 seconden verlopen...");
            message.channel.awaitMessages(filter, {
                max: 1,
                time: 15000
            }).then(collected => {
                const number = collected.first().content;
                if (number === 'annuleer') {
                    return message.reply("Geannuleerd.");
                } else if (1 <= number && number <= 20) {
                    for (var n = 0; n < resultsPlayer.length + 1; n++) {
                        if (n == number) {
                            var playerid = resultsPlayer[n - 1].playerid.toString();
                        }
                    }
                    searchPlayer(playerid);
                }
            }).catch(err => {
                message.reply("Geannuleerd, tijd verlopen...");
                console.log(err);
            });
        } else if (a.totalResults == 1) {
            var playerid = a.items[0].id.toString();
            searchPlayer(playerid);
        } else if (args == "") {
            message.reply("het commando is op de volgende manier te gebruiken:\n```!speler [spelernaam] <Overal rating>```\nDe spelernaam moet één woord zijn, overal rating is een optie deze hoeft dus niet.");
        } else if (args == "help") {
            message.reply("het commando is op de volgende manier te gebruiken:\n```!speler [spelernaam] <Overal rating>```\nDe spelernaam moet één woord zijn, overal rating is een optie deze hoeft dus niet.");
        } else if (args == "info") {
            message.reply("het commando is op de volgende manier te gebruiken:\n```!speler [spelernaam] <Overal rating>```\nDe spelernaam moet één woord zijn, overal rating is een optie deze hoeft dus niet.");
        } else {
            message.reply("Geen speler(s) gevonden.");
        }
    }
}

module.exports = PlayerSearchCommand;