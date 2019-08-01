exports.run = async (client, message, args) => {
    if (!checkPermissionAdmin(message.member)) return message.channel.send(`You(${message.author}) do not have the right permissions to change the prefix. The \`ADMINISTRATOR\` permission is needed.`);

    const firstArgument = args.shift();

    if (firstArgument !== "show" || !firstArgument !== "change") return message.channel.send(`Use one of the arguments. The available arguments are: \`show\` and \`change\`.`)

    if ()


    const requestedPrefix = args[1];
    if (!regexCheck(requestedPrefix)) return message.channel.send(`The requested prefix can't be used, some characters are not allowed.`);







}

function checkPermissionAdmin(guildMember) {
    return guildMember.permissions.has("ADMINISTRATOR");
}

function regexCheck(prefix) {
    const regex = /^[a-zA-Z0-9!@#\$%\^\&*\)\(\?\<\>+=._-]+$/g;

    return (regex.exec(prefix) ? true : false);
}