import axios, { AxiosResponse } from "axios";
import { LOGGING_UTILITIES } from "./Logging";
import { GLOBAL_VARIABLES } from "../global";
import { DDNS_UTILS } from "./DDNS";

export const NET_HANDLER = {
  retrieveNetworkData: async () => {
    let request: null | AxiosResponse<any, any>;

    LOGGING_UTILITIES.writeLog(
      "Kindly remain patient while we are initiating a network request to identify your public address...",
      {
        type: "info",
      }
    );

    try {
      request = await axios({
        url: "https://api.ipify.org/?format=json",
        method: "GET",
      });

      LOGGING_UTILITIES.writeLog(
        "A response has been received from the service provided, we will now continue processing this.",
        { type: "info" }
      );
    } catch {
      request = null;
      LOGGING_UTILITIES.writeLog(
        "There was an error while retrieving information from the request to the service provider."
      );
    }

    if (!request)
      throw Error(
        "There was an error while attempting to identify the network."
      );

    if (request.status !== 200)
      throw Error(
        "There was an unexpected status response from the IP-ify API."
      );

    const data = request.data;

    const address: string | null = data.ip;

    if (!address)
      throw Error(
        "There was an error identifying the network provided by the service provided."
      );

    return address;
  },
};

export const NET_UTILS = {
  async pubAddrHandler() {
    const lastKnownCached = GLOBAL_VARIABLES.PUB_ADDR !== undefined;

    if (lastKnownCached) {
      await NET_UTILS.verifyCachedAddress();
    } else {
      LOGGING_UTILITIES.writeLog(
        "It appears that we do not have a record for your last known address; no worries, we will handle it!"
      );
      await DDNS_UTILS.updateInformation();
    }
  },

  async verifyCachedAddress() {
    const address = await NET_UTILS.retrieveAddress();

    if (!address) {
      LOGGING_UTILITIES.writeLog(
        "We could not continue the process due to the inability to identify your network...",
        { type: "error" }
      );
      return;
    }

    if (address === GLOBAL_VARIABLES.PUB_ADDR) {
      LOGGING_UTILITIES.writeLog(
        "The address we have saved is still up to date, there is no need to update any records with Cloudflare."
      );

      return;
    } else {
      LOGGING_UTILITIES.writeLog(
        `It appears your address has changed from ${GLOBAL_VARIABLES.PUB_ADDR} to ${address}, so we will now reflect this change to your DNS hosted on Cloudflare.`
      );
    }

    LOGGING_UTILITIES.writeLog(
      "We are now going to try to reflect this to Cloudflare..."
    );

    await DDNS_UTILS.updateInformation(address);
  },

  async retrieveAddress() {
    let network: string | null;

    try {
      network = await NET_HANDLER.retrieveNetworkData();
    } catch (err) {
      LOGGING_UTILITIES.writeLog(`${err}`, { type: "error" });
      network = null;
    }

    return network;
  },
};
