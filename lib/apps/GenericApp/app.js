const fs = require('fs');

class GenericApp {
    constructor() {
        this.configFileName = './config.json';
    }
    /**
     * Pass a message to this app.
     * @param {Discord.Message} message - Discord.js message to process.
     * @returns {Boolean} True if the app handled the message.
     */
    handle(message) {
        return true;
    }
    saveConfig() {
        let data = JSON.stringify(this.config, null, '    ');
        fs.writeFile(this.configFileName, data, function (err) {
            if (err) {
                console.log(`filesave error: ${err.message}`);
                return;
            }
            console.log('File saved successfully.');
        });
    }
    loadConfig() {
        this.config = require(this.configFileName);
        console.log(this.config.name)
    }
    testSave() {
        let data = JSON.stringify(this.config, null, '    ');
        fs.writeFile('./lib/testout.json', data, function (err) {
            if (err) {
                console.log(`filesave error: ${err.message}`);
                return;
            }
            console.log('File saved successfully.');
        });
    }
}

module.exports = GenericApp;