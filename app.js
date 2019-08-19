const Discord = require('discord.js');
const config = require('./config.js');

const shardmanager = new Discord.ShardingManager('./bot.js', {
    totalShards: config.general.shards,
    token: config.general.token,
    respawn: config.general.respawn
});

shardmanager.spawn();

setTimeout(() => {
    shardmanager.fetchClientValues('guilds.size')
    .then(results => {
        console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`);
        shardmanager.broadcastEval(`client.user.setActivity(${results.reduce((prev, val) => prev + val, 0)}, { type: 'WATCHING' });`);
        shardmanager.broadcastEval(`dbl.postStats(${results.reduce((prev, val) => prev + val, 0)});`);
    })
    .catch(console.error);
}, 46000)


setInterval(() => {
shardmanager.fetchClientValues('guilds.size')
    .then(results => {
        console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`);
        shardmanager.broadcastEval(`client.user.setActivity(${results.reduce((prev, val) => prev + val, 0)}, { type: 'WATCHING' });`);
        shardmanager.broadcastEval(`dbl.postStats(${results.reduce((prev, val) => prev + val, 0)});`);
    })
    .catch(console.error);
}, 1800000)