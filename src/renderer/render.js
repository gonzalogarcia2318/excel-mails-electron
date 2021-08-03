import { Shipment } from '../model/shipment.js';

const electron = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;
const XLSX = require('xlsx');
const bootstrap = require('bootstrap');

const selectFileBtn = document.getElementById('selectFileBtn');
const processBtn = document.getElementById('processBtn');
const addUserEntryBtn = document.getElementById('addUserEntry');
const fileNameLabel = document.getElementById('fileName');
const userNameInput = document.getElementById('nameInput');


selectFileBtn.addEventListener('click', handleSelectBtn);
processBtn.addEventListener('click', processData);
addUserEntryBtn.addEventListener('click', onAddUserEntryClick);
userNameInput.addEventListener('keypress', (event) => {
    if (event.key == 'Enter') {
        onAddUserEntryClick();
    }
});

ipcRenderer.on('reset-values', resetValues);

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
        processBtn.disabled = false;
    }
}

function parseWorkbook() {
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Range: 1 to skip first row of the worksheet
    const worksheetJson = XLSX.utils.sheet_to_json(worksheet, { range: 1 });

    for (let row in worksheetJson) {
        const data = worksheetJson[row];
        const date = data['Fecha creación'].split(/\s+/)[1]; // Split considering all spaces
        if (data['Nombre y Apellido']) { // If name is not empty or null, add to array
            shipments.push(new Shipment(data['Nombre y Apellido'], data['WeliveryID'], data['Status'], date));
        }

    }
};

function processData() {
    addUserEntry(false);
    //
    if (!shipments.length) { // if length returns 0 => 0 = false => !false should enter
        showErorr("No hay envios cargados. Seleccionar Planilla");
        return;
    }
    if (!buyersData.length) {
        showErorr("Ingresar nombres de los compradores");
        return;
    }
    //
    buyersData.filter(buyerData => !buyerData.processed)
        .forEach(buyerData => {
            let shipment = shipments.find(shipment => shipment.compareByName(buyerData.userName))
            if (shipment != null) {
                buyerData.row.cells[2].className = 'fw-bold';
                buyerData.row.cells[2].innerHTML = shipment.weliveryId;
                buyerData.row.cells[3].appendChild(createCopyTextButton(shipment));
                buyerData.row.cells[3].appendChild(createDeleteRowButton(buyerData))

                notifyShipment(shipment, buyerData.userEmail);

                buyerData.processed = true;
            } else {
                if (buyerData.row.cells[3].firstChild == null) { // If button wasn't added before
                    buyerData.row.classList.remove('fade-row-in');
                    buyerData.row.cells[2].className = 'fw-bold text-danger';
                    buyerData.row.cells[2].innerHTML = 'No se encontró el ID';
                    buyerData.row.cells[3].appendChild(createDeleteRowButton(buyerData))
                }
            }
        })
}


function onAddUserEntryClick() {
    addUserEntry(true);
}

function addUserEntry(showError) {
    const userNameInput = document.getElementById('nameInput');
    const userEmailInput = document.getElementById('emailInput');
    //
    if (!validateUserEntry(userNameInput.value, showError)) {
        return;
    }
    //
    const table = document.getElementById('usersTable');
    let row = table.insertRow();
    row.classList.add('fade-row-in');
    row.insertCell(0).innerHTML = userNameInput.value;
    row.insertCell(1).innerHTML = userEmailInput.value;
    row.insertCell(2).innerHTML = "-";
    row.insertCell(3);
    //
    buyersData.push({ userName: userNameInput.value, userEmail: userEmailInput.value, row: row, processed: false });
    userNameInput.value = null;
    userEmailInput.value = null;
}

function validateUserEntry(userNameInput, showError) {
    if (!userNameInput) {
        if (showError) {
            showErorr("Nombre inválido");
        }
        return false;
    }
    if (userIsAlreadyEntered(userNameInput)) {
        if (showError) {
            showErorr("El comprador ya esta en la lista")
        }
        return false;
    }
    return true;
}

function createCopyTextButton(shipment) {
    let copyTextBtn = document.createElement('button');
    copyTextBtn.className = 'btn';
    let icon = document.createElement('i');
    icon.className = 'bi bi-clipboard';
    let tooltip = new bootstrap.Tooltip(copyTextBtn, {
        title: "Copiar",
        placement: 'bottom',
        boundary: document.body
    })
    copyTextBtn.appendChild(icon);

    // Function to copy text into clipboard
    copyTextBtn.addEventListener('click', function () {
        const element = document.createElement('textarea');
        const emailContent = `Hola, ${shipment.userName}\n\n`
            + `Ya despachamos tu pedido. Podes seguirlo desde este link: https://welivery.com.ar/tracking/?wid=${shipment.weliveryId}\n`
            + `Te llegará entre esta tarde y mañana.\n\n`
            + `Cualquier cosa, podes contactarte con soporte@welivery.com.ar\n\n`
            + `Saludos,\n`
            + `Agustina`
        element.value = emailContent;
        document.body.appendChild(element);
        element.select();
        document.execCommand('copy');
        document.body.removeChild(element);
    })
    return copyTextBtn;
}

function createDeleteRowButton(buyerData) {
    let deleteRowBtn = document.createElement('button');
    deleteRowBtn.className = 'btn';
    let icon = document.createElement('i');
    icon.className = 'bi bi-trash';
    let tooltip = new bootstrap.Tooltip(deleteRowBtn, {
        title: "Eliminar",
        placement: 'bottom',
        boundary: document.body
    })
    deleteRowBtn.appendChild(icon);

    deleteRowBtn.addEventListener('click', function () {
        buyerData.row.onanimationend = () => {
            tooltip.dispose();
            buyerData.row.remove();
        }
        buyerData.row.classList.add('fade-row-out');
        buyersData.splice(buyersData.indexOf(buyerData), 1); // Remove user from array
    })

    return deleteRowBtn;
}


function notifyShipment(shipment, email) {
    console.log(`Notify shipment of ${shipment.userName} with WeliveryID: ${shipment.weliveryId} to ${email}`)
}


function userIsAlreadyEntered(userNameInput) {
    return buyersData.find(buyer => buyer.userName === userNameInput) != null
}

function resetValues() {
    workbook = null;
    workbookName = "";
    processBtn.disabled = true;
    fileNameLabel.innerHTML = `Planilla: ${workbookName}`;
    shipments = [];
    buyersData.forEach(buyerData => buyerData.row.remove());
    buyersData = [];
}

function showErorr(errorMessage) {
    const errorToastElement = document.getElementById('errorToast');
    document.getElementById('errorToastMessage').innerHTML = errorMessage;
    const toast = new bootstrap.Toast(errorToastElement, { delay: 5000, animation: true })
    toast.show();
}


// PRUEBAS PARA PERSISTIR DATOS
function addToStorage() {
    let message = document.getElementById('nameInput').value;
    ipcRenderer.send('edit-email-message', message);
}

function viewStorage() {
    ipcRenderer.send('get-email-message');
}


