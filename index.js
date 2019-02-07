const Commando = require('discord.js-commando');
const client = new Commando.Client({
    owner: '259012839379828739',
    commandPrefix: 'fut!'
});
const path = require('path');
var CONFIG = require('./config.json');
const DBL = require("dblapi.js");
const dbl = new DBL(CONFIG.dbl, client);

client.login(CONFIG.token);

client.registry
    .registerGroups([
        ['fut_playersearch', 'FUT PlayerSearch'],
        ['fut_chem', 'Chem'],
        ['fut_position', 'Position'],
        ['fut_help', 'Help'],
        ['fut_playersearchpc', 'FUT PlayerSearchPC'],
        ['fut_cheapest', 'FUT Cheapest']
    ])
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', async function () {
    let count = 0;
    await client.guilds.forEach((guild) => {
        guild.fetchMembers().then(g => {
            g.members.forEach((member) => {
                count++;
            });
        });
    });
    await setTimeout(() => {
	    console.log(`Bot has started, with ${count} users, in ${client.channels.size} channels of ${client.guilds.size} guild(s).`);
    }, 6000);
    client.user.setActivity(`${client.guilds.size} server(s)`, { type: 'WATCHING' });
    setInterval(() => {
        //dbl.postStats(client.guilds.size);
	client.user.setActivity(`${client.guilds.size} server(s)`, { type: 'WATCHING' });
    }, 1800000);
});

client.on('error', console.error);
