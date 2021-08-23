import { LogPresenter } from "../../types/interfaces/LogPresenter";

/**
 * JSON formatted string log output, suitable for logging on Google Cloud.
 *
 * @param log the log object to be logged to stdout
 */
export const ProductionPresenter: LogPresenter = async (log) => {
  const logString: string = JSON.stringify(log) + "\n";
  await new Promise((resolve) => process.stdout.write(logString, resolve));
};
