import React from 'react';
import {
    AppState,
    Dimensions,
    ScrollView,
    View,
    Text,
    Button,
    Platform
} from 'react-native';
import DeviceInfo from 'react-native-device-info';

import AZStackSdk from '../../common/azstack/sdk/';
import Notification from '../notification/';

class AZStackSdkExample extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            authenticatedUser: null,
        };

        this.subscriptions = {};

        this.Notification = new Notification();
        this.deviceToken = null;
        this.devicePlatformOS = null;
        this.applicationBundleId = DeviceInfo.getBundleId();

        this.handleAppStateChange = this.handleAppStateChange.bind(this);
    };

    addSubscriptions() {
        this.subscriptions.onConnected = this.refs.AZStackSdk.EventEmitter.addListener(this.refs.AZStackSdk.eventConstants.EVENT_NAME_CONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.setState({ authenticatedUser: result });
            this.registerDeviceToken();
        });
        this.subscriptions.onAutoReconnected = this.refs.AZStackSdk.EventEmitter.addListener(this.refs.AZStackSdk.eventConstants.EVENT_NAME_ON_AUTO_RECONNECTED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.setState({ authenticatedUser: result });
            this.registerDeviceToken();
        });
        this.subscriptions.onReconnected = this.refs.AZStackSdk.EventEmitter.addListener(this.refs.AZStackSdk.eventConstants.EVENT_NAME_ON_RECONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.setState({ authenticatedUser: result });
            this.registerDeviceToken();
        });
        this.subscriptions.onDisconnectReturn = this.refs.AZStackSdk.EventEmitter.addListener(this.refs.AZStackSdk.eventConstants.EVENT_NAME_ON_DISCONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.setState({ authenticatedUser: null });
            this.deviceToken = null;
        });
    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

    registerDeviceToken() {
        if (!this.refs.AZStackSdk.AZStackCore.slaveSocketConnected) {
            return;
        }
        if (this.deviceToken) {
            return;
        }
        this.Notification.init().then((deviceToken) => {
            this.deviceToken = deviceToken;
            this.refs.AZStackSdk.AZStackCore.notificationRegisterDevice({
                deviceToken: this.deviceToken,
                devicePlatformOS: this.devicePlatformOS,
                applicationBundleId: this.applicationBundleId
            }).then((result) => { }).catch((error) => { });
        }).catch((error) => { });
    };
    checkClickedNotification() {
        this.Notification.getInitialNotification().then((initialNotification) => {
            console.log('initial notification');
            console.log(initialNotification);
            this.refs.AZStackSdk.AZStackCore.parseNotification({ notification: initialNotification }).then((result) => {
                console.log('parsed notification');
                console.log(result);
            }).catch((error) => {
                console.log('parse notification error');
                console.log(error);
            });
        }).catch((error) => {
            console.log('initial notification error');
            console.log(error);
        });
    };
    handleAppStateChange(nextAppState) {
        if (nextAppState === 'active') {
            this.checkClickedNotification();
        }
    };

    showConversations() {
        this.refs.AZStackSdk.showConversations({});
    };
    startChatUser(options) {
        this.refs.AZStackSdk.startChat({
            chatType: this.refs.AZStackSdk.AZStackCore.chatConstants.CHAT_TYPE_USER,
            chatId: 387212
        });
    };
    startChatGroup(options) {
        this.refs.AZStackSdk.startChat({
            chatType: this.refs.AZStackSdk.AZStackCore.chatConstants.CHAT_TYPE_GROUP,
            chatId: 7436
        });
    };
    showNumberPad() {
        this.refs.AZStackSdk.showNumberPad({});
    };
    audioCall() {
        this.refs.AZStackSdk.startAudioCall({
            callData: {
                fullname: 'Test User 2',
                toUserId: 387212,
            },
            onEndCall: () => { }
        });
    };
    videoCall() {
        this.refs.AZStackSdk.startVideoCall({
            callData: {
                fullname: 'Test User 2',
                toUserId: 387212,
            },
            onEndCall: () => { }
        });
    };
    showCallLogs() {
        this.refs.AZStackSdk.showCallLogs({});
    };
    showUser() {
        this.refs.AZStackSdk.showUser({ userId: 387212 });
    };
    showGroup() {
        this.refs.AZStackSdk.showGroup({ groupId: 7436 });
    };
    unregisterDeviceToken() {
        if (!this.refs.AZStackSdk.AZStackCore.slaveSocketConnected) {
            return;
        }
        if (!this.deviceToken) {
            return;
        }
        this.refs.AZStackSdk.AZStackCore.notificationUnregisterDevice({
            deviceToken: this.deviceToken
        }).then((result) => { }).catch((error) => { });
    };

    componentDidMount() {
        this.devicePlatformOS = Platform.OS === 'android' ? this.refs.AZStackSdk.AZStackCore.platformConstants.PLATFORM_ANDROID : (Platform.OS === 'ios' ? this.refs.AZStackSdk.AZStackCore.platformConstants.PLATFORM_IOS : this.refs.AZStackSdk.AZStackCore.platformConstants.PLATFORM_WEB);
        this.addSubscriptions();
        AppState.addEventListener('change', this.handleAppStateChange);
        this.registerDeviceToken();
        this.checkClickedNotification();

        this.refs.AZStackSdk.connect().then((result) => { }).catch((error) => { });
    };
    componentWillUnmount() {
        this.clearSubscriptions();
        AppState.removeEventListener('change', this.handleAppStateChange);
        this.Notification.clear();
        this.refs.AZStackSdk.disconnect().then((result) => { }).catch((error) => { });
    };

    render() {
        const { width, height } = Dimensions.get('window');
        return (
            <AZStackSdk
                ref={'AZStackSdk'}
                options={{
                    azstackConfig: this.props.azstackConfig,
                    defaultLayout: this.props.defaultLayout,
                    languageCode: this.props.languageCode,
                    themeName: this.props.themeName,
                    getInitialMembers: this.props.getInitialMembers,
                    getMoreMembers: this.props.getMoreMembers,
                    getFromPhoneNumbers: this.props.getFromPhoneNumbers,
                    getPaidCallTags: this.props.getPaidCallTags,
                    onBeforeMessageSend: this.props.onBeforeMessageSend,
                    onBeforeCalloutStart: this.props.onBeforeCalloutStart
                }}
            >
                <View
                    style={{
                        flex: 1,
                        ...Platform.select({
                            ios: {
                                paddingTop: 20
                            }
                        }),
                    }}
                >
                    <ScrollView>
                        <Text>{this.state.authenticatedUser ? 'Connected, ' + this.state.authenticatedUser.fullname : 'Connecting...'}</Text>
                        <Text>{'\n'}{'\n'}</Text>
                        <Button onPress={() => this.showConversations()} title='Show conversations'></Button>
                        <Button onPress={() => this.startChatGroup()} title='Chat with group'></Button>
                        <Button onPress={() => this.startChatUser()} title='Chat with user'></Button>
                        <Button onPress={() => this.audioCall()} title='Voice Call User 2'></Button>
                        <Button onPress={() => this.videoCall()} title='Video Call User 2'></Button>
                        <Button onPress={() => this.showNumberPad()} title='Show number pad'></Button>
                        <Button onPress={() => this.showCallLogs()} title='Show call logs'></Button>
                        <Button onPress={() => this.showUser()} title='Show user'></Button>
                        <Button onPress={() => this.showGroup()} title='Show group'></Button>
                        <Button onPress={() => this.unregisterDeviceToken()} title='Unregister device token'></Button>
                    </ScrollView>
                </View>
            </AZStackSdk>
        );
    };
};

export default AZStackSdkExample;