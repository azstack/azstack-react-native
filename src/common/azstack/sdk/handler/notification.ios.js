import {
    PushNotificationIOS
} from 'react-native';

class Notication {
    constructor(options) {

        this.AZStackCore = options.AZStackCore;

        this.resolveFunction = null;
        this.rejectFunction = null;
        PushNotificationIOS.addEventListener('register', (deviceToken) => {
            this.resolveFunction(deviceToken);
        });
        PushNotificationIOS.addEventListener('registrationError', (error) => {
            this.rejectFunction();
        });
        PushNotificationIOS.addEventListener('notification', (notification) => { });
        PushNotificationIOS.addEventListener('localNotification', (notification) => { });
    };

    init() {
        return new Promise((resolve, reject) => {
            this.resolveFunction = resolve;
            this.rejectFunction = reject;
            this.requestPermissions().then(() => { }).catch(() => {
                reject();
            });
        });
    };

    getInitialNotification() {
        return new Promise((resolve, reject) => {
            PushNotificationIOS.getInitialNotification().then((notification) => {
                if (!notification) {
                    return reject();
                }

                this.AZStackCore.parseNotification({ notification: notification._data }).then((result) => {
                    resolve(result);
                }).catch((error) => {
                    reject();
                });
            }).then((error) => {
                reject();
            });
        });
    };

    requestPermissions() {
        return new Promise((resolve, reject) => {
            PushNotificationIOS.requestPermissions({
                alert: true,
                badge: true,
                sound: true
            }).then((result) => {
                if (!result.alert || !result.badge || !result.sound) {
                    return reject();
                }
                resolve();
            }).catch((error) => {
                reject();
            });
        });
    };
};

export default Notication;