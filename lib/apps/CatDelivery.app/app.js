const fetch = require("node-fetch"); // for getting cat pics
const GenericApp = require("../GenericApp");

class CatDelivery extends GenericApp {
    constructor() {
        super(__dirname);
        this.events = {
            "791397233743626251": {
                "796529775661023244": [
                    "message"
                ]
            }
        }
        this.commands = ['cat'];
    }
    handle(message) {
        this.handleCatPostRequest(message.channel);
        return true;
    }
    handleEvent(evt,message) {
        switch(evt) {
            case 'message':
                this.handleCatReply(message.channel);
                break;
        }
    }
    async handleCatPostRequest(channel) {
        // log('Posting a cat!');
        const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
        channel.send(file);
        channel.send("cat");
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

module.exports = CatDelivery;