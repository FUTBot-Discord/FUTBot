const rediss = require("redis");
const { redis } = require("../config");
const sub = rediss.createClient(redis);

sub.on("error", (err) => {
    console.log(`Error1 ${err}`);
});

module.exports = (client) => {
    client.user.setActivity(`startup process, give me a moment plz ,_,`, { type: 'PLAYING' });

    let usercount = 0;

    for (i = 0; i < client.guilds.size; i++) {
        usercount += client.guilds.array()[i].memberCount;
    }

    console.log(`Logged in as ${client.user.tag} and looking at ${usercount} users(${client.guilds.size} guilds). `
        + `Shard ID: ${(client.shard.id + 1)}/${client.shard.count}.`);

    sub.subscribe("updateGuildsCount");

    sub.on("message", (channel, message) => {
        client.user.setActivity(`${message} servers`, { type: 'WATCHING' });
    });

    console.log("====================")
};
