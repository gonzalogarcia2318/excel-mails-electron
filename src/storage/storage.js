const { app } = require('electron');
const fs = require('fs');

class Storage {

    constructor() {
        this.userConfigPath = `${app.getPath('userData')}/user-config.json`;
        this.data = this.parseDataToJson(this.userConfigPath);
    }

    // Get value of key from json
    get(key) {
        return this.data[key];
    }

    set(key, value) {
        this.data[key] = value;
        fs.writeFileSync(this.userConfigPath, JSON.stringify(this.data));
    }

    parseDataToJson(filePath) {
        try {
            return JSON.parse(fs.readFileSync(filePath));
        } catch (error) {
            // If it fails, set defaults and save them.
            this.data = defaults;
            fs.writeFileSync(this.userConfigPath, JSON.stringify(this.data))
            return this.data;
        }
    }
}

const defaults = { emailMessage: 'Hola! Este es el mail por defecto.' };

module.exports = Storage;