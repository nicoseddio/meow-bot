const Discord = require('discord.js');
const auth = require('./auth.json');

    const fs = require('fs');
    const { EventEmitter } = require('events');
    const kernel = new Kernel(client);
    const kernelBeacon = new KernalBeacon();

const client = new Discord.Client();
client.login(auth.token);

client.on('ready', () => {
    console.log();
    console.log(`Logged in as ${client.user.tag}!`);
    
    kernel.initializeCache(kernelBeacon);
});
client.on('message', async function(message) {
    if (message.author.id === client.user.id) return; //ignore self
    kernel.handle(message, 'message');
    kernel.handle(message);
});
client.on('messageDelete', async function(message) {
    kernel.handle(message, 'messageDelete');
});
kernelBeacon.on('messageReturned', async function(message) {
    kernel.handle(message);
});


class Kernel {
    constructor(client, configFileName = './config.json') {
        this.client = client;
        this.configFileName = configFileName
        this.config = Kernel.loadObjectFromFile(this.configFileName);
    }
    initializeCache(kernelBeacon) {
        this.cache = {};
        this.cache.apps = this.loadApps(this.config, kernelBeacon);
        this.cache.commands = Kernel.loadCommands(this.config.apps,this.cache.apps);
        this.cache.events = Kernel.loadEvents(this.cache.apps);
        Kernel.dumpObjectToFile(this.cache);
    }

    handle(message,event = false) {
        let events  = cache.events,
            guild   = message.guild.id,
            channel = message.channel.id;

        if (!(event === false)) {
            //for apps in cache.events['messageDelete'].guild.channel
                //unless app disabled for guild.channel in config
                    //pass message to app
            if (event in events &&
                guild in events[event] &&
                channel in events[event][guild])
                    events[event][guild][channel].forEach(app => {
                        if(this.appEnabled(app,message.guild.id))
                            cache.apps[app].handleEvent(event,message);
                    });
        }
        else {
            if (!this.stringPrefixed(message.content))
                return;
            else
                message.content = knockPrefixes(message.content,config.prefixes);

            args = message.content.split(' ');
            if (args.length > 0 &&
                args[0] in cache.commands &&
                this.appEnabled(cache.commands[args[0]],message.guild.id)) {
                    let app = cache.commands[args[0]];
                    cache.apps[app].handle(message);
            }
        }
    }
    appEnabled(appName,GUILD_ID = true) {
        if ('apps' in this.config &&
            appName in this.config.apps &&
            'disabled' in this.config.apps[appName] &&
            this.config.apps[appName].disabled.includes(GUILD_ID))
                return false;
        else return true;
    }
    stringPrefixed(string, prefixes = this.config.prefixes, prefixesCaseSensitive = false) {
        let words = string.split(' ');
        if (words.length > 0 &&
            prefixes.includes(words[0].toLowerCase()))
                return true;
        else return false;
    }

    loadApps(config, kernelBeacon, dir='./lib/apps/', appExt='.app') {
        const aCache = {};
        // load in directory
        fs.readdirSync(dir).forEach(function (appFile) {
            //if valid app
            if (appFile.endsWith(appExt)) {
                let app = appFile.replace(appExt,'');
                //if not in config or not disabled
                if (!('apps' in config &&
                    app in config.apps &&
                    'disabled' in config.apps[app] &&
                    config.apps[app].disabled.includes(true))) {
                        //initialize the app
                        const appObj = require(dir+appFile);
                        aCache[app] = new appObj(kernelBeacon);
                        aCache[app].setClientID(client.user.id);
                }
            }
        });
        return aCache;
    }
    static loadCommands(appsCfg,aCache) {
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
    static loadEvents(aCache) {
        const eCache = {};
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
    static knockPrefixes(string,prefs,knockSpaces=true) {
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
    static loadObjectFromFile(fileName = './config.json') {
        try {
            let rawdata = fs.readFileSync(fileName);
            const object = JSON.parse(rawdata);
            return object;
        }
        catch (err) {
            console.log(
                  'Error parsing config: ' + fileName
                + '\nDoes the config file exist?'
                + '\n    Creating new config file.'
                + '\n'+ err.message);
            const object = {};
            return object;
        }
    }
    static dumpObjectToFile(object,filename = './kernel_dump') {
        let data = JSON.stringify(object, null, '  ');
        fs.writeFile(filename, data, function (err) {
            if (err) {
                console.log(`filesave error: ${err.message}`);
                return;
            }
            return true;
        });
    }
    static createTimeStamp(date = new Date()) {
        return `[` +
            `${String(date.getFullYear()).substr(-2)}`      +
            `${String(date.getMonth()+1).padStart(2,'0')}`  +
            `${String(date.getDate()).padStart(2,'0')} `    +
            `${String(date.getHours()).padStart(2,'0')}:`   +
            `${String(date.getMinutes()).padStart(2,'0')}:` +
            `${String(date.getSeconds()).padStart(2,'0')}`  +
        `]`;
    }
}
class KernalBeacon extends EventEmitter {
    returnMessage(message) {
        this.emit('messageReturned', message)
    }
}