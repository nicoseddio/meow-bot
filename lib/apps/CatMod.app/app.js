const GenericApp = require("../GenericApp");

class CatMod extends GenericApp {
    constructor() {
        super(__dirname);
        this.events = {
            "message": {
                "726982067136757853": [
                    "767240063301713951"
                ]
            },
            "messageDelete": {
                "726982067136757853": [
                    "767240063301713951"
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