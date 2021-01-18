const Discord = require('discord.js');
const auth = require('./auth.json');

    const fs = require('fs');
    const configFileName = './config.json'; // for config file saving
    const config = require(configFileName);
    const appsCache = loadApps(config.apps, auth);
    const commandsCache = loadCommands(config.apps,appsCache);
    const eventsCache = loadEvents(appsCache);

    process.exit();

    let fullmode = config.apps.System.enabled;
    // if (fullmode) const System = require('./lib/System');

const client = new Discord.Client();
client.login(auth.token);

    // if (fullmode) const sys = new System(client,config,__dirname);

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


function loadApps(appsConfig, auth, dir='./lib/apps/', appExt='.app') {
    const appsCache = {};
    // load in directory
    fs.readdirSync(dir).forEach(function (appFileName) {
        let appName = appFileName.replace(appExt,'');
        //if valid app
        if (appFileName.endsWith(appExt)) {
            //if not in config or not disabled
            if (    !(appName in appsConfig) ||
                    !(appsConfig[appName].disabled)
                ) {

                //initialize the app
                const app = require(dir+appFileName);
                appsCache[appName] = new app;
            }
        }
    });

    for (let a in appsCache) {
        let app = appsCache[a];
        if (app.authenticate === 'function' &&
            app.authenticate() === auth.
    }

    return appsCache;
}
function loadCommands(appsCfg,appsCache) {
    const cCache = {};
    Object.keys(appsCache).forEach(a => {
        //pull app commnds from cached app
            //if command in config aliases, use alias
                //if alias is used, rename prioritizing cfg
            //else add command
                //if command taken, add app_name
        appsCache[a].commands.forEach(c => {
            console.log(a + ": " + c)
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
function loadEvents(appsCache) {
    eCache = {};
    Object.keys(appsCache).forEach(a => {
        appsCache[a].events.forEach(e => {
            if (!(e in eCache)) eCache[e] = [];
            eCache[e].push(a);
        });
    });
    return eCache;
}
function generateToken(token,length=12) {
    let t = '';
    for (let i = 0; i < length; i++) {
        t += token.charAt(
            Math.floor(Math.random() * Math.floor(token.length))
        );
    }
    return t;
}