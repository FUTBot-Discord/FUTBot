const { RichEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
    const embed = new RichEmbed()
        .setTitle('Help page')
        .setDescription('We here at the FUTBot really want to help you.\n' +
            'Do you want to know all the commands? Use the ** commands ** (fut!commands) command to see all available commands.\n' +
            "Can't you understand what to do or what else? Join the supported Discord server! [Click here](https://discord.gg/KUnh4fc) to join it.\n" +
            "All the information could also be found at the documentation webpage(https://futbot.tech/documentation). If you [click here](https://futbot.tech/documentation) you will be redirected to the webpage.\n\n" +
            "Want to get some advanced profit calculation? Take a look at the \"Profit\" bot also. It can be found [here](https://www.profitbot.tech/).");

    return message.channel.send(embed);
}