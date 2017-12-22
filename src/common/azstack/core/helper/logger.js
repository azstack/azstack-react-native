import * as logLevelConstants from '../constant/logLevel';

class Logger {
    constructor() {
        this.logLevers = [
            logLevelConstants.LOG_LEVEL_NONE,
            logLevelConstants.LOG_LEVEL_ERROR,
            logLevelConstants.LOG_LEVEL_INFO,
            logLevelConstants.LOG_LEVEL_DEBUG
        ];
        this.logLeverColors = {
            [logLevelConstants.LOG_LEVEL_NONE]: 'color: #FFFFFF; font-size: 14px;',
            [logLevelConstants.LOG_LEVEL_ERROR]: 'color: #D91E18; font-size: 14px;',
            [logLevelConstants.LOG_LEVEL_INFO]: 'color: #4B77BE; font-size: 14px;',
            [logLevelConstants.LOG_LEVEL_DEBUG]: 'color: #F7CA18; font-size: 14px;'
        };
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
        console.log(logLevelConstants.LOG_PREFIX + '%c ' + logLevel, this.logLeverColors[logLevel], metaData.message, metaData.payload ? metaData.payload : '');
    };
};

export default Logger;