import chalk from "chalk";
import AdmZip from "adm-zip";
import * as fs from "fs";
import * as Tar from "tar";
import * as zlib from "zlib";

/**
 * sourceフォルダー内に含まれるzipのパスを取得します
 * @param {string} sourcePath 
 * @returns {string[]}
 */
function getSourceZipPath(sourcePath) {
    console.info(chalk.green("sourceフォルダー内に存在するすべてのzipを取得します..."));
    let zipPaths = [];
    try {
        const items = fs.readdirSync(sourcePath, "utf-8");

        for (const item of items) {
            const path = `${sourcePath}/${item}`;
            const stat = fs.statSync(path);

            if (stat.isFile()) {
                if (item.endsWith(".zip")) {
                    zipPaths.push(path);
                }
            }
        }

        if (zipPaths.length === 0) {
            console.error(chalk.red("sourceフォルダー内にzipフォルダが存在しません"));
            return undefined;
        }
    } catch (e) {
        console.error(chalk.red("フォルダーの取得に失敗しました。sourceフォルダーが正しい位置にあるかを確認し、もう一度実行してください", e));
        return undefined;
    }

    return zipPaths;
}

/**
 * sourceフォルダー内に含まれるtarのパスを取得します
 * @param {string} sourcePath 
 * @returns {string[]}
 */
function getSourceTarPath(sourcePath) {
    console.info(chalk.green("sourceフォルダー内に存在するすべてのtarを取得します..."));
    let tarPaths = [];
    try {
        const items = fs.readdirSync(sourcePath, "utf-8");

        for (const item of items) {
            const path = `${sourcePath}/${item}`;
            const stat = fs.statSync(path);

            if (stat.isFile()) {
                if (item.endsWith(".tar")) {
                    tarPaths.push(path);
                }
            }
        }

        if (tarPaths.length === 0) {
            console.error(chalk.red("sourceフォルダー内にtarフォルダが存在しません"));
            return undefined;
        }
    } catch (e) {
        console.error(chalk.red("フォルダーの取得に失敗しました。sourceフォルダーが正しい位置にあるかを確認し、もう一度実行してください", e));
        return undefined;
    }

    return tarPaths;
}

/**
 * zipファイルを解凍する
 * @param {string} sourcePath 
 * @param {string} targetPath 
 */
export async function zip(sourcePath, targetPath) {
    const zipPaths = getSourceZipPath(sourcePath);

    if (!zipPaths) return;

    for (const zipPath of zipPaths) {
        try {
            const outputPath = zipPath.replace(sourcePath, targetPath).replace(/\/.zip$/, "");
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(outputPath, true);
            console.info(chalk.green(zipPath + " の解凍に成功しました"));
        } catch (e) {
            console.error(chalk.red(zipPath + " の解凍に失敗しました", e));
        }
    }

    console.info(chalk.bgGreen("処理が完了しました"));
}

/**
 * tarファイルを解凍する
 * @param {string} sourcePath 
 * @param {string} targetPath 
 */
export async function tar(sourcePath, targetPath) {
    const tarPaths = getSourceTarPath(sourcePath);

    if (!tarPaths) return;

    for (const tarPath of tarPaths) {
        const outputPath = tarPath.replace(sourcePath, targetPath).replace(/\.tar$/, "");
        fs.mkdirSync(outputPath, { recursive: true });

        await new Promise((resolve, reject) => {
            const gunZip = zlib.createGunzip();
            const extractor = Tar.extract({ cwd: outputPath });

            fs.createReadStream(tarPath)
                .pipe(gunZip)
                .pipe(extractor)
                .on("error", (e) => {
                    console.error(chalk.red(tarPath + " の解凍に失敗しました", e));
                    reject(e);
                })
                .on("end", () => {
                    console.info(chalk.green(tarPath + " の解凍に成功しました"));
                    resolve();
                });
        });
    }

    console.info(chalk.bgGreen("処理が完了しました"));
}