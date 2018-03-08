import FCM, {
    FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType
} from 'react-native-fcm';

class Notication {
    constructor() {

        FCM.on(FCMEvent.Notification, async (notification) => {

            console.log('new notification');
            console.log(notification);

            if (notification.local_notification) {
                return;
            }
            if (notification.opened_from_tray) {
                return;
            }

            FCM.presentLocalNotification({
                id: new Date().valueOf().toString(),
                title: 'This is title',
                body: 'This is body',
                sub_text: 'This is a subText',
                sound: 'default',
                priority: 'high',
                click_action: this.applicationBundleId,
                auto_cancel: true,
                // large_icon: '',
                icon: 'ic_launcher',
                color: 'red',
                vibrate: 300,
                wake_screen: true,
                group: this.applicationBundleId,
                ongoing: false,
                lights: true,
                show_in_foreground: true,
                data: { badge: 3 }
            });
        });
    };

    init() {
        return new Promise((resolve, reject) => {
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
        return new Promise((resolve, reject) => {
            FCM.requestPermissions().then(() => {
                resolve();
            }).catch((error) => {
                reject();
            });
        });
    };

    getToken() {
        return new Promise((resolve, reject) => {
            FCM.getFCMToken().then((token) => {
                resolve(token);
            }).catch((error) => {
                reject();
            });;
        });
    };
};

export default Notication;