const Discord = require('discord.js');
const bot = new Discord.Client();
var CONFIG = require('./config.json');

bot.login(CONFIG.token);

bot.on('ready', function() {
    console.log("Ready for take off");
        var guild = bot.guilds.get('343452992797802496');
        var rolename = guild.roles.find('name', 'Beheerder');
        //var rolename = bot.users.find('discriminator', '6304', 'username', 'Tjird');
        console.log(rolename);
    console.log("==================");
    
});


