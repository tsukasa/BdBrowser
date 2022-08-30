import Logger from "common/logger";
import decNetReqRules from "./modules/declarativenetrequest";
import decNetReqDebug from "./modules/dnrdebug";
import frontendEvents from "./modules/fetch";

function initialize()
{
    Logger.log("Service", "Initializing service worker...");

    decNetReqDebug.registerEvents();
    decNetReqRules.registerEvents();
    frontendEvents.registerEvents();
}

initialize();
