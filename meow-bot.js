// docs https://discord.js.org/#/
// guide https://www.digitalocean.com/community/tutorials/how-to-build-a-discord-bot-with-node-js

// function naming scheme:
// - getFoo: returned value expected
// - handleFoo: no returned value expected
// - checkFoo: returned boolean expected





// #################################################
// #################### Imports ####################
// #################################################

const Discord = require('discord.js');
const fetch = require("node-fetch"); // for getting cat pics
const { exec } = require('child_process'); // for bash commands
const fs = require('fs'); // file operations
const auth = require('./auth.json');
const { ok } = require('assert');
const configFileName = './config.json'; // for config file saving
const config = require(configFileName);

// #################################################
// ################ System Startup #################
// #################################################

var logStream = fs.createWriteStream("logfile.txt", {flags:'a'})

const client = new Discord.Client();
client.login(auth.token);

client.on('ready', () => {
    console.log();
    log(`Logged in as ${client.user.tag}!`);

    // log(`Browsing the server...`);
    // handleBrowseServer();
});










// #################################################
// ################ Message Events #################
// #################################################

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

    // message content processing
    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();

      // bang processing
    if (command.startsWith(config.prefixes.games)) {
        const strippedcommand = command.slice(config.prefixes.games.length);
        handleBangCommand(strippedcommand, args, message);
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
            config.messages.notACat +
            `\n\n*Deleted Message:*\n\`${deletedMessage.content}\``);
        log(`Message deleted in the cat-cafe. Informed ${deletedMessage.author.tag}.`);
    }
});











// #################################################
// ############### Utility Functions ###############
// #################################################

function handleBangCommand(command, args, message) {
    switch(command) {
        case "quantum":
            message.channel.send(getQuantumMessage());
            break;
    }
}
function handleCommand(command, args, message) {
    let c = command;
    if (c === "<@!769241485617922088>")
        c = args.shift().toLowerCase();
    switch(c) {
        case "test":
            break;
        case "praise":
        case "meow":
            message.reply("purrrrrrrrr");
            break;
        case "cat":
            log(`${message.author.tag} wants a cat!`)
            handleCatPostRequest(message.channel);
            break;
        case "ping":
            const timeTaken = Date.now() - message.createdTimestamp;
            message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
            break;
        case "quantum":
            message.channel.send(getQuantumMessage());
            break;
        case "help":
        case "commands":
            message.channel.send(config.messages.commandsList);
            break;
        case "sudo":
            if (config.sudoers.includes(message.author.id)) {
                handleSystemCommand(command, args, message);   
            }
            else message.reply("Voice key incorrect. Meow!");
            break;
        default:
            message.reply(`your command was not recognized!`);
            log(`Invalid command from ${message.author.tag}: ${message.content}.`);
            break;
    }
}

function getMentionOf(userID) {
    return `<@!${userID}>`;
}
function getQuantumMessage() {
    const randomnum = Math.random();
    const threshhold = 0.5;
    if (randomnum < threshhold)
       return("Your cat is dead! |0>, q("+randomnum+")");
    else
        return("Your cat is alive! |1>, q("+randomnum+")");
}

