import { Shipment } from '../model/shipment.js';

const electron = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;
const XLSX = require('xlsx');
const bootstrap = require('bootstrap');

// Elements
const selectFileBtn = document.getElementById('selectFileBtn');
const processBtn = document.getElementById('processBtn');
const addUserEntryBtn = document.getElementById('addUserEntry');
const fileNameLabel = document.getElementById('fileName');
const userNameInput = document.getElementById('nameInput');
const userNicknameInput = document.getElementById('nicknameInput');


// Event listeners
selectFileBtn.addEventListener('click', handleSelectBtn);
processBtn.addEventListener('click', processData);
addUserEntryBtn.addEventListener('click', onAddUserEntryClick);
userNameInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter') {
        onAddUserEntryClick();
    }
    if (event.key == 'Tab') {
        fillNickname();
    }
});

userNicknameInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter') {
        onAddUserEntryClick();
    }
});

userNicknameInput.addEventListener('focus', fillNickname);

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
                buyerData.row.cells[3].className = 'fw-bold';
                buyerData.row.cells[3].innerHTML = shipment.weliveryId;
                buyerData.row.cells[4].appendChild(createCopyTextButton(shipment, buyerData));

                notifyShipment(shipment, buyerData.userEmail);

                buyerData.processed = true;
            } else {
                buyerData.row.classList.remove('fade-row-in');
                buyerData.row.cells[3].className = 'fw-bold text-danger';
                buyerData.row.cells[3].innerHTML = 'No se encontró';
            }
        })
}


function onAddUserEntryClick() {
    addUserEntry(true);
}
// TODO: RETURN FOCUS TO NAME INPUT
function addUserEntry(showError) {
    const userNameInput = document.getElementById('nameInput');
    const userNicknameInput = document.getElementById('nicknameInput');
    const userEmailInput = document.getElementById('emailInput');
    //
    if (!validateUserEntry(userNameInput.value, showError)) {
        return;
    }
    //
    if (!userNicknameInput.value) {
        fillNickname();
    }
    //
    const buyerData = { userName: userNameInput.value, userNickname: userNicknameInput.value, userEmail: userEmailInput.value, row: null, processed: false };
    const table = document.getElementById('usersTable');
    let row = table.insertRow();
    buyerData.row = row;
    row.classList.add('fade-row-in');
    row.insertCell(0).innerHTML = userNameInput.value;
    row.insertCell(1).innerHTML = userNicknameInput.value;
    row.insertCell(2).innerHTML = userEmailInput.value;
    row.insertCell(3).innerHTML = "-";
    row.insertCell(4).appendChild(createDeleteRowButton(buyerData));
    //
    buyersData.push(buyerData);
    userNameInput.value = null;
    userNicknameInput.value = null;
    userEmailInput.value = null;
    userNameInput.focus();
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

function createCopyTextButton(shipment, buyerData) {
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
        element.value = generateEmailMessage(shipment, buyerData.userNickname);
        document.body.appendChild(element);
        element.select();
        document.execCommand('copy');
        document.body.removeChild(element);
        buyerData.row.classList.add('table-success');
        showNotificationToast("Copiado!");
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


function getEmailMessage() {
    return ipcRenderer.sendSync('get-email-message');
}

// At the moment I am only replacing the name and the link. Maybe in a future, this could use every shipment attribute.
function generateEmailMessage(shipment, userNickname) {
    let emailMessage = getEmailMessage();
    emailMessage = emailMessage.replaceAll('${nombre}', userNickname ? userNickname : shipment.userName);
    emailMessage = emailMessage.replaceAll('${link}', `https://welivery.com.ar/tracking/?wid=${shipment.weliveryId}`);
    return emailMessage;
}

function showNotificationToast(message) {
    const notificationToastElement = document.getElementById('notificationToast');
    document.getElementById('notificationToastMessage').innerHTML = message;
    const toast = new bootstrap.Toast(notificationToastElement, { delay: 2000, animation: true })
    toast.show();
}

function fillNickname() {
    if (!userNicknameInput.value) {
        userNicknameInput.value = capitalize(userNameInput.value.split(' ')[0]);
    }
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}