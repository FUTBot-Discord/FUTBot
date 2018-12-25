const commando = require('discord.js-commando');

class JoinCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'join',
            group: 'fut_join',
            memberName: 'join',
            description: 'Zoekt de goedkoopste per rating'
        });
    }

    async run(message, args) {
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join();
            if (message.guild.voiceConnection.status == 2) message.reply("spraakkanaal joined");
        } else {
            message.reply("Je zal eerst zelf in een spraakanaal moeten zitten");
        }
    }
}

module.exports = JoinCommand;