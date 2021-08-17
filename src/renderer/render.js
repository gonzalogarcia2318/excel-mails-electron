import { Shipment } from '../model/shipment.js';
import { WeliveryWorksheet } from './worksheets/welivery-worksheet.js';
import { OcaWorksheet } from './worksheets/oca-worksheet.js';

const electron = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;
const XLSX = require('xlsx');
const bootstrap = require('bootstrap');
const nodemailer = require('nodemailer');

// Elements
const selectFileBtn = document.getElementById('selectFileBtn');
const processBtn = document.getElementById('processBtn');
const addUserEntryBtn = document.getElementById('addUserEntry');
const fileNameLabel = document.getElementById('fileName');
const userNameInput = document.getElementById('nameInput');
const userNicknameInput = document.getElementById('nicknameInput');
const userEmailInput = document.getElementById('emailInput');
const emailSenderInput = document.getElementById('emailSender');
const emailPassword = document.getElementById('emailPassword');


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

userEmailInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter') {
        onAddUserEntryClick();
    }
});

userNicknameInput.addEventListener('focus', fillNickname);
ipcRenderer.on('reset-values', resetValues);


let workbook;
let workbookNames = [];
let shipments = [];
let buyersData = [];

async function handleSelectBtn() {
    const dialogResponse = await electron.dialog.showOpenDialog({
        title: 'Seleccionar planillas',
        filters: [{ name: 'Spreadsheets', extensions: ['xlsx', 'xltx'] }],
        properties: ['openFile', 'multiSelections']
    });
    if (dialogResponse.filePaths.length > 0) {
        dialogResponse.filePaths.forEach(filePath => {
            parseWorkbook(filePath)
        });
    }
}

function parseWorkbook(filePath) {
    console.log("Process file", filePath);

    workbook = XLSX.readFile(filePath);

    workbookNames.push(filePath.split('\\')[filePath.split('\\').length - 1]);
    fileNameLabel.innerHTML = `Planillas: ${workbookNames.join(', ')}`;
    //
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    let parsedWorksheet;

    // If first row has 'Welivery', is a Welivery sheet.
    if (worksheet['A1'] != null && worksheet['A1'].v === 'Welivery') {
        parsedWorksheet = new WeliveryWorksheet(worksheet);
    } else {
        parsedWorksheet = new OcaWorksheet(worksheet);
    }
    shipments.push(...parsedWorksheet.getShipments());

    console.log("Shipments", shipments);
};

function processData() {
    addUserEntry(false);
    //
    if (!shipments.length) { // if length returns 0 => 0 = false => !false => true
        showErorr("No hay envios cargados. Seleccionar Planilla");
        return;
    }
    if (!buyersData.length) {
        showErorr("Ingresar nombres de los compradores");
        return;
    }
    if (!emailSenderInput.value || !emailPassword.value) {
        showErorr("Ingresar datos del email remitente");
        return;
    }
    //
    buyersData.filter(buyerData => !buyerData.processed)
        .forEach(buyerData => {
            const shipment = shipments.find(shipment => shipment.compareByName(buyerData.userName))
            if (shipment != null) {
                shipment.setEmailMessage(generateEmailMessage(shipment, buyerData.userNickname));
                buyerData.row.classList.add('table-warning')
                buyerData.row.cells[3].className = 'fw-bold';
                buyerData.row.cells[3].innerHTML = shipment.trackingId;
                buyerData.row.cells[4].appendChild(createCopyTextButton(shipment, buyerData));

                notifyShipment(shipment, buyerData);

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

function addUserEntry(showError) {
    if (!validateUserEntry(userNameInput.value, userEmailInput.value, showError)) {
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
    row.classList.add('fade-row-in', 'whitespace-nowrap');
    row.insertCell(0).innerHTML = userNameInput.value;
    row.insertCell(1).innerHTML = userNicknameInput.value;
    row.insertCell(2).innerHTML = userEmailInput.value;
    row.insertCell(3).innerHTML = "-";
    const actionsCell = row.insertCell(4);
    actionsCell.classList.add('d-flex', 'align-items-center');
    actionsCell.appendChild(createDeleteRowButton(buyerData));
    //
    buyersData.push(buyerData);
    userNameInput.value = null;
    userNicknameInput.value = null;
    userEmailInput.value = null;
    userNameInput.focus();
}

function validateUserEntry(userName, userEmail, showError) {
    if (!userName || !userEmail) {
        if (showError) {
            showErorr("Usuario inválido");
        }
        return false;
    }
    if (userIsAlreadyEntered(userName)) {
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
        element.value = shipment.getEmailMessage();
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


function userIsAlreadyEntered(userNameInput) {
    return buyersData.find(buyer => buyer.userName === userNameInput) != null
}

function resetValues() {
    workbook = null;
    workbookNames = [];
    fileNameLabel.innerHTML = `Planillas: `;
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


function getEmailMessageByPlatform(platform) {
    return ipcRenderer.sendSync('get-email-message', platform);
}

// At the moment I am only replacing the name and the tracking ID. Maybe in a future, this could use every shipment attribute.
function generateEmailMessage(shipment, userNickname) {
    let emailMessage = getEmailMessageByPlatform(shipment.platform);
    emailMessage = emailMessage.replaceAll('${nombre}', userNickname ? userNickname : shipment.userName);
    emailMessage = emailMessage.replaceAll('${trackingId}', shipment.trackingId);
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


function notifyShipment(shipment, buyerData) {
    const loadingSpinner = createLoadingSpinner();
    buyerData.row.cells[4].appendChild(loadingSpinner);

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: emailSenderInput.value,
            pass: emailPassword.value
        }
    });

    const mailOptions = {
        from: emailSenderInput.value,
        to: buyerData.userEmail,
        subject: 'Sending email from electron app',
        text: shipment.getEmailMessage()
    };

    transporter.sendMail(mailOptions, function (error, info) {
        buyerData.row.classList.remove('table-warning');
        buyerData.row.cells[4].removeChild(loadingSpinner);
        if (error) {
            buyerData.row.classList.add('table-danger');
            buyerData.row.cells[4].appendChild(createErrorIcon('Error al enviar'));
        } else {
            buyerData.row.classList.add('table-success');
            buyerData.row.cells[4].appendChild(createSuccessIcon('Enviado!'));
        }
    })
}

function createLoadingSpinner() {
    const spinnerContainer = document.createElement('span');
    spinnerContainer.className = 'actions-padding'
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border spinner-border-sm';
    spinnerContainer.appendChild(spinner);
    return spinnerContainer;
}

function createSuccessIcon(tooltipMessage) {
    const successIcon = document.createElement('i');
    successIcon.className = 'bi bi-check-circle-fill text-success actions-padding';
    const tooltip = new bootstrap.Tooltip(successIcon, {
        title: tooltipMessage,
        placement: 'bottom',
        boundary: document.body
    });
    return successIcon;
}

function createErrorIcon(tooltipMessage) {
    const errorIcon = document.createElement('i');
    errorIcon.className = 'bi bi-x-circle-fill text-danger actions-padding';
    const tooltip = new bootstrap.Tooltip(errorIcon, {
        title: tooltipMessage,
        placement: 'bottom',
        boundary: document.body
    });
    return errorIcon;
}
