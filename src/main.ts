
import { OFSPlugin } from "./plugin";


export { };
declare global {
    interface Window {
        ofs: OFSPlugin;
    }
}

window.onload = function () {
    window.ofs = new OFSPlugin("enroute");
};
