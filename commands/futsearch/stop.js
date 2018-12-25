const commando = require('discord.js-commando');
const YTDL = require('ytdl-core');

class LeaveCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'stop',
            group: 'fut_stop',
            memberName: 'stop',
            description: 'Zoekt de goedkoopste per rating'
        });
    }

    async run(message, args) {
        
    }
}

module.exports = LeaveCommand;