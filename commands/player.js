const rp = require("request-promise");

exports.run = async (client, message, args) => {
    var reqOpts = {
        url: "http://mcstatus.tjird.eu/check/play.dusdavidgames.nl",
        method: "GET",
        headers: { "Cache-Control": "no-cache" },
        proxy: "http://185.216.162.75:3128"
    };
    const request = await rp(reqOpts);
}