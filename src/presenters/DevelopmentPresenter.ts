import { LogPresenter } from "../../types/interfaces/LogPresenter";
import { lightBlue, purple, red } from "./colours/ColourConverters";
import { SeverityColours } from "./colours/SeverityColours";
import { Severity } from "../../types/enums/Severity";
let longestFilename = 0;
const MAX_FILENAME_LENGTH = 50;
const timestampWidth = 10;
const severityWidth = 7;
/**
 * This provides an easy way for the developer to read logs while developing.
 * Nicely formatted logs in your console, rather than well structured data for a server log file.
 * @param log the log object to be logged to stdout
 */
export const DevelopmentPresenter: LogPresenter = async (log) => {
  if (log.filename.length > longestFilename) {
    longestFilename = Math.min(log.filename.length, MAX_FILENAME_LENGTH);
  }
  const filenameWidth = longestFilename;
  const messages: string[] = [
    log["filename"]
      .split("/")
      .filter((f) => f)
      .join("->")
      .slice(-filenameWidth)
      .padEnd(filenameWidth, "."),
    log.message,
  ];
  await printTimestampedLog(new Date(log.timestamp), log.severity, messages);
};

const printTimestampedLog = async (
  timestamp: Date,
  severity: Severity,
  messages: string[]
) => {
  // linesArray is an array of arrays, where each message has its own array [['message1'],['message2']]
  const linesArray = messages.map((message) => message.split("\n"));
  // gets the message with the most lines lineCount
  const lineCount = Math.max(...linesArray.map((lines) => lines.length), 1);
  // if multiline, print the date as well as the time for the timestamp
  const timestamps = centerMultilineLog(
    lineCount === 1
      ? [timestamp.toLocaleTimeString()]
      : [timestamp.toLocaleTimeString(), timestamp.toLocaleDateString()],
    lineCount,
    timestampWidth
  );
  let severities = centerMultilineLog(
    [
      (SeverityColours.get(severity) ?? red)(
        `${severity.padEnd(severityWidth, " ")}`
      ),
    ],
    lineCount
  );
  severities = centerMultilineLog([severity], lineCount, severityWidth);
  let output = "";
  for (let index = 0; index < lineCount; index++) {
    output +=
      [
        purple(timestamps[index]),
        severities[index],
        ...linesArray.map(
          (lines) => centerMultilineLog(lines, lineCount)[index]
        ),
      ].join(lightBlue(" | ")) + "\n";
  }
  await new Promise((resolve) => process.stdout.write(output, resolve));
};

/**
 * Centers a single line in a multiline output. Takes a single line to output and returns an array of lines.
 * @param output an array of lines to center. Must have length less than or equal to lineCount.
 * @param lineCount the number of lines in total in which to center this output string.
 * @param minWidth (optional) the minimum number of characters of this column
 */
const centerMultilineLog = (
  output: string[],
  lineCount: number,
  minWidth?: number
): string[] => {
  if (output.length > lineCount)
    throw new Error("Can't have more lines than line count");
  const visibleOutput = output
    .map((out) => out.replace(/\x1b\[[0-9;]*?m/g, "").trimEnd())
    .filter((s) => s.length);

  const longestVisibleOutput = Math.max(
    ...visibleOutput.map((v) => v.length),
    minWidth ?? 0
  );
  // if the top and bottom lines are empty, fill them with a line
  const startGap = Math.ceil((lineCount - visibleOutput.length) / 2);
  const lines = Array(startGap).fill(" ".repeat(longestVisibleOutput));
  const lengthToEndLog = lines.push(
    ...output.map((o) => o.padEnd(longestVisibleOutput, " "))
  );
  lines.push(
    ...Array(lineCount - lengthToEndLog).fill(" ".repeat(longestVisibleOutput))
  );
  if (lineCount - output.length >= 2) {
    const lineString = "=".repeat(longestVisibleOutput);
    lines[0] = lineString;
    lines[lines.length - 1] = lineString;
  }
  return lines;
};
