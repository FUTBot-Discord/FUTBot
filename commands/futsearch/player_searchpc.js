const commando = require('discord.js-commando');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const AsciiTable = require('ascii-table');
const Discord = require('discord.js');
const moment = require('moment');
const Date = require('date.js');

class PlayerSearchPCCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'playerpc',
            group: 'fut_playersearchpc',
            memberName: 'playerpc',
            description: 'Zoekt een speler van de FUT market'
        });
    }

    async run(message, args) {
        if (message.author.bot) return;

        function httpGet(theUrl) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open("GET", theUrl, false); // false for synchronous request
            xmlHttp.send(null);
            return JSON.parse(xmlHttp.responseText);
        }

        function playerTitle(versionid, titlename) {
            switch (versionid.toString()) {
                case "70-gold":
                    var titlename = "Champions League TOTGS Rare";
                    break;
                case "32-gold":
                    var titlename = "FUTMAS";
                    break;
                case "46-gold":
                    var titlename = "Europa League Live Rare";
                    break;
                case "50-gold":
                    var titlename = "Champions League Live Rare";
                    break;
                case "68-gold":
                    var titlename = "Europa League TOTGS Rare";
                    break;
                case "85-gold":
                    var titlename = "Headliner";
                    break;
            }
            return titlename;
        }

        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        function searchPlayer(playerid) {
            let idurl = "https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22id%22:%22" + playerid + `%22,%22quality%22:%22${quality}%22%7D`;
            let searchbyid = httpGet(idurl);

            let pricesurl = "https://www.futbin.com/19/playerPrices?player=" + playerid + "&_=1545322911135";
            let futbinprices = httpGet(pricesurl);

            const xbLCPrice1 = futbinprices[playerid].prices.pc.LCPrice.toString();
            const xbLCPrice2 = futbinprices[playerid].prices.pc.LCPrice2.toString();
            const xbLCPrice3 = futbinprices[playerid].prices.pc.LCPrice3.toString();
            const xbLCPrice4 = futbinprices[playerid].prices.pc.LCPrice4.toString();
            const xbLCPrice5 = futbinprices[playerid].prices.pc.LCPrice5.toString();
            const xbupdated = futbinprices[playerid].prices.pc.updated.toString();
            const xbminprice = futbinprices[playerid].prices.pc.MinPrice.toString();
            const xbmaxprice = futbinprices[playerid].prices.pc.MaxPrice.toString();
            const xbprp = futbinprices[playerid].prices.pc.PRP.toString();

            const xbbinmessage1 = `- ${xbLCPrice1}\n- ${xbLCPrice2}\n- ${xbLCPrice3}\n- ${xbLCPrice4}\n- ${xbLCPrice5}\n`;
            const xbbinmessage2 = `**Updated**: ${xbupdated}\n`;
            const xbbinmessage3 = `**Range**: ${xbminprice} - ${xbmaxprice}\n`;
            const xbbinmessage4 = `**RPR**: ${xbprp}%`;

            if (searchbyid.items[0].position.toString() == "GK") {
                var snl = "DIV";
                var sch = 'HAN';
                var pas = 'KIC';
                var dri = 'REF';
                var vrd = 'SPE';
                var fys = 'POS';
            } else {
                var snl = "PAC";
                var sch = 'SHO';
                var pas = 'PAS';
                var dri = 'DRI';
                var vrd = 'DEF';
                var fys = 'PHY';
            }

            var playerhistorytodayurl = "https://www.futbin.com/19/playerGraph?type=today&year=19&player=" + playerid;
            var playerhistoryyesterdayurl = "https://www.futbin.com/19/playerGraph?type=yesterday&year=19&player=" + playerid;
            var playerhistorydayesterdayurl = "https://www.futbin.com/19/playerGraph?type=da_yesterday&year=19&player=" + playerid;
            var playerhistorydailyurl = "https://www.futbin.com/19/playerGraph?type=daily_graph&year=19&player=" + playerid;

            var playerhistorytoday = httpGet(playerhistorytodayurl);
            var playerhistoryyesterday = httpGet(playerhistoryyesterdayurl);
            var playerhistorydayesterday = httpGet(playerhistorydayesterdayurl);
            var playerhistorydaily = httpGet(playerhistorydailyurl);

            var lasthour = `${moment().format("MM/DD/YYYY HH")}:00:00`;
            var date = new Date(lasthour);
            var lasthourgmt = date.getTime() - 3600000;
            var threehourgmt = lasthourgmt - 10800000;
            var sixhourgmt = threehourgmt - 10800000;
            var twelvehourgmt = sixhourgmt - 21600000;
            var yesterdaygmt = twelvehourgmt - 43200000;
            var twodaysgmt = `${moment().format("MM/DD/YYYY")} 00:00:00`;
            var date1 = new Date(twodaysgmt);
            var twodaysgmt = date1.getTime() - 169200000;
            var oneweekgmt = date1.getTime() - 601200000;

            for (var i = 0; i < playerhistorytoday.pc.length; i++) {
                if (playerhistorytoday.pc[i].includes(lasthourgmt)) {
                    var pclasthourprice = numberWithCommas(playerhistorytoday.pc[i][1]);
                    break;
                } else {
                    var pclasthourprice = "Unknown";
                }
            }

            if (pclasthourprice === "Unknown") {
                for (var i = 0; i < playerhistoryyesterday.pc.length; i++) {
                    if (playerhistoryyesterday.pc[i].includes(lasthourgmt)) {
                        var pclasthourprice = numberWithCommas(playerhistoryyesterday.pc[i][1]);
                        break;
                    }
                }
            }

            for (var i = 0; i < playerhistorytoday.pc.length; i++) {
                if (playerhistorytoday.pc[i].includes(threehourgmt)) {
                    var pcthreehourprice = numberWithCommas(playerhistorytoday.pc[i][1]);
                    break;
                } else {
                    var pcthreehourprice = "Unknown";
                }
            }

            if (pcthreehourprice === "Unknown") {
                for (var i = 0; i < playerhistoryyesterday.pc.length; i++) {
                    if (playerhistoryyesterday.pc[i].includes(threehourgmt)) {
                        var pcthreehourprice = numberWithCommas(playerhistoryyesterday.pc[i][1]);
                        break;
                    }
                }
            }

            for (var i = 0; i < playerhistorytoday.pc.length; i++) {
                if (playerhistorytoday.pc[i].includes(sixhourgmt)) {
                    var pcsixhourprice = numberWithCommas(playerhistorytoday.pc[i][1]);
                    break;
                } else {
                    var pcsixhourprice = "Unknown";
                }
            }

            if (pcsixhourprice === "Unknown") {
                for (var i = 0; i < playerhistoryyesterday.pc.length; i++) {
                    if (playerhistoryyesterday.pc[i].includes(sixhourgmt)) {
                        var pcsixhourprice = numberWithCommas(playerhistoryyesterday.pc[i][1]);
                        break;
                    }
                }
            }

            for (var i = 0; i < playerhistorytoday.pc.length; i++) {
                if (playerhistorytoday.pc[i].includes(twelvehourgmt)) {
                    var pctwelvehourprice = numberWithCommas(playerhistorytoday.pc[i][1]);
                    break;
                } else {
                    var pctwelvehourprice = "Unknown";
                }
            }

            if (pctwelvehourprice === "Unknown") {
                for (var i = 0; i < playerhistoryyesterday.pc.length; i++) {
                    if (playerhistoryyesterday.pc[i].includes(twelvehourgmt)) {
                        var pctwelvehourprice = numberWithCommas(playerhistoryyesterday.pc[i][1]);
                        break;
                    }
                }
            }

            for (var i = 0; i < playerhistoryyesterday.pc.length; i++) {
                if (playerhistoryyesterday.pc[i].includes(yesterdaygmt)) {
                    var pcyesterdayhourprice = numberWithCommas(playerhistoryyesterday.pc[i][1]);
                    break;
                } else {
                    var pcyesterdayhourprice = "Unknown";
                }
            }

            if (pcyesterdayhourprice === "Unknown") {
                for (var i = 0; i < playerhistorydayesterday.pc.length; i++) {
                    if (playerhistorydayesterday.pc[i].includes(yesterdaygmt)) {
                        var pcyesterdayhourprice = numberWithCommas(playerhistorydayesterday.pc[i][1]);
                        break;
                    }
                }
            }

            for (var i = 0; i < playerhistorydaily.pc.length; i++) {
                if (playerhistorydaily.pc[i].includes(twodaysgmt)) {
                    var pctwodayshourprice = numberWithCommas(playerhistorydaily.pc[i][1]);
                    break;
                } else {
                    var pctwodayshourprice = "Unknown";
                }
            }

            for (var i = 0; i < playerhistorydaily.pc.length; i++) {
                if (playerhistorydaily.pc[i].includes(oneweekgmt)) {
                    var pconeweekhourprice = numberWithCommas(playerhistorydaily.pc[i][1]);
                    break;
                } else {
                    var pconeweekhourprice = "Unknown";
                }
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
            var title2 = raritiesjson.dynamicRarities[title1].toString();
            var title = playerTitle(title1, title2);
            var height = searchbyid.items[0].height.toString().substring(0, 1) + "." + searchbyid.items[0].height.toString().substring(1, 4) + "m";
            const description = `**${snl}**: ${searchbyid.items[0].attributes[0].value} **${sch}**: ${searchbyid.items[0].attributes[1].value} **${pas}**: ${searchbyid.items[0].attributes[2].value} **${dri}**: ${searchbyid.items[0].attributes[3].value} **${vrd}**: ${searchbyid.items[0].attributes[4].value} **${fys}**: ${searchbyid.items[0].attributes[5].value}\n**WR**: ${searchbyid.items[0].atkWorkRate.charAt(0)}/${searchbyid.items[0].defWorkRate.charAt(0)} **SM**: ${searchbyid.items[0].skillMoves}★ **WF**: ${searchbyid.items[0].weakFoot}★\n:footprints: ${searchbyid.items[0].foot.charAt(0)} :straight_ruler: ${height} :scales:️ ${searchbyid.items[0].weight}kg :calendar_spiral: ${searchbyid.items[0].age} years`;
            const pcpricehistory = `1 hour ago: ${pclasthourprice}\n3 hours ago: ${pcthreehourprice}\n6 hours ago: ${pcsixhourprice}\n12 hours ago: ${pctwelvehourprice}\n1 day ago: ${pcyesterdayhourprice}\n2 days ago: ${pctwodayshourprice}\n1 week ago: ${pconeweekhourprice}`;
            const embed = new Discord.RichEmbed()
                .setColor(0x2FF37A)
                .setThumbnail(searchbyid.items[0].headshot.imgUrl.toString())
                .setAuthor(author, searchbyid.items[0].club.imageUrls.dark.small.toString())
                .setTitle(title)
                .setDescription(description)
                .setFooter("FUTBot v.1.0.2 | Prices from FUTBIN | Made by Tjird, inspired by ajpiano", "https://tjird.nl/fut1.jpg")
                .addField("Nation", searchbyid.items[0].nation.abbrName.toString(), true)
                .addField("Club", `${searchbyid.items[0].club.name} (${searchbyid.items[0].league.abbrName})`, true)
                .addField("PC", `**5 lowest BIN prices**\n${xbbinmessage1}${xbbinmessage2}${xbbinmessage3}${xbbinmessage4}\n\n**Price history**\n${pcpricehistory}\n`)
            message.reply("here is the requested player:", { embed });
        }

        var quality = "0-bronze,0-gold,0-silver,1-bronze,1-silver,1-gold,3-bronze,3-silver,3-gold,5-gold,12-gold,21-gold,22-gold,24-gold,25-gold,32-gold,42-gold,43-gold,47-gold,48-gold,51-gold,63-gold,64-gold,71-gold,78-gold,83-gold,85-gold";

        const filter = m => m.author.id === message.author.id;

        var urlrarities = "https://www.easports.com/fifa/ultimate-team/api/fut/display";

        var split = args.split(" ");
        var slice = split.slice(0, 1);
        var slice2 = split.slice(1, 2);
        var slice3 = split.slice(2, 3);

        if (split.length == 1) {
            var url = `https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22name%22:%22${slice}%22,%22quality%22:%22${quality}%22%7D`;
        } else if (split.length == 2 && isFinite(slice2.toString())) {
            var url = `https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22name%22:%22${slice}%22,%22quality%22:%22${quality}%22,%22ovr%22:%22${slice2}%22%7D`;
        } else if (split.length == 2 && isNaN(slice2.toString())) {
            var url = `https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22name%22:%22${slice} ${slice2}%22,%22quality%22:%22${quality}%22%7D`;
        } else if (split.length == 3 && isFinite(slice3.toString())) {
            var url = `https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22name%22:%22${slice} ${slice2}%22,%22quality%22:%22${quality}%22,%22ovr%22:%22${slice3}%22%7D`;
        } else {
            message.reply("You request does not meet the requirements of the commando.");
            return;
        }

        let raritiesjson = httpGet(urlrarities);
        let a = httpGet(url);

        if (a.totalResults > 1) {
            var n = 20;
            var resultsPlayer = [];
            var table = new AsciiTable()
            table.setHeading('Choice', 'Name', 'OVR', 'Version');
            for (var i = 0; i < a.items.length; i++) {
                if (i == n) break;
                var j = i + 1;
                if (a.items[i].commonName !== '') {
                    var playerName = a.items[i].commonName;
                } else {
                    var playerName = a.items[i].firstName + " " + a.items[i].lastName;
                }
                var version1 = a.items[i].rarityId + "-" + a.items[i].quality;
                var version2 = raritiesjson.dynamicRarities[version1];
                var version = playerTitle(version1, version2);
                resultsPlayer.push({ choice: j, name: playerName, ovr: a.items[i].rating, version: version, playerid: a.items[i].id });
                table.addRow(j, playerName, a.items[i].rating, version);
            }
            table.setAlign(1, AsciiTable.LEFT);
            table.setAlign(2, AsciiTable.CENTER);
            table.setAlign(3, AsciiTable.LEFT);
            var datasend = "```" + table.toString() + "```";
            message.delete();
            message.channel.send(datasend).then( m => m.delete(25000));
            message.reply("make a choice by entering a number... This will expire within 25 seconds...\nType `cancel` to cancel the request.").then( m => m.delete(25000));
            // #4480
            message.channel.awaitMessages(filter, {
                max: 1,
                time: 25000
            }).then(collected => {
                const number = collected.first().content.toLowerCase();
                if (number === 'cancel') {
                    return message.reply("Cancelled.");
                } else if (1 <= number && number <= a.totalResults) {
                    for (var n = 0; n < resultsPlayer.length + 1; n++) {
                        if (n == number) {
                            var playerid = resultsPlayer[n - 1].playerid.toString();
                        }
                    }
                    collected.first().delete();
                    searchPlayer(playerid);
                } else {
                    throw "Wrong message content. #4480";
                }
            }).catch(err => {
                if (err === "Wrong message content. #4480") {
                    message.reply("Message does not match the criteria, request cancelled...")
                } else {
                    message.reply("Cancelled, time expired...");
                }
                console.log(err);
            });
        } else if (a.totalResults == 1) {
            var playerid = a.items[0].id.toString();
            message.delete();
            searchPlayer(playerid);
        } else {
            message.reply("No player(s) found.");
        }
    }
}

module.exports = PlayerSearchPCCommand;