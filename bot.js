const Discord = require('discord.js');
const client = new Discord.Client();

const Enmap = require("enmap");
const fs = require("fs");

const { general } = require('./config.js');

client.config = general;

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});

client.commands = new Enmap();

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    console.log(`Attempting to load command ${commandName}. Shard ID: ${(client.shard.id + 1)}/${client.shard.count}`);
    client.commands.set(commandName, props);
  });
});

client.login(general.token);