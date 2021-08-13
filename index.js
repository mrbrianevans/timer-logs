"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Severity = void 0;
const crypto = require("crypto");
const logPresenter_1 = require("./logPresenter");
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
})(Severity = exports.Severity || (exports.Severity = {}));
var Environment;
(function (Environment) {
    Environment[Environment["DEVELOPMENT"] = 0] = "DEVELOPMENT";
    Environment[Environment["BROWSER"] = 1] = "BROWSER";
    Environment[Environment["PRODUCTION"] = 2] = "PRODUCTION";
})(Environment || (Environment = {}));
class Timer {
    constructor(config) {
        var _a, _b, _c, _d, _e, _f;
        this.startTime = Date.now();
        this.details = (_a = config.details) !== null && _a !== void 0 ? _a : {};
        this.loggerName = (_b = config.loggerName) !== null && _b !== void 0 ? _b : 'timer-logs';
        this.filename = config.filename;
        this.splitFilePath = config.filename.split('/').filter(p => p.length > 0);
        this.label = (_c = config.label) !== null && _c !== void 0 ? _c : this.splitFilePath.slice(-1)[0].split('.')[0];
        this.savedTimes = {};
        this.logClass = (_d = config.logClass) !== null && _d !== void 0 ? _d : this.splitFilePath.slice(-1)[0].split('.')[0];
        this.omitStackTrace = (_e = config.omitStackTrace) !== null && _e !== void 0 ? _e : false;
        this._severity = Severity[(_f = config.severity) !== null && _f !== void 0 ? _f : Severity.DEFAULT];
        this.uniqueId = crypto.randomBytes(8).toString('hex');
        this.start('operationTime');
        this.start(this.label);
    }
    set severity(value) {
        this._severity = value;
    }
    static consoleLog(logObject) {
        let environment;
        if (typeof window !== 'undefined')
            environment = Environment.BROWSER;
        else if (process.env.NODE_ENV === 'development')
            environment = Environment.DEVELOPMENT;
        else
            environment = Environment.PRODUCTION;
        let logPresenter;
        switch (environment) {
            case Environment.BROWSER:
                logPresenter = logPresenter_1.browserLogPresenter;
                break;
            case Environment.DEVELOPMENT:
                logPresenter = logPresenter_1.developerLogPresenter;
                break;
            case Environment.PRODUCTION:
                logPresenter = logPresenter_1.productionLogPresenter;
                break;
            default:
                logPresenter = logPresenter_1.productionLogPresenter;
                break;
        }
        logPresenter(logObject);
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
        this.stop('operationTime');
        if (this.mostRecentlyStartedLabel && !this.savedTimes[this.mostRecentlyStartedLabel].finishTime)
            this.end();
        const printObject = {
            message: this.label + `: ${this.finishTime - this.startTime}ms`
        };
        const printMap = new Map(Object.entries(printObject));
        Object.entries(this.savedTimes)
            .forEach(([label, times]) => {
            if (typeof times.time === 'number')
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
        const concatenatedMessage = [message].concat(messages === null || messages === void 0 ? void 0 : messages.map(m => m.toString())).join(' ');
        this.printLog(new Map([
            ['message', concatenatedMessage],
        ]), Severity.INFO);
    }
    warn(message, ...messages) {
        const concatenatedMessage = [message].concat(messages === null || messages === void 0 ? void 0 : messages.map(m => m.toString())).join(' ');
        this.printLog(new Map([
            ['message', concatenatedMessage],
        ]), Severity.WARNING);
    }
    alert(message, ...messages) {
        const concatenatedMessage = [message].concat(messages === null || messages === void 0 ? void 0 : messages.map(m => m.toString())).join(' ');
        this.printLog(new Map([
            ['message', concatenatedMessage],
        ]), Severity.ALERT);
    }
    customError(message) {
        const errorDetails = new Map(Object.entries({ message }));
        this.printLog(errorDetails, Severity.ERROR);
    }
    postgresError(e) {
        return this._postgresError(e, null);
    }
    postgresErrorReturn(returnValue) {
        return (e) => this._postgresError(e, returnValue);
    }
    genericError(e, message) {
        const errorDetails = new Map([
            ['errorName', e.name]
        ]);
        if (!this.omitStackTrace && e.stack)
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
    _postgresError(e, returnVal) {
        const errorDetails = new Map(Object.entries(e));
        if (!errorDetails.has('message'))
            errorDetails.set('message', 'Postgres error code ' + e.code);
        errorDetails.set("databaseType", "postgres");
        this.printLog(errorDetails, Severity.ERROR);
        return returnVal;
    }
    printLog(details, severity) {
        var _a;
        if (!details.has('message')) {
            details.set('message', 'timer-logs unset message in file ' + this.filename);
        }
        const log = {
            severity: severity,
            filename: this.filename,
            logClass: (_a = this.logClass) !== null && _a !== void 0 ? _a : this.splitFilePath.slice(-1)[0].split('.')[0],
            loggerName: this.loggerName,
            uniqueId: this.uniqueId,
            timestamp: new Date().toUTCString(),
        };
        details.forEach((value, key) => {
            log[key] = value;
        });
        this.splitFilePath.forEach((filePath, level) => {
            log[`FilePathDepth${level + 1}`] = filePath;
        });
        Timer.consoleLog(log);
    }
}
exports.default = Timer;
