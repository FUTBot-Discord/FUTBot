const AsciiTable = require('ascii-table');
const general = require("../functions/general");

exports.run = async (client, message, args) => {
    const channel = message.channel;

    const t = new AsciiTable("Current TOTW")
        .setHeading('Name', 'Rating', 'Position')
        .setTitleAlignCenter()
        .setAlign(1, AsciiTable.LEFT)
        .setAlign(2, AsciiTable.LEFT)
        .setAlign(3, AsciiTable.LEFT);

    const players = await general.getActiveTOTWPlayers();

    for (let player of players) {
        let n = player.meta_info.common_name ? player.meta_info.common_name : `${player.meta_info.first_name} ${player.meta_info.last_name}`;

        t.addRow(n, player.rating, player.preferred_position);
    }

    return channel.send(t, {
        split: true,
        code: true
    });
}