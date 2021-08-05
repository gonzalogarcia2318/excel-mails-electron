const { eletron, ipcRenderer, remote } = require('electron');

const emailMessageInput = document.getElementById('emailMessageTextarea');
const saveConfigBtn = document.getElementById('saveConfig');
const errorElement = document.getElementById('errorMessage');
const successElement = document.getElementById('successMessage');


saveConfigBtn.addEventListener('click', saveConfig);

ipcRenderer.on('email-message', (event, message) => {
    emailMessageInput.textContent = message;
})

function saveConfig() {
    if (!emailMessageInput.value) {
        errorElement.innerHTML = "Mensaje inválido.";
        errorElement.classList.remove('d-none');
        successElement.classList.add('d-none');
        return;
    }
    ipcRenderer.send('edit-email-message', emailMessageInput.value);
    //
    errorElement.classList.add('d-none');
    successElement.innerHTML = "El mail se actualizó correctamente!"
    successElement.classList.remove('d-none');

    setTimeout(closeDialog, 4000);
}

function closeDialog() {
    remote.getCurrentWindow().close();
}