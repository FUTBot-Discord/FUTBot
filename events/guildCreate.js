const rediss = require("redis");
const {
    redis
} = require("../config");
const pub = rediss.createClient(redis);

pub.on("error", err => {
    console.log(`Error ${err}`);
});

module.exports = (client, guild) => {
    const gOwner = guild.owner;

    try {
        gOwner.send(
            `Heeyy!! Love to you because your guild has invited me. \nYou can find the documentation at https://futbot.tjird.eu. \nIf you have any questions, don't hesitate and join the supported Discord https://discord.gg/KUnh4fc.`
        );
    } catch (e) {}

    pub.publish(
        "addedGuild",
        `{"guildName": "${guild.name.toString()}", "guildOwner": "${guild.owner.user.tag.toString()}", "botId": "${client.user.id.toString()}"}`
    );
};