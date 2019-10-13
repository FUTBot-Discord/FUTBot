exports.run = async (client, message, args) => {
    const cmd = client.commands.get("invite");

    return cmd.run(client, message, args);
}