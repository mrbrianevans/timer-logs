"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const Environment_1 = require("./types/enums/Environment");
const Severity_1 = require("./types/enums/Severity");
const BrowserPresenter_1 = require("./src/presenters/BrowserPresenter");
const DevelopmentPresenter_1 = require("./src/presenters/DevelopmentPresenter");
const ProductionPresenter_1 = require("./src/presenters/ProductionPresenter");
const sqlPresenter_1 = require("./src/presenters/sqlPresenter");
class Timer {
    constructor(config) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        this.startTime = Date.now();
        this.details = (_a = config.details) !== null && _a !== void 0 ? _a : {};
        this.loggerName = (_b = config.loggerName) !== null && _b !== void 0 ? _b : "timer-logs";
        this.filename = config.filename;
        this.splitFilePath = config.filename.split("/").filter((p) => p.length > 0);
        this.label = (_c = config.label) !== null && _c !== void 0 ? _c : this.splitFilePath.slice(-1)[0].split(".")[0];
        this.savedTimes = {};
        this.logClass = (_d = config.logClass) !== null && _d !== void 0 ? _d : this.splitFilePath.slice(-1)[0].split(".")[0];
        this.omitStackTrace = (_e = config.omitStackTrace) !== null && _e !== void 0 ? _e : false;
        this._severity = Severity_1.Severity[(_f = config.severity) !== null && _f !== void 0 ? _f : Severity_1.Severity.DEFAULT];
        this.uniqueId = crypto.randomBytes(8).toString("hex");
        this.start("operationTime");
        this.start(this.label);
        if (typeof window !== "undefined")
            this.environment = Environment_1.Environment.BROWSER;
        else {
            const coalescedEnv = (_j = (_h = (_g = config.environment) !== null && _g !== void 0 ? _g : process.env.LOGGING_ENV) !== null && _h !== void 0 ? _h : process.env.NODE_ENV) !== null && _j !== void 0 ? _j : "production";
            switch (coalescedEnv) {
                case "browser":
                    this.environment = Environment_1.Environment.BROWSER;
                    break;
                case "development":
                    this.environment = Environment_1.Environment.DEVELOPMENT;
                    break;
                case "production":
                default:
                    this.environment = Environment_1.Environment.PRODUCTION;
                    break;
            }
        }
    }
    set severity(value) {
        this._severity = value;
    }
    start(label) {
        console.assert(!this.savedTimes.hasOwnProperty(label), "Timer started more than once for same label");
        console.assert(label !== "message", "Label cannot be called message. Reserved by default");
        console.assert(label !== "severity", "Label cannot be called severity. Reserved by default");
        this.mostRecentlyStartedLabel = label;
        this.savedTimes[label] = { startTime: Date.now() };
        const _stop = () => {
            return this.stop(label);
        };
        return {
            stop: _stop,
        };
    }
    stop(label) {
        console.assert(this.savedTimes.hasOwnProperty(label), "Timer stopped for unstarted label. Missing timer.start()");
        console.assert(this.savedTimes[label].finishTime === undefined, "Stop called more than once for same label");
        const finishTime = Date.now();
        this.savedTimes[label].finishTime = finishTime;
        this.savedTimes[label].time = finishTime - this.savedTimes[label].startTime;
        return this.savedTimes[label].time;
    }
    next(label) {
        if (!this.mostRecentlyStartedLabel) {
            console.error("Next called before a timer was started");
            return;
        }
        this.stop(this.mostRecentlyStartedLabel);
        this.start(label);
    }
    end() {
        if (this.mostRecentlyStartedLabel)
            return this.stop(this.mostRecentlyStartedLabel);
    }
    flush() {
        this.finishTime = Date.now();
        this.stop("operationTime");
        if (this.mostRecentlyStartedLabel &&
            !this.savedTimes[this.mostRecentlyStartedLabel].finishTime)
            this.end();
        const printObject = {
            message: this.label + `: ${this.finishTime - this.startTime}ms`,
        };
        const printMap = new Map(Object.entries(printObject));
        Object.entries(this.savedTimes).forEach(([label, times]) => {
            if (typeof times.time === "number")
                printMap.set(label, times.time);
        });
        if (this.details)
            Object.entries(this.details).forEach(([label, detail]) => {
                printMap.set(label, detail);
            });
        this.printLog(printMap, this._severity);
        return this.finishTime - this.startTime;
    }
    addDetail(key, value = true) {
        Object.assign(this.details, { [key]: value });
    }
    addDetails(details) {
        Object.assign(this.details, details);
    }
    getTimeUntilNow() {
        return Date.now() - this.startTime;
    }
    info(message, ...messages) {
        const concatenatedMessage = [message]
            .concat(messages === null || messages === void 0 ? void 0 : messages.map((m) => m.toString()))
            .join(" ");
        this.printLog(new Map([["message", concatenatedMessage]]), Severity_1.Severity.INFO);
    }
    warn(message, ...messages) {
        const concatenatedMessage = [message]
            .concat(messages === null || messages === void 0 ? void 0 : messages.map((m) => m.toString()))
            .join(" ");
        this.printLog(new Map([["message", concatenatedMessage]]), Severity_1.Severity.WARNING);
    }
    alert(message, ...messages) {
        const concatenatedMessage = [message]
            .concat(messages === null || messages === void 0 ? void 0 : messages.map((m) => m.toString()))
            .join(" ");
        this.printLog(new Map([["message", concatenatedMessage]]), Severity_1.Severity.ALERT);
    }
    tlog(strings, ...values) {
        const message = strings
            .flatMap((s, i) => [s, i < values.length && sqlPresenter_1.valueToString(values[i])].filter((s) => s))
            .join("");
        this.printLog(new Map(Object.entries({
            message,
        })), Severity_1.Severity.INFO);
    }
    tsql(strings, ...values) {
        const queryText = strings.reduce((query, phrase, index) => index < values.length
            ? `${query} ${phrase}$${index + 1}`
            : `${query} ${phrase}`, "");
        if (this.environment === Environment_1.Environment.DEVELOPMENT)
            console.log(sqlPresenter_1.PresentSql(queryText, values));
    }
    customError(message) {
        const errorDetails = new Map(Object.entries({ message }));
        this.printLog(errorDetails, Severity_1.Severity.ERROR);
    }
    postgresError(e) {
        return this._postgresError(e, null);
    }
    postgresErrorReturn(returnValue) {
        return (e) => this._postgresError(e, returnValue);
    }
    genericError(e, message) {
        const errorDetails = new Map([["errorName", e.name]]);
        if (!this.omitStackTrace && e.stack)
            errorDetails.set("stackTrace", e.stack);
        if (message) {
            errorDetails.set("message", message);
            errorDetails.set("errorMessage", e.message);
        }
        else
            errorDetails.set("message", e.message);
        this.printLog(errorDetails, Severity_1.Severity.ERROR);
    }
    genericErrorCustomMessage(message) {
        return (e) => this.genericError(e, message);
    }
    consoleLog(logObject) {
        let logPresenter;
        switch (this.environment) {
            case Environment_1.Environment.BROWSER:
                logPresenter = BrowserPresenter_1.BrowserPresenter;
                break;
            case Environment_1.Environment.DEVELOPMENT:
                logPresenter = DevelopmentPresenter_1.DevelopmentPresenter;
                break;
            case Environment_1.Environment.PRODUCTION:
                logPresenter = ProductionPresenter_1.ProductionPresenter;
                break;
            default:
                logPresenter = ProductionPresenter_1.ProductionPresenter;
                break;
        }
        logPresenter(logObject);
    }
    _postgresError(e, returnVal) {
        const errorDetails = new Map(Object.entries(e));
        if (!errorDetails.has("message"))
            errorDetails.set("message", "Postgres error code " + e.code);
        errorDetails.set("databaseType", "postgres");
        this.printLog(errorDetails, Severity_1.Severity.ERROR);
        return returnVal;
    }
    printLog(details, severity) {
        var _a, _b;
        let detailsMessage = (_a = details.get("message")) === null || _a === void 0 ? void 0 : _a.toString();
        const message = details.has("message") && detailsMessage
            ? detailsMessage
            : "timer-logs: message not set";
        const log = {
            severity: severity,
            filename: this.filename,
            logClass: (_b = this.logClass) !== null && _b !== void 0 ? _b : this.splitFilePath.slice(-1)[0].split(".")[0],
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
exports.default = Timer;
