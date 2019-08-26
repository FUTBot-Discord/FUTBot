exports.run = async (client, message, args) => {
    const cmd = client.commands.get("chemistry");

    return cmd.run(client, message, args);
}