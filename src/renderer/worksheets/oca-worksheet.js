const XLSX = require('xlsx');
import { PlatformTypes, Shipment } from '../../model/shipment.js';

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
                this.shipments.push(new Shipment(data['Destinatario'], trackingId, PlatformTypes.OCA, null));
            }
        }
    }

    getShipments() {
        return this.shipments;
    }

}