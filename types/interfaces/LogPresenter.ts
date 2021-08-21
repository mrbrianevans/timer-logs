import { GenericLog } from "../dataStructures/Logs";

export type LogPresenter = (logObject: GenericLog) => Promise<void>;
