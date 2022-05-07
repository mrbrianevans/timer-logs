import * as crypto from "crypto";
import type { PostgresError } from "./types/dataStructures/Errors";
import type { Config } from "./types/dataStructures/Config.js";
import { Environment } from "./types/enums/Environment.js";
import type { GenericLog, LogDetails } from "./types/dataStructures/Logs";
import { Severity } from "./types/enums/Severity.js";
import { BrowserPresenter } from "./src/presenters/BrowserPresenter.js";
import { DevelopmentPresenter } from "./src/presenters/DevelopmentPresenter.js";
import { ProductionPresenter } from "./src/presenters/ProductionPresenter.js";
import { PresentSql, valueToString } from "./src/presenters/sqlPresenter.js";
import type { LogPresenter } from "./types/interfaces/LogPresenter";

export class Timer {
  private readonly startTime: number;
  private finishTime?: number;
  private mostRecentlyStartedLabel?: string;
  private readonly savedTimes: {
    [label: string]: { startTime: number; finishTime?: number; time?: number };
  };
  private readonly splitFilePath: string[];
  private readonly filename: string;
  private readonly uniqueId: string;
  private readonly label: string;
  private readonly details: LogDetails;
  private readonly loggerName: string;
  private readonly logClass: string;
  private readonly omitStackTrace: boolean;
  private readonly environment: Environment;

  /**
   * Create a new Timer object. Can have multiple timers within this object.
   * Should only have one of these per file. Creating this object beings a timer automatically
   * @param config required configuration object, requires filename, others are optional
   */
  constructor(config: Config) {
    this.startTime = Date.now();
    this.details = config.details ?? {};
    this.loggerName = config.loggerName ?? "timer-logs";
    this.filename = config.filename;
    this.splitFilePath = config.filename.split("/").filter((p) => p.length > 0);
    this.label = config.label ?? this.splitFilePath.slice(-1)[0].split(".")[0];
    this.savedTimes = {};
    this.logClass =
      config.logClass ?? this.splitFilePath.slice(-1)[0].split(".")[0];
    this.omitStackTrace = config.omitStackTrace ?? false;
    this._severity = Severity[config.severity ?? Severity.DEFAULT];
    this.uniqueId = crypto.randomBytes(8).toString("hex");
    this.start("operationTime");
    this.start(this.label);
    // set the environment
    if (typeof window !== "undefined") this.environment = Environment.BROWSER;
    else {
      const coalescedEnv =
        config.environment ??
        process.env.LOGGING_ENV ??
        process.env.NODE_ENV ??
        "production";
      switch (coalescedEnv) {
        case "browser":
          this.environment = Environment.BROWSER;
          break;
        case "development":
          this.environment = Environment.DEVELOPMENT;
          break;
        case "production":
          this.environment = Environment.PRODUCTION;
          break;
        default:
          console.log(
            `Invalid logging environment '${coalescedEnv}', using 'production' instead.`
          );
          this.environment = Environment.PRODUCTION;
          break;
      }
    }
  }

  private _severity: Severity;

  set severity(value: Severity) {
    this._severity = value;
  }

  /**
   * Start a new timer
   * @param label the label of the timer. this will be console logged on flush()
   * @return object which can be used to stop the timer without its label
   */
  public start(label: string) {
    console.assert(
      !this.savedTimes.hasOwnProperty(label),
      "Timer started more than once for same label"
    );
    console.assert(
      label !== "message",
      "Label cannot be called message. Reserved by default"
    );
    console.assert(
      label !== "severity",
      "Label cannot be called severity. Reserved by default"
    );
    this.mostRecentlyStartedLabel = label;
    this.savedTimes[label] = { startTime: Date.now() };
    /**
     * Stops the timer and saves the time taken
     */
    const _stop = () => {
      return this.stop(label);
    };
    return {
      stop: _stop,
    };
  }

  /**
   * Stops a timer and saves the time taken
   * @param label the label of the timer you wish to stop
   */
  public stop(label: string) {
    console.assert(
      this.savedTimes.hasOwnProperty(label),
      "Timer stopped for unstarted label. Missing timer.start()"
    );
    console.assert(
      this.savedTimes[label].finishTime === undefined,
      "Stop called more than once for same label"
    );
    const finishTime = Date.now();
    this.savedTimes[label].finishTime = finishTime;
    this.savedTimes[label].time = finishTime - this.savedTimes[label].startTime;
    return this.savedTimes[label].time;
  }

