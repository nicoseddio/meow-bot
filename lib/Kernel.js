const fs = require('fs');
const { EventEmitter } = require('events');
const { type } = require('os');
const { config } = require('process');

class Kernel {
    constructor() {
        this.config = require('../config.json');
        this.cache = {};
        this.commandsList = "\nMeow!\n<@!769241485617922088> supports the following commands:\n- `meow`\n- `commands`\n- `ping`\n- `quantum`\n<@!769241485617922088> admins can use `sudo` commands.\nEnjoy your meow-bot!";
        this.commandsListSudo =
            "administrative commands:\n"    +
            "- `commands`\n"                +
            "- `dump-session`\n"            +
            "- `enable-app`\n"              +
            "- `save-config`\n"
        //this.commandsListSudo = "Sudo Commands:\n- `shutdown`\n- `update`\n- `version`\n- `saveconfig`\n- `status [set [TYPE] [msg], clear]`\n  `TYPEs: PLAYING/STREAMING/LISTENING/WATCHING/COMPETING`";
    }
    initialize(client) {
        this.client = client;
        this.cache.apps = this.loadApps();
        this.dumpSession();

        console.log()
    }
    distribute(message,mEvent = false) {
        if (message.content.startsWith(this.config.adminCommand)) {
            message.content = 
                message.content.replace(this.config.adminCommand, '');
            if (message.content.startsWith(" "))
                message.content = message.content.replace(" ", '');
            this.parseSystemCommand(message);
        }
        else this.getEnabledApps(
                message.guild.id,
                message.channel.id)
            .forEach(app => {
                if (this.verifyStructure(this.cache,"apps",app))
                    if (mEvent === 'message')
                        this.cache.apps[app].handle(message);
                    else
                        this.cache.apps[app].handleSpecial(message,mEvent);
            });
    }
    parseSystemCommand(message) {
        if (!this.verifySudoUser(message.author))
            return false;
        let args = message.content.split(" "), cmd = "";
        if (args.length >= 1) cmd = args.shift();
        switch (cmd) {
            case "help": //intentional fall-through
            case "commands":
                message.reply(this.commandsListSudo);
                break;
            case "dump": //intentional fall-through
            case "session-dump":
            case "dump-session":
                this.dumpSession();
                message.reply("session dumped!");
                break;
            case "enable-app":
                if (!(args.length > 1)) {
                    message.reply("Usage: enable-app {app} {guild_id} [channel_id]")
                    break; }
                let a = args[0], g = args[1], c = false;
                if (g.toLowerCase() === "this")
                    g = message.guild.id;
                if (args.length > 2) {
                    c = args[2];
                    if (c.startsWith('<#'))
                        c = c.replace('<#','').replace('>','');
                    this.enableApp(a, g, c)
                    message.reply(`${a} enabled for channel ${c} on guild ${g}!`);
                } else {
                    this.enableApp(a, g)
                    message.reply(`${a} enabled for guild ${g}!`);
                }
                break;
            case "log":
                log(message.content);
                break;
            case "save":
            case "save-config":
                fs.copyFileSync('config.json', 'backup_config.json');
                this.objectToJSON(this.config,"config");
                message.reply('config saved successfully!');
                break;
            default:
                message.channel.send("Meow! That is not a recognized system command!");
                break;
        }
    }
    getEnabledApps(guild,channel) {
        let appsList = [];
        if (this.verifyStructure(this.config,'guilds',guild,'apps')) {
            Object.keys(this.config.guilds[guild].apps)
                .forEach(appN => {
                    let appA = this.config.guilds[guild].apps[appN]
                    if (appA.length == 0 || (appA.length > 0 && appA.includes(channel)))
                        appsList.push(appN)
                })
        }
        return appsList;
    }
    loadApps(dir='./apps/') {
        let cfg = this.config.apps;
        const aCache = {};
        // load in directory
        fs.readdirSync('./lib/apps')
            .filter(app => app.endsWith('.js'))
            .forEach(app => {
                const appObj = require(dir+app);
                cfg[app] = cfg[app] || {};
                cfg[app].settings = cfg[app].settings || {};
                aCache[app] = new appObj(this,cfg[app].settings);
        });
        return aCache;
    }
    enableApp(app,guild,channel=false) {
        let appCfg = this.addStructure(this.config, 'guilds', guild, 'apps', app)
        if (channel &&
            !appCfg.includes(channel))
                appCfg.push(channel);
        else
            appCfg.length = 0;
        return true;
    }
    disableApp(app,guild,channel=false) {
        if (this.verifyStructure(this.config, 'guilds', guild, 'apps', app)) {
            let appCfg = this.config.guilds[guild].apps[app];
            if (channel && appCfg.includes(channel)) {
                const i = appCfg.indexOf(channel);
                if (i > -1) appCfg.splice(i, 1);
            } else if (!channel) {
                delete this.config.guilds[guild].apps[app];
            }
        }
    }
    appEnabled(app,guild,channel=false) {
        let g = guild, c = channel, cfg = this.config;
        if (channel) {
            if (this.verifyStructure(cfg,'guilds',g,'apps',app) &&
                cfg.guilds[g].apps[app].includes(c))
                    return true;
            else return false;
        } else {
            if (this.verifyStructure(cfg,'guilds',g,'apps',app) &&
                cfg.guilds[g].apps[app].length === 0)
                    return true;
            else return false;
        }
    }
    verifyStructure(parent, ...children) {
        let sep = ';', cs = children.join(sep).split(sep);
        if (cs.length > 1 && cs[0] in parent) {
            let c = cs.shift()
            if (this.verifyStructure(parent[c],cs.join(sep)))
                return true
            else return false
        }
        else if (cs.length > 0 && cs[0] in parent)
            return true;
        else return false;
    }
    addStructure(parent, ...children) {
        let sep = ';', cs = children.join(sep).split(sep), //necessary for recursion
            cLvl = parent;
        if (cs.length > 0) {
            let c = cs.shift();
            parent[c] = parent[c] || {};
            cLvl = parent[c];
            if (cs.length > 0)
                cLvl = this.addStructure(parent[c],cs.join(sep))
        }
        return cLvl;
    }
    objectToJSON(object = this.cache,filename = 'dump_file') {
        let data = JSON.stringify(replaceCircular(object), null, '    ');
        fs.writeFile(filename+'.json', data, function (err) {
            if (err) {
                console.log(`filesave error: ${err.message}`);
                return;
            }
            return true;
        });
    }
    verifySudoUser(user) {
        let ts = this.createTimeStamp(),
            msg = `${ts} System access attempted by ${user.tag}: `;
        if (this.config.sudoers.includes(user.id)) {
            console.log(msg + "granted.");
            return true;
        } else {
            console.log(msg + "refused.");
            return false;
        }
    }
    dumpSession() {
        let lastSave = this.createTimeStamp();
        this.cache.lastSave = lastSave;
        this.config.lastSave = lastSave;
        this.objectToJSON(this.config,'dump_configBackup')
        this.objectToJSON(this.cache, 'dump_cacheBackup')
    }
    createTimeStamp(date = new Date(),fileSystemSafe=false) {
        let ts = `[` +
            `${String(date.getFullYear()).substr(-2)}`      +
            `${String(date.getMonth()+1).padStart(2,'0')}`  +
            `${String(date.getDate()).padStart(2,'0')} `    +
            `${String(date.getHours()).padStart(2,'0')}:`   +
            `${String(date.getMinutes()).padStart(2,'0')}:` +
            `${String(date.getSeconds()).padStart(2,'0')}`  +
        `]`;
        if (fileSystemSafe) {
            ts = ts.replaceAll(':','-')
            ts = ts.replaceAll(' ','_')
            ts = ts.replaceAll('[','')
            ts = ts.replaceAll(']','')
        }
        return ts;
    }
}

