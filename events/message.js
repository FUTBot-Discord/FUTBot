const r = require("rethinkdb");
const pool = require("../functions/rethinkdb");
const mysql = require("../functions/mysql");
const { escape } = require("mysql");

module.exports = async (client, message) => {
    if (message.author.bot) return;
    if (!message.guild || message.guild == undefined) return;

    const prefix = await fetchPrefix(message.guild.id);

    if (message.content.startsWith(`<@${client.user.id}>`)) return message.channel.send(`The current prefix is: \`${prefix}\`.`);
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (!command) return message.channel.send(`Use the command \`${prefix}help\` to see all commands.`);

    const cmd = client.commands.get(command);

    if (!cmd) return message.channel.send(`No command found that is called \`${command}\`.`);

    let username = `${message.author.username}#${message.author.discriminator}`;

    mysql.query(`INSERT INTO command_log (guild_name, guild_id, user_name, user_id, channel_name, channel_id, command) VALUES (${escape(message.guild.name)}, ${message.guild.id}, ${escape(username)}, ${message.author.id}, ${escape(message.channel.name)}, ${message.channel.id}, ${escape(command)})`);

    cmd.run(client, message, args);
}

async function fetchPrefix(guildId) {
    const d = await pool.run(r.table("prefix").get(guildId));
    if (d === null) return "fut!";
    return d.prefix;
}