exports.run = async (client, message, args) => {
    if (!args[0]) return message.reply("You need to fill in a number.");

    return message.reply(parseFloat(args[0]) * 1.15);
}