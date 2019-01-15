const Commando = require('discord.js-commando');
const client = new Commando.Client({
    owner: '259012839379828739',
    commandPrefix: 'fut!'
});
const path = require('path');
var CONFIG = require('../config.json');

client.login(CONFIG.token);

client.registry
    .registerGroups([
        ['fut_playersearch', 'FUT PlayerSearch'],
        ['fut_chem', 'Chem'],
        ['fut_position', 'Position'],
        ['fut_cheapest', 'FUT Cheapest']
    ])
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', function () {
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guild(s).`);
    client.user.setActivity(`${client.guilds.size} server(s)`, { type: 'WATCHING' });
});

client.on('error', console.error);

// client.on('message', function () {
//     scrapeIt("https://www.futhead.com/19/squads/441381/", {
//     title: ".header h1"
//   , desc: ".header h2"
//   , avatar: {
//         selector: ".header img"
//       , attr: "src"
//     }
// }).then(({ data, response }) => {
//     console.log(`Status Code: ${response.statusCode}`)
//     console.log(data)
// })
// })



