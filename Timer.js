"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timer = void 0;
class Timer {
    constructor(config) {
        var _a, _b;
        this.startTime = Date.now();
        this.config = config;
        this.config.details = (_a = config === null || config === void 0 ? void 0 : config.details) !== null && _a !== void 0 ? _a : {};
        this.savedTimes = {};
        if (((_b = this.config) === null || _b === void 0 ? void 0 : _b.label) !== undefined)
            this.start(this.config.label);
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
        this.savedTimes[label].finishTime = Date.now();
        this.savedTimes[label].time = this.savedTimes[label].finishTime - this.savedTimes[label].startTime;
        return this.savedTimes[label].time;
    }
    next(label) {
        this.stop(this.mostRecentlyStartedLabel);
        this.start(label);
    }
    end() {
        if (this.mostRecentlyStartedLabel)
            return this.stop(this.mostRecentlyStartedLabel);
    }
    flush() {
        var _a, _b, _c, _d, _e, _f;
        this.finishTime = Date.now();
        if (this.mostRecentlyStartedLabel && !this.savedTimes[this.mostRecentlyStartedLabel].finishTime)
            this.end();
        const printObject = {
            severity: (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.severity) !== null && _b !== void 0 ? _b : 'INFO',
            message: ((_d = (_c = this.config) === null || _c === void 0 ? void 0 : _c.label) !== null && _d !== void 0 ? _d : `Timer`) + `: ${this.finishTime - this.startTime}ms`,
            filename: (_e = this.config) === null || _e === void 0 ? void 0 : _e.filename
        };
        Object.entries(this.savedTimes).forEach(([label, times]) => {
            printObject[label] = times.time;
        });
        if ((_f = this === null || this === void 0 ? void 0 : this.config) === null || _f === void 0 ? void 0 : _f.details)
            Object.entries(this.config.details).forEach(([label, detail]) => {
                printObject[label] = detail;
            });
        console.log(JSON.stringify(printObject));
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
        var _a;
        const errorLog = {
            severity: 'ERROR',
            message: message,
            filename: (_a = this.config) === null || _a === void 0 ? void 0 : _a.filename
        };
        console.log(JSON.stringify(errorLog));
    }
    postgresError(e) {
        var _a;
        const errorLog = {
            severity: 'ERROR',
            message: 'Postgres Error: ' + e.message,
            errno: e.errno,
            code: e.code,
            filename: (_a = this === null || this === void 0 ? void 0 : this.config) === null || _a === void 0 ? void 0 : _a.filename,
            characterPositionInQuery: e.position
        };
        console.log(JSON.stringify(errorLog));
    }
    genericError(e, message) {
        var _a;
        const errorLog = {
            severity: 'ERROR',
            message,
            errorMessage: e.message,
            errorName: e.name,
            stackTrace: e.stack,
            filename: (_a = this.config) === null || _a === void 0 ? void 0 : _a.filename
        };
        console.log(JSON.stringify(errorLog));
    }
}
exports.Timer = Timer;
