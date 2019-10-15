const r = require("rethinkdb");
const pool = require("../functions/rethinkdb");
const mysql = require("../functions/mysql");
const { escape } = require("mysql");
const general = require("../functions/general");

module.exports = async (client, message) => {
    if (message.author.bot) return;
    if (!message.guild || message.guild == undefined) return;

    const author = message.author;
    const channel = message.channel;
    const guild = message.guild;

    const prefix = await fetchPrefix(guild.id);

    if (message.content.startsWith(`<@${client.user.id}>`)) return channel.send(`The current prefix is: \`${prefix}\`.`);
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (!command) return channel.send(`Use the command \`${prefix}help\` to see all commands.`);

    const cmd = client.commands.get(command);

    if (!cmd) return channel.send(`No command found that is called \`${command}\`.`);
    if (command === "admin") {
        if (author.id === "259012839379828739") {
            general.insertCommandLog(author.username, author.discriminator, author.id, guild.id, guild.name, channel.name, channel.id, command, args);

            return cmd.run(client, message, args);
        } else {
            return channel.send(`${author.username}#${author.discriminator} is not allowed to use the command called \`${command}\`.`);
        }
    }

    const cmdlist = await general.getCommandsList();

    if (!cmdlist.includes(command)) {
        if (!await general.getCommandWhitelist(command, guild.id)) return channel.send(`This server is not whitelisted for the command called \`${command}\`.`);
    }

    general.insertCommandLog(author.username, author.discriminator, author.id, guild.id, guild.name, channel.name, channel.id, command, args);

    return cmd.run(client, message, args);
}

async function fetchPrefix(guildId) {
    const d = await pool.run(r.table("prefix").get(guildId));
    if (d === null) return "fut!";
    return d.prefix;
}