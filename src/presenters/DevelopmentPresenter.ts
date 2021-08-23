import {LogPresenter} from "../../types/interfaces/LogPresenter";
import {purple, red} from "./colours/ColourConverters";
import {SeverityColours} from "./colours/SeverityColours";

/**
 * This provides an easy way for the developer to read logs while developing.
 * Nicely formatted logs in your console, rather than well structured data for a server log file.
 * @param log the log object to be logged to stdout
 */
export const DevelopmentPresenter: LogPresenter = async (log) => {
  const filenameWidth = 30;
  const output: string =
    [
      purple(new Date(log.timestamp).toLocaleTimeString()),
      (SeverityColours.get(log.severity) ?? red)(
        `${log.severity.padEnd(7, " ")}`
      ),
      log["filename"]
        .split("/")
        .filter((f) => f)
        .join("->")
        .slice(-filenameWidth)
        .padEnd(filenameWidth, "."),
      log.message,
    ].join(" | ") + "\n";
  await new Promise((resolve) => process.stdout.write(output, resolve));
};
