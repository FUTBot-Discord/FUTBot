const r = require("rethinkdb");
const pool = require("../functions/rethinkdb");

exports.run = async (client, message, args) => {
    const guildId = message.guild.id;
    const channel = message.channel;

    if (!checkPermissionAdmin(message.member)) return channel.send(`You(${message.author}) do not have the right permissions to change the prefix. The \`ADMINISTRATOR\` permission is needed.`);

    const firstArgument = args[0];

    if (firstArgument !== "show" && firstArgument !== "change") return channel.send(`Use one of the arguments. The available arguments are: \`show\` and \`change\`.`);
    if (firstArgument === "show") return channel.send(`The prefix this guild is using is as followed: \`${await fetchPrefix(guildId)}\`.`);

    const requestedPrefix = args[1];

    if (!requestedPrefix) return channel.send(`Fill in a requested prefix as second argument.`);
    if (!regexCheck(requestedPrefix)) return channel.send(`The requested prefix can't be used, some characters are not allowed.`);

    const prefixUpdate = await updatePrefix(guildId, requestedPrefix);

    if (prefixUpdate.unchanged > 0) return channel.send(`It's the same prefix as previous, use an other prefix if you want to change.`);
    if (prefixUpdate.replaced > 0) return channel.send(`Prefix has just been changed to: \`${requestedPrefix}\``);

    await createRow(guildId,requestedPrefix)
        .then(channel.send(`Prefix has just been changed to: \`${requestedPrefix}\``));
}

function checkPermissionAdmin(guildMember) {
    return guildMember.permissions.has("ADMINISTRATOR");
}

function regexCheck(prefix) {
    const regex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(\?\<\>+=._-]+$/g;
    return (regex.exec(prefix) ? true : false);
}

async function fetchPrefix (guildId) {
    const d = await pool.run(r.table("prefix").get(guildId));
    if (d === null) return "fut!";
    return d.prefix;
}

function createRow (guildId, prefix) {
    const d = pool.run(r.table("prefix").insert({
        id: `${guildId}`,
        prefix: `${prefix}`
      }));
    return d;
}

function updatePrefix (guildId, prefix) {
    const d = pool.run(r.table("prefix").get(`${guildId}`).update({
        prefix: `${prefix}`
      }));
    return d;
}