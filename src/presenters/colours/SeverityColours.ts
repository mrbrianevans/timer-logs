import { Severity } from "../../../types/enums/Severity";
import { ColourConverter } from "../../../types/interfaces/ColourConverter";
import { lightBlue, orange, pink, red } from "./ColourConverters";

export const SeverityColours = new Map<Severity, ColourConverter>([
  [Severity.DEFAULT, lightBlue],
  [Severity.DEBUG, pink],
  [Severity.INFO, lightBlue],
  [Severity.NOTICE, lightBlue],
  [Severity.WARNING, orange],
  [Severity.ERROR, red],
  [Severity.CRITICAL, red],
  [Severity.ALERT, red],
  [Severity.EMERGENCY, red],
]);
