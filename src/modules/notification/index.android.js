import { AppRegistry } from 'react-native';
import Firebase from 'react-native-firebase';

AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => async (message) => {
    const newNotification = new Firebase.notifications.Notification()
        .setNotificationId(new Date().valueOf().toString())
        .setTitle('azstack_react_native_sdk')
        .setBody(`${message.data.pushFrom}: ${message.data.pushMessage}`)
        .setData({
            data: JSON.stringify(message.data)
        })
        .android.setChannelId('azstack_react_native_sdk')
        .android.setPriority(Firebase.notifications.Android.Priority.High)
        .android.setAutoCancel(true);
    Firebase.notifications().displayNotification(newNotification).catch((error) => { });

    return Promise.resolve();
});

class Notication {
    constructor(options) {

        this.initialNotification = null;

        this.onNotificationDisplayedListener = Firebase.notifications().onNotificationDisplayed(this.onNotificationDisplayed.bind(this));
        this.onHasNotificationListener = Firebase.notifications().onNotification(this.onHasNotification.bind(this));
        this.onNotificationOpenedListener = Firebase.notifications().onNotificationOpened(this.onNotificationOpened.bind(this));
        this.onHasMessageListener = Firebase.messaging().onMessage(this.onHasMessage.bind(this));

        const channel = new Firebase.notifications.Android.Channel(
            'azstack_react_native_sdk',
            'azstack_react_native_sdk',
            Firebase.notifications.Android.Importance.Max
        ).setDescription('azstack_react_native_sdk channel');
        Firebase.notifications().android.createChannel(channel);
    };

    onNotificationDisplayed(notification) { };
    onHasNotification(notification) {
        const newNotification = new Firebase.notifications.Notification({ show_in_foreground: true })
            .setNotificationId(new Date().valueOf().toString())
            .setTitle(notification._title)
            .setBody(notification._body)
            .setData(notification._data)
            .android.setChannelId('azstack_react_native_sdk')
            .android.setPriority(Firebase.notifications.Android.Priority.High)
            .android.setAutoCancel(true);
        Firebase.notifications().displayNotification(newNotification).catch((error) => { });
    };
    onNotificationOpened(notification) {
        if (notification && notification.notification) {
            let notificationData = null;
            try {
                notificationData = JSON.parse(notification.notification._data.data);
            } catch (e) { }

            if (notificationData) {
                this.initialNotification = notificationData;
            }
        }
    };
    onHasMessage(message) { };

    init() {
        return new Promise((resolve, reject) => {
            this.requestPermissions().then(() => {
                this.getToken().then((token) => {
                    resolve(token);
                }).catch((error) => {
                    reject(error);
                });
            }).catch((error) => {
                reject(error);
            });
        });
    };
    clear() {
        this.onNotificationDisplayedListener();
        this.onHasNotificationListener();
        this.onNotificationOpenedListener();
        this.onHasMessageListener();
    };

    getInitialNotification() {
        return new Promise((resolve, reject) => {

            if (this.initialNotification) {
                let notificationData = this.initialNotification;
                this.initialNotification = null;
                return resolve(notificationData);
            }

            Firebase.notifications().getInitialNotification().then((notification) => {
                if (!notification || !notification.notification) {
                    return reject(new Error('No initial notification'));
                }

                let notificationData = null;
                try {
                    notificationData = JSON.parse(notification.notification._data.data);
                } catch (e) {
                    return reject(e);
                }

                if (!notificationData) {
                    return reject(new Error('No notification data'));
                }

                resolve(notificationData);
            }).catch((error) => {
                reject(error);
            });
        });
    };
    requestPermissions() {
        return new Promise((resolve, reject) => {
            Firebase.messaging().requestPermission().then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
    };
    getToken() {
        return new Promise((resolve, reject) => {
            Firebase.messaging().getToken().then(fcmToken => {
                if (fcmToken) {
                    resolve(fcmToken);
                } else {
                    reject(new Error('Token is empty'));
                }
            }).catch((error) => {
                reject(error);
            });
        });
    };
};

export default Notication;