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
        this.objectToJSON(this.config,'dump_configBackup.json')
        this.objectToJSON(this.cache, 'dump_cacheBackup.json')
    }
    distribute(message) {

    }
    distributeEvent(event,message) {
    }
    loadApps(client, aConfig, dir='./apps/') {
        const aCache = {};
        // load in directory
        fs.readdirSync('./lib/apps')
            .filter(app => app.endsWith('.js'))
            .filter(app => this.appEnabled(app))
            .forEach(app => {
                const appObj = require(dir+app);
                // initialize with client and config
                aConfig[app] = aConfig[app] || {};
                aConfig[app].settings = aConfig[app].settings || {};
                aCache[app] = new appObj(client,aConfig[app].settings);
        });
        return aCache;
    }
    appEnabled(app,guild=false,channel=false) {
        let e = false, cfg = this.config;
        if (channel && guild) {
            e = (!disabledGlobally() &&
                    channelEnabled());
        } else if (guild) {
            e = (!disabledGlobally() &&
                    guildEnabled());
        } else {
            e = !disabledGlobally();
        }
        console.log(`${app} is enabled: ${e}`)
        return e;
        function disabledGlobally() {
            if ("apps" in cfg &&
                app in cfg.apps &&
                "disabled" in cfg.apps[app] &&
                cfg.apps[app].disabled)
                return true;
            else return false;
        }
        function guildEnabled() {
            let g = guild;
            if ("guilds" in cfg &&
                g in cfg.guilds &&
                "apps" in cfg.guilds[g] &&
                cfg.guilds[g].apps.includes(app))
                return true;
            else return false;
        }
        function channelEnabled() {
            let g = guild, c = channel;
            if (guildEnabled() &&
                "channels" in cfg.guilds[g] &&
                c in cfg.guilds[g].channels &&
                "apps" in cfg.guilds[g].channels[c] &&
                cfg.guilds[g].channels[c].apps.includes(app))
                return true;
            else return false;
        }
    }
    objectToJSON(object = this.cache,filename = 'dump_file') {
        let data = JSON.stringify(object, null, '    ');
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

module.exports = Kernel;