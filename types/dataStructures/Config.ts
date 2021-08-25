import { LogDetails } from "./Logs";

export interface Config {
  /**
   * the severity of the log, defaults to DEFAULT
   */
  severity?:
    | "DEFAULT"
    | "DEBUG"
    | "INFO"
    | "NOTICE"
    | "WARNING"
    | "ERROR"
    | "CRITICAL"
    | "ALERT"
    | "EMERGENCY";
  /**
   * the label of the log. gets printed in the google cloud summary message
   */
  label?: string;
  /**
   * any key-value pairs to include in the console log
   */
  details?: LogDetails;
  /** filename of the typescript source file where the log is coming from */
  filename: string;
  /**
   * This will be printed on all log output, to distinguish logs output by this library from other logging in
   * your application. Its possible but not recommended to override it in the config.
   */
  loggerName?: string;
  /**
   * This will be printed on all log output from the instance configured with it, to help identify where a log has
   * come from, or what it relates to. This is mostly useful if you have
   * multiple instances of this class in a single file. Otherwise the file acts as an identifier.
   */
  logClass?: string;
  /**
   * Omit the stack trace from error logging. (still prints the provided file path)
   */
  omitStackTrace?: boolean;
  /**
   * Override the environment setting for this logging instance.
   *
   * This can be set at an environment level with the LOGGING_ENV or NODE_ENV environment variable.
   *
   * Order of precedence: config value > LOGGING_ENV > NODE_ENV > 'production' default
   *
   * Changes the way logs are printed.
   */
  environment?: "development" | "production" | "browser";
}
