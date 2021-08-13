/**
 * This offers a different way of printing logs, designed for a development environment.
 * Rather than printing JSON objects, it formats them in an easier to read manner.
 * This makes them bad for analysis in a tool like Elastic, but good for a developer to quickly see changes.
 */
import {GenericLog, Severity} from "./index";


/**
 * This provides an easy way for the developer to read logs while developing.
 * Nicely formatted logs in your console, rather than well structured data for a server log file.
 * @param log the log object to be logged to stdout
 */
export function developerLogPresenter(log:GenericLog) {
    console.log(log)
}

/**
 * JSON formatted string log output, suitable for logging on Google Cloud.
 *
 * @param log the log object to be logged to stdout
 */
export function productionLogPresenter(log:GenericLog){
    const logString: string = JSON.stringify(log)
    console.log(logString)
}

/**
 * Logging optimised for the browser dev tools console.
 *
 * @param log the log to be logged to the browser dev tools console.
 */
export function browserLogPresenter(log:GenericLog){
    const logString: string = JSON.stringify(log)
    const severity: Severity = log.severity ?? Severity.DEFAULT
    // this affects how logs are printed in the browser
    switch (severity) {
        case Severity.DEBUG:
            console.debug(logString)
            break;
        case Severity.DEFAULT:
            console.log(logString)
            break;
        case Severity.INFO:
        case Severity.NOTICE:
            console.info(logString)
            break;
        case Severity.WARNING:
            console.warn(logString)
            break;
        case Severity.ERROR:
        case Severity.CRITICAL:
        case Severity.ALERT:
        case Severity.EMERGENCY:
            console.error(logString)
            break;
        default:
            console.log(logString)
    }
}