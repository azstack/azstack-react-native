class Call {
    constructor(options) {
        this.logLevelConstants = options.logLevelConstants;
        this.serviceTypes = options.serviceTypes;
        this.errorCodes = options.errorCodes;
        this.callStatuses = options.callStatuses;
        this.Logger = options.Logger;

        this.callData = {
            callType: null,
            callId: null,
            toPhoneNumber: null,
            isCaller: null,
            hasVideo: null
        };
    }

    setCallData(options) {
        for (let field in options) {
            this.callData[field] = options[field];
        }
    };
    clearCallData() {
        this.callData.callType = null;
        this.callData.callId = null;
        this.callData.toPhoneNumber = null;
        this.callData.isCaller = null;
        this.callData.hasVideo = null;
    };

    sendStartCallout(options) {
        return new Promise((resolve, reject) => {
            if (this.callData.callId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot start callout when currently on call'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot start callout when currently on call'
                });
                return;
            }

            this.setCallData({
                callType: this.callStatuses.CALL_TYPE_CALLOUT,
                callId: options.callData.callId,
                toPhoneNumber: options.callData.toPhoneNumber,
                isCaller: true,
                hasVideo: false
            });

            const startCalloutPacket = {
                service: this.serviceTypes.CALLOUT_START_SEND,
                body: JSON.stringify({
                    callId: this.callData.callId,
                    to: this.callData.toPhoneNumber
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send start callout packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Start callout packet',
                payload: startCalloutPacket
            });
            options.sendFunction(startCalloutPacket).then(() => {
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send start callout data, start callout fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send start callout data, start callout fail'
                });
            });
        });
    };
    receiveStartCalloutError(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot get start callout data, start callout fail'
                });
                reject({
                    code: this.errorCodes.ERR_SOCKET_PARSE_BODY,
                    message: 'Cannot get start callout data, start callout fail'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got start callout error data'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Start callout error data',
                payload: body
            });

            if (this.callData.callId && this.callData.callId !== body.callId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Ignore start callout error packet when callId not matched'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                return;
            }

            const error = {
                code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                status: null,
                message: 'Unknown error'
            };
            if (body.chargingError) {
                switch (body.chargingError) {
                    case this.callStatuses.CALL_STATUS_CALLOUT_BUSY:
                        error.status = this.callStatuses.CALL_STATUS_CALLOUT_BUSY;
                        error.message = 'The toPhoneNumber currently busy'
                        break;
                    case this.callStatuses.CALL_STATUS_CALLOUT_NOT_ENOUGH_BALANCE:
                        error.status = this.callStatuses.CALL_STATUS_CALLOUT_NOT_ENOUGH_BALANCE;
                        error.message = 'Your account has not enough balance'
                        break;
                    case this.callStatuses.CALL_STATUS_CALLOUT_INVALID_NUMBER:
                        error.status = this.callStatuses.CALL_STATUS_CALLOUT_INVALID_NUMBER;
                        error.message = 'The toPhoneNumber is not valid'
                        break;
                    default:
                        break;
                }
            }
            reject(error);

        });
    };
};

export default Call;