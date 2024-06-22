const { ipcRenderer, dialog, ipcMain } = require("electron");

const dropArea = document.getElementById("drop-field");
const fileList = document.getElementById("file-list").querySelector("ul");
const operationSelect = document.getElementById("operation-select");
const executeButton = document.getElementById("execute-button");
const selectFolderButton = document.getElementById("select-folder-button");
const logMessagesContainer = document.getElementById("log-messages");
let outputPath;

// ドロップフィールドのイベントリスナー
dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("active");
});

dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("active");
});

dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.classList.remove("active");

    const items = event.dataTransfer.items;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const folderPath = item.getAsFile().path;
        addFolderPath(folderPath);
    }
});

// フォルダーパスを追加する関数
function addFolderPath(folderPath) {
    if (!isFolderPathExists(folderPath)) {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <span class="delete-button" data-path="${folderPath}">×</span>
            <span class="file-path">${folderPath}</span>
        `;
        fileList.appendChild(listItem);

        const deleteButton = listItem.querySelector(".delete-button");
        deleteButton.addEventListener("click", () => {
            listItem.remove();
        });
    }
}

// フォルダーパスが既にリストに存在するかどうかをチェックする関数
function isFolderPathExists(folderPath) {
    const existingPaths = Array.from(fileList.querySelectorAll("li"))
        .map(item => item.querySelector(".file-path").textContent.trim());

    return existingPaths.includes(folderPath);
}

// Select Folderボタンのクリックイベント
selectFolderButton.addEventListener("click", async () => {
    const selectedFolders = await ipcRenderer.invoke("open-folder-dialog");

    if (selectedFolders && selectedFolders.length > 0) {
        const folderPath = selectedFolders[0];
        outputPath = folderPath;
        selectFolderButton.textContent = "出力フォルダ: " + folderPath;
    }
});

// Executeボタンのクリックイベント
executeButton.addEventListener("click", async () => {
    const selectedOperation = operationSelect.value;
    const folderPaths = Array.from(fileList.querySelectorAll("li"))
        .map(item => item.querySelector(".file-path").textContent.trim());

    logMessagesContainer.innerHTML = "";
    ipcRenderer.send("execute-operation", outputPath, selectedOperation, folderPaths);
});

// ログイベントを受け取る
ipcRenderer.on("send-log", (event, result, error) => {
    if (error) {
        logMessagesContainer.innerHTML += `<p style="color: red;">${result}</p>`;
    } else {
        logMessagesContainer.innerHTML += `<p style="color: green;">${result}</p>`;
    }
});
