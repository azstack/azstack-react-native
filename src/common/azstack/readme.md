# 1. Installation

## Install package
```
    npm install --save azstack-react-native
```
## 1.1. Core
### 1.1.1. Install socket.io-client https://github.com/socketio/socket.io-client
### 1.1.2. Install jsencrypt https://github.com/travist/jsencrypt
### 1.1.3. Install react-native-webrtc https://github.com/oney/react-native-webrtc
## 1.2. Sdk
### 1.2.1. Install react-native-image-crop-picker https://github.com/ivpusic/react-native-image-crop-picker
### 1.2.2. Install react-native-document-picker https://github.com/Elyx0/react-native-document-picker
### 1.2.3. Install react-native-video https://github.com/react-native-community/react-native-video
### 1.2.4. Install react-native-swiper https://github.com/leecade/react-native-swiper
### 1.2.5. Install react-native-audio https://github.com/jsierles/react-native-audio
### 1.2.6. Install react-native-fs https://github.com/itinance/react-native-fs
### 1.2.7. Install react-native-sketch-canvas https://github.com/terrylinla/react-native-sketch-canvas
### 1.2.8. Install react-native-maps https://github.com/react-community/react-native-maps
### 1.2.9. Install react-native-google-places https://github.com/tolu360/react-native-google-places
### 1.2.10. Install react-native-device-info https://github.com/rebeccahughes/react-native-device-info
### 1.2.11. Install react-native-fcm https://github.com/evollu/react-native-fcm (Android only)
### 1.2.12. Install react-native-incall-manager https://github.com/zxcpoiu/react-native-incall-manager
### 1.2.13. Install react-native-zip-archive https://github.com/mockingbot/react-native-zip-archive


# 2. Usage

```javascript
    import {AZStackSdk} from 'azstack-react-native'; 
```

```javascript
    componentDidMount() {
        this.refs.AZStackSdk.connect().then((result) => {
            this.setState({ authenticatedUser: result });
        }).catch((error) => {});
    };
```

```javascript
render() {
    ...
    let azstackConfig = {
        requestTimeout: 60000,
        intervalPingTime: 60000,
        autoReconnect: true,
        autoReconnectLimitTries: 10,
        autoReconnectIntervalTime: 5000,
        logLevel: 'ERROR',
        authenticatingData: {
            appId: '',
            publicKey: '',
            azStackUserId: '',
            userCredentials: '',
            fullname: '',
            namespace: ''
        }
    };
    let defaultLayout = {
        withStatusbar: true,
        withHeader: true,
        screenStyle: {},
        statusbarStyle: {}
    };
    let languageCode = 'en';
    let themeName = 'classic';
    let getInitialMembers = (options) => {
        return new Promise((resolve, reject) => {
            resolve(['test_user_1', 'test_user_2', 'test_user_3'].filter((member) => {
                return member.indexOf(options.searchText) > -1;
            }));
        });
    };
    let getMoreMembers = (options) => {
        return new Promise((resolve, reject) => {
            resolve(false);
        });
    };
    let getNumbers = (options) => {
        return new Promise((resolve, reject) => {
            resolve([]);
        });
    };
    let onBeforeMessageSend = (message) => {
        return new Promise((resolve, reject) => {
            resolve(message);
        });
    };
    let onBeforeCalloutStart = (calloutData) => {
        return new Promise((resolve, reject) => {
            resolve(calloutData);
        });
    };
    ...
    return (
        <AZStackSdk
            ref={"AZStackSdk"}
            options={{
                azstackConfig: azstackConfig,
                defaultLayout: defaultLayout,
                languageCode: languageCode,
                getInitialMembers: getInitialMembers,
                getMoreMembers: getMoreMembers,
                getNumbers: getNumbers,
                onBeforeMessageSend: onBeforeMessageSend,
                onBeforeCalloutStart: onBeforeCalloutStart
            }}
        >
    )
    ...
}
```

# APIS
List conversations
```javascript
    this.refs.AZStackSdk.showConversations(screenOptions) 
```
    
How to start chat
```javascript 
    this.refs.AZStackSdk.startChat({
        chatType: '', // 1: CHAT_TYPE_USER, 2: CHAT_TYPE_GROUP
        chatId: 0,
        // other screenOptions
    }); 
```

Show number pad for callout
```javascript 
    this.refs.AZStackSdk.showNumberPad(screenOptions) 
```

How to start callout
```javascript
    this.refs.AZStackSdk.startCallout({
        info: {
            fullname: 'Some name',
            toPhoneNumber: '0123456789',
            fromPhoneNumber: '0123456789',
        },
        onEndCall: () => {
            // or whatever you want here
        },
        // other screenOptions
    }); 
```

How to start video call
```javascript 
    this.refs.AZStackSdk.startVideoCall({
        info: {
            name: 'User 2',
            userId: 387212, // must be number
        },
        onEndCall: () => {
            // or whatever you want here
        },
        // other screenOptions
    }); 
```

How to start audio call
```javascript
    this.refs.AZStackSdk.startAudioCall({
        info: {
            fullname: 'User 2',
            userId: 387212, // must be number
        },
        onEndCall: () => {
            // or whatever you want here
        },
        // other screenOptions
    }); 
```

Show call logs
```javascript 
    this.refs.AZStackSdk.showCallLogs(screenOptions) 
```

Show user info
```javascript 
    this.refs.AZStackSdk.showUser(screenOptions) 
```

Show group info
```javascript 
    this.refs.AZStackSdk.showGroup(screenOptions) 
```

# screenOptions

```javascript
{
    onBackButtonPressed: () => {},
    screenStyle: {},
    statusbarStyle: {},
    withStatusbar: true | false, // true by default, overwrite defaultLayout
    withHeader: true | false, // true by default, overwrite defaultLayout
}
```

# For more detail about how it work
Visit https://github.com/azstack/azstack-react-native/blob/master/docs/Usage.md
