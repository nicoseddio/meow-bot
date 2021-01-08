const fs = require('fs');

function loadApps(dir) {
    const apps = {};
    let files = [];
    try {
        files = fs.readdirSync(dir);
    } catch (error) {
        throw new Error(`${dir} is not a valid directory.`);
    }

    return apps;
}

function buildListeners() {}

function test() {
    loadApps('./lib/apps/');
    return;
}