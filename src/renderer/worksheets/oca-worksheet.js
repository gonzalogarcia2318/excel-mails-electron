const XLSX = require('xlsx');
import { PlatformTypes } from '../../types/platform-types.js';
import { Shipment } from '../../model/shipment.js';

export class OcaWorksheet {

    constructor(worksheet) {
        this.worksheetJson = XLSX.utils.sheet_to_json(worksheet);
        this.parseToShipments();
    }

    parseToShipments() {
        this.shipments = [];
        for (let row in this.worksheetJson) {
            const data = this.worksheetJson[row];
            if (data['Destinatario']) { // If name is not empty or null, add to array
                const trackingId = data['Numero_de_Envio'].split(' ')[1];
                this.shipments.push(new Shipment(data['Destinatario'], trackingId, PlatformTypes.OCA, this.searchEmailFieldInRow(data)));
            }
        }
    }

    getShipments() {
        return this.shipments;
    }

    // Method to find email field in sheet row (if it exists). Multiple attribute names because they could vary. 
    searchEmailFieldInRow(row) {
        if (row['Email']) {
            return row['Email'];
        }
        if (row['Mail']) {
            return row['Mail'];
        }
        if (row['email']) {
            return row['email'];
        }
        if (row['mail']) {
            return row['mail'];
        }
        return null;
    }

}