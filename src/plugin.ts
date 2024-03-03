/**  
 * Mohammad Ahshan Danish
 * https://www.linkedin.com/in/mohdahshandanish/
 *    
 *       <-- Ready
 *  init -->
 *       <--- initEnd
 *  open --->
 *       <--- Close
 */

export enum Method {
    Close = "close",
    Open = "open",
    Update = "update",
    UpdateResult = "updateResult",
    Init = "init",
    Ready = "ready",
    InitEnd = "initEnd",
}

export class OFSMessage {
    apiVersion?: number;
    method?: string;
    sendInitData?: boolean;
    showHeader?: boolean;
    enableBackButton?: boolean;
    securedData?: any;
    buttons?: any;
    static parse(str: string) {
        try {
            return Object.assign(new OFSMessage(), JSON.parse(str)) as OFSMessage;
        } catch (error) {
            return new OFSMessage();
        }
    }
}
class OFSCustomActivity {
    aid!: number
}

export class OFSOpenMessage extends OFSMessage {
    entity: string | undefined;
    activity!: OFSCustomActivity;
}

type OFSCredentials = {
    instance: string;
    clientId: string;
    clientSecret: string;
};
export class OFSPlugin {
    private _tag: string;
    private _proxy!: OFSCredentials;
    constructor(name: string) {
        console.error(`${name} is Created.`);
        this._tag = name;
        this._setup();
    }

    private _setup() {
        console.error("plugin is ready");
        window.addEventListener("message", this._getWebMessage.bind(this), false);
        var messageData: OFSMessage = {
            apiVersion: 1,
            method: "ready",
            "sendInitData": true,
            "showHeader": true,
            "enableBackButton": true
        };
        this._sendWebMessage(messageData);
    }

    // A message with the init method indicates that 
    // Oracle Field Service Core Application has started 
    // initializing the plug-in.
    private async _init(message: OFSMessage) {
        this.init(message);
        var messageData: OFSMessage = {
            apiVersion: 1,
            method: "initEnd",
        };
        this._sendWebMessage(messageData);
    }
    private _sendWebMessage(data: OFSMessage) {
        console.error(
            `${this._tag}: Sending  message` + JSON.stringify(data, undefined, 4)
        );
        var originUrl =
            document.referrer ||
            (document.location.ancestorOrigins &&
                document.location.ancestorOrigins[0]) ||
            "";

        if (originUrl) {
            parent.postMessage(data, OFSPlugin._getOriginURL(originUrl));
        }
    }

    private static _getOriginURL(url: string) {
        if (url != "") {
            if (url.indexOf("://") > -1) {
                return "https://" + url.split("/")[2];
            } else {
                return "https://" + url.split("/")[0];
            }
        }
        return "";
    }

    init(message: OFSMessage) {
        // Nothing to be done if not needed
        console.error(JSON.stringify(message.buttons, undefined, '\t'));
        window.localStorage.setItem('icons', JSON.stringify(message.buttons, undefined, '\t'));
        console.warn(`${this._tag}: Empty init method`);
    }

    // MessageEvent interface represents a message received by a target object.
    private _getWebMessage(message: MessageEvent): boolean {
        console.error(`${this._tag}: Message is received:`, message.data);
        var parsed_message = OFSMessage.parse(message.data);
        this._storeCredentials(parsed_message);
        console.warn(parsed_message.method);
        switch (parsed_message.method) {
            case "init":
                this._init(parsed_message);
                break;
            case "open":
                this.open(parsed_message as OFSOpenMessage);
                break;
            case "error":
                alert(JSON.stringify(parsed_message, undefined, 4));
                this.error(parsed_message);
                break;
        }
        return true;
    }
    error(parsed_message: OFSMessage) {
        throw new Error("ERROR .");
    }

    public sendMessage(method: Method, data?: any): void {
        this._sendWebMessage({
            apiVersion: 1,
            method: method,
            ...data,
        });
    }

    private open(data: OFSOpenMessage): void {
        let closeMessage = {
            activity: {
                aid: data.activity?.aid,
            },
        }
        const submit_button = document.getElementById("submit_button");
        if (!!submit_button) {
            submit_button.onclick = () => {
                console.error("submit_button clicked");
                this.sendMessage(Method.Close, closeMessage);
            };
        }
    }

    private _storeCredentials(message: OFSMessage) {
        if (message.securedData) {
            if (message.securedData.ofsInstance &&
                message.securedData.ofsClientId &&
                message.securedData.ofsClientSecret) {
                this._proxy = {
                    instance: message.securedData.ofsInstance,
                    clientId: message.securedData.ofsClientId,
                    clientSecret: message.securedData.ofsClientSecret,
                };
            }
        }
    }
}