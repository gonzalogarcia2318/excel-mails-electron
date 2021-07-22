const XLSX = require('xlsx');
const electron = require('electron').remote;

const selectFileBtn = document.getElementById('selectFileBtn');
const namesInput = document.getElementById('namesInput');
const processBtn = document.getElementById('processBtn');

selectFileBtn.addEventListener('click', handleSelectBtn);
processBtn.addEventListener('click', processData);

// Current workbook
let workbook;
let shipments = [];

async function handleSelectBtn() {
    const dialogResponse = await electron.dialog.showOpenDialog({
        title: 'Selecciona un archivo',
        filters: [{ name: 'Spreadsheets', extensions: ['xlsx'] }],
        properties: ['openFile']
    });

    if (dialogResponse.filePaths.length > 0) {
        console.log("Process file", dialogResponse.filePaths[0]);
        workbook = XLSX.readFile(dialogResponse.filePaths[0]);
        parseWorkbook()
    }
}

function parseWorkbook() {
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Range: 1 to skip first row of the worksheet
    const worksheetJson = XLSX.utils.sheet_to_json(worksheet, { range: 1 });

    // INGRESAR NOMBRES, BUSCAR POR NOMBRE EL ID Y NOTIFICAR
    for (let row in worksheetJson) {
        const data = worksheetJson[row];
        const date = data['Fecha creación'].split(/\s+/)[1]; // Split considering all spaces
        shipments.push(new Shipment(data['Nombre y Apellido'], data['WeliveryID'], data['Status'], date));
    }
};

function processData() {
    // VALIDAR NOMBRES, WORKSHEET
    const buyersNames = namesInput.value.split(',');
    console.log("Buyers", buyersNames);
    //
    buyersNames.forEach(buyerName => {
        let shipment = shipments.find(shipment => shipment.userName == buyerName.trim())
        if (shipments != null) {
            notifyShipment(shipment);
        }

    })
}







function notifyShipment(shipment) {
    console.log(`Notify shipment from ${shipment.userName} with WeliveryID: ${shipment.weliveryId}`)
}



function printShipments() {
    console.table(shipments);
}


function clearAll() {
    workbook = null;
    shipments = [];
    namesInput.value = null;
}