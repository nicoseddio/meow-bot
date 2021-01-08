const Discord = require('discord.js');
const fetch = require("node-fetch"); // for getting cat pics
const fs = require('fs'); // file operations
const auth = require('./auth.json');

const client = new Discord.Client();
client.login(auth.token);

client.on('ready', () => {
    console.log();
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async function(message) {

    // don't operate on own commands
    if (message.author.id === client.user.id) return;

    // cat-cafe moderation
    if (message.channel.id === config.channels.catcafe) {
        handleNoCatsCheck(message);
        if (message.content === "CAT") {
            log(`${message.author.tag} wants a cat!`)
            handleCatPostRequest(message.channel);
        }
        handleCatReply(message.channel);
        return;
    }

    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();

      // bang processing
    if (command.startsWith(config.prefixes.games)) {
        const strippedcommand = command.slice(config.prefixes.games.length);
        handleAppCommand(strippedcommand, message);
    } // meow-bot DM processing
    else if (message.channel.type === 'dm') {
        handleCommand(command, args, message);
    } // meow-bot terminal processing
    else if (message.channel.id === config.channels.meowbot) {
        if (command === "<@!769241485617922088>" || !(command.startsWith('<@!')) ) //ignore users talking to each other
            handleCommand(command, args, message);
    } // meow-bot opening mention processing
    else if (command === "<@!769241485617922088>") {
        handleCommand(command, args, message);
    } // message included mention processing
    else if (message.mentions.has(client.user.id, {ignoreDirect: false})
        && message.channel.id != config.channels.catcafe) {
            message.reply("meow!");
    }
});


client.on("messageDelete", async function(deletedMessage) {
    if (deletedMessage.channel.id === config.channels.catcafe) {
        deletedMessage.author.send(
            Messages.get('notACat') +
            `\n\n*Deleted Message:*\n\`${deletedMessage.content}\``);
        console.log(`Message deleted in the cat-cafe. Informed ${deletedMessage.author.tag}.`);
    }
});