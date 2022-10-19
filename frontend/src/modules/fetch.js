import {IPCEvents} from "common/constants";
import ipcRenderer from "../ipc";

export default function fetch(url, options) {
    return new Promise(resolve => {
        ipcRenderer.send(
            IPCEvents.MAKE_REQUESTS,
            { url: url, options: options },
            data => {
                if(options && options._wrapInResponse === false)
                    resolve(data);
                else {
                    const res = new Response(data.body);
                    Object.defineProperty(res, "headers", { value: data.headers });
                    Object.defineProperty(res, "ok", { value: data.ok });
                    Object.defineProperty(res, "redirected", { value: data.redirected });
                    Object.defineProperty(res, "status", { value: data.status });
                    Object.defineProperty(res, "statusCode", { value: data.status });
                    Object.defineProperty(res, "statusText", { value: data.statusText });
                    Object.defineProperty(res, "type", { value: data.type });
                    Object.defineProperty(res, "url", { value: data.url });
                    resolve(res);
                }
            }
        );
    });
}
