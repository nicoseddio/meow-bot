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
    async handleCatReply(channel,time_sleep_ms=20000,num_fetched_messages=10) {
        await new Promise(r => setTimeout(r, time_sleep_ms));
        channel.messages.fetch({limit:num_fetched_messages}).then(msgs => {
            // filters last 10 messages for meow-bot responses and images/links.
            // If the last message was not meow-bot, meow-bot comments 'cat'.
            if (!(msgs.filter(msg =>
                    msg.content.includes('http') ||
                    msg.attachments.size > 0 ||
                    msg.author.id === this.client.user.id
                    ).first().author.id === this.client.user.id)) {
                channel.send('cat');
            }
        });
    }
}

module.exports = CatMod;