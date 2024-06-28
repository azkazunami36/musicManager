//@ts-check
import { UUID } from "./UUID.js";
import { DATAJSON } from "./datajson.js";
import { httpDataRequest } from "./httpDataRequest.js";

addEventListener("load", async () => {
    const jsonData = new class jsonData {
        constructor(string: string) {
            this.json = JSON.parse(string);
            if (!this.json.albums) this.json.albums = {};
            if (!this.json.files) this.json.files = {};
            if (!this.json.musics) this.json.musics = {};
        }
        json: DATAJSON;
        async saveJSON() {
            console.log(this.json)
            await httpDataRequest("savejson", JSON.stringify(this.json));
        }
    }(await httpDataRequest("getjson"))
    const sideBarViewButtonControl = new class sideBarViewButtonControl {
        constructor() {
            const types = ["artist", "album", "music", "genre", "upload", "filesetting", "albumsetting", "artistsetting", "musicsetting"];
            for (let i = 0; i !== types.length; i++) {
                const element = document.getElementById(types[i]);
                if (element) element.addEventListener("click", () => { this.chenge(types[i]) });
            };
        }
        /**
         * sideBarNameに入力された文字列のものにタブが切り替わります。存在しないタブを指定すると無視されます。
         * @param sideBarName 
         * @returns 
         */
        chenge(sideBarName: string) {
            const window = document.getElementById(sideBarName + "Window");
            if (window === null) return console.log("null");
            const viewed = document.getElementsByClassName("viewed")[0];
            if (viewed) {
                const beforeName = viewed.id.replace("Window", "");
                const beforeButton = document.getElementById(beforeName);
                if (beforeButton) beforeButton.style.background = "rgb(255, 255, 255)";
                viewed.classList.remove("viewed");
            }
            const button = document.getElementById(sideBarName);
            if (button) button.style.background = "rgb(150, 200, 255)";
            window.classList.add("viewed");
        }
    }
    const fileUpload = new class fileUpload {
        constructor() {
            const uploadWindow = document.getElementById("uploadWindow");
            const file = (() => {
                if (!uploadWindow) return undefined;
                return uploadWindow.getElementsByClassName("file")[0] as HTMLInputElement;
            })();
            const uploadButton = uploadWindow?.getElementsByClassName("upload")[0];
            if (file && uploadButton) {
                uploadButton.addEventListener("click", async () => {
                    if (file.files && file.files[0]) {
                        const name = file.files[0].name;
                        const filereader = new FileReader();
                        filereader.readAsArrayBuffer(file.files[0].slice());
                        filereader.onloadend = async () => {
                            if (filereader.result) {
                                if (typeof filereader.result !== "string") {
                                    const unit8array = new Uint8Array(filereader.result);
                                    const binaryString = unit8array.reduce((binaryString, uint8) => binaryString + String.fromCharCode(uint8), '');
                                    const base64 = btoa(binaryString);
                                    const splitedName = name.split(".");
                                    const extension = (splitedName.length !== 1) ? splitedName[splitedName.length - 1] : undefined;
                                    const filename = (extension) ? name.slice(0, -(extension.length + 1)) : name;
                                    const uuid = UUID.randomUUID();
                                    await httpDataRequest("saveFile", JSON.stringify({
                                        base64: base64,
                                        filename: uuid,
                                        extension: extension
                                    }));
                                    jsonData.json.files[uuid] = {
                                        filePath: "./media/" + filename + "." + extension,
                                        name: filename,
                                        type: "unknown"
                                    }
                                    await jsonData.saveJSON();
                                    sideBarViewButtonControl.chenge("filesetting")
                                }
                            }
                        }
                    }
                });
            }
        }
    };
    const metadataEditer = new class metadataEditer {
        propertys: { [n: string]: { [n: string]: HTMLInputElement } } = {
            file: {},
            album: {},
            artist: {},
            music: {}
        }
        constructor() {
            const file = document.getElementById("filesettingWindow");
            const album = document.getElementById("albumsettingWindow");
            const artist = document.getElementById("artistsettingWindow");
            const music = document.getElementById("musicsettingWindow");
            function defaultSelecter(element: HTMLElement) {
                const array: Element[] = []
                for (let i = 0; i !== 2; i++) {
                    const text = ["div.textbox"];
                    element.querySelectorAll(
                        "div.body div.PropertyWindow1 div.right div.propertyBase div.property " + text[i] + " input"
                    ).forEach(element => array.push(element));
                }
                return array;
            };
            if (file) {
                const property = defaultSelecter(file);
                property.forEach(e => { this.propertys.file[e.id] = e as HTMLInputElement; });
            }
            if (album) {
                const property = defaultSelecter(album);
                property.forEach(e => { this.propertys.album[e.id] = e as HTMLInputElement; });
            }
            if (artist) {
                const property = defaultSelecter(artist);
                property.forEach(e => { this.propertys.artist[e.id] = e as HTMLInputElement; });
            }
            if (music) {
                const property = defaultSelecter(music);
                property.forEach(e => { this.propertys.music[e.id] = e as HTMLInputElement; });
            }
            console.log(this.propertys);
        }
        propertyLoad(type: "file" | "album" | "artist" | "music", UUID: string) {
            switch (type) {
                case "file": {
                    const meta = jsonData.json.files[UUID];
                    if (meta) {
                        this.propertys.file.name.value
                        this.propertys.file.extension.value
                        this.propertys.file.mediaType.value
                        this.propertys.file.compressType.value
                        this.propertys.file.bitRate.value
                        this.propertys.file.samplingRate.value
                        this.propertys.file.recordingMethod.value
                        this.propertys.file.sampleRate.value
                    }
                    break;
                }
                case "album": {
                    const meta = jsonData.json.albums[UUID];
                    if (meta) {

                    }
                    break;
                }
                case "artist": {
                    const meta = jsonData.json.artists[UUID];
                    if (meta) {

                    }
                    break;
                }
                case "music": {
                    const meta = jsonData.json.musics[UUID];
                    if (meta) {

                    }
                    break;
                }
            }

        }
        call(type: "file" | "album" | "artist" | "music") {
            // 画面切り替えコード

            sideBarViewButtonControl.chenge(type + "setting");

            // 画面切り替えコード
        }
    };
    (function test() {
    })();
});