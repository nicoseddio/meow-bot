const fs = require('fs');
const { EventEmitter } = require('events');

class Kernel extends EventEmitter {
    constructor() {
        this.config = require('../config.json');
        this.cache = {};
    }
    initialize(client) {
        this.client = client;
        this.cache.apps = loadApps(this.client,this.config.apps);
    }
    distributeEvent(event,message) {
    }
    enabledForGuild(app,guild,gConfig) {
        if (guild in gConfig &&
            'apps' in gConfig[guild] &&
            gConfig[guild].apps.includes(app))
                return true;
        else return false;
    }
    enabledForChannel(app,channel,guild,gConfig) {
        if (guild in gConfig &&
            'channels' in gConfig[guild] &&
            channel in gConfig[guild].channels &&
            'apps' in gConfig[guild].channels[channel] &&
            gConfig[guild].channels[channel].apps.includes(app))
                return true;
        else return false;
    }
    loadApps(client, aConfig, dir='./apps/') {
        const aCache = {};
        // load in directory
        fs.readdirSync(dir).forEach(app => {
            app.replace('.js','');
            // ignore if disabled
            if (app in aConfig &&
                'disabled' in aConfig[app] &&
                aConfig[app].disabled)
                continue;
            const appObj = require(dir+app);
            // initialize with client and config
            if (app in aConfig &&
                'settings' in aConfig[app])
                aCache[app] = new appObj(client,aConfig[app].settings);
            else   
                aCache[app] = new appObj(client, {});
        });
        return aCache;
    }
    dumpObjectToFile(object = this.cache,filename = './dump_file') {
        let data = JSON.stringify(object, null, '  ');
        fs.writeFile(filename, data, function (err) {
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