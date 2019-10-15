const Discord = require("discord.js");
const general = require("../functions/general");

exports.run = async (client, message, args) => {
    if (!args[0] || args[0] == undefined) return message.reply("fill in a console.");

    const pConsole = args[0].toLowerCase();
    const consoles = [
        "pc",
        "xb",
        "ps"
    ];

    if (!consoles.includes(pConsole)) return message.reply("use a valid console.");

    const guild = message.guild;
    const channel = message.channel;

    let data = await general.getFlippingList(guild.id, pConsole);

    if (!data || data == undefined) return channel.send("There went something wrong, try again later..");
    if (data.length < 1) return channel.send(`Profit list for console called \`${pConsole.toUpperCase()}\` is empty.`);

    let res = new Discord.RichEmbed()
        .setFooter("FUTBot v.2.0.0 | Data from FUTBIN | Made by Tjird#0001", "https://tjird.nl/futbot.jpg")
        .setColor(0x2FF37A)
        .setTitle(`Profit list for the console ${pConsole.toUpperCase()}`);

    let playername;
    let player_info;
    let prices;
    let psPrices;
    let pcPrices;
    let xboxPrices;

    for (player of data) {
        player_info = player.player_info.meta_info;
        playername = player_info.common_name ? player_info.common_name : `${player_info.first_name} ${player_info.last_name}`;
        prices = await general.getPlayerPrices(player.player_id);
        psPrices = prices.ps;
        pcPrices = prices.pc;
        xboxPrices = prices.xbox;

        switch (pConsole) {
            case "ps":
                prices = psPrices;
                break;
            case "xb":
                prices = xboxPrices;
                break;
            case "pc":
                prices = pcPrices;
                break;
        };

        res.addField(playername, `**Trader Info**\nBought for: ${general.numberWithCommas(player.buy_price)}\nSell for: ${general.numberWithCommas(player.sold_price)}\n\n**FUTBIN Info**\nSell for: ${prices.LCPrice}\nUpdated at: ${prices.updated}`, true);
    }

    return channel.send(res);
}