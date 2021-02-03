const GenericApp = require("../GenericApp");

class CatMod extends GenericApp {
    constructor() {
        super(kernel);
        this.events = {
            "726982067136757853": {
                "767240063301713951": [
                    "message",
                    "messageDelete"
                ]
            }
        }
        this.commands = ['CAT'];
    }
    handle(message) {
        return true;
    }
}

module.exports = CatMod;