  /**
   * Stops the most recently started timer, and starts a new one
   * @param label for new timer started
   * @example
   * timer.start('label1')
   * await new Promise()
   * timer.next('label2')
   * await new Promise()
   * timer.next('label3')
   * await new Promise()
   * timer.end()
   */
  public next(label: string) {
    if (!this.mostRecentlyStartedLabel) {
      console.error("Next called before a timer was started");
      return;
    }
    this.stop(this.mostRecentlyStartedLabel);
    this.start(label);
  }

  /**
   * stops the most recently started timer
   */
  public end() {
    if (this.mostRecentlyStartedLabel)
      return this.stop(this.mostRecentlyStartedLabel);
  }

  /**
   * Prints times to the console in JSON format for Google Cloud Logging.
   *
   * Will end the most recently started timer if not already ended
   */
  public flush() {
    this.finishTime = Date.now();
    this.stop("operationTime");
    if (
      this.mostRecentlyStartedLabel &&
      !this.savedTimes[this.mostRecentlyStartedLabel].finishTime
    )
      this.end();
    const printObject: { [label: string]: string | number | boolean } = {
      message: this.label + `: ${this.finishTime - this.startTime}ms`,
    };
    const printMap = new Map(Object.entries(printObject));
    Object.entries(this.savedTimes).forEach(([label, times]) => {
      if (typeof times.time === "number") printMap.set(label, times.time);
    });
    if (this.details)
      Object.entries(this.details).forEach(([label, detail]) => {
        printMap.set(label, detail);
      });
    this.printLog(printMap, this._severity);
    return this.finishTime - this.startTime;
  }

  /**
   * Adds a detail to the JSON of the log.
   *
   * @param key the key to log in the JSON
   * @param value (optional) value for the key. Defaults to true
   */
  public addDetail(key: string, value: string | number | boolean = true) {
    Object.assign(this.details, { [key]: value });
  }

  /**
   * Adds multiple details to the JSON of the log.
   *
   * @param details an object of key value pairs to log
   */
  public addDetails(details: { [key: string]: string | number | boolean }) {
    Object.assign(this.details, details);
  }

  /**
   * Returns the time elapsed since creating this timer in milliseconds
   */
  public getTimeUntilNow() {
    return Date.now() - this.startTime;
  }

  /**
   * Log a message at INFO severity level.
   */
  public info(message: string, ...messages: any[]) {
    const concatenatedMessage = [message]
      .concat(messages?.map((m) => m.toString()))
      .join(" ");
    this.printLog(new Map([["message", concatenatedMessage]]), Severity.INFO);
  }

  /**
   * Log a message at WARNING severity level.
   */
  public warn(message: string, ...messages: any[]) {
    const concatenatedMessage = [message]
      .concat(messages?.map((m) => m.toString()))
      .join(" ");
    this.printLog(
      new Map([["message", concatenatedMessage]]),
      Severity.WARNING
    );
  }

  /**
   * Log a message at ALERT severity level.
   */
  public alert(message: string, ...messages: any[]) {
    const concatenatedMessage = [message]
      .concat(messages?.map((m) => m.toString()))
      .join(" ");
    this.printLog(new Map([["message", concatenatedMessage]]), Severity.ALERT);
  }

  /**
   * Log a tagged template literal.
   */
  public tlog(strings: TemplateStringsArray, ...values: any[]) {
    const message = strings
      .flatMap((s, i) =>
        [s, i < values.length && valueToString(values[i])].filter((s) => s)
      )
      .join("");
    this.printLog(
      new Map(
        Object.entries({
          message,
        })
      ),
      Severity.INFO
    );
  }

  /**
   * A tagged template literal to print out a SQL query.
   */
  public tsql(strings: TemplateStringsArray, ...values: any[]) {
    const queryText = strings.reduce(
      (query, phrase, index) =>
        index < values.length
          ? `${query} ${phrase}$${index + 1}`
          : `${query} ${phrase}`,
      ""
    );
    if (this.environment === Environment.DEVELOPMENT) {
      const logMap = new Map();
      logMap.set("message", PresentSql(queryText, values));
      this.printLog(logMap, Severity.DEBUG);
    }
  }

  /**
   * Logs a custom error message in a separate log to the main Timer
   * @param message the string to log
   */
  public customError(message: string) {
    const errorDetails = new Map(Object.entries({ message }));
    this.printLog(errorDetails, Severity.ERROR);
  }

  /**
   * Logs a postgres error message in a separate log to the main Timer.
   *
   * @param e the error object returned by postgres client
   * @return null so the promise resolves to a value
   * @example
   * const result = await pool.query('SELECT NOW()',[])
   *                            .catch(e=>timer.postgresError(e))
   */
  public postgresError(e: PostgresError): null {
    return this._postgresError(e, null);
  }

