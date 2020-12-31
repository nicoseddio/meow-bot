class GenericApp {
    constructor(client,config) {
        this.client = client;
        this.config = config;
        return {
            event_listeners: ['message'],
            associated_commands: [],
        }
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

module.exports = GenericApp;