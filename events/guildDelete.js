const rediss = require("redis");
const {
    redis
} = require("../config");
const pub = rediss.createClient(redis);

pub.on("error", (err) => {
    console.log(`Error ${err}`);
});

module.exports = (client, guild) => {
    pub.publish("leftGuild", `{"guildName": "${guild.name.toString()}", "guildOwner": "${guild.owner.user.tag.toString() ? guild.owner.user.tag.toString() : "Unknown#0000"}", "botId": "${client.user.id.toString()}"}`);
}