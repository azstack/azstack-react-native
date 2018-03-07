class Notification {
    constructor(options) {
        this.logLevelConstants = options.logLevelConstants;
        this.serviceTypes = options.serviceTypes;
        this.errorCodes = options.errorCodes;
        this.Logger = options.Logger;
        this.sendPacketFunction = options.sendPacketFunction;
    };

    sendChangeApplicationState(options, callback) {

        return new Promise((resolve, reject) => {

            const changeApplicationStatePacket = {
                service: this.serviceTypes.APPLICATION_CHANGE_STATE,
                body: JSON.stringify({
                    state: options.state
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send change application state'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Change application state packet',
                payload: changeApplicationStatePacket
            });
            this.sendPacketFunction(changeApplicationStatePacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send change application state successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send change application state, change application state fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send change application state, change application state fail'
                });
            });
        });
    };
    receiveChangeApplicationState(body) {
        return new Promise((resolve, reject) => {

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got change application state'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'change application state data',
                payload: body
            });

            resolve({});
        });
    };
};

export default Notification;