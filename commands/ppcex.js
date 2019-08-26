exports.run = async (client, message) => {
    const cmd = client.commands.get("playerpcex");

    return cmd.run(client, message);
}