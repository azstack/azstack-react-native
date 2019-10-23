import PushNotificationIOS from '@react-native-community/push-notification-ios';

class Notification {
    constructor(options) {

        this.resolveFunction = null;
        this.rejectFunction = null;

        this.onRegisterSuccessHandler = this.onRegisterSuccessHandler.bind(this);
        this.onRegisterErrorHandler = this.onRegisterErrorHandler.bind(this);
        this.onHasRemoteNotification = this.onHasRemoteNotification.bind(this);
        this.onHasLocalNotification = this.onHasLocalNotification.bind(this);

        PushNotificationIOS.addEventListener('register', this.onRegisterSuccessHandler);
        PushNotificationIOS.addEventListener('registrationError', this.onRegisterErrorHandler);
        PushNotificationIOS.addEventListener('notification', this.onHasRemoteNotification);
        PushNotificationIOS.addEventListener('localNotification', this.onHasLocalNotification);
    };

    init() {
        return new Promise((resolve, reject) => {
            this.resolveFunction = resolve;
            this.rejectFunction = reject;
            this.requestPermissions().then(() => { }).catch((error) => {
                reject(error);
            });
        });
    };
    clear() {
        PushNotificationIOS.removeEventListener('register', this.onRegisterSuccessHandler);
        PushNotificationIOS.removeEventListener('registrationError', this.onRegisterErrorHandler);
        PushNotificationIOS.removeEventListener('notification', this.onHasRemoteNotification);
        PushNotificationIOS.removeEventListener('localNotification', this.onHasLocalNotification);
    };

    onRegisterSuccessHandler(deviceToken) {
        this.resolveFunction(deviceToken);
    };
    onRegisterErrorHandler(error) {
        this.rejectFunction(error);
    };
    onHasRemoteNotification(notification) { };
    onHasLocalNotification(notification) { };

    getInitialNotification() {
        return new Promise((resolve, reject) => {
            PushNotificationIOS.getInitialNotification().then((notification) => {
                if (!notification || !notification._data) {
                    return reject(new Error('No initial notification'));
                }

                resolve(notification._data);

            }).then((error) => {
                reject(error);
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
                    return reject(new Error('Notification permission denied'));
                }
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
    };
};

export default Notification;