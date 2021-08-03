"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
var Severity;
(function (Severity) {
    Severity["DEFAULT"] = "DEFAULT";
    Severity["DEBUG"] = "DEBUG";
    Severity["INFO"] = "INFO";
    Severity["NOTICE"] = "NOTICE";
    Severity["WARNING"] = "WARNING";
    Severity["ERROR"] = "ERROR";
    Severity["CRITICAL"] = "CRITICAL";
    Severity["ALERT"] = "ALERT";
    Severity["EMERGENCY"] = "EMERGENCY";
})(Severity || (Severity = {}));
class Timer {
    constructor(config) {
        var _a, _b;
        this.startTime = Date.now();
        this.config = config;
        this.config.details = (_a = config === null || config === void 0 ? void 0 : config.details) !== null && _a !== void 0 ? _a : {};
        this.splitFilePath = config.filename.split('/').filter(p => p.length > 0);
        this.savedTimes = {};
        this._severity = Severity[(_b = this.config.severity) !== null && _b !== void 0 ? _b : Severity.DEFAULT];
        if (this.config.label === undefined)
            this.config.label = this.splitFilePath.slice(-1)[0].split('.')[0];
        this.uniqueId = crypto.randomBytes(8).toString('hex');
        this.start(this.config.label);
    }
    set severity(value) {
        this._severity = value;
    }
    start(label) {
        console.assert(!this.savedTimes.hasOwnProperty(label), 'Timer started more than once for same label');
        console.assert(label !== 'message', 'Label cannot be called message. Reserved by default');
        console.assert(label !== 'severity', 'Label cannot be called severity. Reserved by default');
        this.mostRecentlyStartedLabel = label;
        this.savedTimes[label] = { startTime: Date.now() };
        const _stop = () => {
            return this.stop(label);
        };
        return {
            stop: _stop
        };
    }
    stop(label) {
        console.assert(this.savedTimes.hasOwnProperty(label), 'Timer stopped for unstarted label. Missing timer.start()');
        console.assert(this.savedTimes[label].finishTime === undefined, 'Stop called more than once for same label');
        const finishTime = Date.now();
        this.savedTimes[label].finishTime = finishTime;
        this.savedTimes[label].time = finishTime - this.savedTimes[label].startTime;
        return this.savedTimes[label].time;
    }
    next(label) {
        if (!this.mostRecentlyStartedLabel) {
            console.error('Next called before a timer was started');
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
        if (this.mostRecentlyStartedLabel && !this.savedTimes[this.mostRecentlyStartedLabel].finishTime)
            this.end();
        const printObject = {
            message: this.config.label + `: ${this.finishTime - this.startTime}ms`
        };
        const printMap = new Map(Object.entries(printObject));
        Object.entries(this.savedTimes)
            .forEach(([label, times]) => {
            if (typeof times.time === 'number')
                printMap.set(label, times.time);
        });
        if (this.config.details)
            Object.entries(this.config.details).forEach(([label, detail]) => {
                printMap.set(label, detail);
            });
        this.printLog(printMap, this._severity);
        return this.finishTime - this.startTime;
    }
    addDetail(key, value = true) {
        var _a;
        Object.assign((_a = this.config) === null || _a === void 0 ? void 0 : _a.details, { [key]: value });
    }
    addDetails(details) {
        var _a;
        Object.assign((_a = this.config) === null || _a === void 0 ? void 0 : _a.details, details);
    }
    getTimeUntilNow() {
        return Date.now() - this.startTime;
    }
    customError(message) {
        const errorDetails = new Map(Object.entries({ message }));
        this.printLog(errorDetails, Severity.ERROR);
    }
    postgresError(e, returnVal) {
        const errorDetails = new Map(Object.entries(e));
        errorDetails.set("databaseType", "postgres");
        this.printLog(errorDetails, Severity.ERROR);
        return returnVal !== null && returnVal !== void 0 ? returnVal : null;
    }
    postgresErrorReturn(returnValue) {
        return (e) => this.postgresError(e, returnValue);
    }
    genericError(e, message) {
        const errorDetails = new Map([
            ['errorName', e.name]
        ]);
        if (!this.config.omitStackTrace && e.stack)
            errorDetails.set('stackTrace', e.stack);
        if (message) {
            errorDetails.set('message', message);
            errorDetails.set('errorMessage', e.message);
        }
        else
            errorDetails.set('message', e.message);
        this.printLog(errorDetails, Severity.ERROR);
    }
    genericErrorCustomMessage(message) {
        return (e) => this.genericError(e, message);
    }
    printLog(details, severity) {
        var _a;
        const log = {
            severity: severity,
            filename: this.config.filename,
            logClass: (_a = this.config.logClass) !== null && _a !== void 0 ? _a : this.splitFilePath.slice(-1)[0].split('.')[0],
            loggerName: this.config.loggerName,
            uniqueId: this.uniqueId
        };
        details.forEach((value, key) => {
            log[key] = value;
        });
        this.splitFilePath.forEach((filePath, level) => {
            log[`FilePathDepth${level + 1}`] = filePath;
        });
        const logString = JSON.stringify(log);
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
    }
}
exports.default = Timer;
