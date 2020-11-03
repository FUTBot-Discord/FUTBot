exports.run = async (client, message, args) => {
    if (!args[0]) return message.reply("You need to fill in a number.");
    if (args[1]) return message.reply(parseFloat(args[0]) * parseFloat(args[1]) + " // " + args[0]); 
    else return message.reply(parseFloat(args[0]) * 1.15 + " // " + args[0]);
}