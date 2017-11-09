import * as logLevelConstants from '../constant/logLevel';

class Logger {
    constructor() {
        this.logLevers = [
            logLevelConstants.LOG_LEVEL_NONE,
            logLevelConstants.LOG_LEVEL_ERROR,
            logLevelConstants.LOG_LEVEL_INFO,
            logLevelConstants.LOG_LEVEL_DEBUG
        ];
        this.logLever = logLevelConstants.LOG_LEVEL_NONE;
    };
    setLogLevel(logLevel) {
        if (this.logLevers.indexOf(logLevel) === -1) {
            return;
        }
        this.logLever = logLevel;
    };
    log(logLevel, metaData) {
        if (this.logLevers.indexOf(logLevel) === -1) {
            return;
        }
        if (this.logLevers.indexOf(logLevel) > this.logLevers.indexOf(this.logLever)) {
            return;
        }
        console.log(logLevelConstants.LOG_PREFIX + logLevel, metaData);
    };
};

export default Logger;