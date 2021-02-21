const version = "2.00.00";

const Discord = require('discord.js');
const auth = require('./auth.json');

const Kernel = require('./lib/Kernel');
const kernel = new Kernel();

const client = new Discord.Client();
client.login(auth.token);

client.on('ready', () => {
    console.log();
    console.log(`Logged in as ${client.user.tag}!`);

    kernel.initialize(client);
});
client.on('message', async function(message) {
    if (message.author.id === client.user.id) return; //ignore self
    kernel.distribute(message, 'message');
});
client.on('messageDelete', async function(message) {
    kernel.distribute(message, 'messageDelete');
});