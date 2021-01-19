const fs = require('fs');
const { config } = require('process');

class GenericApp {
    constructor(dirname = __dirname) {
        this.events = {};
        // example:
        // events {
        //     'message': {
        //         "[guild_id]": [
        //             "[channel_id]"
        //         ]
        //     }
        // }
        this.commands = [];
        this.dirname = dirname;
    }
    /**
     * Pass a message to this app.
     * @param {Discord.Message} message - Discord.js message to process.
     * @returns {Boolean} True if the app handled the message.
     */
    handle(message) {
        return true;
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
    loadConfig(configFileName = this.dirname+`/config.json`) {
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