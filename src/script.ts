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
                        filereader.onloadend = async  () => {
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
        constructor() {
            const file = document.getElementById("filesettingWindow");
            const album = document.getElementById("albumsettingWindow");
            const artist = document.getElementById("artistsettingWindow");
            const music = document.getElementById("musicsettingWindow");
            if (file && album && artist && music) {
                
            }
        }
    };
    (function test() {
    })();
});