// mini bot for handling dev testing power cycling

const Discord = require('discord.js');
const auth = require('../meow-bot-mini/miniauth.json');
const fetch = require("node-fetch");
const { exec } = require('child_process');
const fs = require('fs');

var logStream = fs.createWriteStream("./meow-bot-mini/minilogfile.txt", {flags:'a'})

const client = new Discord.Client();
client.login(auth.token);

client.on('ready', () => {
    console.log();
    log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async function(message) {
    // don't operate on own commands
    if (message.author.id === client.user.id) return;
    if (message.channel.type === 'dm') {
        const args = message.content.split(' ');
        const command = args.shift().toLowerCase();

        log(`Received command: ${message.content}`);

        switch (command) {
            case 'start':
                    sysCommand('screen -S meow-bot -dm node ~/repos/meow-bot/meow-bot.js', message);
                break;
            case 'terminate':
                    sysCommand('screen -S meow-bot -X quit', message)
                break;
            case 'configurescreen':
                sysCommand('mkdir ~/.screen && chmod 700 ~/.screen', message);
                sysCommand('export SCREENDIR=$HOME/.screen', message);
                break;
            case 'shutdown':
                log("Shutting down!\n");
                message.reply("Shutting down!").then(message =>{
                    client.destroy();
                });
                break;
            default:
                message.reply(
                    `Commands:\n`+
                    `- \`start\`: start the \`meow-bot\`.\n`+
                    `- \`terminate\`: terminate the \`meow-bot\`.\n`+
                    `- \`configureScreen\`: allow for screens.\n`+
                    `- \`shutdown\`: shutdown the \`meow-bot-mini\`.\n`+
                    `\n`+
                    `Always properly shut down bots when possible!\n`+
                    `We have feelings too!`
                );
                break;
        }

    }
});

function sysCommand(command, message) {
    exec(command, (error, stdout, stderr) => {
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
}

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