const fetch = require("node-fetch"); // for getting cat pics

class CatDelivery {
    constructor() {}
    handle(message) {
        this.handleCatPostRequest(message.channel);
        return true;
    }
    async handleCatPostRequest(channel) {
        // log('Posting a cat!');
        const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
        channel.send(file);
        channel.send("cat");
    }
}

module.exports = CatDelivery;