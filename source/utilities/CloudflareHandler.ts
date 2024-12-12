import Cloudflare from "cloudflare";
import { GLOBAL_VARIABLES } from "../global";
import { Zone } from "cloudflare/resources/zones/zones";
import { LOGGING_UTILITIES } from "./Logging";
import dayjs from "dayjs";

const cloudflare = new Cloudflare({
  apiEmail: GLOBAL_VARIABLES.CLOUDFLARE.EMAIL,
  apiKey: GLOBAL_VARIABLES.CLOUDFLARE.API_KEY,
});

export const CF_UTILS = {
  async passoff(address: string) {
    LOGGING_UTILITIES.writeLog(
      "We are going to attemmpt to identify the current address on the DNS record currently."
    );

    const cfRecord = await this.retrieveCurrentAddress(address);

    if (!cfRecord) {
      LOGGING_UTILITIES.writeLog(
        "We were unable to process the request to Cloudflare for validation, try again later."
      );
      return;
    }

    const djsCreation = dayjs(cfRecord.created_on);
    const oneMinuteBeforeCreation = djsCreation.subtract(1, "minutes");
    const oneMinuteBeforeNow = dayjs(new Date());

    if (oneMinuteBeforeNow.diff(oneMinuteBeforeCreation, "M") <= 1) return; // Likely created due to not existing, too new, we will ignore.

    const recordedAddr = cfRecord.content as string;

    if (!cfRecord) {
      LOGGING_UTILITIES.writeLog(
        "We are unable to continue the process due to an error. Try again later."
      );
      return;
    }

    if (recordedAddr === address) {
      LOGGING_UTILITIES.writeLog(
        "The IP address of the network we have identified is identical to the one listed on the record, therefore we have not made any changes."
      );
      return;
    }

    await this.updateAddress(address, cfRecord);
  },
  async updateAddress(address: string, record: Cloudflare.DNS.Records.Record) {
    const zone = await this.retrieveZone();

    if (!zone) {
      LOGGING_UTILITIES.writeLog(
        "We were unable to identify the zone required to make changes. We cannot continue, review your configuration and try again."
      );
      return;
    }

    const records = await this.retrieveRecords(zone);

    if (!records) {
      LOGGING_UTILITIES.writeLog(
        "We were unable to identify the records required to make changes. We cannot continue, review your configuration and try again."
      );
      return;
    }

    const foundRecord = records.result.find((x) => x.id === record.id);

    if (!foundRecord) {
      LOGGING_UTILITIES.writeLog(
        "We were unable to identify the specific record required to make changes. We cannot continue, review your configuration and try again."
      );
      return;
    }

    if (foundRecord.content === address) {
      LOGGING_UTILITIES.writeLog(
        "The record you are attempting to update is already reflecting the address we are trying to change it to, this is odd, nothetheless we will stop our process to save bandwidth."
      );
      return;
    }

    let updatedRecord: Cloudflare.DNS.Records.Record | null;

    try {
      updatedRecord = await cloudflare.dns.records.edit(record.id!, {
        content: address,
        type: "A",
        zone_id: zone.id,
        name: `${GLOBAL_VARIABLES.DNS.TARGET.toLocaleLowerCase()}.${zone.name}`,
      });

      LOGGING_UTILITIES.writeLog(
        `The DNS record of ${updatedRecord.name}.${zone.name} has been updated to point to ${address}.`
      );
    } catch {
      LOGGING_UTILITIES.writeLog(
        "We encountered an issue while attempting to push updates to reflect the changes to the DNS."
      );
    }
  },
  async retrieveZone() {
    let zone: Zone | null;

    try {
      zone = await cloudflare.zones.get({
        zone_id: GLOBAL_VARIABLES.DNS.ZONE,
      });

      LOGGING_UTILITIES.writeLog(
        `The zone responsible for the DNS has been identified (ID: ${zone.id})`
      );
    } catch {
      zone = null;
      LOGGING_UTILITIES.writeLog(
        "The zone responsible for the DNS is unable too be identified."
      );
    }

    return zone;
  },
  async retrieveRecords(zone: Zone) {
    let DNSRecords: Cloudflare.DNS.Records.RecordsV4PagePaginationArray | null;

    try {
      DNSRecords = await cloudflare.dns.records.list({ zone_id: zone.id });
      LOGGING_UTILITIES.writeLog(
        `We were able to identify a total of ${DNSRecords.result.length} records.`
      );
    } catch {
      DNSRecords = null;
      LOGGING_UTILITIES.writeLog(
        "We were unable to identify the DNS records associated with the zone."
      );
    }

    return DNSRecords;
  },
  async retrieveCurrentAddress(address: string) {
    const zone = await this.retrieveZone();

    if (!zone) {
      LOGGING_UTILITIES.writeLog(
        "We are unable to proceed due to the zone not existing, ensure your configuration is setup properly and try restarting the software."
      );

      return null;
    }

    LOGGING_UTILITIES.writeLog(
      "We are attempting to retrieve all the DNS records associated with the zone."
    );

    const DNSRecords = await this.retrieveRecords(zone);

    if (!DNSRecords) {
      LOGGING_UTILITIES.writeLog(
        `We are unable to proceed due to being unable to identify any/all of the DNS records associated with ${zone.name} (${zone.id})`
      );
      return null;
    }

    LOGGING_UTILITIES.writeLog(
      `We are now going to attempt to identify the record of: ${GLOBAL_VARIABLES.DNS.TARGET.toLowerCase()}.${zone.name.toLowerCase()}`
    );

    const recordExists = DNSRecords.result.find(
      (x) =>
        x.name.toLowerCase() ===
        `${GLOBAL_VARIABLES.DNS.TARGET}.${zone.name}`.toLowerCase()
    );

    if (!recordExists) {
      LOGGING_UTILITIES.writeLog(
        "We were unable to identify the record, we will now attempt to create it."
      );

      const record = await this.createRecord(address, zone);

      if (!record) {
        LOGGING_UTILITIES.writeLog(
          "There was an issue while trying to create the record. Ensure all the credentials in your configuration are proper and try again."
        );
        return null;
      } else return record;
    } else {
      return recordExists;
    }
  },
  async createRecord(address: string, zone: Zone) {
    let record: Cloudflare.DNS.Records.Record | null;

    LOGGING_UTILITIES.writeLog(
      `We are going to attempt to create the DNS (A) record of ${GLOBAL_VARIABLES.DNS.TARGET}.${zone.name} and point it towards ${address}...`
    );

    try {
      record = await cloudflare.dns.records.create({
        zone_id: zone.id,
        name: `${GLOBAL_VARIABLES.DNS.TARGET.toLowerCase()}.${zone.name}`,
        content: address,
        type: "A",
      });

      LOGGING_UTILITIES.writeLog("The zone has been successfully created.");
    } catch {
      record = null;
      LOGGING_UTILITIES.writeLog(
        "There was an error during the attempt to create the record."
      );
    }

    return record;
  },
};
