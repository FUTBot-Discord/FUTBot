const r = require("rethinkdb");
const pool = require("../functions/rethinkdb");

module.exports = async (client, message) => {
    if (message.author.bot) return;

    const prefix = (await getPrefix(message.guild.id)) ? await getPrefix(message.guild.id) : "fut!";

    if (message.content === `<@${client.user.id}>`) return message.channel.send(`The current prefix is: \`${prefix}\`.`);

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === prefix) return message.channel.send(`Use the command \`${prefix}help\` to see all commands.`);

    const cmd = client.commands.get(command);

    if (!cmd) return message.channel.send(`No command found that is called \`${command}\`.`);

    cmd.run(client, message, args);
}

function getPrefix (guildId) {
    const d = pool.run(r.table("prefix").get(guildId));
    return d.prefix;
}