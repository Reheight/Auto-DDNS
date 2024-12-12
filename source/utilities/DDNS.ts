import { GLOBAL_VARIABLES } from "../global";
import { CF_UTILS } from "./CloudflareHandler";
import { LOGGING_UTILITIES } from "./Logging";
import { NET_UTILS } from "./NetworkHandler";

export const DDNS_UTILS = {
  async updateInformation(address: string = "") {
    const updatedAddress =
      address.length > 0 ? address : await NET_UTILS.retrieveAddress();

    if (!updatedAddress) {
      LOGGING_UTILITIES.writeLog(
        "We were unable to identify your network and therefore cannot continue this process..."
      );
      return;
    }

    LOGGING_UTILITIES.writeLog(
      `Your public network address has been identified as ${updatedAddress}`
    );

    GLOBAL_VARIABLES.PUB_ADDR = updatedAddress;

    LOGGING_UTILITIES.writeLog(
      `The cached public network address has been set to ${GLOBAL_VARIABLES.PUB_ADDR}`
    );

    await CF_UTILS.passoff(GLOBAL_VARIABLES.PUB_ADDR);
  },

  async updater() {
    LOGGING_UTILITIES.writeLog(
      "We are going to check if we need to update your DNS to reflect your current public address."
    );

    await NET_UTILS.pubAddrHandler();

    for (let i = 0; i < 1; i++) LOGGING_UTILITIES.newLine();

    if (!GLOBAL_VARIABLES.LOOP) return setInterval(this.updater, 60000);
  },
};
