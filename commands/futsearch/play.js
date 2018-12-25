const commando = require('discord.js-commando');
const YTDL = require('ytdl-core');

class LeaveCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'play',
            group: 'fut_play',
            memberName: 'play',
            description: 'Zoekt de goedkoopste per rating'
        });
    }

    async run(message, args) {
        const url = args.split(" ").slice(0, 1);

        function playMusic (url) {

        }

        if (message.guild.voiceConnection) {
            if (message.guild.voiceConnection.status == 0) {
                playMusic(url);
            }
        } else {
            if (message.member.voiceChannel) {
                message.member.voiceChannel.join();
                if (message.guild.voiceConnection.status == 2) message.reply("spraakkanaal joined");
                playMusic(url);
            } else {
                message.reply("Je zal eerst zelf in een spraakanaal moeten zitten");
            }
        }
    }
}

module.exports = LeaveCommand;