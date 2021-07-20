const XLSX = require('xlsx');
const electron = require('electron').remote;

const selectFileBtn = document.getElementById('selectFileBtn');

// Current workbook
let workbook;

async function handleSelectBtn() {
    const dialogResponse = await electron.dialog.showOpenDialog({
        title: 'Selecciona un archivo',
        filters: [{ name: 'Spreadsheets', extensions: ['xlsx'] }],
        properties: ['openFile']
    });

    if (dialogResponse.filePaths.length > 0) {
        console.log("Process file", dialogResponse.filePaths[0]);
        workbook = XLSX.readFile(dialogResponse.filePaths[0]);
        processWorkbook()
    }
}

function processWorkbook() {
    console.log("Workbook", workbook);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    console.log("Worksheet", worksheet);

    // Range: 1 to skip first row of the worksheet
    const worksheetJson = XLSX.utils.sheet_to_json(worksheet, { range: 1 });
    console.log("JSON DATA")
    console.log(worksheetJson);

    for (let row in worksheetJson) {
        let dataRow = worksheetJson[row];
        console.log("Row: ", worksheetJson[row]);
        console.log("Nombre: ", dataRow['Nombre y Apellido']);
        console.log("Welivery ID: ", dataRow['WeliveryID']);
        console.log("Status: ", dataRow['Status']);
    }


    // // for (let key in worksheetJson) {
    //     console.log("Key", key)
    //     console.log("Value", worksheetJson[key]);
    // }

    // workbook.SheetNames.forEach(function (sheetName) {
    //     const htmlstr = XLSX.utils.sheet_to_html(workbook.Sheets[sheetName], { editable: false });


    //     let sheetJson = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    //     console.log(sheetJson);

    //     for (let key in sheetJson) {
    //         console.log(sheetJson[key]);
    //     }


    // });
};

selectFileBtn.addEventListener('click', handleSelectBtn);