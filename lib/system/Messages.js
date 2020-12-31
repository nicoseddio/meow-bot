const messages = {
    commandsList:
        "Meow!"+
        "\n<@!769241485617922088> supports the following commands:"+
        "\n- `meow`"+
        "\n- `commands`"+
        "\n- `ping`"+
        "\n- `quantum`"+
        "\n<@!769241485617922088> admins can use `sudo` commands."+
        "\nEnjoy your meow-bot!",
    notACat:
        "Meow!"+
        "\nThanks for posting to the <#767240063301713951>!"+
        "\nOne of your messages was deleted because it doesn't fit the channel theme:"+
        "\n**Only 'cat'** and media of **cats** may be posted."+
        "\nThe residing _cat-god_ is tasked with nurturing proper cat worship."+
        "\nPlease repost to the <#767240063301713951>!"+
        "\nWe want to see your kitties!",
    commandsListSudo:
        "`sudo` Commands:"+
        "\n- `shutdown`"+
        "\n- `update`"+
        "\n- `version`"+
        "\n- `saveconfig`"+
        "\n- `status [set [TYPE] [msg], clear]`"+
        "\n  `TYPEs: PLAYING/STREAMING/LISTENING/WATCHING/COMPETING`",
}

function get(message) {
    return messages[message];
}
function list() {
    return Object.keys(messages);
}

exports.get = get;
exports.list = list;