// from https://gist.github.com/saitonakamura/d51aa672c929e35cc81fa5a0e31f12a9
// example: JSON.stringify(replaceCircular(obj))
var replaceCircular = function(val, cache) {
    cache = cache || new WeakSet();
    if (val && typeof(val) == 'object') {
        if (cache.has(val)) return '[Circular]';
        cache.add(val);
        var obj = (Array.isArray(val) ? [] : {});
        for(var idx in val) {
            obj[idx] = replaceCircular(val[idx], cache);
        }
        cache.delete(val);
        return obj;
    }
    return val;
};

function log(...messages) {
    let msg = " " + messages.join(', ');
    console.log(createTimeStamp() + msg)
}
function createTimeStamp(date = new Date(),fileSystemSafe=false) {
    let ts = `[` +
        `${String(date.getFullYear()).substr(-2)}`      +
        `${String(date.getMonth()+1).padStart(2,'0')}`  +
        `${String(date.getDate()).padStart(2,'0')} `    +
        `${String(date.getHours()).padStart(2,'0')}:`   +
        `${String(date.getMinutes()).padStart(2,'0')}:` +
        `${String(date.getSeconds()).padStart(2,'0')}`  +
    `]`;
    if (fileSystemSafe) {
        ts = ts.replaceAll(':','-')
        ts = ts.replaceAll(' ','_')
        ts = ts.replaceAll('[','')
        ts = ts.replaceAll(']','')
    }
    return ts;
}

module.exports = Kernel;