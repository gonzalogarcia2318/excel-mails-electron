const { eletron, ipcRenderer, remote } = require('electron');
import { PlatformTypes } from '../../model/shipment.js';


const weliveryEmailMessageInput = document.getElementById('weliveryEmailMessageTextarea');
const ocaEmailMessageInput = document.getElementById('ocaEmailMessageTextarea');
const emailSenderInput = document.getElementById('emailSender');
const emailMessageSubjectInput = document.getElementById('emailMessageSubjectInput');
const saveConfigBtn = document.getElementById('saveConfig');
const errorElement = document.getElementById('errorMessage');
const successElement = document.getElementById('successMessage');

let userConfig;


saveConfigBtn.addEventListener('click', saveConfig);

ipcRenderer.on('user-config', (event, config) => {
    console.log("config", userConfig);
    userConfig = config;
    weliveryEmailMessageInput.value = userConfig.weliveryEmailMessage;
    ocaEmailMessageInput.value = userConfig.ocaEmailMessage;
    emailSenderInput.value = userConfig.emailSender;
    emailMessageSubjectInput.value = userConfig.emailMessageSubject;
})

function saveConfig() {
    if (!weliveryEmailMessageInput.value || !ocaEmailMessageInput.value || !emailMessageSubjectInput.value) {
        errorElement.innerHTML = "Completar los campos del email.";
        errorElement.classList.remove('d-none');
        successElement.classList.add('d-none');
        return;
    }
    //
    userConfig.weliveryEmailMessage = weliveryEmailMessageInput.value;
    userConfig.ocaEmailMessage = ocaEmailMessageInput.value;
    userConfig.emailSender = emailSenderInput.value;
    userConfig.emailMessageSubject = emailMessageSubjectInput.value;
    //
    ipcRenderer.send('save-user-config', userConfig);
    //
    errorElement.classList.add('d-none');
    successElement.innerHTML = "Los datos se actualizaron correctamente!"
    successElement.classList.remove('d-none');

    setTimeout(closeDialog, 4000);
}

function closeDialog() {
    remote.getCurrentWindow().close();
}