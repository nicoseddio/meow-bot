const GenericApp = require("../GenericApp");

class CatMod extends GenericApp {
    mEvents() {
        return ['message', 'messageDelete']
    }
    handle(message) {
        return true;
    }
}

module.exports = CatMod;