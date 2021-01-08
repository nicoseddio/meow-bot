class GenericApp {
    constructor(client,config) {
        this.client = client;
        this.config = config;
    }
    /**
     * Pass a message to this app.
     * @param {Discord.Message} message - Discord.js message to process.
     * @returns {Boolean} True if the app handled the message.
     */
    handle(message) {
        return true;
    }
}

function listeners() {
    return {
        events: ['message'],
        commands: [],
    }
}

module.exports = GenericApp;
exports.listeners = listeners;