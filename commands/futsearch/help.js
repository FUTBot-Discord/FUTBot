const commando = require('discord.js-commando');
const Discord = require('discord.js');

class HelpCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'help',
            group: 'fut_help',
            memberName: 'help',
            description: 'Help command'
        });
    }

    async run(message, args) {
        if (message.author.bot) return;
        message.reply("all the commands with there documentation are available on this site. \nhttps://discordbots.org/bot/520694612080328709\nDo you have a question that is not answered after reading the documentation? Join the supported Discord! https://discord.gg/KUnh4fc");
    }
}
    module.exports = HelpCommand;