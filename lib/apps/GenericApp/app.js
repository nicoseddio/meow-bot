const fs = require('fs');
const { config } = require('process');

class GenericApp {
    constructor(kernelBeacon) {
        this.kernelBeacon = kernelBeacon;
        this.events = this.loadEvents();
        this.commands = this.loadCommands();
    }
    loadEvents() {
        // example:
        // this.events = {
        //     "GUILD_ID": {
        //         "CHANNEL_ID": [
        //             'message',
        //             'messageDelete'
        //         ]
        //     }
        // }
        return {};
    }
    loadCommands() {
        return {};
    }
    /**
     * Pass a message to this app.
     * @param {Discord.Message} message - Discord.js message to process.
     * @returns {Boolean} True if the app handled the message.
     */
    handle(message) {
        return true;
    }
    handleEvent(evt,message) {
        return true;
    }
    setClientID(id) {
        this.client.user.id = id;
    }
    saveConfig(config, configFileName = this.dirname+'/config.json') {
        let data = JSON.stringify(config, null, '    ');
        fs.writeFile(configFileName, data, function (err) {
            if (err) {
                console.log(`filesave error: ${err.message}`);
                return;
            }
            return true;
        });
    }
    loadConfig(configFileName = `/config.json`, dirname = null) {
        if (dirname !== null) configFileName = dirname + configFileName;
        try {
            let rawdata = fs.readFileSync(configFileName);
            const config = JSON.parse(rawdata);
            return config;
        }
        catch (err) {
            throw new TypeError(
                  'Error parsing config: ' + configFileName
                + '\nDid you construct with super(__dirname)?'
                + '\nDoes the config file exist?'
                + '\n'+ err.message);
            return {};
        }
    }
}

module.exports = GenericApp;