const Discord = require("discord.js");
const general = require("../functions/general");

exports.run = async (client, message, args) => {
    if (!args[0] || args[0] == undefined) return message.reply("fill in a subcommand.");

    const subcommand = args[0];
    const subcommands = [
        "list",
        "add",
        "remove",
        "change",
        "clear"
    ];

    if (!subcommands.includes(subcommand)) return message.reply("use a valid subcommand.");

    if (!args[1] || args[1] == undefined) return message.reply("fill in a console.");

    const pConsole = args[1].toLowerCase();
    const consoles = [
        "pc",
        "xb",
        "ps"
    ];

    if (!consoles.includes(pConsole)) return message.reply("use a valid console.");

    const guild = message.guild;
    const channel = message.channel;

    let data;

    if (subcommand === "list") {
        data = await general.getFlippingList(guild.id, pConsole);

        if (!data || data == undefined) return channel.send("There went something wrong, try again later..");
        if (data.length < 1) return channel.send(`Flipping list for console called \`${pConsole.toUpperCase()}\` is empty.`);

        res = new Discord.RichEmbed()
            .setFooter("FUTBot v.2.0.0 | Data from FUTBIN | Made by Tjird#0001", "https://tjird.nl/futbot.jpg")
            .setColor(0x2FF37A)
            .setTitle(`Flipping list for the console ${pConsole.toUpperCase()}`);

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

            res.addField(playername, `Buy Price: ${general.numberWithCommas(player.buy_price)}\nSell Price: ${general.numberWithCommas(player.sell_price)}\n\nFUTBIN Price: ${prices.LCPrice}\nUpdated at: ${prices.updated}`, true);
        }

        return channel.send(res);
    }

    if (!general.checkPermissionAdmin(message.member)) return channel.send(`You(${message.author}) do not have the right permissions to change the flipping list. The \`ADMINISTRATOR\` permission is needed.`);

    if (subcommand === "clear") {
        return await general.clearFlippingList(pConsole, guild.id) ? channel.send(`Flipping list for the console ${pConsole.toUpperCase()} has been cleared.`) : channel.send(`Something went wrong when clearing the flipping list of console ${pConsole.toUpperCase()}.`);
    } else if (subcommand === "remove") {
        if (!args[2] || args[2] == undefined) return message.reply("fill in a playerId.");
        if (!/^\d+$/.test(args[2])) return message.reply("fill in a valid playerId");

        let playerId = args[2];

        return await general.removeItemFlippingList(pConsole, guild.id, playerId) ? channel.send(`Flipping list for the console ${pConsole.toUpperCase()} and with playerId ${playerId} has been cleared.`) : channel.send(`Something went wrong when removing a item with id ${playerId} and console ${pConsole.toUpperCase()}.`);
    } else if (subcommand === "add") {
        if (!args[2] || args[2] == undefined) return message.reply("fill in a playerId.");
        if (!/^\d+$/.test(args[2])) return message.reply("fill in a valid playerId");

        let playerId = args[2];

        if (!args[3] || args[3] == undefined) return message.reply("fill in a buy-price.");
        if (!/^\d+$/.test(args[3])) return message.reply("fill in a valid buy-price");

        let buyPrice = args[3];

        if (!args[4] || args[4] == undefined) return message.reply("fill in a sell-price.");
        if (!/^\d+$/.test(args[4])) return message.reply("fill in a valid sell-price");

        let sellPrice = args[4];

        if (!args[5] || args[5] == undefined) return message.reply("fill in a sold-price.");
        if (!/^\d+$/.test(args[5])) return message.reply("fill in a valid sold-price");

        let soldPrice = args[5];

        if (await general.getItemFlippingList(pConsole, guild.id, playerId)) return message.reply(`There is already a player in your list with id ${playerId}.`);

        return await general.addItemFlippingList(pConsole, guild.id, playerId, buyPrice, sellPrice, soldPrice) ? channel.send(`Player has been added to the flipping list of console ${pConsole.toUpperCase()}`) : channel.send("Something went wrong when you were trying to add a player.");
    } else if (subcommand === "change") {
        if (!args[2] || args[2] == undefined) return message.reply("fill in a playerId.");
        if (!/^\d+$/.test(args[2])) return message.reply("fill in a valid playerId");

        let playerId = args[2];

        if (!args[3] || args[3] == undefined) return message.reply("fill in a buy-price.");
        if (!/^\d+$/.test(args[3])) return message.reply("fill in a valid buy-price");

        let buyPrice = args[3];

        if (!args[4] || args[4] == undefined) return message.reply("fill in a sell-price.");
        if (!/^\d+$/.test(args[4])) return message.reply("fill in a valid sell-price");

        let sellPrice = args[4];

        if (!args[5] || args[5] == undefined) return message.reply("fill in a sold-price.");
        if (!/^\d+$/.test(args[5])) return message.reply("fill in a valid sold-price");

        let soldPrice = args[5];

        if (!await general.getItemFlippingList(pConsole, guild.id, playerId)) return message.reply(`There is no player in your list with id ${playerId}.`);

        return await general.updateItemFlippingList(pConsole, guild.id, playerId, buyPrice, sellPrice, soldPrice) ? channel.send(`Player has been changed at the flipping list of console ${pConsole.toUpperCase()}`) : channel.send("Something went wrong when you were trying to change a player.");
    }

}