function handleSystemCommand(command, args, message) {
    log(`Sudo access requested by ${message.author.tag}`);
    if (args.length > 0) {
        const subcommand = args.shift().toLowerCase();
        switch(subcommand) {
            case "shutdown":
                message.reply("Shutting down!").then(message =>{
                    client.destroy();
                    log("Shutting down!\n");
                });
                break;
            case "update":
                log(`Pulling updates!`);
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
                message.reply(`${client.user.tag} v${config.system.clientVersion}`);
                break;
            case "status":
                if (!(args.length > 0)) message.reply("You forgot a command!");
                else {
                    const statuscommand = args.shift().toLowerCase();
                    handleStatusChange(statuscommand,args);
                }
                break;
            case "saveconfig":
                message.reply("Saving config file!");
                handleWriteToFile(config, configFileName);
                break;
        }
    }
    else message.reply(config.messages.commandsListSudo);
}
function handleStatusChange(command, args) {
    switch(command) {
        case "set":
            if (args.length > 0) {
                let statusType = args.shift().toUpperCase();
                let statusMessage = "";
                if (args.length > 0) statusMessage = args.shift();
                if (args.length > 0) for (i in args) statusMessage += " " + args[i];
                client.user.setActivity(statusMessage, { type: statusType});
                log(`Status set to: ${statusType} ${statusMessage}`);
            }
            break;
        case "clear":
            client.user.setActivity('', {type: 4});
            log("Status cleared!");
            break;
    }
}
function handleWriteToFile(dictionary, file) {
    
    let data = JSON.stringify(dictionary, null, '    ');
    fs.writeFile(file, data, function (err) {
        if (err) {
            log(`File writing error: ${err.message}`);
            return;
        }
        log('File saved successfully.');
    });
}
function handleReadFromFile(file, dictionary) {
    var data = fs.readFileSync(file), dictionary;

    try {
        dictionary = JSON.parse(data);
        console.dir(dictionary);
    }
    catch (err) {
        log('JSON parsing error: '+err.message);
    }
}
async function handleCatReply(channel,time_sleep_ms=10000,num_fetched_messages=10) {
    await sleep(time_sleep_ms);
    channel.messages.fetch({limit:num_fetched_messages}).then(msgs => {
        // filters last 10 messages for meow-bot responses and images/links.
        // If the last message was not meow-bot, meow-bot comments 'cat'.
        if (    !(msgs.filter(
                    msg =>
                        msg.content.includes('http')
                        || msg.attachments.size > 0
                        || msg.author.id == client.user.id
                    ).first().author.id == client.user.id
                )
            ) {
                channel.send('cat');
                log("That's a kitty!");
        }
    });
}












// #################################################
// ########### Domain-Specific Functions ###########
// #################################################

async function handleCatPostRequest(channel) {
    log('Posting a cat!');
    const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
    channel.send(file);
    channel.send("cat");
}
async function handleNoCatsCheck(message) {
    const words = message.content.split(' ');
    let notCats = false;
    for (w in words) {
        let word = String(words[w].toLowerCase());
        if ( !( checkMadeOfWords(word,['cat','cats'])
                ||  word === ""
                // ||  words[w].includes("http") 
                ||  word.startsWith("http")
            ) ) {
                notCats = true;
        }
    }
    if (config.global.moderateCats && notCats) {
        await sleep(500);
        message.delete();
        // delete notification now handled by client.on("messageDelete")
        //     to allow for cat-god moderation
        log(`That's not a kitty!`);
    }
}
/**
 * Check whether a word is made of other words.
 * @param {string} word - Primary word to check against.
 * @param {string[]} words - Array of words to check in primary word.
 * @param {boolean} exclusive - Whether word should only contain any one of words.
 */
function checkMadeOfWords(word, words, exclusive=false) {
    if (exclusive) {
        let wordsCheckList = [];
        for (w in words) {
            let work = word;
            let okay = true;
            // while viable w-length sections left
            while (work.length >= words[w].length && okay) {
                // check current w-length section
                if (work.startsWith(words[w])) {
                    // move to next w-length section
                    work = work.substring(words[w].length);
                }
                else {
                    // terminate current word
                    okay = false;
                }
            }
            // document result of check
            wordsCheckList.push(okay);
        }
        // true if word made of any one words
        return wordsCheckList.includes(true);
    } else {
        let work = word;
        let okay = true;
        let swords = words.sort().reverse();
        // same logic as above,
        //   but checks all words on every w-length section
        while (work.length > 0 && okay) {
            let passed = false;
            for (w in swords) {
                if (work.startsWith(swords[w])) {
                    work = work.substring(swords[w].length);
                    passed = true;
                    break;
                }
            }
            if (!passed)
                okay = false;
        }
        return okay;
    }
}












// #################################################
// ############ Global Helper Functions ############
// #################################################

/**
 * Timestamped message, sent to console and file.
 * @param {String} string_s - message to put to console and file.
 */
async function log(string_s) {
    const t = new Date();
    const stamp = 
         `[${String(t.getFullYear()).substr(-2)}`
        + `${String(t.getMonth()+1).padStart(2, '0')}`
        + `${String(t.getDate()   ).padStart(2, '0')}`
        +` ${String(t.getHours()  ).padStart(2, '0')}`
        +`:${String(t.getMinutes()).padStart(2, '0')}`
        +`:${String(t.getSeconds()).padStart(2, '0')}]`
    let logMessage = `${stamp} ${string_s}`;
    logStream.write(logMessage+'\n');
    console.log(logMessage);
}
/**
 * Pause thread. Example: `await sleep(2000)`
 * @param {number} ms - Length of time to sleep in milliseconds.
 */
function sleep(ms = 2000) {
    return new Promise(resolve => setTimeout(resolve, ms));
}