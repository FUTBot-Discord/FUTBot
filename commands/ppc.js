exports.run = async (client, message, args) => {
    const cmd = client.commands.get("playerpc");

    return cmd.run(client, message, args);
}