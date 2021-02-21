const fs = require('fs');
const { EventEmitter } = require('events');
const { type } = require('os');

class Kernel {
    constructor() {
        this.config = require('../config.json');
        this.cache = {};
        this.commandsList = "\nMeow!\n<@!769241485617922088> supports the following commands:\n- `meow`\n- `commands`\n- `ping`\n- `quantum`\n<@!769241485617922088> admins can use `sudo` commands.\nEnjoy your meow-bot!";
        this.commandsListSudo = "Sudo Commands:\n- `shutdown`\n- `update`\n- `version`\n- `saveconfig`\n- `status [set [TYPE] [msg], clear]`\n  `TYPEs: PLAYING/STREAMING/LISTENING/WATCHING/COMPETING`";
    }
    initialize(client) {
        this.client = client;
        this.cache.apps = this.loadApps(this.client,this.config.apps);
        this.objectToJSON(this.config,'dump_configBackup')
        this.objectToJSON(this.cache, 'dump_cacheBackup')

        console.log()
    }
    distribute(message,mEvent = false) {
        this.getEnabledApps(
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
    distributeEvent(mEvent,message) {
        // this.distribute(message,mEvent);
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
    loadApps(client, aConfig, dir='./apps/') {
        const aCache = {};
        // load in directory
        fs.readdirSync('./lib/apps')
            .filter(app => app.endsWith('.js'))
            .forEach(app => {
                const appObj = require(dir+app);
                // initialize with client and config
                aConfig[app] = aConfig[app] || {};
                aConfig[app].settings = aConfig[app].settings || {};
                aCache[app] = new appObj(this,aConfig[app].settings);
        });
        return aCache;
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
        let sep = ';'
        let cs = children.join(sep).split(sep);
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
        let sep = ';'
        let cs = children.join(sep).split(sep); //necessary for recursion
        if (cs.length > 0) {
            let c = cs.shift();
            parent[c] = parent[c] || {};
            if (cs.length > 0)
                this.addStructure(parent[c],cs.join(sep))
        }
        return parent;
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
    createTimeStamp(date = new Date()) {
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

module.exports = Kernel;