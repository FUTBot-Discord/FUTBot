const rp = require("request-promise");
const r = require("rethinkdb");
const pool = require("../functions/rethinkdb");
const AsciiTable = require('ascii-table');

exports.run = async (client, message, args) => {
    const channel = message.channel;
    const user = message.author;
    const rarityString = await getRarityString();

    rarityString;

    // let url;

    // switch (args.length) {
    //     case 1:
    //         url = `https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22name%22:%22${args[0]}%22,%22quality%22:%22${rarityString}%22%7D`;
    //         break;
    //     case 2:
    //         if (isFinite(args[1])) url = `https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22name%22:%22${args[0]}%22,%22quality%22:%22${rarityString}%22,%22ovr%22:%22${args[1]}%22%7D`;
    //         if (isNaN(args[1])) url = `https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22name%22:%22${args[0]} ${args[1]}%22,%22quality%22:%22${rarityString}%22%7D`;
    //         break;
    //     case 3:
    //         if (isNaN(args[2])) return channel.send("Your 3th argument is incorrect, it must be a number.").
    //         url = `https://www.easports.com/fifa/ultimate-team/api/fut/item?jsonParamObject=%7B%22name%22:%22${args[0]} ${args[1]}%22,%22quality%22:%22${rarityString}%22,%22ovr%22:%22${args[2]}%22%7D`;
    //         break;
    //     default:
    //         return channel.send("Your request does not meet the requirements of the command.");
    // }

    // console.log(url);
    // var reqOpts = {
    //     url: "http://mcstatus.tjird.eu/check/play.dusdavidgames.nl",
    //     method: "GET",
    //     headers: { "Cache-Control": "no-cache" }
    // };
    // const request = await rp(reqOpts);

}

async function getRarityString() {
    const d = await pool.run(r.table("rarities"));
    console.log(d);
}