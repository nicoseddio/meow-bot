const GenericApp = require("../GenericApp");

class CatMod extends GenericApp {
    mEvents() {
        return ['message', 'messageDelete']
    }
    handle(message) {
        return true;
    }
    notACatMessage(channelID,role=false) {
        let roleMsg = ""
        if (role) roleMsg = `The residing _${role}_ is tasked with nurturing proper cat worship.\n`
        return "\n"+
            "Meow!\n"+
            `Thanks for posting to the <#${channelID}>!\n`+
            "One of your messages was deleted because it doesn't fit the channel theme:\n"+
            "**Only 'cat'** and media of **cats** may be posted.\n"+
            roleMsg+
            `Please repost to the <#${channelID}>!\n`+
            "We want to see your kitties!"
    }
}

module.exports = CatMod;