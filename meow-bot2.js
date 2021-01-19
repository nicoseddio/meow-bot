const Discord = require('discord.js');
const auth = require('./auth.json');

    const fs = require('fs');
    const configFileName = './config.json'; // for config file saving
    const config = require(configFileName);
    const cache = {};
    cache.apps = loadApps(config.apps);
    cache.commands = loadCommands(config.apps,cache.apps);
    cache.events = loadEvents(cache.apps);

    sleep(2000);
    console.log(cache);
    console.log(cache.events.message.CatMod);

    process.exit();

const client = new Discord.Client();
client.login(auth.token);

client.on('ready', () => {
    console.log();
    console.log(`Logged in as ${client.user.tag}!`);
    
    if (fullmode) sys.initialize();
});



client.on('message', async function(message) {
    // don't operate on own commands
    if (message.author.id === client.user.id) return;
    
    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();

    if (!config.prefixes.includes(command)) return;

        //run through event listeners
        // messageHandled = System.event(evnt,message);

        //run through commands
        // if (!messageHandled)
        //     messageHandled = System.distribute(message);
    
});

client.on('messageDelete', async function(message) {
    
});


function loadApps(cfg, dir='./lib/apps/', appExt='.app') {
    const aCache = {};
    // load in directory
    fs.readdirSync(dir).forEach(function (appFile) {
        //if valid app
        if (appFile.endsWith(appExt)) {
            let app = appFile.replace(appExt,'');
            //if not in config or not disabled
            if (    !(app in cfg) ||
                    !(cfg[app].disabled)
                ) {

                //initialize the app
                const appObj = require(dir+appFile);
                aCache[app] = new appObj;
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
        // aCache[a].events.forEach(e => {
        //     if (!(e in eCache)) eCache[e] = [];
        //     eCache[e].push(a);
        // });
        for (const e in aCache[a].events) {
            console.log(e);
            if (!(e in eCache)) eCache[e] = {};
            eCache[e][a] = aCache[a].events[e];
        }
    });
    return eCache;
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }