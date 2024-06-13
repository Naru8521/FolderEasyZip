import chalk from "chalk";
import readline from "readline";
import * as ziptar from "./zip-tar.js";
import * as unziptar from "./unzip-tar.js";

const sourcePath = "../source";
const targetPath = "../target";
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on("line", (input) => {

    if (input.startsWith("start")) {
        const option = input.replace("start", "").trim();

        switch (option) {
            case "zip": return ziptar.zip(sourcePath, targetPath);
            case "tar": return ziptar.tar(sourcePath, targetPath);
            case "unzip": return unziptar.zip(sourcePath, targetPath);
            case "untar": return unziptar.tar(sourcePath, targetPath);
            default: return console.error(chalk.red("形式を指定する必要があります。start <zip,tar,unzip>"))
        }
    }

    console.error(chalk.red("無効なコマンド: " + input + "。「help」でコマンド一覧を取得します"));
}).on("close", () => {
    console.info(chalk.white("終了します"));
    process.exit(0);
});

console.info(chalk.white("EasyFolderZipが起動しました"));