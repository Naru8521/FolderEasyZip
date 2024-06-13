import chalk from "chalk";
import AdmZip from "adm-zip";
import * as fs from "fs";

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
            const outputPath = zipPath.replace(sourcePath, targetPath);
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(outputPath, true);
        } catch (e) {
            console.error(chalk.red(zipPath + " の圧縮に失敗しました", e));
        }
    }

    console.info(chalk.bgGreen("処理が完了しました"));
}