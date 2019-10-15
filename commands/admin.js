const general = require("../functions/general");

exports.run = async (client, message, args) => {
    if (!args[0] || args[0] == undefined) return message.reply("fill in a subcommand.");

    const subcommands = [
        "whitelist"
    ];
    const subcommand = args[0];

    if (!subcommands.includes(subcommand)) return message.reply("use a valid subcommand.");

    if (!args[1] || args[1] == undefined) return message.reply("fill in an argument.");

    const arguments = [
        "remove",
        "add"
    ];
    const argument = args[1];

    if (!arguments.includes(argument)) return message.reply("use a valid argument.");

    if ((!args[2] || args[2] == undefined) && (!args[3] || args[3] == undefined)) return message.reply("command and guildId must be filled-in.");

    switch (argument) {
        case "add":
            await general.insertCommandWhitelist(args[2], args[3]);
            return message.delete();
        case "remove":
            await general.removeCommandWhitelist(args[2], args[3]);
            return message.delete();
    };
}