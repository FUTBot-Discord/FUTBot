exports.run = async (client, message, args) => {
    const cmd = client.commands.get("position");

    return cmd.run(client, message, args);
}