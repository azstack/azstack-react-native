class Notification {
    constructor(options) {
        this.logLevelConstants = options.logLevelConstants;
        this.serviceTypes = options.serviceTypes;
        this.errorCodes = options.errorCodes;
        this.notificationConstants = options.notificationConstants;
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
                message: 'Change application state data',
                payload: body
            });

            resolve({});
        });
    };

    sendNotificationRegisterDevice(options, callback) {

        return new Promise((resolve, reject) => {

            const pushNotificationRegisterDevicePacket = {
                service: this.serviceTypes.PUSH_NOTIFICATION_REGISTER_DEVICE_SEND,
                body: JSON.stringify({
                    id: options.deviceToken,
                    type: options.devicePlatformOS,
                    appBundleId: options.applicationBundleId
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send push notification register device'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Push notification register device packet',
                payload: pushNotificationRegisterDevicePacket
            });
            this.sendPacketFunction(pushNotificationRegisterDevicePacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send push notification register device data successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send push notification register device data, notification register device fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send push notification register device data, notification register device fail'
                });
            });
        });
    };
    receiveNotificationRegisterDevice(body) {
        return new Promise((resolve, reject) => {

            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect notification register device result, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect notification register device result'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got notification register device result'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Notification register device result',
                payload: body
            });

            if (body.r !== this.errorCodes.REQUEST_SUCCESS_FROM_SERVER) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Server response with error, notification register device fail'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Server response with error, notification register device fail'
                });
                return;
            }

            resolve({});
        });
    };

    sendNotificationUnregisterDevice(options, callback) {

        return new Promise((resolve, reject) => {

            const pushNotificationUnregisterDevicePacket = {
                service: this.serviceTypes.PUSH_NOTIFICATION_UNREGISTER_DEVICE_SEND,
                body: JSON.stringify({
                    id: options.deviceToken
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send push notification unregister device'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Push notification unregister device packet',
                payload: pushNotificationUnregisterDevicePacket
            });
            this.sendPacketFunction(pushNotificationUnregisterDevicePacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send push notification unregister device data successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send push notification unregister device data, notification unregister device fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send push notification unregister device data, notification unregister device fail'
                });
            });
        });
    };
    receiveNotificationUnregisterDevice(body) {
        return new Promise((resolve, reject) => {

            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect notification unregister device result, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect notification unregister device result'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got notification unregister device result'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Notification unregister device result',
                payload: body
            });

            if (body.r !== this.errorCodes.REQUEST_SUCCESS_FROM_SERVER) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Server response with error, notification unregister device fail'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Server response with error, notification unregister device fail'
                });
                return;
            }

            resolve({});
        });
    };

    parseNotification(options) {
        let parsedNotification = {
            appId: options.appId,
            type: this.notificationConstants.NOTIFICATION_TYPE_UNKNOWN
        };

        let packetType = 0;

        if (isNaN(options.pushPacketType)) {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                message: 'Parse packet type error'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Packet type',
                payload: {
                    packetType: options.pushPacketType
                }
            });
            return ({
                error: {
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot parse packet type, parse notification fail'
                },
                result: null
            });
        }

        packetType = parseInt(options.pushPacketType);

        switch (packetType) {
            case this.serviceTypes.MESSAGE_SERVER_WITH_USER_TYPE_TEXT:
            case this.serviceTypes.MESSAGE_WITH_USER_TYPE_STICKER:
            case this.serviceTypes.MESSAGE_WITH_USER_TYPE_FILE:
            case this.serviceTypes.MESSAGE_WITH_USER_TYPE_LOCATION:
            case this.serviceTypes.MESSAGE_HAS_NEW_WITH_GROUP:
                parsedNotification.type = this.notificationConstants.NOTIFICATION_TYPE_MESSAGE;
                break;
            case this.serviceTypes.FREE_CALL_START:
            case this.serviceTypes.FREE_CALL_STATUS_CHANGED:
                parsedNotification.type = this.notificationConstants.NOTIFICATION_TYPE_FREE_CALL;
                break;
            case this.serviceTypes.CALLIN_START_PUSH:
                parsedNotification.type = this.notificationConstants.NOTIFICATION_TYPE_CALLIN;
                break;
            default:
                break;
        };

        return {
            error: null,
            result: parsedNotification
        };
    };
};

export default Notification;