exports.run = async (client, message) => {
    const cmd = client.commands.get("playerex");

    return cmd.run(client, message);
}