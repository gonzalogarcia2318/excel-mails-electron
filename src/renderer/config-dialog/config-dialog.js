const { eletron, ipcRenderer, remote } = require('electron');
import { PlatformTypes } from '../../model/shipment.js';


const weliveryEmailMessageInput = document.getElementById('weliveryEmailMessageTextarea');
const ocaEmailMessageInput = document.getElementById('ocaEmailMessageTextarea');
const emailSenderInput = document.getElementById('emailSender');
const senderNameInput = document.getElementById('senderName');
const weliveryEmailMessageSubjectInput = document.getElementById('weliveryEmailMessageSubjectInput');
const ocaEmailMessageSubjectInput = document.getElementById('ocaEmailMessageSubjectInput');
const saveConfigBtn = document.getElementById('saveConfig');
const errorElement = document.getElementById('errorMessage');
const successElement = document.getElementById('successMessage');

let userConfig;


saveConfigBtn.addEventListener('click', saveConfig);

ipcRenderer.on('user-config', (event, config) => {
    console.log("config", userConfig);
    userConfig = config;
    weliveryEmailMessageInput.value = checkNull(userConfig.weliveryEmailMessage);
    ocaEmailMessageInput.value = checkNull(userConfig.ocaEmailMessage);
    emailSenderInput.value = checkNull(userConfig.emailSender);
    senderNameInput.value = checkNull(userConfig.senderName);
    weliveryEmailMessageSubjectInput.value = checkNull(userConfig.weliveryEmailMessageSubject);
    ocaEmailMessageSubjectInput.value = checkNull(userConfig.ocaEmailMessageSubject);
})

function saveConfig() {
    if (!weliveryEmailMessageInput.value || !ocaEmailMessageInput.value || !weliveryEmailMessageSubjectInput.value || !ocaEmailMessageSubjectInput.value) {
        errorElement.innerHTML = "Completar los campos del email.";
        errorElement.classList.remove('d-none');
        successElement.classList.add('d-none');
        return;
    }
    //
    userConfig.weliveryEmailMessage = weliveryEmailMessageInput.value;
    userConfig.ocaEmailMessage = ocaEmailMessageInput.value;
    userConfig.emailSender = emailSenderInput.value;
    userConfig.senderName = senderNameInput.value;
    userConfig.weliveryEmailMessageSubject = weliveryEmailMessageSubjectInput.value;
    userConfig.ocaEmailMessageSubject = ocaEmailMessageSubjectInput.value;
    //
    ipcRenderer.send('save-user-config', userConfig);
    //
    errorElement.classList.add('d-none');
    successElement.innerHTML = "Los datos se actualizaron correctamente!"
    successElement.classList.remove('d-none');

    setTimeout(closeDialog, 1000);
}

function closeDialog() {
    remote.getCurrentWindow().close();
}


function checkNull(string) {
    return string ? string : null;
}