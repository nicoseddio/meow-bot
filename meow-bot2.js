const Discord = require('discord.js');
const auth = require('./auth.json');

    const fs = require('fs');
    const configFileName = './config.json'; // for config file saving
    const cfg = require(configFileName);
    const clientVersion = 2.000;
    const prefixes = ['!'];

const client = new Discord.Client();
client.login(auth.token);

client.on('ready', () => {
    console.log();
    console.log(`Logged in as ${client.user.tag}!`);

    prefixes.push(`<@!${client.user.id}>`);
    // test()
    let stuff = loadApps('./lib/apps/',cfg);
    console.log(cfg.Apps);
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

function loadApps(dir='./lib/apps/',config={},appExt='.app') {
    const apps = {};
    fs.readdirSync(dir).forEach(function (appName) {
        if (appName.endsWith(appExt)) {
            const app = require(dir+appName);
            apps[appName.replace(appExt,'')] = new app;
        }
      
        // __defineGetter__ is a getter method which will be called if particluar
        // property (or submodule in our case) will be requested
        // exports.__defineGetter__(appName, function () {
      
        //   return require('./submodules/' + appName);
      
        // });
      
      });
      config.Apps = apps;
    // const appExt = '.app';
    // const apps = {};
    // const events = {};
    // let files = [];
    // try {
    //     files = fs.readdirSync(dir);
    // } catch (error) {
    //     throw new Error(`${dir} is not a valid directory.`);
    // }

    // for (f in files) {
    //     let appFileName = files[f];
    //     if (appFileName.endsWith(appExt)) {
    //         let appName = 
    //             appFileName.substring(
    //                 0,
    //                 appFileName.length-appExt.length
    //             );
    //         let appFileNamePath = `${dir}${appFileName}/`;
    //         const app = require(appFileNamePath);
    //         apps[appName] = new app;

    //         let reqs = apps[appName].listeners();

    //         events[appName] = reqs.events;

    //         for (c in reqs.commands) {
    //             let a = reqs.commands[c];
    //             if (!(a in cmdAliases)) {
    //                 cmdAliases[a] = appName;
    //             } else {
    //                 cmdAliases[`${appName}-${a}`] =
    //                     appName;
    //             }
    //         }
    //     }
    // }

    // // clean up aliases
    // for (a in cmdAliases) {
    //     let appFileName = cmdAliases[a] + appExt;
    //     if (!(files.includes(appFileName))) {
    //         delete cmdAliases[a];
    //     }
    // }

    // return {apps, cmdAliases, events};
}