  /**
   * Convenience wrapper for postgresError, to return a value.
   * By default it returns null, but can be overriden with this method.
   * This is useful if you want your promise to resolve to a default value
   * in case of an error.
   * @param returnValue the value to return
   * @example
   * const { rows } = await pool.query('SELECT NOW()',[])
   *                            .catch(e=>timer.postgresErrorReturn({rows:[]}))
   */
  public postgresErrorReturn<ReturnType>(
    returnValue: ReturnType
  ): (e: PostgresError) => ReturnType {
    return (e: PostgresError) => this._postgresError(e, returnValue);
  }

  /**
   * Logs a generic error in a separate log to the main Timer.
   *
   * @param e the error that has been thrown
   * @param message an optional custom message giving context to the error
   * This can be called after any catching any error, like this:
   * @example
   * try{
   *   // code that could throw an error
   * }catch(e){
   *   timer.genericError(e)
   * }
   * @example
   * await asynchronousFunction()
   *        .then()
   *        .catch(e=>timer.genericError(e))
   */
  public genericError(e: Error | unknown, message?: string) {
    const errorDetails = new Map();
    if (e instanceof Error) {
      errorDetails.set("errorName", e.name);
      if (!this.omitStackTrace && e.stack)
        errorDetails.set("stackTrace", e.stack);
      if (message) {
        errorDetails.set("message", message);
        errorDetails.set("errorMessage", e.message);
      } else errorDetails.set("message", e.message);
    } else {
      switch (typeof e) {
        case "object":
          if (e !== null)
            for (const eKey in e)
              errorDetails.set(eKey, String(e[eKey as keyof typeof e]));
          break;
        default:
          errorDetails.set("error", String(e));
      }
    }

    this.printLog(errorDetails, Severity.ERROR);
  }

  /**
   * Logs any type of Error in a separate log to the main Timer.
   *
   * This is a convenience wrapper on `genericError` to allow you to add a custom message,
   * and still use in a promise catch clause.
   * @param message custom message to log with error.
   *
   * @example
   * await new Promise((resolve => setTimeout(resolve, 50)))
   * .then(()=> {
   *    throw new Error('Unexpected error occured')
   * }).catch(timer.genericErrorCustomMessage('A better explanation for what caused this error'))
   */
  public genericErrorCustomMessage(message: string) {
    return (e: Error) => this.genericError(e, message);
  }

  private consoleLog(logObject: GenericLog) {
    let logPresenter: LogPresenter;
    switch (this.environment) {
      case Environment.BROWSER:
        logPresenter = BrowserPresenter;
        break;
      case Environment.DEVELOPMENT:
        logPresenter = DevelopmentPresenter;
        break;
      case Environment.PRODUCTION:
        logPresenter = ProductionPresenter;
        break;
      default:
        logPresenter = ProductionPresenter;
        break;
    }
    // todo: this should be asynchronous await
    logPresenter(logObject);
  }

  /**
   * Logs a postgres error and returns the value passed as the second parameter.
   *
   * @param e the postgres error object
   * @param returnVal the value for this function to return after logging the error
   * @private
   */
  private _postgresError<ReturnType>(
    e: PostgresError,
    returnVal: ReturnType
  ): ReturnType {
    const errorDetails = new Map(Object.entries(e));
    if (!errorDetails.has("message"))
      errorDetails.set("message", "Postgres error code " + e.code);
    errorDetails.set("databaseType", "postgres");
    this.printLog(errorDetails, Severity.ERROR);
    return returnVal;
  }

  /**
   * Internal printing method which makes sure all of the properties are printed with each log.
   *
   * @param details object of
   * @param severity
   * @private
   */
  private printLog(
    details: Map<string, string | number | boolean | null | undefined>,
    severity: Severity
  ) {
    let detailsMessage = details.get("message")?.toString();
    // this should never be triggered. Always pass a message in the details map. Just a backup:
    const message =
      details.has("message") && detailsMessage
        ? detailsMessage
        : "timer-logs: message not set";
    const log: GenericLog = {
      severity: severity,
      filename: this.filename,
      logClass: this.logClass ?? this.splitFilePath.slice(-1)[0].split(".")[0],
      loggerName: this.loggerName,
      uniqueId: this.uniqueId,
      timestamp: new Date().toUTCString(),
      message,
    };
    details.forEach((value, key) => {
      log[key] = value;
    });
    this.splitFilePath.forEach((filePath, level) => {
      log[`FilePathDepth${level + 1}`] = filePath;
    });
    this.consoleLog(log);
  }
}
