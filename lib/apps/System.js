const GenericApp = require('./GenericApp/GenericApp');
const Apt = require('../extensions/Apt');
class System extends GenericApp {
    constructor(client,config) {
        super(client,config);
        this.EventListeners = Apt.buildListeners(config);
        this.CommandsLookup = Apt.buildCommandsList(config);
    }
    event(event,message) {
        switch(event) {
            case 'message':
                break;
            case 'messageDelete':
                break;
            default:
                return false;
        }
    }
    distribute(message) {
        return false;
    }
}