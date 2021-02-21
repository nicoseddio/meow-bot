class GenericApp {
    constructor(kernel,settings) {
        this.kernel = kernel;
        this.settings = settings;
        this.commands = this.commands();
        this.mEvents = this.mEvents();
        this.initialize();
    }
    /**
     * App-specific constructor statements.
     */
    initialize() {}
    /**
     * Set the commands this app listens for.
     * @returns {Array} Array of strings of commands.
     */
    commands() {
        return [];
    }
    /**
     * Set the Discord client events this app listens for.
     * @returns {Array} Array of strings of events, such as
     *      'message' and 'messageDelete'.
     */
    mEvents() {
        return [];
    }
    /**
     * Receive a message in this app.
     * @param {Discord.Message} message - Discord.js message to process.
     * @returns {Boolean} True if the app handled the message.
     */
    handle(message) {
        return true;
    }
    /**
     * Receive a message for an unusual event.
     * @param {Discord.Message} message - Discord.js message to process.
     * @param {String} mEvent - Discord.js event to act upon.
     */
    handleSpecial(message,mEvent) {
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