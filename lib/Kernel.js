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

        console.log("truth: " + this.appEnabled("MusicStreamer.js","726982067136757853"))
        console.log("not truth: " + this.appEnabled("CatMod.js","726982067136757853"))
        console.log("truth: " + this.appEnabled("CatMod.js","726982067136757853","767240063301713951"))
        console.log("not truth: " + this.appEnabled("CatMod.js","726982067136757853","769696060737847348"))
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
                aCache[app] = new appObj(client,aConfig[app].settings);
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