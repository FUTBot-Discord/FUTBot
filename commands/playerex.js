const general = require("../functions/general");
const uniqid = require('uniqid');
const Discord = require("discord.js");
const moment = require('moment');
const asyncRedis = require("async-redis");
const { redis } = require('../config');
redis.db = 1;
const clientRedis = asyncRedis.createClient(redis);

clientRedis.on("error", (err) => {
    console.log(`${err}`);
})

exports.run = async (client, message, args) => {
    let request;
    const channel = message.channel;
    const user = message.author;
    const guild = message.guild;
    const filter = m => m.author.id === user.id;

    switch (true) {
        case args.length === 1:
            request = await general.requestPlayerData(1, args);
            break;
        case args.length === 2:
            if (isFinite(args[1])) request = await general.requestPlayerData(2, args);
            if (isNaN(args[1])) request = await general.requestPlayerData(3, args);
            break;
        case args.length > 2:
            if (isNaN(args[2])) return channel.send("Your 3th argument is incorrect, it must be a number.");
            request = await general.requestPlayerData(4, args);
            break;
        default:
            return channel.send("Your request does not meet the requirements of the command.");
    };

    const uid = uniqid();
    let playerData;
    let prices;
    let embed;

    if (request == null || request.length == 0) return channel.send("No players where found with this search.");

    let cardCount = request.length;

    switch (true) {
        case cardCount === 1:
            if (await getDataRedis(request[0].id)) {
                playerData = await getDataRedis(request[0].id);
                embed = await fillInEmbed(playerData);
            } else {
                playerData = await general.getPlayerDataById(request[0].id);
                prices = await general.getPlayerPrices(playerData.id);
                playerData = await general.formatPlayerData(playerData, prices, 2);
                priceHistory = await general.makeObjPriceHistory(playerData.id);
                playerData.priceHistory = priceHistory;
                await clientRedis.setex(`${playerData.id}`, 300, JSON.stringify(playerData))
            }

            embed = await fillInEmbed(playerData);

            break;
        case cardCount > 1:
            const arr = await general.makeArrOfRemainingPlayers(request);
            let checkCrit;
            let checkTime;

            channel.send(await general.makeOptionMenu(arr), {
                split: true,
                code: true
            }).then(m => m.delete(25000));

            channel.send("Make a choice by entering a number... This will expire within 25 seconds...\nType `cancel` to cancel the request.", {
                split: true
            }).then(m => m.delete(25000));

            await channel.awaitMessages(filter, {
                max: 1,
                time: 25000
            }).then(async collected => {
                const res = collected.first().content.toLowerCase();

                if (res === 'cancel') return channel.send("Cancelled.");

                if (1 <= res && res <= cardCount) {
                    let choice = 0;
                    for (n = 0; n < arr.length; n++) {
                        choice++;
                        if (choice == res) {
                            const opt = {
                                playerId: `${arr[n].playerId}`,
                                guildId: guild.id
                            };
                            await clientRedis.setex(`${uid}`, 5, JSON.stringify(opt))
                            break;
                        }
                    }
                    collected.first().delete();
                } else {
                    throw "#1721";
                }
            }).catch(err => {
                if (err === "#1721") return checkCrit = true;

                console.log(err);

                return checkTime = true;
            });

            if (checkCrit) return channel.send("Message does not match the criteria, request cancelled...");
            if (checkTime) return channel.send("Cancelled, time expired...");

            const playerIdTemp = await getDataRedis(uid);

            if (await getDataRedis(playerIdTemp.playerId)) {
                playerData = await getDataRedis(playerIdTemp.playerId);
            } else {
                playerData = await general.getPlayerDataById(playerIdTemp.playerId);
                prices = await general.getPlayerPrices(playerIdTemp.playerId);
                playerData = await general.formatPlayerData(playerData, prices, 2);
                priceHistory = await general.makeObjPriceHistory(playerData.id);
                playerData.priceHistory = priceHistory;
                await clientRedis.setex(`${playerData.id}`, 300, JSON.stringify(playerData))
            }

            embed = await fillInEmbed(playerData);

            break;
        default:
            console.log("error");
    }

    return channel.send(embed);

};

