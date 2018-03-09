import FCM, {
    FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType
} from 'react-native-fcm';

let initialNotification = null;
let fcmActionBannerClicked = 'fcm.ACTION.BANNER_CLICKED';

FCM.on(FCMEvent.Notification, async (notification) => {

    console.log('new notification');
    console.log(notification);

    if (notification && notification.fcm.action === fcmActionBannerClicked && notification.initialNotification) {
        initialNotification = { ...notification.initialNotification };
    }

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
        click_action: fcmActionBannerClicked,
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
        data: { badge: 1 },
        initialNotification: {
            appId: notification.appId,
            pushFromId: notification.pushFromId,
            pushFrom: notification.pushFrom,
            pushToId: notification.pushToId,
            pushTime: notification.pushTime,

            pushPacketType: notification.pushPacketType,

            pushMsgId: notification.pushMsgId,
            pushMessage: notification.pushMessage,
            pushMsgType: notification.pushMsgType
        }
    });
});

class Notication {
    constructor() { };

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

    getInitialNotification() {
        return new Promise((resolve, reject) => {

            FCM.getInitialNotification().then(notification => {

                if (notification && notification.fcm.action === fcmActionBannerClicked && notification.initialNotification) {
                    return resolve({ ...notification.initialNotification });
                }

                if (initialNotification) {
                    resolve({ ...initialNotification });
                    initialNotification = null;
                    return;
                }

                reject();

            }).catch((error) => {
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