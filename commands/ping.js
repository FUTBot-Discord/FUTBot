exports.run = async (client, message) => {
    message.channel.send("Pinging...").then(m => {
        return m.edit(`Bot Latency: \`${m.createdTimestamp - message.createdTimestamp}ms\`, API Latency: \`${Math.round(client.ping)}ms\``);
    });
}