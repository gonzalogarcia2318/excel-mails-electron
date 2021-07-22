const XLSX = require('xlsx');
const electron = require('electron').remote;

const selectFileBtn = document.getElementById('selectFileBtn');
// const buyersInput = document.getElementById('buyersInput');
const processBtn = document.getElementById('processBtn');
const addUserEntryBtn = document.getElementById('addUserEntry');
const fileNameLabel = document.getElementById('fileName');


selectFileBtn.addEventListener('click', handleSelectBtn);
processBtn.addEventListener('click', processData);
addUserEntryBtn.addEventListener('click', addUserEntry)

// Current workbook
let workbook;
let workbookName;
let shipments = [];
let buyersData = [];

async function handleSelectBtn() {
    const dialogResponse = await electron.dialog.showOpenDialog({
        title: 'Selecciona un archivo',
        filters: [{ name: 'Spreadsheets', extensions: ['xlsx'] }],
        properties: ['openFile']
    });
    if (dialogResponse.filePaths.length > 0) {
        console.log("Process file", dialogResponse.filePaths[0]);
        workbook = XLSX.readFile(dialogResponse.filePaths[0]);
        workbookName = dialogResponse.filePaths[0].split('\\')[dialogResponse.filePaths[0].split('\\').length - 1]
        fileNameLabel.innerHTML = `Planilla: ${workbookName}`;
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
    // TODO: VALIDAR NOMBRES, WORKSHEET
    console.log("BUYERS DATA", buyersData)
    //
    buyersData.forEach(buyerData => {
        let shipment = shipments.find(shipment => shipment.userName == buyerData.userName.trim())
        buyerData.row.cells[2].innerHTML = shipment.weliveryId;
        buyerData.row.cells[3].innerHTML = "Enviado";
        if (shipments != null) {
            notifyShipment(shipment, buyerData.userEmail);
        }

    })
}


function addUserEntry() {
    //TODO: VALIDAR
    const userNameInput = document.getElementById('nameInput');
    const userEmailInput = document.getElementById('emailInput');
    //
    const table = document.getElementById('usersTable');
    let row = table.insertRow();
    row.classList.add('fade-row');
    row.insertCell(0).innerHTML = userNameInput.value;
    row.insertCell(1).innerHTML = userEmailInput.value;
    row.insertCell(2).innerHTML = "-";
    row.insertCell(3).innerHTML = "-";
    row.insertCell(4);
    //
    buyersData.push({ userName: userNameInput.value, userEmail: userEmailInput.value, row: row });
    userNameInput.value = null;
    userEmailInput.value = null;
}







function notifyShipment(shipment, email) {
    console.log(`Notify shipment of ${shipment.userName} with WeliveryID: ${shipment.weliveryId} to ${email}`)
}

function clearAll() {
    workbook = null;
    shipments = [];
    buyersData = [];

}