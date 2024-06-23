/**
 * httpリクエストできる関数
 * @param request URLに含ませるリクエスト(処理分岐)を入力
 * @param send 送信したいテキスト(JSONもstringifyで可能)
 * @returns 
 */
export async function httpDataRequest(request: string, send?: Document | XMLHttpRequestBodyInit | null) {
    return await new Promise<string>(resolve => {
        const req = new XMLHttpRequest()
        req.open("POST", "http://" + location.hostname + ":" + location.port + "/" + request)
        req.setRequestHeader("content-type", "text/plain;charset=UTF-8")
        req.send(send); //データを送信
        req.onreadystatechange = async () => { if (req.readyState === 4 && req.status === 200) resolve(req.responseText) } //レスポンスを返す
    })
}