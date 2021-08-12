const { eletron, ipcRenderer, remote } = require('electron');
import { PlatformTypes } from '../../model/shipment.js';


const weliveryEmailMessageInput = document.getElementById('weliveryEmailMessageTextarea');
const ocaEmailMessageInput = document.getElementById('ocaEmailMessageTextarea');
const saveConfigBtn = document.getElementById('saveConfig');
const errorElement = document.getElementById('errorMessage');
const successElement = document.getElementById('successMessage');


saveConfigBtn.addEventListener('click', saveConfig);

ipcRenderer.on('email-messages', (event, emailMessages) => {
    emailMessages.forEach(emailMessage => {
        if (emailMessage.platform === PlatformTypes.WELIVERY) {
            weliveryEmailMessageInput.textContent = emailMessage.value;
        }
        if (emailMessage.platform === PlatformTypes.OCA) {
            ocaEmailMessageInput.textContent = emailMessage.value;
        }
    })
})

function saveConfig() {
    if (!weliveryEmailMessageInput.value && !ocaEmailMessageInput.value) {
        errorElement.innerHTML = "Mensaje inválido.";
        errorElement.classList.remove('d-none');
        successElement.classList.add('d-none');
        return;
    }
    const emailsMessages = [];
    emailsMessages.push({ platform: PlatformTypes.WELIVERY, value: weliveryEmailMessageInput.value });
    emailsMessages.push({ platform: PlatformTypes.OCA, value: ocaEmailMessageInput.value });
    ipcRenderer.send('edit-email-messages', emailsMessages);
    //
    errorElement.classList.add('d-none');
    successElement.innerHTML = "Los mails se actualizaron correctamente!"
    successElement.classList.remove('d-none');

    setTimeout(closeDialog, 4000);
}

function closeDialog() {
    remote.getCurrentWindow().close();
}