const fs = require('fs');
const { EventEmitter } = require('events');

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
        console.log(JSON.stringify(this.createStructure({},'apps.app','CatMod','settings.timeouts','life')))
        console.log(JSON.stringify(this.createStructure({},'apps.app')))
        console.log(JSON.stringify(this.createStructure({},'foo')))
    }
    distribute(message) {

    }
    distributeEvent(mEvent,message) {
        let g = message.guild.id, c = message.channel.id, cfg = this.config;
        console.log(g + " " + c)
        if ("guilds" in cfg &&
            g in cfg.guilds &&
            "channels" in cfg.guilds[g] &&
            c in cfg.guilds[g].channels &&
            "apps" in cfg.guilds[g].channels[c]) {
                ccfg.guilds[g].channels[c].apps.forEach(app => {
                    app.handle(message);
                })
            }
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
            if ("guilds" in cfg &&
                g in cfg.guilds &&
                "apps" in cfg.guilds[g] &&
                app in cfg.guilds[g].apps &&
                cfg.guilds[g].apps[app].includes(c))
                return true;
            else return false;
        } else {
            if ("guilds" in cfg &&
                g in cfg.guilds &&
                "apps" in cfg.guilds[g] &&
                app in cfg.guilds[g].apps &&
                cfg.guilds[g].apps[app].length === 0)
                return true;
            else return false;
        }
    }
    createStructure(parent, ...children) {
        let tree = children.join('.');
        if (tree.indexOf('.') > 0) {
            let cs = tree.split('.'), child = cs.shift();
            parent[child] = parent[child] || {};
            if (cs.length > 0)
                this.createStructure(parent[child], cs.join('.'));
        } else if (tree.length > 0) {
            parent[tree] = parent[tree] || {};
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