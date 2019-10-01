exports.run = async (client, message, args) => {
    if (!args[0]) {
        message.reply("please add an argument.");
        return;
    }

    switch (args[0]) {
        case "be":
            beMessage();
            break;
        case "tax":
            taxMessage();
            break;
        case "profit":
            profitMessage();
            break;
        default:
            noargMessage();
    }

    function beMessage() {
        if (!args[1]) {
            message.reply("please add a buy-price.");
            return;
        }

        if (!args[2]) {
            var buy = args[1].replace(/\./g, '').replace(/,/g, '');
            var buy = parseInt(buy, 10);
            var reply = buy * 1.05;
            var reply = nearest(reply, checkroundup(reply))
            if (isFinite(reply)) return message.reply(formatNumber(reply));
            return message.reply("not every arguments was a number.");
        } else {
            var buy = args[1].replace(/\./g, '').replace(/,/g, '');
            var buy = parseInt(buy, 10);
            var buy1 = args[2].replace(/\./g, '').replace(/,/g, '');
            var buy1 = parseInt(buy1, 10);
            var buy = buy * buy1;
            var reply = buy * 1.05;
            var reply = nearest(reply, checkroundup(reply))
            if (isFinite(reply)) return message.reply(formatNumber(reply));
            return message.reply("not every arguments was a number.");
        }
    }

    function taxMessage() {
        if (!args[1]) {
            message.reply("please add a buy-price.");
            return;
        }

        if (!args[2]) {
            var buy = args[1].replace(/\./g, '').replace(/,/g, '');
            var buy = parseInt(buy, 10);
            var reply = Math.round(buy * 0.05);
            var reply = `${args[1]} ${args[1] - reply} ${reply}`;
            if (isFinite(reply)) return message.reply(formatNumber(reply));
            return message.reply("not every arguments was a number.");
        } else {
            var buy = args[1].replace(/\./g, '').replace(/,/g, '');
            var buy = parseInt(buy, 10);
            var buy1 = args[2].replace(/\./g, '').replace(/,/g, '');
            var buy1 = parseInt(buy1, 10);
            var buy = buy * buy1;
            var reply = Math.round(buy * 0.05);
            var reply = `${args[1]} ${args[1] - reply} ${reply}`;
            if (isFinite(reply)) return message.reply(formatNumber(reply));
            return message.reply("not every arguments was a number.");
        }

    }

    function profitMessage() {
        if (!args[1] && !args[2]) {
            message.reply("please fill in all the arguments.")
        }

        let buy = parseInt(args[1].replace(/\./g, '').replace(/,/g, ''), 10);
        let sold = parseInt(args[2].replace(/\./g, '').replace(/,/g, ''), 10);
        let amount;
        if (args[3]) amount = parseInt(args[3].replace(/\./g, '').replace(/,/g, ''), 10); buy = buy * amount; sold = sold * amount;

        const total = (sold - buy) * 0.95;
        if (isFinite(total)) return message.reply(formatNumber(total));
        return message.reply("not every arguments was a number.");
    }

    function noargMessage() {
        message.reply("please add a valid argument.");
    }

    function nearest(n, v) {
        n = n / v;
        n = Math.ceil(n) * v;
        return n;
    }

    function checkroundup(r) {
        var roundup = 1000;
        if (r < 100000) var roundup = 500;
        if (r < 50000) var roundup = 250;
        if (r < 10000) var roundup = 100;
        if (r < 1000) var roundup = 50;
        return roundup;
    }

    function formatNumber(num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1\.')
    }
}