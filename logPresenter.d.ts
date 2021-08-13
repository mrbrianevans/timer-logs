/**
 * This offers a different way of printing logs, designed for a development environment.
 * Rather than printing JSON objects, it formats them in an easier to read manner.
 * This makes them bad for analysis in a tool like Elastic, but good for a developer to quickly see changes.
 */
import { GenericLog } from "./index";
/**
 * This provides an easy way for the developer to read logs while developing.
 * Nicely formatted logs in your console, rather than well structured data for a server log file.
 * @param log the log object to be logged to stdout
 */
export declare function developerLogPresenter(log: GenericLog): void;
/**
 * JSON formatted string log output, suitable for logging on Google Cloud.
 *
 * @param log the log object to be logged to stdout
 */
export declare function productionLogPresenter(log: GenericLog): void;
/**
 * Logging optimised for the browser dev tools console.
 *
 * @param log the log to be logged to the browser dev tools console.
 */
export declare function browserLogPresenter(log: GenericLog): void;
