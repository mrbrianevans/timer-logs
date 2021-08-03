declare type Config = {
    /**
     * the severity of the log, defaults to DEFAULT
     */
    severity?: 'DEFAULT' | 'DEBUG' | 'INFO' | 'NOTICE' | 'WARNING' | 'ERROR' | 'CRITICAL' | 'ALERT' | 'EMERGENCY';
    /**
     * the label of the log. gets printed in the google cloud summary message
     */
    label?: string;
    /**
     * any key-value pairs to include in the console log
     */
    details?: {
        [key: string]: string | number;
    };
    /** filename of the typescript source file where the log is coming from */
    filename: string;
    /**
     * This will be printed on all log output, to distinguish logs output by this library from other logging in
     * your application. Its possible but not recommended to override it in the config.
     */
    loggerName?: 'timer-logs logger';
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
};
declare enum Severity {
    DEFAULT = "DEFAULT",
    DEBUG = "DEBUG",
    INFO = "INFO",
    NOTICE = "NOTICE",
    WARNING = "WARNING",
    ERROR = "ERROR",
    CRITICAL = "CRITICAL",
    ALERT = "ALERT",
    EMERGENCY = "EMERGENCY"
}
export default class Timer {
    private readonly startTime;
    private finishTime?;
    private mostRecentlyStartedLabel?;
    private config;
    private readonly savedTimes;
    private splitFilePath;
    private readonly uniqueId;
    /**
     * Create a new Timer object. Can have multiple timers within this object.
     * Should only have one of these per file. Creating this object beings a timer automatically
     * @param config required configuration object, requires filename, others are optional
     */
    constructor(config: Config);
    private _severity;
    set severity(value: Severity);
    /**
     * Start a new timer
     * @param label the label of the timer. this will be console logged on flush()
     * @return object which can be used to stop the timer without its label
     */
    start(label: string): {
        stop: () => number | undefined;
    };
    /**
     * Stops a timer and saves the time taken
     * @param label the label of the timer you wish to stop
     */
    stop(label: string): number | undefined;
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
    next(label: string): void;
    /**
     * stops the most recently started timer
     */
    end(): number | undefined;
    /**
     * Prints times to the console in JSON format for Google Cloud Logging.
     *
     * Will end the most recently started timer if not already ended
     */
    flush(): number;
    /**
     * Adds a detail to the JSON of the log.
     *
     * @param key the key to log in the JSON
     * @param value (optional) value for the key. Defaults to true
     */
    addDetail(key: string, value?: string | number | boolean): void;
    /**
     * Adds multiple details to the JSON of the log.
     *
     * @param details an object of key value pairs to log
     */
    addDetails(details: {
        [key: string]: string | number | boolean;
    }): void;
    /**
     * Returns the time elapsed since creating this timer in milliseconds
     */
    getTimeUntilNow(): number;
    /**
     * Logs a custom error message in a separate log to the main Timer
     * @param message the string to log
     */
    customError(message: string): void;
    /**
     * Logs a postgres error message in a separate log to the main Timer.
     *
     * @param e the error object returned by postgres client
     *
     * @example
     * const { rows } = await pool.query('SELECT NOW()',[])
     *                            .catch(e=>timer.postgresError(e))
     */
    postgresError(e: PostgresError): void;
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
     *        .catch(timer.genericError)
     */
    genericError(e: Error, message?: string): void;
    /**
     * Logs any type of Error in a separate log to the main Timer.
     *
     * This is a convenience wrapper on `genericError` to allow you to add a custom message,
     * and still use in a promise catch clause.
     * @param message custom message to log with error.
     *
     * @example
     * await new Promise
     */
    genericErrorCustomMessage(message: string): (e: Error) => void;
    /**
     * Internal printing method which makes sure all of the properties are printed with each log.
     *
     * @param details object of
     * @param severity
     * @private
     */
    private printLog;
}
/**
 * Postgres error type thrown by pg library
 */
declare type PostgresError = {
    message: string;
    errno: string;
    length: number;
    name: string;
    severity: string;
    code: string;
    detail?: string;
    hint?: string;
    position: string;
    internalPosition?: string;
    internalQuery?: string;
    where?: string;
    schema?: string;
    table?: string;
    column?: string;
    dataType?: string;
    constraint?: string;
    file: string;
    line: string;
    routine: string;
};
export {};
