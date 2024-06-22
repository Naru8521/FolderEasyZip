const path = require("path");
const { tar: folderTar, zip: folderZip } = require("zip-a-folder");

/**
 * 指定されたフォルダーをzipにします
 * @param {any} mainWindow 
 * @param {string[]} directoryPaths
 * @param {string} outputPath
 */
async function zip(mainWindow, directoryPaths, outputPath) {

    for (const directoryPath of directoryPaths) {
        try {
            const newOutPutPath = path.join(outputPath, path.basename(directoryPath) + ".zip");
            await folderZip(directoryPath, newOutPutPath);
            mainWindow.webContents.send("send-log", directoryPath + " の圧縮に成功しました");
        } catch (e) {
            mainWindow.webContents.send("send-log", e, true);
            mainWindow.webContents.send("send-log", `エラー: ${directoryPath}の圧縮に失敗しました`, true);
        }
    }

    mainWindow.webContents.send("send-log", "処理が完了しました");
}

/**
 * 指定されたフォルダーをtarにします
 * @param {any} mainWindow 
 * @param {string[]} directoryPaths
 * @param {string} outputPath
 */
async function tar(mainWindow, directoryPaths, outputPath) {
    for (const directoryPath of directoryPaths) {
        try {
            const newOutPutPath = path.join(outputPath, path.basename(directoryPath) + ".zip");
            await folderTar(directoryPath, newOutPutPath);
            mainWindow.webContents.send("send-log", directoryPath + " の圧縮に成功しました");
        } catch (e) {
            mainWindow.webContents.send("send-log", `エラー: ${directoryPath}の圧縮に失敗しました`, true);
        }
    }

    mainWindow.webContents.send("send-log", "処理が完了しました");
}

module.exports = { zip, tar };