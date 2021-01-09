const fs = require('fs');

class Kernel {
    constructor(client, config) {
        this.client = client;
        this.cfg = config;
        if (!('Apps') in this.cfg)
            this.cfg.Apps = {};
        const CmdAliases = {};
        this.cfg.CmdAliases = CmdAliases;
        const Events = {};
        this.cfg.Events = Events;
        if (!('appExt' in this.cfg))
            this.cfg.appExt = '.app';
    }
    loadApps(dir='./lib/apps/') {
        const appExt = this.cfg.appExt;
        const apps = this.cfg.Apps;
        const cmdAliases = this.cfg.CmdAliases;
        const events = this.cfg.Events;
        let files = [];
        // try {
            files = fs.readdirSync(dir);
        // } catch (error) {
        //     throw new Error(`${dir} is not a valid directory.`);
        // }
    
        for (let f in files) {
            let appFileName = files[f];
            if (appFileName.endsWith(appExt)) {
                let appName = 
                    appFileName.substring(
                        0,
                        appFileName.length-appExt.length
                    );
                // let appFileNamePath = `${dir}${appFileName}/${appName}.js`;
                let appFileNamePath = `./apps/${appFileName}/${appName}.js`;
                const app = require(appFileNamePath);
                apps[appName] = new app();
    
                let reqs = apps[appName].listeners();
    
                events[appName] = reqs.events;
    
                for (c in reqs.commands) {
                    let a = reqs.commands[c];
                    if (!(a in cmdAliases)) {
                        cmdAliases[a] = appName;
                    } else {
                        cmdAliases[`${appName}-${a}`] =
                            appName;
                    }
                }
            }
        }
    
        // clean up aliases
        for (let a in cmdAliases) {
            let appFileName = cmdAliases[a] + appExt;
            if (!(files.includes(appFileName))) {
                delete cmdAliases[a];
            }
        }
    
        return true;
    }
    knockPrefixes(
            string,
            prefs=this.cfg.prefixes,
            knockSpaces=true
        ) {
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
    cleanUsersFromPrefixes() {
        let prefs = this.cfg.prefixes;
        for (let p in prefs) {
            if (this.checkForUserId(prefs[p]))
                prefs.splice(p,1);
        }
        return true;
    }
    addClientToPrefixes(id = this.client.user.id) {
        let forms = this.getUserMentionFormats(true,id);
        for (let f in forms) 
            this.cfg.prefixes.push(forms[f]);
        return true;
    }
    checkForUserId(str) {
        let isId = false, forms = this.getUserMentionFormats();
        for (let s in forms) {
            if (str.startsWith(forms[s]))
                isId = true;
        }
        return isId;
    }
    getUserMentionFormats(includeUser=false,id=null) {
        if (includeUser)
            return [`<@${id}>`, `<@!${id}>`];
        else return [`<@`,`<@!`];
    }
}

module.exports = Kernel;