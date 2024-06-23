import readline from "readline";
import express from "express";
import fs from "fs";
import fsP from "fs/promises";
import path from "path";
import http from "http";
import https from "https";
import bodyParser from "body-parser";

/**
 * 
 * @param {string} text 
 * @returns {Promise<string>}
 */
export async function question(text: string): Promise<string> {
    const iface = readline.createInterface({ input: process.stdin, output: process.stdout })
    return await new Promise(resolve => iface.question(text + "> ", answer => { iface.close(); resolve(answer) }))
};
const data = [
    ["aac", "audio/aac"],
    ["abw", "application/x-abiword"],
    ["arc", "application/x-freearc"],
    ["avi", "video/x-msvideo"],
    ["azw", "application/vnd.amazon.ebook"],
    ["bin", "application/octet-stream"],
    ["bmp", "image/bmp"],
    ["bz", "application/x-bzip"],
    ["bz2", "application/x-bzip2"],
    ["csh", "application/x-csh"],
    ["css", "text/css"],
    ["csv", "text/csv"],
    ["doc", "application/msword"],
    ["docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    ["eot", "application/vnd.ms-fontobject"],
    ["epub", "application/epub+zip"],
    ["gz", "application/gzip"],
    ["gif", "image/gif"],
    ["htm", "text/html"],
    ["html", "text/html"],
    ["ico", "image/vnd.microsoft.icon"],
    ["ics", "text/calendar"],
    ["jar", "application/java-archive"],
    ["jpeg", "image/jpeg"],
    ["jpg", "image/jpeg"],
    ["js", "text/javascript"],
    ["json", "application/json"],
    ["jsonld", "application/ld+json"],
    ["mid", "audio/midi audio/x-midi"],
    ["midi", "audio/midi audio/x-midi"],
    ["mjs", "text/javascript"],
    ["mkv", "video/x-matroska"],
    ["mp3", "audio/mpeg"],
    ["mp4", "video/mp4"],
    ["mpeg", "video/mpeg"],
    ["mpkg", "application/vnd.apple.installer+xml"],
    ["odp", "application/vnd.oasis.opendocument.presentation"],
    ["ods", "application/vnd.oasis.opendocument.spreadsheet"],
    ["odt", "application/vnd.oasis.opendocument.text"],
    ["oga", "audio/ogg"],
    ["ogv", "video/ogg"],
    ["ogx", "application/ogg"],
    ["opus", "audio/opus"],
    ["otf", "font/otf"],
    ["png", "image/png"],
    ["pdf", "application/pdf"],
    ["php", "application/x-httpd-php"],
    ["ppt", "application/vnd.ms-powerpoint"],
    ["pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
    ["rar", "application/vnd.rar"],
    ["rtf", "application/rtf"],
    ["sh", "application/x-sh"],
    ["svg", "image/svg+xml"],
    ["swf", "application/x-shockwave-flash"],
    ["tar", "application/x-tar"],
    ["tif", "image/tiff"],
    ["tiff", "image/tiff"],
    ["ts", "video/mp2t"],
    ["ttf", "font/ttf"],
    ["txt", "text/plain"],
    ["vsd", "application/vnd.visio"],
    ["wav", "audio/wav"],
    ["weba", "audio/webm"],
    ["webm", "video/webm"],
    ["webp", "image/webp"],
    ["woff", "font/woff"],
    ["woff2", "font/woff2"],
    ["xhtml", "application/xhtml+xml"],
    ["xls", "application/vnd.ms-excel"],
    ["xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    ["xml", "application/xml"],
    ["xul", "application/vnd.mozilla.xul+xml"],
    ["zip", "application/zip"],
    ["3gp", "video/3gpp"],
    ["3g2", "video/3gpp2"],
    ["7z", "application/x-7z-compressed"],
];

export function contentTypeToExtConvert(/** @type {string} */string: string, /** @type {"extension" | "contentType"} */toType: "extension" | "contentType") {
    for (let i = 0; i !== data.length; i++) {
        if (data[i][toType === "contentType" ? 0 : 1] === string) return data[i][toType === "extension" ? 0 : 1];
    }
}

export class easyExpress {
    constructor(option?: {
        /** これを指定すると自動的にhttpsモードになります。 */
        https?: {
            cert: string;
            key: string;
        };
    }) {
        this.app = express();
        if (option?.https) {
            this.data.server = https.createServer({
                key: option.https.key,
                cert: option.https.cert,
            });
        } else this.data.server = http.createServer();
        this.app.get("*", (req, res) => {
            if (this.#get) this.#get(req, res);
        });
        this.app.post("*", (req, res) => {
            if (this.#post) this.#post(req, res);
            if (this.#easyPost) {
                let data = "";
                req.on("data", (chunk) => {
                    data += chunk;
                });
                req.on("end", () => {
                    if (this.#easyPost) this.#easyPost(data, req, res);
                });
            }
        });
        this.app.use(bodyParser.urlencoded({ limit: "127gb", extended: true }));
    }
    /**
     * 情報源: [HTTP レスポンスコード](https://developer.mozilla.org/ja/docs/Web/HTTP/Status)
     */
    static statusCode() {
        return {
            100: "Continue",
            101: "Switching Protocols",
            102: "Processing",
            103: "Early Hints",
            200: "OK",
            201: "Created",
            202: "Accepted",
            203: "Non-Authoritative Information",
            204: "No Content",
            205: "Reset Content",
            /** サーバー側で処理方法がわからない事態が発生したことを示します。 */
            500: "Internal Server Error",
            /** リクエストメソッドをサーバーが対応しておらず、扱えないことを示します。サーバーが対応しなければならない (従って、このコードを返してはならない) メソッドは `GET` と `HEAD` だけです。 */
            501: "Not Implemented",
            /** このエラーレスポンスは、リクエストの処理に必要なレスポンスを受け取るゲートウェイとして動作するサーバーが無効なレスポンスを受け取ったことを示します。 */
            502: "Bad Gateway",
            /** サーバーはリクエストを処理する準備ができていないことを示します。 一般的な原因は、サーバーがメンテナンスや過負荷でダウンしていることです。 このレスポンスとともに問題について説明する、ユーザーにわかりやすいページを送信するべきであることに注意してください。 このレスポンスは一時的な状況について使用するものであり、また可能であれば、サービスが復旧する前に HTTP の `Retry-After` ヘッダーに予定時刻を含めてください。 また、これら一時的な状況のレスポンスは通常キャッシュされるべきではないことから、ウェブ管理者はこのレスポンスとともに送られるキャッシュ関連のヘッダーに注意しなければなりません。 */
            503: "Service Unavailable",
            /** このエラーレスポンスは、ゲートウェイとして動作するサーバーが時間内にレスポンスを得られない場合に送られます。 */
            504: "Gateway Timeout",
            /** リクエストで使用した HTTP のバージョンにサーバーが対応していないことを示します。 */
            505: "HTTP Version Not Supported",
            /** サーバーに内部構成エラーがあることを示します。選択したバリアントリソースが透過的コンテンツネゴシエーション自体に携わるよう設定されており、ネゴシエーションプロセスが正しく終了しなかったことを示します。 */
            506: "Variant Also Negotiates",
            /** サーバーがリクエストを完了させるのに必要な表現を保存することができなかったため、メソッドがリソースに対して実行できなかったことを示します。 */
            507: "Insufficient Storage",
            /** サーバーは、リクエストの処理中に無限ループを検出しました。 */
            508: "Loop Detected",
            /** サーバーがリクエストを処理するために、リクエストをさらに拡張することが必要です。 */
            510: "Not Extended",
            /** クライアントがネットワークでアクセスするために認証が必要であることを示します。 */
            511: "Network Authentication Required",
        };
    }
    /**
     * これをget関数内で使用すると、getの返信をすべてこの関数が終了させてくれます。
     * その代わり、Responseの返答は既に終了(end)しているので、他の操作を行うことは出来なくなります。
     * @param req
     * @param res
     * @param filePath
     */
    static async easyGetReply(req: express.Request, res: express.Response, folderPath: string) {
        const url = req.url[req.url.length - 1] !== "/" ? req.url : req.url + "index.html";
        const contentType = contentTypeToExtConvert(path.extname(url).replace(".", ""), "contentType");
        const filepath = folderPath + url;
        const headers: http.OutgoingHttpHeaders | http.OutgoingHttpHeader[] = {};
        headers["Accept-Ranges"] = "bytes";
        if (contentType !== undefined) headers["Content-Type"] = contentType;
        if (fs.existsSync(filepath)) {
            const fileSize = (await fsP.stat(filepath)).size;
            const chunkSize = 1 * 1e7; //チャンクサイズ

            const ranges = String(req.headers.range).split("-");
            if (ranges[0]) ranges[0] = ranges[0].replace(/\D/g, "");
            if (ranges[1]) ranges[1] = ranges[1].replace(/\D/g, "");
            //これは取得するデータ範囲を決定します。
            const options = {
                start: Number(ranges[0]),
                end: 0,
            };
            options.end = Number(ranges[1]) || Math.min(options.start + chunkSize, fileSize - 1);
            if (!req.headers.range) options.end = fileSize !== 0 ? fileSize - 1 : 0;
            headers["Content-Length"] = String(fileSize);
            if (req.headers.range) headers["Content-Length"] = String(options.end - options.start + 1);
            headers["Content-Range"] = "bytes " + options.start + "-" + options.end + "/" + fileSize;
            try {
                const stream = fs.createReadStream(filepath, options);
                res.writeHead(req.headers.range ? 206 : 200, headers);
                stream.on("data", (chunk: string) => res.write(chunk));
                stream.on("end", () => res.end());
            } catch (e) {
                console.log(e, headers);
                res.writeHead(500);
                res.end();
            }
        } else {
            res.writeHead(404, headers);
            res.end();
        }
    }
    #get?: (req: express.Request, res: express.Response) => void;
    #post?: (req: express.Request, res: express.Response) => void;
    #easyPost?: (data: string, req: express.Request, res: express.Response) => void;
    /** easyExpressを立ち上げるために使用された変数です。 */
    data: {
        /**
         * サーバーが登録されます。
         */
        server?: http.Server | https.Server;
    } = {};
    app: express.Express;
    get(callback: (req: express.Request, res: express.Response) => void) {
        this.#get = callback;
    }
    post(callback: (req: express.Request, res: express.Response) => void) {
        this.#post = callback;
    }
    easyPost(callback: (data: string, req: express.Request, res: express.Response) => void) {
        this.#easyPost = callback;
    }
    listen(path: string, callback?: (() => void) | undefined) {
        this.app.listen(path, callback);
    }
}

/**
 * 特定の個所を特定の文字列に置き換えます。
 * @param string 置き換え元の文字列を入力
 * @param num 置き換えたい箇所の番号
 * @param replaceStr 置き換えられる文字列
 * @returns 置き換えられた文字列
 */
export function replace(string: string, num: number, replaceStr: string) {
    const start = string.slice(0, num);
    const end = string.slice(num + replaceStr.length, string.length);
    return start + replaceStr + end;
}

export function randomStringCreate(
    /** 文字列の長さを入力します。 */
    length: number,
    /** 様々なオプションをつけることが出来ます。 */
    option?: {
        /** 小文字の英字を含めるかを決めます。 */
        str?: boolean;
        /** 大文字の英字を含めるかを決めます。 */
        num?: boolean;
        /** 数字を含めるかを決めます。 */
        upstr?: boolean;
        /** ランダム文字列に含めたい文字を文字列で入力します。 */
        originalString?: string;
        /**
         * 特定の個所に特定の文字列を置きたい場合に指定でき、複数個所を指定することが出来ます。
         * 場合によっては指定した文字列の長さを超える可能性があります。
         */
        setStr?: {
            /** どこの箇所を置き換えるかを指定します。0からカウントされます。 */
            setNum: number;
            /** 何の文字にするかを指定します。１文字推奨です。 */
            string: string;
        }[];
        /**
         * 重複を最小限に抑えるために利用する場合、時間を数字として文字列内に入れます。指定しない場合入れません。
         * もし指定された長さより長い数字となった場合、省略されるため重複の恐れがあります。
         */
        timeNow?: {
            /** ここを有効にすると最初のほうに設置します。 */
            start?: boolean;
            /** ここを有効にすると最後のほうに設置します。 */
            end?: boolean;
        };
    },
) {
    const str = "abcdefghijklmnopqrstuvwxyz";
    const num = "0123456789";
    const upstr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let conster = "";
    if (option?.str) conster += str;
    if (option?.num) conster += num;
    if (option?.upstr) conster += upstr;
    if (option?.originalString) conster += option.originalString;
    if (conster === "") return "";
    let string = "";
    for (let i = 0; i !== length; i++) string += conster[Math.floor(Math.random() * conster.length)];
    if (option?.setStr)
        for (let i = 0; i !== option.setStr.length; i++)
            string = replace(string, option.setStr[i].setNum, option.setStr[i].string);
    if (option?.timeNow) {
        const time = String(Date.now());
        if (option.timeNow.start) string = replace(string, 0, time);
        if (option.timeNow.end) string = replace(string, string.length - time.length, time);
    }
    return string;
}