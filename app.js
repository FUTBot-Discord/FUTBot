const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./config.js');

const redis = require("redis");
const pub = redis.createClient(config.redis);

pub.on("error", (err) => {
    console.log(`Error2 ${err}`);
});

const DBL = require("dblapi.js");
const dbl = new DBL('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUyMDY5NDYxMjA4MDMyODcwOSIsImJvdCI6dHJ1ZSwiaWF0IjoxNTQ3NjMyOTU2fQ.Q8mbinEz3TtHhK3rU5WVVou3qyiirBohq9WR2MsPWJc', client);

const shardmanager = new Discord.ShardingManager('./bot.js', {
    totalShards: config.general.shards,
    token: config.general.token,
    respawn: config.general.respawn,
    delay: config.general.delay
});

shardmanager.spawn(this.totalShards, config.general.delay);

const delay = 7000 + (config.general.shards * config.general.delay);

setTimeout(() => {
    shardmanager.fetchClientValues('guilds.size')
        .then(results => {
            var counts = results.reduce((prev, val) => prev + val, 0);

            pub.publish("updateGuildsCount", `${counts}`);
            dbl.postStats(`${counts}`);
        })
        .catch(console.error);
}, delay);

setInterval(() => {
    shardmanager.fetchClientValues('guilds.size')
        .then(results => {
            var counts = results.reduce((prev, val) => prev + val, 0);

            pub.publish("updateGuildsCount", `${counts}`);
            dbl.postStats(`${counts}`);
        })
        .catch(console.error);
}, 300000);
