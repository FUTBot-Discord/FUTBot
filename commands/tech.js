exports.run = async (client, message, args) => {
    return message.reply(parseFloat(message.content) * 1.15);
}