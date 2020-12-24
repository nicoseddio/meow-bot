// docs https://discord.js.org/#/
// guide https://www.digitalocean.com/community/tutorials/how-to-build-a-discord-bot-with-node-js





// #################################################
// #################### Imports ####################
// #################################################

const Discord = require('discord.js');
const auth = require('./auth.json');
const fetch = require("node-fetch");
const { exec } = require('child_process');
const fs = require('fs');





// #################################################
// ################ Initializations ################
// #################################################

const clientVersion = 1.000
var logStream = fs.createWriteStream("logfile.txt", {flags:'a'})
let channels = {
    "welcome": "739292295236550676",
    "announcements": "726987017778495488",
    "cat-cafe": "767240063301713951",
    "commonroom": "726982067941802108",
    "testing-channel": "769727793352802314",
    "meow-bot": "769696060737847348",
}
let roles = {
    'Host': '726983794002886731',
    'dev': '769661278884724787',
    'cat-god': '767239576762318852',
}
let users = {
    'nikorokia': '446468247756341250',
    'meow-bot': '769241485617922088',
}
let guilds = {
    "thejasminedragon": "726982067136757853",
}
let moderateCats = true;
const botOwner = users["nikorokia"]; //default 'special-user'
const holidays = { //month is 0-indexed
    "United States National Cat Day": {
        "date": new Date(2005, 9, 29),
        "message": ""
    },
    "Canada National Cat Day": {
        "date": new Date(2005, 7, 8),
        "message": ""
    },
}
const string_commandsList = `
Meow!
meow-bot supports the following commands:
- \`meow\`
- \`commands\`
- \`ping\`
- \`quantum\`
Enjoy your meow-bot!`
const string_notACat = `
Meow!
Thanks for posting to the <#${channels['cat-cafe']}>!
One of your messages was deleted because it doesn't fit the channel theme:
**Only 'cat'** and media of **cats** may be posted.
The residing _cat-god_ is tasked with nurturing proper cat worship.
Please repost to the <#${channels['cat-cafe']}>!
We want to see your kitties!`
const prefix = "!";





// #################################################
// ################ System Startup #################
// #################################################

const client = new Discord.Client();
client.login(auth.token);

client.on('ready', () => {
    console.log();
    log(`Logged in as ${client.user.tag}!`);

    // log(`Cleaning house in #cat-cafe...`);
    // try {
    //     removeNotCatPins(client.channels.cache.get(channels['cat-cafe']));
    // } catch(error) {
    //     log(error);
    // }

    log(`Browsing the server...`);
    browseServer();
});





// #################################################
// ################ Message Events #################
// #################################################

client.on("message", async function(message) {
    let replied = false;

    // don't operate on own commands
    if (message.author.id === client.user.id) return;

    // cat-cafe moderation
    if (message.channel.id === channels['cat-cafe']) {
        checkForCats(message);

        if (message.content === "CAT") {
            log(`${message.author.tag} wants a cat!`)
            postCat(message.channel);
            replied = true;
        }
    }

    // message content processing
    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();

      // bang processing
    if (command.startsWith(prefix)) {
        const strippedcommand = command.slice(prefix.length);
        replied = handleBangCommand(strippedcommand, args, message);
    } // meow-bot DM processing
    else if (message.channel.type === 'dm') {
        replied = handleCommand(command, args, message);
    } // meow-bot terminal processing
    else if (message.channel.id === channels['meow-bot']) {
        if (!(command.startsWith('<@!'))) //ignore users talking to each other
            replied = handleCommand(command, args, message);
    } // meow-bot mention processing
    else if (command === "<@!769241485617922088>") {
        const subcommand = args.shift().toLowerCase();
        replied = handleCommand(subcommand, args, message);
    }
    
    // [19:22:45] Meow! <@!769241485617922088> Meow
    // [19:22:55] Meow! <@!446468247756341250> Niko
    
    // message properties processing
    if (message.mentions.has(users['meow-bot'], {ignoreDirect: false}) && !replied) {
        message.reply("meow!");
        replied = true;
    }

});


