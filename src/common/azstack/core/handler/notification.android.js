import FCM, {
    FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType
} from 'react-native-fcm';

class Notication {
    constructor(options) {

        this.logLevelConstants = options.logLevelConstants;
        this.Logger = options.Logger;

        FCM.on(FCMEvent.Notification, async (notification) => {
            if (notification.local_notification) {
            }
            if (notification.opened_from_tray) {
            }
            console.log('new notification');
            console.log(notification);
        });
    };

    setup() {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Start setup push notification'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Platform',
                payload: {
                    platform: 'android'
                }
            });

            this.requestPermissions().then(() => {
                this.getToken().then((token) => {
                    resolve(token);
                }).catch(() => {
                    reject();
                });
            }).catch(() => {
                reject();
            });
        });
    };

    requestPermissions() {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
            message: 'Request notification permission'
        });
        return new Promise((resolve, reject) => {
            FCM.requestPermissions().then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Notification permission granted'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Notification permission rejected'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Request notification permission error',
                    payload: error
                });
                reject();
            });
        });
    };

    getToken() {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Get device token'
            });
            FCM.getFCMToken().then((token) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Get device token success'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Device token',
                    payload: {
                        token: token
                    }
                });
                resolve(token);
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Get device token error'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Get device token error',
                    payload: error
                });
                reject();
            });;
        });
    };
};

export default Notication;