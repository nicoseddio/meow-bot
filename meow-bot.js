// docs https://discord.js.org/#/
// guide https://www.digitalocean.com/community/tutorials/how-to-build-a-discord-bot-with-node-js





// #################################################
// #################### Imports ####################
// #################################################

const Discord = require('discord.js');
const auth = require('./auth.json');
const fetch = require("node-fetch");





// #################################################
// ################ Initializations ################
// #################################################

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
    !meow
    !meow-commands
    !meow-ping
    !meow-quantum
    !meow-version
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
    if (message.author.bot) return;

    // cat-cafe moderation
    if (message.channel.id === channels['cat-cafe']) {
        //moderation
        checkForCats(message);
        // if (message.type === "PINS_ADD") {
        //     log(`${message.author.tag} initiated a Pin Purge in #${message.channel.name}.`);
        //     message.channel.messages.fetchPinned()
        //         .then(messages => {
        //             messages.forEach(m => removeNotCat(m));
        //         });
        //     message.delete();
        // }
        if (message.content === "CAT") {
            log(`${message.author.tag} wants a cat!`)
            postCat(message.channel);
        }
    }

    if (message.mentions.has(users['meow-bot'], {ignoreDirect: false}))
        message.reply("meow!");
    
    // if (!message.content.startsWith(prefix)) return;
  
    // const commandBody = message.content.slice(prefix.length);
    // const args = commandBody.split(' ');
    // const command = args.shift().toLowerCase();

    const args = message.content.split(' ');

    // bang proc
    if (args[0].startsWith(prefix)) {
        const slicedargs = args[0].slice(prefix.length);
        handleBangCommand(message, slicedargs);
        return;
    }

    // [19:22:45] Meow! <@!769241485617922088> Meow
    // [19:22:55] Meow! <@!446468247756341250> Niko
    
    if (message.channel.id === channels['meow-bot']) {

    const command = args.shift().toLowerCase();

    switch(command) {
        case "meow":
            message.reply("purrrrrrrrr");
            break;
        case "ping":
            const timeTaken = Date.now() - message.createdTimestamp;
            message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
            break;
        case "quantum":
            message.channel.send(getQuantumMessage());
            break;
        case "commands":
            message.channel.send(string_commandsList)
            break;
        case "version":
            message.reply(client.user.tag);
            break;
        case "shutdown":
            if (message.author.id === botOwner) {
                log(`Shutdown requested by ${message.author.tag}`);
                message.reply("Shutting down!").then(message =>{
                    client.destroy();
                    log("Shutting down!\n");
                });
            } else message.reply("Voice key incorrect. Meow!");
            break;
        default:
            break;
    }
    }
});


async function handleBangCommand(message, cs) {
    switch(cs) {
        case "quantum":
            message.channel.send(getQuantumMessage());
            break;
    }
}

function getQuantumMessage() {
    const randomnum = Math.random();
    const threshhold = 0.5;
    if (randomnum < threshhold)
       return("Your cat is dead! |0>, q("+randomnum+")");
    else
        return("Your cat is alive! |1>, q("+randomnum+")");
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
    console.log(`${stamp} Meow! ${string_s}`)
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