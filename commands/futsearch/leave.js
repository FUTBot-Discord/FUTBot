const commando = require('discord.js-commando');

class LeaveCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'leave',
            group: 'fut_leave',
            memberName: 'leave',
            description: 'Zoekt de goedkoopste per rating'
        });
    }

    async run(message, args) {
        if (message.guild.voiceConnection) {
            if (message.guild.voiceConnection.status == 0) {
                message.guild.voiceConnection.disconnect();
                message.reply("spraakkanaal verlaten");
            }
        } else {
            message.reply("De bot is atm niet aanwezig in een spraakkanaal");
        }
    }
}

module.exports = LeaveCommand;