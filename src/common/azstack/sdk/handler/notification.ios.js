import {
    PushNotificationIOS
} from 'react-native';

class Notication {
    constructor() {
        this.resolveFunction = null;
        this.rejectFunction = null;
        PushNotificationIOS.addEventListener('register', (deviceToken) => {
            this.resolveFunction(deviceToken);
        });
        PushNotificationIOS.addEventListener('registrationError', (error) => {
            this.rejectFunction();
        });
        PushNotificationIOS.addEventListener('notification', (notification) => {
            console.log('You have received a new notification!', notification);
        });
        PushNotificationIOS.addEventListener('localNotification', (notification) => {
            console.log('Local notification', notification);
        });
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