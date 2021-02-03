class GenericApp {
    constructor(client,config) {
        this.client = client;
        this.config = config;
        this.commands = this.loadCommands();
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
}

module.exports = GenericApp;

// SAMPLE APP
// class Sample extends GenericApp {
//     loadEvents() {
//         return {
//             'GUILD_ID': {
//                 'CHANNEL_ID'
//             }
//         }
//     }
//     loadCommands() {
//         return ['sample']
//     }
//     handle() {
//         return true;
//     }
//     handleEvent() {
//         return true;
//     }
// }