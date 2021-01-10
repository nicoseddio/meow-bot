const fs = require('fs');

class System {
    constructor(client,config) {
        this.client = client;
        this.config = config;
        this.logStream = fs.createWriteStream("system.log", {flags:'a'})
    }
    initialize() {
        this.cleanMentionsFromPrefixes();
        this.addClientMentionToPrefixes(
            this.config.prefixes,
            this.client.user.id
        );
    }
    handle(message) {

    }
    loadApps(dir='./apps/',appExt='.app') {
        const apps = {};
        fs.readdirSync(dir).forEach(function (appName) {
            if (appName.endsWith(appExt)) {
                const app = require(dir+appName);
                apps[appName.replace(appExt,'')] = new app;
            }      
        });
        return apps;
    }
    knockPrefixes(string,prefs,knockSpaces=true) {
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
    cleanMentionsFromPrefixes(prefs) {
        for (let p in prefs) {
            if (this.checkForUserId(prefs[p]))
                prefs.splice(p,1);
        }
        return prefs;
    }
    addClientMentionToPrefixes(prefs, id) {
        let forms = this.getUserMentionFormats(true,id);
        for (let f in forms) 
            prefs.push(forms[f]);
        return true;
    }
    checkForUserMention(str) {
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
    writeToJSON(dictionary,filename) {
        let data = JSON.stringify(dictionary, null, '    ');
        fs.writeFile(file, data, function (err) {
            if (err) {
                log(`writeToJSON error: ${err.message}`);
                return;
            }
            log('File saved successfully.');
        });
    }
    generateToken(token,length=12) {
        console.log('true')
        newToken = '';
        for (let i = 0; i < length; i++) {
            newToken += token.charAt(getRandomInt(token.length));
        }
        function getRandomInt(max) {
            return Math.floor(Math.random() * Math.floor(max));
        }
        return newToken;
    }
    /**
     * Timestamped message, sent to console and file.
     * @param {String} string_s - message to put to console and file.
     */
    async log(string_s) {
        const t = new Date();
        const stamp = 
             `[${String(t.getFullYear()).substr(-2)}`
            + `${String(t.getMonth()+1).padStart(2, '0')}`
            + `${String(t.getDate()   ).padStart(2, '0')}`
            +` ${String(t.getHours()  ).padStart(2, '0')}`
            +`:${String(t.getMinutes()).padStart(2, '0')}`
            +`:${String(t.getSeconds()).padStart(2, '0')}]`
        let m = `${stamp} ${string_s}`;
        this.logStream.write(`${m}\n`);
        console.log(m);
        return true;
    }
}

module.exports = System;