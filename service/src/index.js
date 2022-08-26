import Logger from "common/logger";
import {registerDeclarativeNetRequestEvents} from "./modules/declarativenetrequest";
import {registerOnRuleMatchedDebug} from "./modules/dnrdebug";
import {registerMessageEvents} from "./modules/fetch";

function initialize()
{
    Logger.log("Service", "Initializing service worker...");

    registerOnRuleMatchedDebug();
    registerDeclarativeNetRequestEvents();
    registerMessageEvents();
}

initialize();
