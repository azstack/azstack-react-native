class Notification {
    constructor(options) {
        this.logLevelConstants = options.logLevelConstants;
        this.serviceTypes = options.serviceTypes;
        this.errorCodes = options.errorCodes;
        this.chatConstants = options.chatConstants;
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

    parseNotification(options) {
        let parsedNotification = {
            appId: options.appId,
            type: this.notificationConstants.NOTIFICATION_TYPE_UNKNOWN,
            senderId: 0,
            receiverId: 0,
            msgId: 0,
            time: 0
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

        if (isNaN(options.pushFromId)) {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                message: 'Parse packet sender id error'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Packet sender id',
                payload: {
                    senderId: options.pushFromId
                }
            });
            // return ({
            //     error: {
            //         code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
            //         message: 'Cannot parse packet sender id, parse notification fail'
            //     },
            //     result: null
            // });
        }

        if (isNaN(options.pushToId)) {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                message: 'Parse packet receiver id error'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Packet receiver id',
                payload: {
                    receiverId: options.pushToId
                }
            });
            // return ({
            //     error: {
            //         code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
            //         message: 'Cannot parse packet receiver id, parse notification fail'
            //     },
            //     result: null
            // });
        }

        if (isNaN(options.pushMsgId)) {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                message: 'Parse packet msg id error'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Packet msg id',
                payload: {
                    msgId: options.pushMsgId
                }
            });
            // return ({
            //     error: {
            //         code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
            //         message: 'Cannot parse packet msg id, parse notification fail'
            //     },
            //     result: null
            // });
        }

        if (isNaN(options.pushTime)) {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                message: 'Parse packet time error'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Packet time',
                payload: {
                    time: options.pushTime
                }
            });
            // return ({
            //     error: {
            //         code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
            //         message: 'Cannot parse packet time, parse notification fail'
            //     },
            //     result: null
            // });
        }

        packetType = parseInt(options.pushPacketType);
        parsedNotification.senderId = parseInt(options.pushFromId);
        parsedNotification.receiverId = parseInt(options.pushToId);
        parsedNotification.msgId = parseInt(options.pushMsgId);
        parsedNotification.time = parseInt(options.pushTime) * 1000;

        switch (packetType) {
            case this.serviceTypes.MESSAGE_SERVER_WITH_USER_TYPE_TEXT:
                parsedNotification.type = this.notificationConstants.NOTIFICATION_TYPE_MESSAGE;
                parsedNotification.msgType = this.chatConstants.MESSAGE_TYPE_TEXT;
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