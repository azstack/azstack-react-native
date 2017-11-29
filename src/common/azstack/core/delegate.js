class Delegates {
    constructor(options) {
        this.logLevelConstants = options.logLevelConstants;
        this.Logger = options.Logger
    };

    onAuthencationReturn = (error, authenticatedUser) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
            message: 'Please implement method onAuthencationReturn'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'onAuthencationReturn delegate data',
            payload: {
                error: error,
                authenticatedUser: authenticatedUser
            }
        });
    };

    onStartCalloutReturn = (error, result) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
            message: 'Please implement method onStartCalloutReturn'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'onStartCalloutReturn delegate data',
            payload: {
                error: error,
                result: result
            }
        });
    };
    onCalloutStatusChanged = (error, result) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
            message: 'Please implement method onCalloutStatusChanged'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'onCalloutStatusChanged delegate data',
            payload: {
                error: error,
                result: result
            }
        });
    };
    onStopCalloutReturn = (error, result) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
            message: 'Please implement method onStopCalloutReturn'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'onStopCalloutReturn delegate data',
            payload: {
                error: error,
                result: result
            }
        });
    };

    onCallinStart = (error, result) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
            message: 'Please implement method onCallinStart'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'onCallinStart delegate data',
            payload: {
                error: error,
                result: result
            }
        });
    };
    onCallinStatusChanged = (error, result) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
            message: 'Please implement method onCallinStatusChanged'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'onCallinStatusChanged delegate data',
            payload: {
                error: error,
                result: result
            }
        });
    };
    onCallinStatusChangedByMe = (error, result) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
            message: 'Please implement method onCallinStatusChangedByMe'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'onCallinStatusChangedByMe delegate data',
            payload: {
                error: error,
                result: result
            }
        });
    };
    onRejectCallinReturn = (error, result) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
            message: 'Please implement method onRejectCallinReturn'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'onRejectCallinReturn delegate data',
            payload: {
                error: error,
                result: result
            }
        });
    };
    onNotAnsweredCallinReturn = (error, result) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
            message: 'Please implement method onNotAnsweredCallinReturn'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'onNotAnsweredCallinReturn delegate data',
            payload: {
                error: error,
                result: result
            }
        });
    };
    onStopCallinReturn = (error, result) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
            message: 'Please implement method onStopCallinReturn'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'onStopCallinReturn delegate data',
            payload: {
                error: error,
                result: result
            }
        });
    };
}

export default Delegates; 