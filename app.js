const Discord = require('discord.js');
const config = require('./config.js');

const shardmanager = new Discord.ShardingManager('./bot.js', {
    totalShards: config.general.shards,
    token: config.general.token,
    respawn: config.general.respawn
});

shardmanager.spawn();