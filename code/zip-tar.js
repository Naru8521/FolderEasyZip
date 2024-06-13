import { tar as folderTar, zip as folderZip } from "zip-a-folder";
import chalk from "chalk";
import * as fs from "fs";

/**
 * sourceフォルダー内に含まれるフォルダーのパスを取得します
 * @param {string} sourcePath 
 * @returns {string[]} directoryPaths
 */
function getSourceDirPath(sourcePath) {
    console.info(chalk.green("sourceフォルダー内に存在するすべてのフォルダーを取得します..."));
    let directoryPaths = [];
    try {
        const items = fs.readdirSync(sourcePath, "utf-8");

        for (const item of items) {
            const path = `${sourcePath}/${item}`;
            const stat = fs.statSync(path);

            if (stat.isDirectory()) {
                directoryPaths.push(path);
            }
        }

        if (directoryPaths.length === 0) {
            console.error(chalk.red("sourceフォルダー内にフォルダが存在しません"));
            return undefined;
        }
    } catch (e) {
        console.error(chalk.red("フォルダーの取得に失敗しました。sourceフォルダーが正しい位置にあるかを確認し、もう一度実行してください", e));
        return undefined;
    }

    return directoryPaths;
}

/**
 * 指定されたフォルダーをzipにします
 * @param {string} sourcePath 
 * @param {string} targetPath 
 */
export async function zip(sourcePath, targetPath) {
    const directoryPaths = getSourceDirPath(sourcePath);

    if (!directoryPaths) return;

    for (const directoryPath of directoryPaths) {
        try {
            const outputPath = directoryPath.replace(sourcePath, targetPath) + ".zip";
            await folderZip(directoryPath, outputPath);
            console.info(chalk.green(directoryPath + " の圧縮に成功しました"));
        } catch (e) {
            console.error(chalk.red(directoryPath + " の圧縮に失敗しました", e));
        }
    }

    console.info(chalk.bgGreen("処理が完了しました"));
}

/**
 * 指定されたフォルダーをtarにします
 * @param {string} sourcePath 
 * @param {string} targetPath 
 */
export async function tar(sourcePath, targetPath) {
    const directoryPaths = getSourceDirPath(sourcePath);

    if (!directoryPaths) return;

    for (const directoryPath of directoryPaths) {
        try {
            const outputPath = directoryPath.replace(sourcePath, targetPath) + ".tar";
            await folderTar(directoryPath, outputPath);
            console.info(chalk.green(directoryPath + " の圧縮に成功しました"));
        } catch (e) {
            console.error(chalk.red(directoryPath + " の圧縮に失敗しました", e));
        }
    }

    console.info(chalk.bgGreen("処理が完了しました"));
}