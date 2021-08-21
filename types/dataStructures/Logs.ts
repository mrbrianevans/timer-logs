/**
 * These are attributes that should be set on all log output, regardless of what triggered the log.
 */
import { Severity } from "../enums/Severity";

export type GenericLog = {
  severity: Severity;
  filename: string;
  logClass: string;
  loggerName: string;
  uniqueId: string;
  timestamp: string;
  [label: string]: string | number | boolean | null | undefined;
};
export type LogDetails = { [key: string]: string | number | boolean };
