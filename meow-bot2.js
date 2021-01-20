const Discord = require('discord.js');
const auth = require('./auth.json');

    const fs = require('fs');
    const configFileName = './config.json'; // for config file saving
    const config = require(configFileName);
    const cache = {};
    // cache.apps = loadApps(config.apps);
    // cache.commands = loadCommands(config.apps,cache.apps);
    // cache.events = loadEvents(cache.apps);
    // console.log(JSON.stringify(cache, null, 2));

const client = new Discord.Client();
client.login(auth.token);

client.on('ready', () => {
    console.log();
    console.log(`Logged in as ${client.user.tag}!`);

    
    cache.apps = loadApps(config.apps);
    cache.commands = loadCommands(config.apps,cache.apps);
    cache.events = loadEvents(cache.apps);
    console.log(JSON.stringify(cache, null, 2));
});



client.on('message', async function(message) {
    // don't operate on own commands
    if (message.author.id === client.user.id) return;
    
    let args = message.content.split(' ');
    let command = args.shift().toLowerCase();

    console.log(
        `\nMessage Received:`+
        `\n${JSON.stringify(message,null,2)}`
    );

    let e = cache.events['message'],
        g = message.guild.id,
        c = message.channel.id;
        

    //for apps in cache.events['message'].guild.channel
        //unless app disabled for guild.channel in config
            //pass message to app
    if (g in e)
        if (c in e[g])
            e[g][c].forEach(a => {
                cache.apps[a].handleEvent('message',message);
            })

    // if (!config.prefixes.includes(command)) return;
    let prefixed = false;
    for (let p in config.prefixes) {
        if (command.startsWith(config.prefixes[p]))
            prefixed = true;
    }
    if (!prefixed) return;
    message.content = knockPrefixes(message.content,config.prefixes);
    args = message.content.split(' ');
    command = args.shift().toLowerCase();


    console.log(
        `\nMessage Received:`+
        `\n${JSON.stringify(message,null,2)}`
    );

    //if valid command/app pair
        //unless app disabled for guild.channel in config
            //pass message to app
    if (command in cache.commands) {
        let a = cache.commands[command];
        cache.apps[a].handle(message);
    }
    
});

client.on('messageDelete', async function(message) {
    //for apps in cache.events['messageDelete'].guild.channel
        //unless app disabled for guild.channel in config
            //pass message to app
    
    let event = cache.events['messageDelete'],
        guild = message.guild.id,
        channel = message.channel.id;
    if (guild in event)
        if (channel in event[guild])
            event[guild][channel].forEach(a => {
                cache.apps[a].handleEvent('messageDelete',message);
            })
});


function loadApps(cfg, dir='./lib/apps/', appExt='.app') {
    const aCache = {};
    // load in directory
    fs.readdirSync(dir).forEach(function (appFile) {
        //if valid app
        if (appFile.endsWith(appExt)) {
            let app = appFile.replace(appExt,'');
            //if not in config or not disabled
            if (!(app in cfg) ||
                    ("disabled" in cfg[app] &&
                     "systemwide" in cfg[app].disabled)
                ) {

                //initialize the app
                const appObj = require(dir+appFile);
                aCache[app] = new appObj;
                aCache[app].setClientID(client.user.id);
            }
        }
    });
    return aCache;
}
function loadCommands(appsCfg,aCache) {
    const cCache = {};
    Object.keys(aCache).forEach(a => {
        //pull app commnds from cached app
            //if command in config aliases, use alias
                //if alias is used, rename prioritizing cfg
            //else add command
                //if command taken, add app_name
        aCache[a].commands.forEach(c => {
            // console.log(a + ": " + c)
            if (a in appsCfg && c in appsCfg[a].commands) {
                let cAlias = appsCfg[a].commands[c];
                if (cAlias in cCache)
                    cCache[cCache[cAlias] +"_"+ cAlias] =
                        cCache[cAlias];
                cCache[cAlias] = a;
            } else {
                if (c in cCache) c = a +"_"+ c;
                cCache[c] = a;
            }
        });
    });
    return cCache;
}
function loadEvents(aCache) {
    eCache = {};
    Object.keys(aCache).forEach(a => {
        Object.keys(aCache[a].events).forEach(g => {
            Object.keys(aCache[a].events[g]).forEach(c => {
                aCache[a].events[g][c].forEach(e => {
                    if (!(e in eCache)) eCache[e] = {};
                    if (!(g in eCache[e])) eCache[e][g] = {};
                    if (!(c in eCache[e][g])) eCache[e][g][c] = [];
                    if (!(eCache[e][g][c].includes(a)))
                        eCache[e][g][c].push(a);
                })
            })
        })
    });
    return eCache;
}
function knockPrefixes(string,prefs,knockSpaces=true) {
    let continueChecks = true;
    let prefFound = false;
    while (continueChecks) {
        prefFound = false;
        for (p in prefs) {
            if (string.startsWith(prefs[p])) {
                string = string.slice(prefs[p].length);
                prefFound = true;
            }
            if (string.startsWith(' ') && knockSpaces)
                string = string.slice(1);
        }
        if (!prefFound)
            continueChecks = false;
    }
    return string;
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}