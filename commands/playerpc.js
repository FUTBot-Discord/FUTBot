exports.run = async (client, message, args) => {
    const cmd = client.commands.get("player");

    return cmd.run(client, message, args);
}