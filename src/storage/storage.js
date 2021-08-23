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

    getAll(){
        return this.data;
    }

    setAll(data){
        this.data = data;
        fs.writeFileSync(this.userConfigPath, JSON.stringify(this.data));
    }
}

const defaults = {
    weliveryEmailMessage: 'Hola, ${nombre}\n\n'
        + 'Ya despachamos tu pedido. Podes seguirlo desde este link: https://welivery.com.ar/tracking/?wid=${trackingId}\n'
        + 'Te llegará entre esta tarde y mañana.\n\n'
        + 'Cualquier cosa, podes contactarte con soporte@welivery.com.ar\n\n'
        + 'Saludos,\n'
        + 'Agustina',
    ocaEmailMessage: 'Hola, ${nombre}\n\n'
    + 'Ya despachamos tu pedido. El numero de seguimiento es: ${trackingId}\n'
    + 'Te llegará entre esta tarde y mañana.\n\n'
    + 'Saludos,\n'
    + 'Agustina',
    emailSender: 'mail@mail.com',
    senderName: 'sender',
    weliveryEmailMessageSubject: 'Asunto del mail - Welivery',
    ocaEmailMessageSubject: 'Asunto del mail - OCA',
};

module.exports = Storage;