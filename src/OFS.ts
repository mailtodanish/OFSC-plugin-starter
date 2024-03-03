
import { createHash } from "crypto";
import { PathLike, readFileSync } from "fs";

export type OFSCredentials = {
    instance: string;
    clientId: string;
    clientSecret: string;
};


export class OFS{
    private _credentials!: OFSCredentials;
    private _hash!: string;
    private _baseURL!: URL;
    private static DEFAULT_DOMAIN = "fs.ocs.oraclecloud.com";

    public get credentials(): OFSCredentials {
        return this._credentials;
    }


    set content(buffer: Buffer) {
        var hash = createHash("sha256");
        hash.update(buffer);        
        // this._data.root.plugins.plugin.plugin_data.plugin_data_item.hosted_plugin_data.content._cdata =
        //     buffer.toString("base64");
        // this._data.root.plugins.plugin.plugin_data.plugin_data_item.hosted_plugin_data._attributes.content_hash =
        //     hash.digest("hex");
    }

    public set credentials(v: OFSCredentials) {
        this._credentials = v;
        this._hash = OFS.authenticateUser(v);
        this._baseURL = new URL(
            `https://${this.instance}.${OFS.DEFAULT_DOMAIN}`
        );
    }

    public get instance(): string {
        return this.credentials.instance;
    }

    constructor(credentials: OFSCredentials) {
        this.credentials = credentials;
    }

    private static authenticateUser(credentials: OFSCredentials): string {
        var token =
            credentials.clientId +
            "@" +
            credentials.instance +
            ":" +
            credentials.clientSecret;
        var hash = Buffer.from(token).toString("base64");
        return "Basic " + hash;
    }

    // Metadata: Plugin Management
    async importPlugins(file?: PathLike): Promise<any> {
        const partialURL =
            "/rest/ofscMetadata/v1/plugins/custom-actions/import";
        var formData = new FormData();
        if (file) {
            var blob = new Blob([readFileSync(file)], { type: "text/xml" });
            formData.append("pluginFile", blob, file.toString());
        }  else {
            throw "Must provide file or data";
        }

        return this._postMultiPart(partialURL, formData);
    }

    public get authorization(): string {
        return this._hash;
    }

    private _postMultiPart(
        partialURL: string,
        data: FormData
    ): Promise<any> {
        var theURL = new URL(partialURL, this._baseURL);
        var myHeaders = new Headers();
        myHeaders.append("Authorization", this.authorization);

        var requestOptions: RequestInit = {
            method: "POST",
            headers: myHeaders,
            body: data,
        };
        const fetchPromise = fetch(theURL, requestOptions)
            .then(async function (response) {
                return response
            })
            .catch((error) => {
                console.log("error", error);
               
            });
        return fetchPromise;
    }
}