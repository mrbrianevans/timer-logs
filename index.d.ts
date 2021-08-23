import { PostgresError } from "./types/dataStructures/Errors";
import { Config } from "./types/dataStructures/Config";
import { Severity } from "./types/enums/Severity";
export default class Timer {
    private readonly startTime;
    private finishTime?;
    private mostRecentlyStartedLabel?;
    private readonly savedTimes;
    private readonly splitFilePath;
    private readonly filename;
    private readonly uniqueId;
    private readonly label;
    private readonly details;
    private readonly loggerName;
    private readonly logClass;
    private readonly omitStackTrace;
    private readonly environment;
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
     * Log a message at INFO severity level.
     */
    info(message: string, ...messages: any[]): void;
    /**
     * Log a message at WARNING severity level.
     */
    warn(message: string, ...messages: any[]): void;
    /**
     * Log a message at ALERT severity level.
     */
    alert(message: string, ...messages: any[]): void;
    /**
     * Log a tagged template literal.
     */
    tlog(strings: TemplateStringsArray, ...values: any[]): void;
    /**
     * A tagged template literal to print out a SQL query.
     */
    tsql(strings: TemplateStringsArray, ...values: any[]): void;
    /**
     * Logs a custom error message in a separate log to the main Timer
     * @param message the string to log
     */
    customError(message: string): void;
    /**
     * Logs a postgres error message in a separate log to the main Timer.
     *
     * @param e the error object returned by postgres client
     * @return null so the promise resolves to a value
     * @example
     * const result = await pool.query('SELECT NOW()',[])
     *                            .catch(e=>timer.postgresError(e))
     */
    postgresError(e: PostgresError): null;
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
    postgresErrorReturn<ReturnType>(returnValue: ReturnType): (e: PostgresError) => ReturnType;
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
     * await new Promise((resolve => setTimeout(resolve, 50)))
     * .then(()=> {
     *    throw new Error('Unexpected error occured')
     * }).catch(timer.genericErrorCustomMessage('A better explanation for what caused this error'))
     */
    genericErrorCustomMessage(message: string): (e: Error) => void;
    private consoleLog;
    /**
     * Logs a postgres error and returns the value passed as the second parameter.
     *
     * @param e the postgres error object
     * @param returnVal the value for this function to return after logging the error
     * @private
     */
    private _postgresError;
    /**
     * Internal printing method which makes sure all of the properties are printed with each log.
     *
     * @param details object of
     * @param severity
     * @private
     */
    private printLog;
}
