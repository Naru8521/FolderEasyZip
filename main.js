const { app, BrowserWindow, ipcMain, dialog, ipcRenderer, Menu } = require("electron");
const url = require("url");
const path = require("path");
const ziptar = require("./zip-tar.js");
const unziptar = require("./unzip-tar.js");
const fs = require("fs");

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "public", "index.html"),
            protocol: "file:",
            slashes: true
        })
    );

    Menu.setApplicationMenu(null);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle("open-folder-dialog", async (event, arg) => {
    const result = await dialog.showOpenDialog({
        properties: ["openDirectory", "multiSelections"]
    });
    return result.filePaths;
});

ipcMain.on("ondragstart", (event, folderPath) => {
    mainWindow.webContents.send("ondrag", folderPath);
});

ipcMain.on("execute-operation", async (event, outputPath, operation, folderPaths) => {
    if (!outputPath) {
        const options = {
            type: "error",
            buttons: ["OK"],
            title: "エラー",
            message: "出力フォルダを設定してください",
            detail: undefined
        };

        dialog.showMessageBox(null, options);
        return;
    }

    if (!folderPaths || folderPaths.length === 0) {
        const options = {
            type: "error",
            buttons: ["OK"],
            title: "エラー",
            message: "指定されたフォルダーがありません",
            detail: undefined
        };

        dialog.showMessageBox(null, options);
        return;
    }

    try {
        fs.accessSync(outputPath, fs.constants.F_OK);
    } catch (err) {
        const options = {
            type: "error",
            buttons: ["OK"],
            title: "エラー",
            message: "出力フォルダが存在しません",
            detail: undefined
        };
        dialog.showMessageBox(null, options);
        return;
    }

    let errorFolderPaths = [];
    for (const folderPath of folderPaths) {
        try {
            fs.accessSync(folderPath, fs.constants.F_OK);
        } catch (err) {
            errorFolderPaths.push(folderPath);
        }
    }
    if (errorFolderPaths.length > 0) {
        const options = {
            type: "error",
            buttons: ["OK"],
            title: "エラー",
            message: "指定されたフォルダーが存在しません",
            detail: errorFolderPaths.join("\n")
        };
        dialog.showMessageBox(null, options);
        return;
    }

    mainWindow.webContents.send("send-log", "処理を開始します...");

    switch (operation) {
        case "zip": return await ziptar.zip(mainWindow, folderPaths, outputPath);
        case "tar": return await ziptar.tar(mainWindow, folderPaths, outputPath);
        case "unzip": return await unziptar.zip(mainWindow, folderPaths, outputPath);
        case "untar": return await unziptar.tar(mainWindow, folderPaths, outputPath);
    }
});