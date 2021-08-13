"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.browserLogPresenter = exports.productionLogPresenter = exports.developerLogPresenter = void 0;
const index_1 = require("./index");
function developerLogPresenter(log) {
    console.log(log);
}
exports.developerLogPresenter = developerLogPresenter;
function productionLogPresenter(log) {
    const logString = JSON.stringify(log);
    console.log(logString);
}
exports.productionLogPresenter = productionLogPresenter;
function browserLogPresenter(log) {
    var _a;
    const logString = JSON.stringify(log);
    const severity = (_a = log.severity) !== null && _a !== void 0 ? _a : index_1.Severity.DEFAULT;
    switch (severity) {
        case index_1.Severity.DEBUG:
            console.debug(logString);
            break;
        case index_1.Severity.DEFAULT:
            console.log(logString);
            break;
        case index_1.Severity.INFO:
        case index_1.Severity.NOTICE:
            console.info(logString);
            break;
        case index_1.Severity.WARNING:
            console.warn(logString);
            break;
        case index_1.Severity.ERROR:
        case index_1.Severity.CRITICAL:
        case index_1.Severity.ALERT:
        case index_1.Severity.EMERGENCY:
            console.error(logString);
            break;
        default:
            console.log(logString);
    }
}
exports.browserLogPresenter = browserLogPresenter;
