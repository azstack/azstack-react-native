class Delegates {
    constructor(options) {
        this.logLevelConstants = options.logLevelConstants;
        this.Logger = options.Logger
    };

    onAuthencationComplete = (error, authenticatedUser) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
            message: 'Please implement method onAuthencationComplete'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'onAuthencationComplete delegate data',
            payload: {
                error: error,
                authenticatedUser: authenticatedUser
            }
        });
    };
}

export default Delegates; 