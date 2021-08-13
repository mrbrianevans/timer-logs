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
    /**
     * Create a new Timer object. Can have multiple timers within this object.
     * Should only have one of these per file. Creating this object beings a timer automatically
     * @param config required configuration object, requires filename, others are optional
     */
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
        if (this.config.loggerName === undefined)
            this.config.loggerName = 'timer-logs';
        this.uniqueId = crypto.randomBytes(8).toString('hex');
        this.start('operationTime');
        this.start(this.config.label);
    }
    set severity(value) {
        this._severity = value;
    }
    /**
     * Start a new timer
     * @param label the label of the timer. this will be console logged on flush()
     * @return object which can be used to stop the timer without its label
     */
    start(label) {
        console.assert(!this.savedTimes.hasOwnProperty(label), 'Timer started more than once for same label');
        console.assert(label !== 'message', 'Label cannot be called message. Reserved by default');
        console.assert(label !== 'severity', 'Label cannot be called severity. Reserved by default');
        this.mostRecentlyStartedLabel = label;
        this.savedTimes[label] = { startTime: Date.now() };
        /**
         * Stops the timer and saves the time taken
         */
        const _stop = () => {
            return this.stop(label);
        };
        return {
            stop: _stop
        };
    }
    /**
     * Stops a timer and saves the time taken
     * @param label the label of the timer you wish to stop
     */
    stop(label) {
        console.assert(this.savedTimes.hasOwnProperty(label), 'Timer stopped for unstarted label. Missing timer.start()');
        console.assert(this.savedTimes[label].finishTime === undefined, 'Stop called more than once for same label');
        const finishTime = Date.now();
        this.savedTimes[label].finishTime = finishTime;
        this.savedTimes[label].time = finishTime - this.savedTimes[label].startTime;
        return this.savedTimes[label].time;
    }
    /**
     * Stops the most recently started timer, and starts a new one
     * @param label for new timer started
     * @example
     * timer.start('label1')
     * await new Promise()
     * timer.next('label2')
     * await new Promise()
     * timer.next('label3')
     * await new Promise()
     * timer.end()
     */
    next(label) {
        if (!this.mostRecentlyStartedLabel) {
            console.error('Next called before a timer was started');
            return;
        }
        this.stop(this.mostRecentlyStartedLabel);
        this.start(label);
    }
    /**
     * stops the most recently started timer
     */
    end() {
        if (this.mostRecentlyStartedLabel)
            return this.stop(this.mostRecentlyStartedLabel);
    }
    /**
     * Prints times to the console in JSON format for Google Cloud Logging.
     *
     * Will end the most recently started timer if not already ended
     */
    flush() {
        this.finishTime = Date.now();
        this.stop('operationTime');
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
    /**
     * Adds a detail to the JSON of the log.
     *
     * @param key the key to log in the JSON
     * @param value (optional) value for the key. Defaults to true
     */
    addDetail(key, value = true) {
        var _a;
        Object.assign((_a = this.config) === null || _a === void 0 ? void 0 : _a.details, { [key]: value });
    }
    /**
     * Adds multiple details to the JSON of the log.
     *
     * @param details an object of key value pairs to log
     */
    addDetails(details) {
        var _a;
        Object.assign((_a = this.config) === null || _a === void 0 ? void 0 : _a.details, details);
    }
    /**
     * Returns the time elapsed since creating this timer in milliseconds
     */
    getTimeUntilNow() {
        return Date.now() - this.startTime;
    }
    /**
     * Log a message at INFO severity level.
     */
    info(message, ...messages) {
        const concatenatedMessage = [message].concat(messages === null || messages === void 0 ? void 0 : messages.map(m => m.toString())).join(' ');
        this.printLog(new Map([
            ['message', concatenatedMessage],
        ]), Severity.INFO);
    }
    /**
     * Log a message at WARNING severity level.
     */
    warn(message, ...messages) {
        const concatenatedMessage = [message].concat(messages === null || messages === void 0 ? void 0 : messages.map(m => m.toString())).join(' ');
        this.printLog(new Map([
            ['message', concatenatedMessage],
        ]), Severity.WARNING);
    }
    /**
     * Log a message at ALERT severity level.
     */
    alert(message, ...messages) {
        const concatenatedMessage = [message].concat(messages === null || messages === void 0 ? void 0 : messages.map(m => m.toString())).join(' ');
        this.printLog(new Map([
            ['message', concatenatedMessage],
        ]), Severity.ALERT);
    }
    /**
     * Logs a custom error message in a separate log to the main Timer
     * @param message the string to log
     */
    customError(message) {
        const errorDetails = new Map(Object.entries({ message }));
        this.printLog(errorDetails, Severity.ERROR);
    }
    /**
     * Logs a postgres error message in a separate log to the main Timer.
     *
     * @param e the error object returned by postgres client
     * @return null so the promise resolves to a value
     * @example
     * const result = await pool.query('SELECT NOW()',[])
     *                            .catch(e=>timer.postgresError(e))
     */
    postgresError(e) {
        return this._postgresError(e, null);
    }
    /**
     * Logs a postgres error and returns the value passed as the second parameter.
     *
     * @param e the postgres error object
     * @param returnVal the value for this function to return after logging the error
     * @private
     */
    _postgresError(e, returnVal) {
        const errorDetails = new Map(Object.entries(e));
        if (!errorDetails.has('message'))
            errorDetails.set('message', 'Postgres error code ' + e.code);
        errorDetails.set("databaseType", "postgres");
        this.printLog(errorDetails, Severity.ERROR);
        return returnVal;
    }
    /**
     * Convenience wrapper for postgresError, to return a value.
     * By default it returns null, but can be overriden with this method.
     * This is useful if you want your promise to resolve to a default value
     * in case of an error.
     * @param returnValue the value to return
     * @example
     * const { rows } = await pool.query('SELECT NOW()',[])
     *                            .catch(e=>timer.postgresErrorReturn({rows:[]}))
     */
    postgresErrorReturn(returnValue) {
        return (e) => this._postgresError(e, returnValue);
    }
    /**
     * Logs a generic error in a separate log to the main Timer.
     *
     * @param e the error that has been thrown
     * @param message an optional custom message giving context to the error
     * This can be called after any catching any error, like this:
     * @example
     * try{
     *   // code that could throw an error
     * }catch(e){
     *   timer.genericError(e)
     * }
     * @example
     * await asynchronousFunction()
     *        .then()
     *        .catch(timer.genericError)
     */
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
    /**
     * Logs any type of Error in a separate log to the main Timer.
     *
     * This is a convenience wrapper on `genericError` to allow you to add a custom message,
     * and still use in a promise catch clause.
     * @param message custom message to log with error.
     *
     * @example
     * await new Promise((resolve => setTimeout(resolve, 50)))
     * .then(()=> {
     *    throw new Error('Unexpected error occured')
     * }).catch(timer.genericErrorCustomMessage('A better explanation for what caused this error'))
     */
    genericErrorCustomMessage(message) {
        return (e) => this.genericError(e, message);
    }
    /**
     * Internal printing method which makes sure all of the properties are printed with each log.
     *
     * @param details object of
     * @param severity
     * @private
     */
    printLog(details, severity) {
        var _a;
        if (!details.has('message')) {
            // this should never be triggered. Always pass a message in the details map. Just a backup:
            details.set('message', 'timer-logs unset message in file ' + this.config.filename);
        }
        const log = {
            severity: severity,
            filename: this.config.filename,
            logClass: (_a = this.config.logClass) !== null && _a !== void 0 ? _a : this.splitFilePath.slice(-1)[0].split('.')[0],
            loggerName: this.config.loggerName,
            uniqueId: this.uniqueId,
            timestamp: new Date().toUTCString(),
        };
        details.forEach((value, key) => {
            log[key] = value;
        });
        this.splitFilePath.forEach((filePath, level) => {
            log[`FilePathDepth${level + 1}`] = filePath;
        });
        const logString = JSON.stringify(log);
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
    }
}
exports.default = Timer;
