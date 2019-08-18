const rp = require("request-promise");
const r = require("rethinkdb");
const pool = require("../functions/rethinkdb");
const AsciiTable = require('ascii-table');

exports.run = async (client, message, args) => {
    switch(args.split(" ").length) {
        case 1:
            searchPlayerOption1();
            break;
        case 2:
            searchPlayerOption2();
            break;
        case 3:
            searchPlayerOption3();
            break;
        default:
            return message.reply("Your request does not meet the requirements of the command.");
    }
    
    console.log("end");
    // var reqOpts = {
    //     url: "http://mcstatus.tjird.eu/check/play.dusdavidgames.nl",
    //     method: "GET",
    //     headers: { "Cache-Control": "no-cache" }
    // };
    // const request = await rp(reqOpts);
}

function searchPlayerOption1() {
    console.log("option 1");
}

function searchPlayerOption2() {
    console.log("option 2");
}

function searchPlayerOption3() {
    console.log("option 3");
}