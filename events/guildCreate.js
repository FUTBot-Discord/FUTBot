const rediss = require("redis");
const { redis } = require("../config");
const pub = rediss.createClient(redis);

sub.on("error", (err) => {
    console.log(`Error ${err}`);
});

module.exports = (client, guild) => {
    pub.publish("addedGuild", [guild.name, guild.owner]);
}