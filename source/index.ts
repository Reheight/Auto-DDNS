import { GLOBAL_VARIABLES } from "./global";
import { DDNS_UTILS } from "./utilities/DDNS";
import { LOGGING_UTILITIES } from "./utilities/Logging";

async function main() {
  LOGGING_UTILITIES.displayCopyright();
  LOGGING_UTILITIES.writeLog("Service is initializing...");

  GLOBAL_VARIABLES.LOOP = await DDNS_UTILS.updater();
}

main();
