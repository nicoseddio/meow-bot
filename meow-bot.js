// docs https://discord.js.org/#/
// guide https://www.digitalocean.com/community/tutorials/how-to-build-a-discord-bot-with-node-js


const Discord = require('discord.js');
const auth = require('./auth.json');


let channels = {
    "welcome": "739292295236550676",
    "announcements": "726987017778495488",
    "cat-cafe": "767240063301713951",
    "commonroom": "726982067941802108",
    "testing-channel": "769727793352802314",
    "bot-spam": "769696060737847348",
}
let roles = {
    'Host': '726983794002886731',
    'dev': '769661278884724787',
    'cat-god': '767239576762318852',
}
let users = {
    "nikorokia": "446468247756341250",
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

const client = new Discord.Client();
client.login(auth.token);

client.on('ready', () => {
    console.log();
    log(`Logged in as ${client.user.tag}!`);

    log(`Cleaning house in #cat-cafe...`);
    try {
        removeNotCatPins(client.channels.cache.get(channels['cat-cafe']));
    } catch(error) {
        log(error);
    }

    log(`Browsing the server...`);
    browseServer();
});

const prefix = "!";
client.on("message", function(message) {
    if (message.author.bot) return;

    // cat-cafe moderation
    if (message.channel.id === channels['cat-cafe']) {
        //moderation
        checkForCats(message);
        if (message.type === "PINS_ADD") {
            log(`${message.author.tag} initiated a Pin Purge in #${message.channel.name}.`);
            message.channel.messages.fetchPinned()
                .then(messages => {
                    messages.forEach(m => removeNotCat(m));
                });
            message.delete();
        }
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
            //     let m = 1;
            //     if (args.length > 0) m = args[0];
            //     let ms = message.channel.messages.fetch({limit:m}).then(messages => {
            //         let lastmessage = messages.last();
            //         message.channel.send(lastmessage.content);
            //     })
            //     .catch(console.error);
            // }
            break;
        case "meow-schrodinger": //intentional fall-through
        case "meow-quantum":
            const randomnum = Math.random();
            const threshhold = 0.5;
            if (randomnum < threshhold)
                message.channel.send("Your cat is dead! |0>, q("+randomnum+")");
            else
                message.channel.send("Your cat is alive! |1>, q("+randomnum+")");
            break;
        case "test":
            if (message.author.id === botOwner) {
            }
            break;

        case "meow-commands":
            message.channel.send(string_commandsList)
            break;
        case "meow-version":
            message.reply(client.user.tag);
            break;
        case "meow-shutdown":
            log(`Shutdown requested by ${message.author.tag}`);
            if (message.author.id === botOwner) {
                message.reply("Shutting down!").then(message =>{
                    client.destroy();
                    log("Shutting down!\n");
                });
            }
            break;
        default:
            break;
    }
});

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
process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

async function browseServer() {
    let lastCheckTime = new Date();
    while(true) {
        respondToCats(client.channels.cache.get(channels['cat-cafe']));
        await sleep(10*60*1000); // m * s * ms
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
async function removeNotCatPins(channel) {
    channel.messages.fetchPinned()
        .then(messages => {
            messages.forEach(m => removeNotCat(m));
        });
}
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

async function delayedReply(message, response, maxTimeout = 2) {
    t = Math.floor(Math.random() * Math.floor(maxTimeout));
    setTimeout(() => { 
        message.channel.send(response);
    }, t*1000);
}

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