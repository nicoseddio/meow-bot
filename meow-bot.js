// docs https://discord.js.org/#/
// mgmt https://discord.com/developers/applications/769241485617922088/bot
// guide https://www.digitalocean.com/community/tutorials/how-to-build-a-discord-bot-with-node-js
// example https://github.com/sitepoint-editors/discord-bot-sitepoint/blob/master/index.js
// hosting https://medium.com/@mason.spr/hosting-a-discord-js-bot-for-free-using-heroku-564c3da2d23f


const Discord = require('discord.js');
const auth = require('./auth.json');

var channels = {
    "announcements": "726987017778495488",
    "cat-cafe": "767240063301713951",
    "commonroom": "726982067941802108",
    "testing-channel": "769727793352802314",
    "bot-spam": "769696060737847348",
}
var roles = {
    'Host': '726983794002886731',
    'dev': '769661278884724787',
    'cat-god': '767239576762318852',
}
var users = {
    "nikorokia": "446468247756341250",
}
var guilds = {
    "thejasminedragon": "726982067136757853",
}
var moderateCats = true;
var botOwner = users["nikorokia"]; //default 'special-user'
const commandsList = `
Meow!
meow-bot supports the following commands:
    !meow
    !meow-commands
    !meow-ping
    !meow-quantum
    !meow-version
Enjoy your meow-bot!`

const client = new Discord.Client();
//normal hosting config
client.login(auth.token);
//Heroku hosting config
//client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret

client.on('ready', () => {
    console.log(`\nLogged in as ${client.user.tag}!`);
});

const prefix = "!";
client.on("message", function(message) {
    if (message.author.bot) return;

    // cat-cafe moderation
    if (message.channel.id === channels['cat-cafe']) {
        //moderation
        checkForCats(message);
        if (message.type === "PINS_ADD") {
            message.channel.messages.fetchPinned()
                .then(messages => message.channel.bulkDelete(messages));
            message.delete();
        }
        //engagement
        if (message.attachments.size > 0
            || message.content.includes("http"))
                delayedReply(message, "cat", 900);
    }

    if (message.channel.id === channels['testing-channel']) {
    }

    if (message.mentions.has('769241485617922088', {ignoreDirect: false}))
        message.reply("meow!");
    
    if (!message.content.startsWith(prefix)) return;
  
    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    switch(command) {
        case "meow":
            message.reply("purrrrrrrrr");
            break;
        case "meow-ping":
            const timeTaken = Date.now() - message.createdTimestamp;
            message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
            break;
        case "meow-remove":
            // message.delete();
            // if (checkRole("cat-god", message)) {
            //     var m = 1;
            //     if (args.length > 0) m = args[0];
            //     var ms = message.channel.messages.fetch({limit:m}).then(messages => {
            //         let lastmessage = messages.last();
            //         message.channel.send(lastmessage.content);
            //     })
            //     .catch(console.error);
            // }
            break;
        case "meow-schrodinger": //intentional fall-through
        case "meow-quantum":
            var randomnum = Math.random();
            var threshhold = 0.5;
            if (randomnum < threshhold)
                message.channel.send("Your cat is dead! |0>, q("+randomnum+")");
            else
                message.channel.send("Your cat is alive! |1>, q("+randomnum+")");
            break;

        case "meow-commands":
            message.channel.send(commandsList)
            break;
        case "meow-version":
            message.reply(client.user.tag);
            break;
        case "meow-shutdown":
            console.log(`Shutdown requested by ${message.author.tag}`);
            if (message.author.id === botOwner) {
                message.reply("Meow! Shutting down!").then(message =>{
                    client.destroy();
                    console.log("Meow! Shutting down!\n");
                });
            }
            break;
        default:
            break;
    }
});

function checkRole(role, message) {
    if (message.guild.id == guilds["thejasminedragon"]) {
        if(message.member.roles.cache.get(roles[role])) {
            return true;
        } else {
            return false;
        }
    }
    else return false;
}

function checkForCats(message) {
    if (moderateCats
        && !(message.content.toLowerCase() === "cat"
            || message.content.toLowerCase() === "cats"
            || message.content === ""
            || message.content.includes("http"))) {
                removeNotCat(message);
    }
}
function removeNotCat(message) {
    message.delete();
    message.channel.send("cAt");
    message.author.send("Meow!\nThanks for posting to the <#767240063301713951>! However, your last message was deleted because it doesn't fit within the channel rule:\n**Only the word 'cat' and media of cats are allowed.**\nThe residing _cat-god_ is tasked with keeping this rule.\nPlease repost to the <#767240063301713951> with the proper formatting! We want to see your kitties!\n");
    console.log(`That's not a kittie! Informed ${message.author.tag}`);
}

async function delayedReply(message, response, maxTimeout = 2) {
    t = Math.floor(Math.random() * Math.floor(maxTimeout));
    setTimeout(() => { 
        message.channel.send(response);
    }, t*1000);
}

function parseMessageLink(link) {
    console.log(`Attempting to parse link: ${link}`)
    try{
        var ls = link.split('/');
        var ids = {
            "guildID": ls[4],
            "channelID": ls[5],
            "messageID": ls[6]
        };
        console.log(`Parse Successful: Guild ID: ${ids["guildID"]}, Channel ID: ${ids["channelID"]}, Message ID: ${ids["messageID"]}`);
        return {"success": true, "ids": ids};
    } catch(error) {
        console.log("Parse Failure, error:" + error);
        return {"success": false};
    }
}