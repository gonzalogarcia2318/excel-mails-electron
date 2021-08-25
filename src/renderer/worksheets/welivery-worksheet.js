const XLSX = require('xlsx');
import { Shipment } from '../../model/shipment.js';
import { PlatformTypes } from '../../types/platform-types.js';

export class WeliveryWorksheet {

    constructor(worksheet) {
        // Range: 1 to skip first row of the worksheet
        this.worksheetJson = XLSX.utils.sheet_to_json(worksheet, { range: 1 });
        this.parseToShipments();
    }

    parseToShipments() {
        this.shipments = [];
        for (let row in this.worksheetJson) {
            const data = this.worksheetJson[row];
            if (data['Nombre y Apellido']) { // If name is not empty or null, add to array
                this.shipments.push(new Shipment(data['Nombre y Apellido'], data['WeliveryID'], PlatformTypes.WELIVERY, this.searchEmailFieldInRow(data)));
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