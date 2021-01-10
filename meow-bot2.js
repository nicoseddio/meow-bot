const Discord = require('discord.js');
const auth = require('./auth.json');

    const fs = require('fs');
    const configFileName = './config.json'; // for config file saving
    const config = require(configFileName);
    const System = require('./lib/System');

const client = new Discord.Client();
const sys = new System(client,config);
client.login(auth.token);

client.on('ready', () => {
    console.log();
    console.log(`Logged in as ${client.user.tag}!`);
    
    sys.initialize();
    let stuff = loadApps('./lib/apps/');
    console.log(stuff);
    console.log(sys.generateToken(auth.token));
});



client.on('message', async function(message) {
    // don't operate on own commands
    if (message.author.id === client.user.id) return;

    let messageHandled = false;
    //run through event listeners
    // messageHandled = System.event(evnt,message);

    //run through commands
    // if (!messageHandled)
    //     messageHandled = System.distribute(message);
    
});
client.on('messageDelete', async function(message) {
    
});


function loadApps(dir='./lib/apps/',appExt='.app') {
    const apps = {};
    fs.readdirSync(dir).forEach(function (appName) {
        if (appName.endsWith(appExt)) {
            const app = require(dir+appName);
            apps[appName.replace(appExt,'')] = new app;
        }      
    });
    return apps;
}