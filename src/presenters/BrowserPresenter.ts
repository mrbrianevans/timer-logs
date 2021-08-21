import { LogPresenter } from "../../types/interfaces/LogPresenter";
import { Severity } from "../../types/enums/Severity";

/**
 * Logging optimised for the browser dev tools console.
 *
 * @param log the log to be logged to the browser dev tools console.
 */
export const BrowserPresenter: LogPresenter = (log) => {
  const logString: string = JSON.stringify(log);
  const severity: Severity = log.severity ?? Severity.DEFAULT;
  // this affects how logs are printed in the browser
  switch (severity) {
    case Severity.DEBUG:
      console.debug(logString);
      break;
    case Severity.DEFAULT:
      console.log(logString);
      break;
    case Severity.INFO:
    case Severity.NOTICE:
      console.info(logString);
      break;
    case Severity.WARNING:
      console.warn(logString);
      break;
    case Severity.ERROR:
    case Severity.CRITICAL:
    case Severity.ALERT:
    case Severity.EMERGENCY:
      console.error(logString);
      break;
    default:
      console.log(logString);
  }
  return Promise.resolve();
};
