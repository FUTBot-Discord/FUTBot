exports.run = async (client, message, args) => {
    const cmd = client.commands.get("playerpcex");

    return cmd.run(client, message, args);
}