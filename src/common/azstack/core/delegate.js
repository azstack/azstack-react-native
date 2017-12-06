class Delegates {
    constructor(options) {
        this.logLevelConstants = options.logLevelConstants;
        this.Logger = options.Logger
    };

    onAuthencationReturn = (error, authenticatedUser) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
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
    onDisconnectReturn = (error, result) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'Please implement method onDisconnectReturn'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'onDisconnectReturn delegate data',
            payload: {
                error: error,
                result: result
            }
        });
    };

    onToggleAudioStateReturn = (error, result) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'Please implement method onToggleAudioStateReturn'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'onToggleAudioStateReturn delegate data',
            payload: {
                error: error,
                result: result
            }
        });
    };

    onStartCalloutReturn = (error, result) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
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
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
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
    onAnswerCallinReturn = (error, result) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'Please implement method onAnswerCallinReturn'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'onAnswerCallinReturn delegate data',
            payload: {
                error: error,
                result: result
            }
        });
    };
    onRejectCallinReturn = (error, result) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
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
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
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
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
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

    onPaidCallLogReturn = (error, result) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
            message: 'Please implement method onPaidCallLogReturn'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'onPaidCallLogReturn delegate data',
            payload: {
                error: error,
                result: result
            }
        });
    };
    onGetPaidCallLogsReturn = (error, result) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'Please implement method onGetPaidCallLogsReturn'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'onGetPaidCallLogsReturn delegate data',
            payload: {
                error: error,
                result: result
            }
        });
    };

    onGetUnreadMessagesReturn = (error, result) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'Please implement method onGetUnreadMessagesReturn'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'onGetUnreadMessagesReturn delegate data',
            payload: {
                error: error,
                result: result
            }
        });
    };
    onGetModifiedMessagesReturn = (error, result) => {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'Please implement method onGetModifiedMessagesReturn'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'onGetModifiedMessagesReturn delegate data',
            payload: {
                error: error,
                result: result
            }
        });
    };
}

export default Delegates; 