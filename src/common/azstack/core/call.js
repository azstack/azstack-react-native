class Call {
    constructor(options) {
        this.logLevelConstants = options.logLevelConstants;
        this.serviceTypes = options.serviceTypes;
        this.errorCodes = options.errorCodes;
        this.Logger = options.Logger;

        this.callData = {
            callId: null,
            phoneNumber: null
        };
    }

    startCallout(options) {
        return new Promise((resolve, reject) => {
            if (this.callData.callId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot start callout when currently on call'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot start callout when currently on call'
                });
            }
            resolve();
        });
    };
};

export default Call;