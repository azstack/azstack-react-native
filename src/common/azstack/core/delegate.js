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
}

export default Delegates; 