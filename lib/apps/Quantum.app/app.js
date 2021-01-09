// const GenericApp = require("./lib/apps/GenericApp.app/GenericApp");

class Quantum {
    constructor(wanted=true) {
        this.wanted = wanted;
        this.events = ['message'];
        this.commands = ['quantum'];
    }
    listeners() {
        return {
            events: ['message'],
            commands: ['quantum'],
        }
    }
    handle(message) {
        message.reply(this.getQuantumMessage());
        return true;
    }
    getQuantumMessage() {
        const randomnum = Math.random();
        const threshhold = 0.5;
        if (randomnum < threshhold)
            return("Your cat is dead! |0>, q("+randomnum+")");
        else
            return("Your cat is alive! |1>, q("+randomnum+")");
    }
}

module.exports = Quantum;