const { RichEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
    const embed = new RichEmbed()
        .setTitle("Commands page")
        .setDescription("Any question about an ommand? Join the [Supported Discord](https://discord.gg/KUnh4fc) or take a look at the [documentation](https://futbot.tech/documentation).\n" +
            "If an argument has <> around it will mean that it's **required**. If an argument has \[\] around it will mean that it's **not required**.\n" +
            "Command // Example")
        .addField('Player prices', "player <playername> \[rating\] // fut!player van dijk 90\n" +
            "playerex <playername> \[rating\] // fut!playerex mbappe\n" +
            "cheapest <rating> <console> // fut!cheapest 83-84 ps\n" +
            "top <console> \[type\] // fut!top xbox otw\n" +
            "totw **NO ARGS** // fut!totw", false)
        .addField('Consumables', "chemistry **NO ARGS** // fut!chemistry\n" +
            "position **NO ARGS** // fut!position", false)
        .addField("SBC", "sbc list **NO ARGS** // fut!sbc list\n" +
            "sbc get <sbc_id> // fut!sbc get 8", false)
        .addField('Simple calculator', "tax be <price> \[amount\] // fut!tax be 80000 4\n" +
            "tax profit <buy-price> <sell-price> \[amount\] // fut!tax profit 1600 2000 9\n" +
            "tax tax <price> \[amount\] // fut!tax tax 4500 2\n" +
            "tech <price> // fut!tech 15000", false)
        .addField("Util", "donate **NO ARGS** // fut!donate\n" +
            "help **NO ARGS** // fut!help\n" +
            "invite **NO ARGS** // fut!invite\n" +
            "ping **NO ARGS** // fut!ping\n" +
            "prefix change <prefix> // fut!prefix change fut?", false)
        .addBlankField(false)
        .addField("Console list", "- ps\n- xbox\n- pc", false)
        .addField("Type list", "- gold OR golds\n- icon OR icons\n- otw OR otws", false)
        .setFooter("FUTBot v.2.0.0 | Made by Tjird#0001", "https://tjird.nl/futbot.jpg");

    return message.channel.send(embed);
}