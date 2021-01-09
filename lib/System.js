function knockPrefixes(string,prefs,knockSpaces=true) {
    let continueChecks = true;
    let prefFound = false;
    while (continueChecks) {
        prefFound = false;
        for (p in prefs) {
            if (string.startsWith(prefs[p])) {
                string = string.slice(prefs[p].length);
                prefFound = true;
            }
            if (string.startsWith(' ') && knockSpaces)
                string = string.slice(1);
        }
        if (!prefFound)
            continueChecks = false;
    }
    return string;
}