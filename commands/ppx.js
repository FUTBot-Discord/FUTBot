exports.run = async (client, message) => {
    const cmd = client.commands.get("player");

    return cmd.run(client, message);
}