async function fillInEmbed(playerData) {
    const priceHistory = playerData.priceHistory;
    const embed = new Discord.RichEmbed();
    const fullName = playerData.commonName ? playerData.commonName : `${playerData.firstName} ${playerData.lastName}`;
    const ratingNames = general.makeArrRatings(playerData.position);

    embed.setColor(0x2FF37A);
    // embed.setThumbnail(playerData.headshot);
    embed.setAuthor(`${fullName} - ${playerData.ovr} ${playerData.position}`, playerData.club.logo);
    embed.setTitle(general.getRarityName(playerData.rarity));
    embed.setDescription(`**${ratingNames[0]}**: ${playerData.ratings.pac} **${ratingNames[1]}**: ${playerData.ratings.sho} **${ratingNames[2]}**: ${playerData.ratings.pas} **${ratingNames[3]}**: ${playerData.ratings.dri} **${ratingNames[4]}**: ${playerData.ratings.def} **${ratingNames[5]}**: ${playerData.ratings.phy}\n**WR**: ${playerData.atkWorkRate} / ${playerData.defWorkRate} **SM**: ${playerData.skillMoves}★ **WF**: ${playerData.weakFoot}★\n:footprints: ${playerData.foot} :straight_ruler: ${playerData.height.toString().substring(0, 1)},${playerData.height.toString().substring(1)} M :calendar_spiral: ${playerData.age} years`);
    embed.setFooter(`FUTBot v.2.0.0 | Prices from FUTBIN | Made by Tjird#0001 | PlayerId: ${playerData.id}`, "https://tjird.nl/futbot.jpg");
    embed.addField("Nation", playerData.nationName, true);
    embed.addField("Club", `${playerData.club.name} (${playerData.leagueName})`, true);

    let date = new Date(`${moment().format("MM/DD/YYYY HH")}:00:00`);
    const lastHourGMT = date.getTime() - 3600000;
    const lastThreeHourGMT = lastHourGMT - 7200000;
    const lastSixHourGMT = lastThreeHourGMT - 10800000;
    const lastTwelveHourGMT = lastSixHourGMT - 21600000;
    const yesterdayGMT = lastTwelveHourGMT - 43200000;
    date = new Date(`${moment().format("MM/DD/YYYY")} 00:00:00`);
    const twoDaysGMT = date.getTime() - 172800000;
    const oneWeekGMT = date.getTime() - 604800000;
    const psPriceToday = priceHistory.today.ps;
    const psPriceYesterday = priceHistory.yesterday.ps;
    const psPriceDaYesterday = priceHistory.da_yesterday.ps;
    const psPriceDailyGraph = priceHistory.daily_graph.ps;
    const xboxPriceToday = priceHistory.today.xbox;
    const xboxPriceYesterday = priceHistory.yesterday.xbox;
    const xboxPriceDaYesterday = priceHistory.da_yesterday.xbox;
    const xboxPriceDailyGraph = priceHistory.daily_graph.xbox;
    const pcPriceToday = priceHistory.today.pc;
    const pcPriceYesterday = priceHistory.yesterday.pc;
    const pcPriceDaYesterday = priceHistory.da_yesterday.pc;
    const pcPriceDailyGraph = priceHistory.daily_graph.pc;

    if (!psPriceToday || psPriceToday == undefined) {
        var psLastHourPrice = "Unknown";
    } else {
        for (i = 0; i < psPriceToday.length; i++) {
            if (psPriceToday[i].includes(lastHourGMT)) {
                var psLastHourPrice = general.numberWithCommas(psPriceToday[i][1]);
                break;
            } else {
                var psLastHourPrice = "Unknown";
            }
        }
    }

    if (psLastHourPrice === "Unknown") {
        if (!psPriceYesterday || psPriceYesterday == undefined) {
            var psLastHourPrice = "Unknown";
        } else {
            for (i = 0; i < psPriceYesterday.length; i++) {
                if (psPriceYesterday[i].includes(lastHourGMT)) {
                    var psLastHourPrice = general.numberWithCommas(psPriceYesterday[i][1]);
                    break;
                }
            }
        }

    }

    if (!psPriceToday || psPriceToday == undefined) {
        var psLastThreeHourPrice = "Unknown";
    } else {
        for (i = 0; i < psPriceToday.length; i++) {
            if (psPriceToday[i].includes(lastThreeHourGMT)) {
                var psLastThreeHourPrice = general.numberWithCommas(psPriceToday[i][1]);
                break;
            } else {
                var psLastThreeHourPrice = "Unknown";
            }
        }
    }

    if (psLastThreeHourPrice === "Unknown") {
        if (!psPriceYesterday || psPriceYesterday == undefined) {
            var psLastThreeHourPrice = "Unknown";
        } else {
            for (i = 0; i < psPriceYesterday.length; i++) {
                if (psPriceYesterday[i].includes(lastThreeHourGMT)) {
                    var psLastThreeHourPrice = general.numberWithCommas(psPriceYesterday[i][1]);
                    break;
                }
            }
        }
    }

    if (!psPriceToday || psPriceToday == undefined) {
        var psLastSixHourPrice = "Unknown";
    } else {
        for (i = 0; i < psPriceToday.length; i++) {
            if (psPriceToday[i].includes(lastSixHourGMT)) {
                var psLastSixHourPrice = general.numberWithCommas(psPriceToday[i][1]);
                break;
            } else {
                var psLastSixHourPrice = "Unknown";
            }
        }
    }

    if (psLastSixHourPrice === "Unknown") {
        if (!psPriceYesterday || psPriceYesterday == undefined) {
            var psLastSixHourPrice = "Unknown";
        } else {
            for (i = 0; i < psPriceYesterday.length; i++) {
                if (psPriceYesterday[i].includes(lastSixHourGMT)) {
                    var psLastSixHourPrice = general.numberWithCommas(psPriceYesterday[i][1]);
                    break;
                }
            }
        }
    }


    if (!psPriceToday || psPriceToday == undefined) {
        var psLastTwelveHourPrice = "Unknown";
    } else {
        for (i = 0; i < psPriceToday.length; i++) {
            if (psPriceToday[i].includes(lastTwelveHourGMT)) {
                var psLastTwelveHourPrice = general.numberWithCommas(psPriceToday[i][1]);
                break;
            } else {
                var psLastTwelveHourPrice = "Unknown";
            }
        }
    }

    if (psLastTwelveHourPrice === "Unknown") {
        if (!psPriceYesterday || psPriceYesterday == undefined) {
            var psLastTwelveHourPrice = "Unknown";
        } else {
            for (i = 0; i < psPriceYesterday.length; i++) {
                if (psPriceYesterday[i].includes(lastTwelveHourGMT)) {
                    var psLastTwelveHourPrice = general.numberWithCommas(psPriceYesterday[i][1]);
                    break;
                }
            }
        }
    }

    if (!psPriceYesterday || psPriceYesterday == undefined) {
        var psYesterdayPrice = "Unknown";
    } else {
        for (i = 0; i < psPriceYesterday.length; i++) {
            if (psPriceYesterday[i].includes(yesterdayGMT)) {
                var psYesterdayPrice = general.numberWithCommas(psPriceYesterday[i][1]);
                break;
            } else {
                var psYesterdayPrice = "Unknown";
            }
        }
    }

    if (psYesterdayPrice === "Unknown") {
        if (!psPriceDaYesterday || psPriceDaYesterday == undefined) {
            var psYesterdayPrice = "Unknown";
        } else {
            for (i = 0; i < psPriceDaYesterday.length; i++) {
                if (psPriceDaYesterday[i].includes(yesterdayGMT)) {
                    var psYesterdayPrice = general.numberWithCommas(psPriceDaYesterday[i][1]);
                    break;
                }
            }
        }
    }

    if (!psPriceDailyGraph || psPriceDailyGraph == undefined) {
        var psTwoDaysPrice = "Unknown";
    } else {
        for (i = 0; i < psPriceDailyGraph.length; i++) {
            if (psPriceDailyGraph[i].includes(twoDaysGMT)) {
                var psTwoDaysPrice = general.numberWithCommas(psPriceDailyGraph[i][1]);
                break;
            } else {
                var psTwoDaysPrice = "Unknown";
            }
        }
    }

    if (!psPriceDailyGraph || psPriceDailyGraph == undefined) {
        var psOneWeekPrice = "Unknown";
    } else {
        for (i = 0; i < psPriceDailyGraph.length; i++) {
            if (psPriceDailyGraph[i].includes(oneWeekGMT)) {
                var psOneWeekPrice = general.numberWithCommas(psPriceDailyGraph[i][1]);
                break;
            } else {
                var psOneWeekPrice = "Unknown";
            }
        }
    }

    // ============================================================================================

    if (!xboxPriceToday || xboxPriceToday == undefined) {
        var xboxLastHourPrice = "Unknown";
    } else {
        for (i = 0; i < xboxPriceToday.length; i++) {
            if (xboxPriceToday[i].includes(lastHourGMT)) {
                var xboxLastHourPrice = general.numberWithCommas(xboxPriceToday[i][1]);
                break;
            } else {
                var xboxLastHourPrice = "Unknown";
            }
        }
    }

    if (xboxLastHourPrice === "Unknown") {
        if (!xboxPriceYesterday || xboxPriceYesterday == undefined) {
            var xboxLastHourPrice = "Unknown";
        } else {
            for (i = 0; i < xboxPriceYesterday.length; i++) {
                if (xboxPriceYesterday[i].includes(lastHourGMT)) {
                    var xboxLastHourPrice = general.numberWithCommas(xboxPriceYesterday[i][1]);
                    break;
                }
            }
        }

    }

    if (!xboxPriceToday || xboxPriceToday == undefined) {
        var xboxLastThreeHourPrice = "Unknown";
    } else {
        for (i = 0; i < xboxPriceToday.length; i++) {
            if (xboxPriceToday[i].includes(lastThreeHourGMT)) {
                var xboxLastThreeHourPrice = general.numberWithCommas(xboxPriceToday[i][1]);
                break;
            } else {
                var xboxLastThreeHourPrice = "Unknown";
            }
        }
    }

    if (xboxLastThreeHourPrice === "Unknown") {
        if (!xboxPriceYesterday || xboxPriceYesterday == undefined) {
            var xboxLastThreeHourPrice = "Unknown";
        } else {
            for (i = 0; i < xboxPriceYesterday.length; i++) {
                if (xboxPriceYesterday[i].includes(lastThreeHourGMT)) {
                    var xboxLastThreeHourPrice = general.numberWithCommas(xboxPriceYesterday[i][1]);
                    break;
                }
            }
        }
    }

    if (!xboxPriceToday || xboxPriceToday == undefined) {
        var xboxLastSixHourPrice = "Unknown";
    } else {
        for (i = 0; i < xboxPriceToday.length; i++) {
            if (xboxPriceToday[i].includes(lastSixHourGMT)) {
                var xboxLastSixHourPrice = general.numberWithCommas(xboxPriceToday[i][1]);
                break;
            } else {
                var xboxLastSixHourPrice = "Unknown";
            }
        }
    }

    if (xboxLastSixHourPrice === "Unknown") {
        if (!xboxPriceYesterday || xboxPriceYesterday == undefined) {
            var xboxLastSixHourPrice = "Unknown";
        } else {
            for (i = 0; i < xboxPriceYesterday.length; i++) {
                if (xboxPriceYesterday[i].includes(lastSixHourGMT)) {
                    var xboxLastSixHourPrice = general.numberWithCommas(xboxPriceYesterday[i][1]);
                    break;
                }
            }
        }
    }


    if (!xboxPriceToday || xboxPriceToday == undefined) {
        var xboxLastTwelveHourPrice = "Unknown";
    } else {
        for (i = 0; i < xboxPriceToday.length; i++) {
            if (xboxPriceToday[i].includes(lastTwelveHourGMT)) {
                var xboxLastTwelveHourPrice = general.numberWithCommas(xboxPriceToday[i][1]);
                break;
            } else {
                var xboxLastTwelveHourPrice = "Unknown";
            }
        }
    }

    if (xboxLastTwelveHourPrice === "Unknown") {
        if (!xboxPriceYesterday || xboxPriceYesterday == undefined) {
            var xboxLastTwelveHourPrice = "Unknown";
        } else {
            for (i = 0; i < xboxPriceYesterday.length; i++) {
                if (xboxPriceYesterday[i].includes(lastTwelveHourGMT)) {
                    var xboxLastTwelveHourPrice = general.numberWithCommas(xboxPriceYesterday[i][1]);
                    break;
                }
            }
        }
    }

    if (!xboxPriceYesterday || xboxPriceYesterday == undefined) {
        var xboxYesterdayPrice = "Unknown";
    } else {
        for (i = 0; i < xboxPriceYesterday.length; i++) {
            if (xboxPriceYesterday[i].includes(yesterdayGMT)) {
                var xboxYesterdayPrice = general.numberWithCommas(xboxPriceYesterday[i][1]);
                break;
            } else {
                var xboxYesterdayPrice = "Unknown";
            }
        }
    }

    if (xboxYesterdayPrice === "Unknown") {
        if (!xboxPriceDaYesterday || xboxPriceDaYesterday == undefined) {
            var xboxYesterdayPrice = "Unknown";
        } else {
            for (i = 0; i < xboxPriceDaYesterday.length; i++) {
                if (xboxPriceDaYesterday[i].includes(yesterdayGMT)) {
                    var xboxYesterdayPrice = general.numberWithCommas(xboxPriceDaYesterday[i][1]);
                    break;
                }
            }
        }
    }

    if (!xboxPriceDailyGraph || xboxPriceDailyGraph == undefined) {
        var xboxTwoDaysPrice = "Unknown";
    } else {
        for (i = 0; i < xboxPriceDailyGraph.length; i++) {
            if (xboxPriceDailyGraph[i].includes(twoDaysGMT)) {
                var xboxTwoDaysPrice = general.numberWithCommas(xboxPriceDailyGraph[i][1]);
                break;
            } else {
                var xboxTwoDaysPrice = "Unknown";
            }
        }
    }

    if (!xboxPriceDailyGraph || xboxPriceDailyGraph == undefined) {
        var xboxOneWeekPrice = "Unknown";
    } else {
        for (i = 0; i < xboxPriceDailyGraph.length; i++) {
            if (xboxPriceDailyGraph[i].includes(oneWeekGMT)) {
                var xboxOneWeekPrice = general.numberWithCommas(xboxPriceDailyGraph[i][1]);
                break;
            } else {
                var xboxOneWeekPrice = "Unknown";
            }
        }
    }

    // ============================================================================================

    if (!pcPriceToday || pcPriceToday == undefined) {
        var pcLastHourPrice = "Unknown";
    } else {
        for (i = 0; i < pcPriceToday.length; i++) {
            if (pcPriceToday[i].includes(lastHourGMT)) {
                var pcLastHourPrice = general.numberWithCommas(pcPriceToday[i][1]);
                break;
            } else {
                var pcLastHourPrice = "Unknown";
            }
        }
    }

    if (pcLastHourPrice === "Unknown") {
        if (!pcPriceYesterday || pcPriceYesterday == undefined) {
            var pcLastHourPrice = "Unknown";
        } else {
            for (i = 0; i < pcPriceYesterday.length; i++) {
                if (pcPriceYesterday[i].includes(lastHourGMT)) {
                    var pcLastHourPrice = general.numberWithCommas(pcPriceYesterday[i][1]);
                    break;
                }
            }
        }

    }

    if (!pcPriceToday || pcPriceToday == undefined) {
        var pcLastThreeHourPrice = "Unknown";
    } else {
        for (i = 0; i < pcPriceToday.length; i++) {
            if (pcPriceToday[i].includes(lastThreeHourGMT)) {
                var pcLastThreeHourPrice = general.numberWithCommas(pcPriceToday[i][1]);
                break;
            } else {
                var pcLastThreeHourPrice = "Unknown";
            }
        }
    }

    if (pcLastThreeHourPrice === "Unknown") {
        if (!pcPriceYesterday || pcPriceYesterday == undefined) {
            var pcLastThreeHourPrice = "Unknown";
        } else {
            for (i = 0; i < pcPriceYesterday.length; i++) {
                if (pcPriceYesterday[i].includes(lastThreeHourGMT)) {
                    var pcLastThreeHourPrice = general.numberWithCommas(pcPriceYesterday[i][1]);
                    break;
                }
            }
        }
    }

    if (!pcPriceToday || pcPriceToday == undefined) {
        var pcLastSixHourPrice = "Unknown";
    } else {
        for (i = 0; i < pcPriceToday.length; i++) {
            if (pcPriceToday[i].includes(lastSixHourGMT)) {
                var pcLastSixHourPrice = general.numberWithCommas(pcPriceToday[i][1]);
                break;
            } else {
                var pcLastSixHourPrice = "Unknown";
            }
        }
    }

    if (pcLastSixHourPrice === "Unknown") {
        if (!pcPriceYesterday || pcPriceYesterday == undefined) {
            var pcLastSixHourPrice = "Unknown";
        } else {
            for (i = 0; i < pcPriceYesterday.length; i++) {
                if (pcPriceYesterday[i].includes(lastSixHourGMT)) {
                    var pcLastSixHourPrice = general.numberWithCommas(pcPriceYesterday[i][1]);
                    break;
                }
            }
        }
    }


    if (!pcPriceToday || pcPriceToday == undefined) {
        var pcLastTwelveHourPrice = "Unknown";
    } else {
        for (i = 0; i < pcPriceToday.length; i++) {
            if (pcPriceToday[i].includes(lastTwelveHourGMT)) {
                var pcLastTwelveHourPrice = general.numberWithCommas(pcPriceToday[i][1]);
                break;
            } else {
                var pcLastTwelveHourPrice = "Unknown";
            }
        }
    }

    if (pcLastTwelveHourPrice === "Unknown") {
        if (!pcPriceYesterday || pcPriceYesterday == undefined) {
            var pcLastTwelveHourPrice = "Unknown";
        } else {
            for (i = 0; i < pcPriceYesterday.length; i++) {
                if (pcPriceYesterday[i].includes(lastTwelveHourGMT)) {
                    var pcLastTwelveHourPrice = general.numberWithCommas(pcPriceYesterday[i][1]);
                    break;
                }
            }
        }
    }

    if (!pcPriceYesterday || pcPriceYesterday == undefined) {
        var pcYesterdayPrice = "Unknown";
    } else {
        for (i = 0; i < pcPriceYesterday.length; i++) {
            if (pcPriceYesterday[i].includes(yesterdayGMT)) {
                var pcYesterdayPrice = general.numberWithCommas(pcPriceYesterday[i][1]);
                break;
            } else {
                var pcYesterdayPrice = "Unknown";
            }
        }
    }

    if (pcYesterdayPrice === "Unknown") {
        if (!pcPriceDaYesterday || pcPriceDaYesterday == undefined) {
            var pcYesterdayPrice = "Unknown";
        } else {
            for (i = 0; i < pcPriceDaYesterday.length; i++) {
                if (pcPriceDaYesterday[i].includes(yesterdayGMT)) {
                    var pcYesterdayPrice = general.numberWithCommas(pcPriceDaYesterday[i][1]);
                    break;
                }
            }
        }
    }

    if (!pcPriceDailyGraph || pcPriceDailyGraph == undefined) {
        var pcTwoDaysPrice = "Unknown";
    } else {
        for (i = 0; i < pcPriceDailyGraph.length; i++) {
            if (pcPriceDailyGraph[i].includes(twoDaysGMT)) {
                var pcTwoDaysPrice = general.numberWithCommas(pcPriceDailyGraph[i][1]);
                break;
            } else {
                var pcTwoDaysPrice = "Unknown";
            }
        }
    }

    if (!pcPriceDailyGraph || pcPriceDailyGraph == undefined) {
        var pcOneWeekPrice = "Unknown";
    } else {
        for (i = 0; i < pcPriceDailyGraph.length; i++) {
            if (pcPriceDailyGraph[i].includes(oneWeekGMT)) {
                var pcOneWeekPrice = general.numberWithCommas(pcPriceDailyGraph[i][1]);
                break;
            } else {
                var pcOneWeekPrice = "Unknown";
            }
        }
    }

    const psPriceHistory = `1 hour ago: ${psLastHourPrice}\n3 hours ago: ${psLastThreeHourPrice}\n6 hours ago: ${psLastSixHourPrice}\n12 hours ago: ${psLastTwelveHourPrice}\n1 day ago: ${psYesterdayPrice}\n2 days ago: ${psTwoDaysPrice}\n1 week ago: ${psOneWeekPrice}`;
    const xboxPriceHistory = `1 hour ago: ${xboxLastHourPrice}\n3 hours ago: ${xboxLastThreeHourPrice}\n6 hours ago: ${xboxLastSixHourPrice}\n12 hours ago: ${xboxLastTwelveHourPrice}\n1 day ago: ${xboxYesterdayPrice}\n2 days ago: ${xboxTwoDaysPrice}\n1 week ago: ${xboxOneWeekPrice}`;
    const pcPriceHistory = `1 hour ago: ${pcLastHourPrice}\n3 hours ago: ${pcLastThreeHourPrice}\n6 hours ago: ${pcLastSixHourPrice}\n12 hours ago: ${pcLastTwelveHourPrice}\n1 day ago: ${pcYesterdayPrice}\n2 days ago: ${pcTwoDaysPrice}\n1 week ago: ${pcOneWeekPrice}`;

    const psPrices = playerData.prices.ps;
    const xboxPrices = playerData.prices.xbox;
    const pcPrices = playerData.prices.pc;

    embed.addField("PS", `**5 lowest BIN prices**\n- ${psPrices.LCPrice}\n- ${psPrices.LCPrice2}\n- ${psPrices.LCPrice3}\n- ${psPrices.LCPrice4}\n- ${psPrices.LCPrice5}\n**Updated**: ${psPrices.updated}\n**RPR**: ${psPrices.PRP}%\n\n**Range**:\n${psPrices.MinPrice} - ${psPrices.MaxPrice}\xa0\n\n**Price history**\n${psPriceHistory}\n`, true);
    embed.addField("XBOX", `**5 lowest BIN prices**\n- ${xboxPrices.LCPrice}\n- ${xboxPrices.LCPrice2}\n- ${xboxPrices.LCPrice3}\n- ${xboxPrices.LCPrice4}\n- ${xboxPrices.LCPrice5}\n**Updated**: ${xboxPrices.updated}\n**RPR**: ${xboxPrices.PRP}%\n**Range**:\n${xboxPrices.MinPrice} - ${xboxPrices.MaxPrice}\xa0\n\n**Price history**\n${xboxPriceHistory}\n`, true);
    embed.addField("PC", `**5 lowest BIN prices**\n- ${pcPrices.LCPrice}\n- ${pcPrices.LCPrice2}\n- ${pcPrices.LCPrice3}\n- ${pcPrices.LCPrice4}\n- ${pcPrices.LCPrice5}\n**Updated**: ${pcPrices.updated}\n**RPR**: ${pcPrices.PRP}%\n**Range**:\n${pcPrices.MinPrice} - ${pcPrices.MaxPrice}\xa0\n\n**Price history**\n${pcPriceHistory}\n`, true);

    return embed;
};

async function getDataRedis(id) {
    const res = await clientRedis.get(id);

    if (!res || res == null) return false;

    return JSON.parse(res);
};
