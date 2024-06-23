//Node.jsで動作させるメインプログラムです。

import fs from "fs";

import { question, easyExpress } from "./src/nodeFunction.js";
interface FileUploadType {
    base64: string;
    filename: string;
    extension: string;
}
(async () => {
    if (!fs.existsSync("./media")) fs.mkdirSync("./media");
    if (!fs.existsSync("./data/json")) fs.writeFileSync("./data.json", "{}");

    const port = await (async () => {
        try {
            console.log("このアプリを利用するには、Webサイトからアクセスする必要があります。利用するポートを決定してください。");
            return Number(await question("ポート番号を入力"));
        } catch (e) { return undefined }
    })();
    if (port === undefined || Number.isNaN(port) || port < 1 || port > 65535) return console.log("無効な文字列が入力されたようです。");
    const app = new easyExpress();
    app.listen(String(port), () => { console.log("準備が完了しました。アクセスして利用することができます。") });
    app.get(async (req, res) => { easyExpress.easyGetReply(req, res, "./") });
    app.easyPost((data, req, res) => {
        if (req.url === "/savejson") {
            fs.writeFileSync("./data.json", data);
            res.end();
        } else if (req.url === "/saveFile") {
            const json: FileUploadType | undefined = (() => { try { return JSON.parse(data) } catch (e) { return undefined; } })();
            if (json !== undefined) {
                const binaryString = atob(json.base64);
                const binary = Uint8Array.from(binaryString, binaryChar => binaryChar.charCodeAt(0));
                fs.writeFileSync("./media/" + json.filename + "." + json.extension, binary);
            }
            res.end();
        } else if (req.url === "/getjson") {
            res.end(fs.readFileSync("./data.json"));
        };
    });
})();
