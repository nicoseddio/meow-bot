function list(appsConfig) {
    let k,m = "";
    // if (args.length > 0 && 
    //     aliasAll.includes(args[0].toLowerCase()) ) {
        k = "Installed Apps:\n";
        m = '- `' + Object.keys(appsConfig).join('`\n- `') + '`';
    // }
    return k+m;
}

function install(filename, appsConfig) {
    let appName = String(filename).split('/').slice(-1)[0].split('.')[0];
    appsConfig[appName] = {};
    appsConfig[appName].name = appName;
    appsConfig[appName].file = filename;
    appsConfig[appName].enabled = true;
    appsConfig[appName].appSettings = {};
    let app = require(filename);
    let reqs = app.listeners();
    appsConfig[appName].associatedEvents = reqs.events;
    appsConfig[appName].associatedCommandAliases = {};
    for (c in reqs.commands) {
        appsConfig[
            appName
        ].associatedCommandAliases[
            reqs.commands[c]
        ] = reqs.commands[c];
    }
    return true;
}

function remove(appName, appsConfig) {
    delete appsConfig[appName];
    return true;
}
function buildListeners(appsCfg) {
    const listeners = {};
    for (a in appsCfg) {
        let app = appsCfg[a];
        for (e in app.associatedEvents) {
            let event = app.associatedEvents[e];
            if (!(event in EventListeners))
                listeners[event] = [];
            listeners[event].push(app.name);
        }
    }
    return listeners;
}
function buildCommandsList(appsCfg) {
    const commands = {};
    for (a in appsCfg) {
        let app = appsCfg[a];
        for (c in app.associatedCommandAliases) {
            let cmd = app.associatedCommandAliases[c];
            commands[cmd] = app.name;
        }
    }
    return commands;
}

exports.list = list;
exports.install = install;
exports.remove = remove;
exports.buildCommandsList = buildCommandsList;
exports.buildListeners = buildListeners;