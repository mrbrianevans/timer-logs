import { LogPresenter } from "../../types/interfaces/LogPresenter";

/**
 * This provides an easy way for the developer to read logs while developing.
 * Nicely formatted logs in your console, rather than well structured data for a server log file.
 * @param log the log object to be logged to stdout
 */
export const DevelopmentPresenter: LogPresenter = (log) => {
  console.log(log);
  return Promise.resolve();
};
