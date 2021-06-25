const XLSX = require('xlsx');
const electron = require('electron').remote;

//
const readFile = document.getElementById('excelFile');
const testBtn = document.getElementById('testBtn');
const selectFileBtn = document.getElementById('selectFile');

function testing() {
    alert("HOLA ALERTA")
}

async function handleSelectBtn() {
    const dialogResponse = await electron.dialog.showOpenDialog({
        title: 'Selecciona un archivo',
        filters: [{ name: "Spreadsheets", extensions: 'xlsx' }],
        properties: ['openFile']
    });

    if (dialogResponse.filePaths.length > 0) {
        console.log("Procesar file", dialogResponse.filePaths[0]);
        processWorkbook(XLSX.readFile(dialogResponse.filePaths[0]));
    }
}

function processWorkbook(workbook) {
    const HTMLOUT = document.getElementById('htmlResult');
    HTMLOUT.innerHTML = "";
    workbook.SheetNames.forEach(function (sheetName) {
        const htmlstr = XLSX.utils.sheet_to_html(workbook.Sheets[sheetName], { editable: false });
        HTMLOUT.innerHTML = htmlstr;


        let sheetJson = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        console.log(sheetJson);

        for (let key in sheetJson) {
            console.log(sheetJson[key]);
        }


    });
};

selectFileBtn.addEventListener('click', handleSelectBtn);