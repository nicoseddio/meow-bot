class GenericApp {
    constructor(client,settings) {
        this.client = client;
        this.settings = settings;
        this.commands = this.commands();
        this.mEvents = this.mEvents();
    }
    commands() {
        return [];
    }
    mEvents() {
        return [];
    }
    /**
     * Pass a message to this app.
     * @param {Discord.Message} message - Discord.js message to process.
     * @returns {Boolean} True if the app handled the message.
     */
    handle(message) {
        return true;
    }
    handleMEvent(mEvent,message) {
        return true;
    }
}

module.exports = GenericApp;

// SAMPLE APP
// class Sample extends GenericApp {
//     mEvents() {
//         return ['message']
//     }
//     commands() {
//         return ['sample']
//     }
//     handle() {
//         return true;
//     }
//     handleMEvent() {
//         return true;
//     }
// }