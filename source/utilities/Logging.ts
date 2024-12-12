import { GLOBAL_VARIABLES } from "../global";
import { PACKAGE_INFO } from "./Package";

type loggingData = {
  type: "log" | "error" | "info";
};

export const LOGGING_UTILITIES = {
  newLine: () => console.log("\n"),
  horizontalLine: () =>
    console.log(Array(process.stdout.columns).fill("-").join("")),
  displayCopyright: () => {
    LOGGING_UTILITIES.newLine();
    LOGGING_UTILITIES.horizontalLine();

    LOGGING_UTILITIES.writeLog(
      `${PACKAGE_INFO.NAME} (v${
        PACKAGE_INFO.VERSION
      }) by Dustin Palmatier\nAll Rights Reserved ${new Date().getFullYear()}`
    );
    LOGGING_UTILITIES.horizontalLine();

    LOGGING_UTILITIES.newLine();
  },
  timestamp: () => {
    const time = new Date();
    return `[${time.getUTCMonth()}/${time.getUTCDate()}/${time.getUTCFullYear()} @ ${time.getUTCHours()}:${
      time.getUTCMinutes() <= 9
        ? `0${time.getUTCMinutes()}`
        : time.getUTCMinutes()
    } (${Intl.DateTimeFormat().resolvedOptions().timeZone})]`;
  },
  writeLog: (
    m: string,
    data: loggingData | undefined = {
      type: "info",
    }
  ) => {
    const formattedMessage = `${
      GLOBAL_VARIABLES.CONSOLE_PREFIX
    } ${LOGGING_UTILITIES.timestamp()} ${m}`;

    switch (data.type) {
      case "error":
        console.error(formattedMessage);
        break;
      case "info":
        console.info(formattedMessage);
        break;
      case "log":
        console.log(formattedMessage);
        break;
    }
  },
};
