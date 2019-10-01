const cheerio = require("cheerio");
const Discord = require('discord.js');
const r = require("rethinkdb");
const rp = require("request-promise");
const pool = require("../functions/rethinkdb");
const AsciiTable = require('ascii-table');

exports.run = async (client, message, args) => {
    if (!args[0] || args[0] == undefined) return message.reply("fill in a subcommand.");

    const subcommands = [
        "list",
        "get"
    ];
    const subcommand = args[0];

    if (!subcommands.includes(args[0])) return message.reply("use a valid subcommand.");

    let data = await getSiteData();

    if (!data || data == undefined || data == null) return message.reply("oops something wrong happend. Try again later pls.");

    data = formatSiteData(data);

    if (!data || data == undefined || data == null) return message.reply("oops something wrong happend. Try again later pls.");

    if (subcommand === "list") {
        const t = new AsciiTable("Squad Building Challenge Groups")
            .setHeading('Number', 'Name')
            .setAlign(1, AsciiTable.LEFT)
            .setAlign(2, AsciiTable.LEFT);

        for (i = 0; i < data.length; i++) {
            t.addRow(i, data[i].title.replace("  New", ""));
        }

        const response = `This is a list of all available SBC's.\nIn this menu you can get a number from a SBC you want.\nWith that number you can execute the other command fut!sbc get <number>.\n\n${t}`;

        return message.channel.send(response, {
            split: true,
            code: true
        });

    } else if (subcommand === "get") {
        if (!args[1] || args[1] == undefined) return message.reply("fill-in a number from fut!list to get SBC information.");

        let choice = args[1];

        if (!isFinite(choice)) return message.reply("fill-in a number not characters.");
        if (choice > (data.length - 1)) return message.reply("fill-in a number of a SBC. This number is to high.");

        choice = data[choice];

        const embed = new Discord.RichEmbed()
            .setColor(0x2FF37A)
            .setURL(`https://www.futbin.com${choice.href}`)
            .setFooter("FUTBot v.2.0.0 | Data from FUTBIN | Made by Tjird, inspired by ajpiano", "https://tjird.nl/futbot.jpg")
            .setTitle(choice.title)
            .setAuthor("Squad Building Challenge Group")
            .setImage(choice.img)
            .setDescription(choice.desc)
            .addField("General information", `- Time remaining: ${choice.time}\n- Repeat: ${choice.repeat}`)
            .addField("Estimated prices", `- PS4: ${formatNumber(choice.price_ps)}\n- XBOX ONE: ${formatNumber(choice.price_xb)}\n- PC: ${formatNumber(choice.price_pc)}`);

        return message.channel.send(embed);
    }
}

async function getSiteData() {
    const { host, port } = await getRandomProxy();
    const data = await rp({
        "host": host,
        "port": port,
        "method": "GET",
        "uri": `https://www.futbin.com/squad-building-challenges`
    });

    return data;
}

function formatSiteData(data) {
    const $ = cheerio.load(data);

    let itemElements = $('.col-md-3.col-xs-6.set_col.mb-5');
    let itemList = [];

    for (let i = 0; i < itemElements.length; i++) {
        let item = itemElements.eq(i);

        let title = item.find('.top-set-row').text().trim();
        let img = item.find('.lazy').attr("data-original");
        let time = item.find('.col-md-12.set_time_rep').find("div").first().text().trim();
        let repeat = item.find('.set_repeatable').text().trim();
        let desc = item.find('.set_desc').text().trim();
        let price_ps = item.find('.estimated_coins_ps4').attr("data-price");
        let price_xb = item.find('.estimated_coins_xone').attr("data-price");
        let price_pc = item.find('.estimated_coins_pc').attr("data-price");
        let href = item.find("a").attr("href");

        if (time == "") time = "Unlimited";

        itemList.push({
            title, img, time, repeat, desc, price_ps, price_xb, price_pc, href
        });
    }

    return itemList;
}

async function getRandomProxy() {
    let d = await pool.run(r.table("proxies").sample(1));
    d = d[0].address.split(":");

    return d;
}

function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1\.')
}