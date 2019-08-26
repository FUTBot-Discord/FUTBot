exports.run = async (client, message) => {
    const cmd = client.commands.get("playerpc");

    return cmd.run(client, message);
}