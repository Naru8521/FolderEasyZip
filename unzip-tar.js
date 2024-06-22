const path = require("path");
const zlib = require("zlib");
const Tar = require("tar");
const fs = require("fs");
const AdmZip = require("adm-zip");

/**
 * zipのフォルダパスを取得します
 * @param {string[]} directoryPaths 
 * @returns {string[]}
 */
function getZipPath(directoryPaths) {
    let zipPaths = [];

    for (const directoryPath of directoryPaths) {
        const stat = fs.statSync(directoryPath);

        if (stat.isFile() && directoryPath.endsWith(".zip")) {
            zipPaths.push(directoryPath); // 修正: 正しいパスを追加
        }
    }

    return zipPaths;
}

/**
 * tarのフォルダパスを取得します
 * @param {string[]} directoryPaths 
 * @returns {string[]}
 */
function getTarPath(directoryPaths) {
    let tarPaths = [];

    for (const directoryPath of directoryPaths) {
        const stat = fs.statSync(directoryPath);

        if (stat.isFile() && directoryPath.endsWith(".tar")) {
            tarPaths.push(directoryPath); // 修正: 正しいパスを追加
        }
    }

    return tarPaths;
}

/**
 * zipファイルを解凍する
 * @param {any} mainWindow
 * @param {string[]} directoryPaths
 * @param {string} outputPath
 */
async function zip(mainWindow, directoryPaths, outputPath) {
    const zipPaths = getZipPath(directoryPaths);

    if (zipPaths.length === 0) {
        mainWindow.webContents.send("send-log", "エラー: zipフォルダーが見つかりませんでした", true);
        return;
    }

    for (const zipPath of zipPaths) {
        try {
            const baseDirName = path.basename(zipPath, ".zip");
            const extractPath = path.join(outputPath, baseDirName);
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(extractPath, true);
            mainWindow.webContents.send("send-log", `${zipPath} の解凍に成功しました`);
        } catch (e) {
            mainWindow.webContents.send("send-log", `エラー: ${zipPath} の解凍に失敗しました: ${e.message}`, true);
        }
    }

    mainWindow.webContents.send("send-log", "処理が完了しました");
}

/**
 * tarファイルを解凍する
 * @param {any} mainWindow
 * @param {string[]} directoryPaths
 * @param {string} outputPath
 */
async function tar(mainWindow, directoryPaths, outputPath) {
    const tarPaths = getTarPath(directoryPaths);

    if (tarPaths.length === 0) {
        mainWindow.webContents.send("send-log", "エラー: tarフォルダーが見つかりませんでした", true);
        return;
    }

    for (const tarPath of tarPaths) {
        try {
            const baseDirName = path.basename(tarPath, ".tar");
            const extractPath = path.join(outputPath, baseDirName);
            fs.mkdirSync(extractPath, { recursive: true });

            await new Promise((resolve, reject) => {
                const gunZip = zlib.createGunzip();
                const extractor = Tar.extract({ cwd: extractPath });

                fs.createReadStream(tarPath)
                    .pipe(gunZip)
                    .pipe(extractor)
                    .on("error", (e) => {
                        mainWindow.webContents.send("send-log", `エラー: ${tarPath} の解凍に失敗しました: ${e.message}`, true);
                        reject(e);
                    })
                    .on("end", () => {
                        mainWindow.webContents.send("send-log", `${tarPath} の解凍に成功しました`);
                        resolve();
                    });
            });
        } catch (e) {
            mainWindow.webContents.send("send-log", `エラー: ${tarPath} の解凍に失敗しました: ${e.message}`, true);
        }
    }

    mainWindow.webContents.send("send-log", "処理が完了しました");
}

module.exports = { zip, tar };
