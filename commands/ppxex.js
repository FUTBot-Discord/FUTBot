exports.run = async (client, message, args) => {
    const cmd = client.commands.get("playerex");

    return cmd.run(client, message, args);
}