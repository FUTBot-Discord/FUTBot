exports.run = async (client, message, args) => {
    const cmd = client.commands.get("help");

    return cmd.run(client, message, args);
}