function handleBangCommand(command, args, message) {
    let replied = false;
    switch(command) {
        case "quantum":
            message.channel.send(getQuantumMessage());
            replied = true;
            break;
    }
    return replied;
}
function handleCommand(command, args, message) {
    let replied = false;
    switch(command) {
        case "meow":
            message.reply("purrrrrrrrr");
            replied = true;
            break;
        case "cat":
            log(`${message.author.tag} wants a cat!`)
            postCat(message.channel);
            replied = true;
            break;
        case "ping":
            const timeTaken = Date.now() - message.createdTimestamp;
            message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
            replied = true;
            break;
        case "quantum":
            message.channel.send(getQuantumMessage());
            replied = true;
            break;
        case "commands":
            message.channel.send(string_commandsList);
            replied = true;
            break;
        case "system":
            if (message.author.id === botOwner) {
                log(`System access requested by ${message.author.tag}`);
                if (args.length > 0) {
                    const subcommand = args.shift().toLowerCase();
                    switch(subcommand) {
                        case "shutdown":
                            log(`    They want to shut me down!`);
                            message.reply("Shutting down!").then(message =>{
                                client.destroy();
                                log("Shutting down!\n");
                            });
                            break;
                        case "update":
                            log(`    They want to update me!`);
                            message.reply("Pulling updates!");
                            exec("git pull", (error, stdout, stderr) => {
                                if (error) {
                                    log(`error: ${error.message}`);
                                    return;
                                }
                                if (stderr) {
                                    log(`stderr: ${stderr}`);
                                    return;
                                }
                                log(`stdout: ${stdout}`);
                                message.reply(stdout);
                            });
                            break;
                        case "version":
                            message.reply(`${client.user.tag} v${clientVersion}`);
                            break;
                        case "status":
                            const statuscommand = args.shift().toLowerCase();
                            handleStatusChange(command,args,message);
                            break;
                    }
                }
                else message.reply('System Commands:\n- `shutdown`\n- `update`\n- `version`\n- `status [set, clear]`');
            }
            else message.reply("Voice key incorrect. Meow!");
            replied = true;
            break;
        default:
            message.reply(`your command was not recognized!`);
            log(`Invalid command passed by ${message.author.tag}: ${message.content}.`);
            replied = true;
            break;
    }
    return replied;
}

function getQuantumMessage() {
    const randomnum = Math.random();
    const threshhold = 0.5;
    if (randomnum < threshhold)
       return("Your cat is dead! |0>, q("+randomnum+")");
    else
        return("Your cat is alive! |1>, q("+randomnum+")");
}

function handleStatusChange(command, args, message) {
    return;
}




// #################################################
// ################ Deletion Events ################
// #################################################

client.on("messageDelete", async function(deletedMessage) {
    if (deletedMessage.channel.id === channels['cat-cafe']) {
        deletedMessage.author.send(string_notACat);
        log(`That wasn't a kittie! Informed ${deletedMessage.author.tag}...`);
    }
});




// #################################################
// ############# Passive Functionality #############
// #################################################

async function browseServer() {
    let lastCheckTime = new Date();
    while(true) {
        respondToCats(client.channels.cache.get(channels['cat-cafe']));
        await sleep(10*60*1000); // m * s * ms
        lastCheckTime = new Date();
    }

    async function respondToCats(channel) {
        channel.messages.fetch({limit:10}).then(messages => {
            // filters last 10 messages for meow-bot responses and images/links.
            // If the last message was not meow-bot, meow-bot comments 'cat'.
            if (    !(messages.filter( message =>
                        message.content.includes('http')
                        || message.attachments.size > 0
                        || message.author.id == client.user.id
                    ).first().author.id == client.user.id)) {
                channel.send('cat');
                log("That's a kitty!");
            }
        });
    }
}





// #################################################
// ########### Domain-Specific Functions ###########
// #################################################

async function postCat(channel) {
    log('Posting a cat!');
    const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
    channel.send(file);
    channel.send("cat");
}
async function checkForCats(message) {
    const words = message.content.split(' ');
    let notCats = false;
    for (w in words) {
        if ( !(     words[w].toLowerCase() === "cat"
                ||  words[w].toLowerCase() === "cats"
                ||  words[w] === ""
                ||  words[w].includes("http") ) ) {
                        notCats = true;
                }
    }
    if (moderateCats && notCats) {
        try {
            removeNotCat(message);
        } catch(error) {
            log(error);
        }
    }
}
// async function removeNotCatPins(channel) {
//     channel.messages.fetchPinned()
//         .then(messages => {
//             messages.forEach(m => removeNotCat(m));
//         });
// }
async function removeNotCat(message) {
    try {
        message.delete();
        // message.channel.send("cAt");
        message.author.send(string_notACat);
        log(`That's not a kittie! Informed ${message.author.tag}...`);
    } catch(error) {
        log(error);
    }
}





// #################################################
// ############ Global Helper Functions ############
// #################################################

async function log(string_s) {
    const t = new Date();
    const stamp = 
         `[${String(t.getHours()).padStart(2, '0')}`
        +`:${String(t.getMinutes()).padStart(2, '0')}`
        +`:${String(t.getSeconds()).padStart(2, '0')}]`
    let logMessage = `${stamp} Meow! ${string_s}`;
    logStream.write(logMessage);
    console.log(logMessage);
}
function sleep(ms = 2000) {
    return new Promise(resolve => setTimeout(resolve, ms));
} //example: await sleep(2000); //sleep for 2 seconds
function parseMessageLink(link) {
    log(`Attempting to parse link: ${link}`)
    try{
        const ls = link.split('/');
        const ids = {
            "guildID": ls[4],
            "channelID": ls[5],
            "messageID": ls[6]
        };
        log(`Parse Successful:`
            +` Guild ID: ${ids["guildID"]},`
            +` Channel ID: ${ids["channelID"]},`
            +` Message ID: ${ids["messageID"]}`);
        return {"success": true, "ids": ids};
    } catch(error) {
        log("Parse Failure, error:" + error);
        return {"success": false};
    }
}
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