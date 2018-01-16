
# Table of Contents

* [1. Requirements](#1-requirements)
* [2. Sdk](#2-sdk)
    * [2.1. Initial](#21-initial)
    * [2.2. Connection ](#22-connection)
        * [2.2.1. Connect ](#221-connect)
        * [2.2.2. Disconnect ](#222-disconnect)
    * [2.3. Render](#23-render)
        * [2.3.1. Conversations List](#231-conversations-list)
* [3. Core](#3-core)
    * [3.2. Initial](#32-initial)
    * [3.3. Constants](#33-constants)
        * [3.3.1. Log levels](#331-log-levels)
        * [3.3.2. Error codes](#332-error-codes)
        * [3.3.3. Call constants](#333-call-constants)
            * [3.3.3.1. WebRTC](#3331-webrtc)
            * [3.3.3.2. Media type](#3332-media-type)
            * [3.3.3.3. Free call](#3333-free-call)
            * [3.3.3.4. Callout](#3334-callout)
            * [3.3.3.5. Callin](#3335-callin)
            * [3.3.3.6. Paid call log](#3336-paid-call-log)
        * [3.3.4. List constants](#334-list-constants)
            * [3.3.4.1. Done](#3341-done)
        * [3.3.5. Chat constants](#335-chat-constants)
            * [3.3.5.1. Chat Types](#3351-chat-types)
            * [3.3.5.2. Conversation Deleted](#3352-conversation-deleted)
            * [3.3.5.3. Message Types](#3353-message-types)
            * [3.3.5.4. Message Statuses](#3354-message-statuses)
            * [3.3.5.5. Message Deleted](#3355-message-deleted)
            * [3.3.5.6. Message file types](#3356-message-file-types)
        * [3.3.6. User constants](#336-user-constants)
            * [3.3.6.1. User status](#3361-user-status)
        * [3.3.7. Group constants](#337-group-constants)
            * [3.3.7.1. Group types](#3371-group-types)
            * [3.3.7.2. Group is in](#3372-group-is-in)
    * [3.4. Connection](#34-connection)
        * [3.4.1. Connect](#341-connect)
        * [3.4.2. Disconnect](#342-disconnect)
        * [3.4.3. Delegates](#343-delegates)
    * [3.5. Calls](#35-calls)
        * [3.5.1. Free call](#351-free-call)
            * [3.5.1.1. Start function](#3511-start-function)
            * [3.5.1.2. Stop function](#3512-stop-function)
            * [3.5.1.3. Answer function](#3513-answer-function)
            * [3.5.1.4. Reject function](#3514-reject-function)
            * [3.5.1.5. Not answer function](#3515-not-answer-function)
            * [3.5.1.6. Delegates](#3516-delegates)
        * [3.5.2 Callout](#352-callout)
            * [3.5.2.1. Start function](#3521-start-function)
            * [3.5.2.2. Stop function](#3522-stop-function)
            * [3.5.2.3. Delegates](#3523-delegates)
        * [3.5.3 Callin](#353-callin)
            * [3.5.3.1. Answer function](#3531-answer-function)
            * [3.5.3.2. Reject function](#3532-reject-function)
            * [3.5.3.3. Not Answered function](#3533-not-answered-function)
            * [3.5.3.4. Stop function](#3534-stop-function)
            * [3.5.3.5. Delegates](#3535-delegates)
        * [3.5.4. Ultilities](#354-ultilities)
            * [3.5.4.1. Toggle audio state function](#3541-toggle-audio-state-function)
            * [3.5.4.2. Toggle video state function](#3542-toggle-video-state-function)
            * [3.5.4.3. Switch camera type function](#3543-switch-camera-type-function)
        * [3.5.5. Paid call logs](#355-paid-call-logs)
            * [3.5.5.1. Get paid call logs](#3551-get-paid-call-logs)
            * [3.5.5.2. Delegates](#3552-delegates)
    * [3.6. Conversations](#36-conversations)
        * [3.6.1 Get modified conversations](#361-get-modified-conversations)
        * [3.6.2 Delete conversation](#362-delete-conversation)
    * [3.7. Messages](#37-messages)
        * [3.7.1. Get list](#371-get-list)
            * [3.7.1.1 Get unread messages](#3711-get-unread-messages)
            * [3.7.1.2 Get modified messages](#3712-get-modified-messages)
            * [3.7.1.3 Get modified files](#3713-get-modified-files)
        * [3.7.2. Sending](#372-sending)
            * [3.7.2.1. New message](#3721-new-message)
            * [3.7.2.2. Change message status](#3722-change-message-status)
            * [3.7.2.3. Delete message](#3723-delete-message)
            * [3.7.2.4. Send typing](#3724-send-typing)
        * [3.7.3. Delegates](#373-delegates)
            * [3.7.3.1. On new message](#3731-on-new-message)
            * [3.7.3.2. On message from me](#3732-on-message-from-me)
            * [3.7.3.3. On message status changed](#3733-on-message-status-changed)
            * [3.7.3.4. On typing](#3734-on-typing)
    * [3.8. User](#38-user)
        * [3.8.1. Get users information](#381-get-users-information)
    * [3.9. Group](#39-group)
        * [3.9.1. Group actions](#391-group-actions)
            * [3.9.1.1. Create group](#3911-create-group)
            * [3.9.1.2. Invite group](#3912-invite-group)
            * [3.9.1.3. Leave group](#3913-leave-group)
            * [3.9.1.4. Rename group](#3914-rename-group)
            * [3.9.1.5. Change admin group](#3915-change-admin-group)
            * [3.9.1.6. Join public group](#3916-join-public-group)
        * [3.9.2. Get functions](#392-get-functions)
            * [3.9.2.1. Get group details](#3921-get-group-details)
            * [3.9.2.2. Get groups list](#3922-get-groups-list)
        * [3.9.3. Delegates](#392-delegates)
            * [3.9.3.1. On group created](#3931-on-group-created)
            * [3.9.3.2. On group invited](#3932-on-group-invited)
            * [3.9.3.3. On group left](#3933-on-group-left)
            * [3.9.3.4. On group renamed](#3934-on-group-renamed)
            * [3.9.3.5. On group admin changed](#3935-on-group-admin-changed)
            * [3.9.3.6. On group public joined](#3936-on-group-public-joined)



# 1. Requirements

## 1.1. Get our sdk
## 1.2. Install socket.io-client https://github.com/socketio/socket.io-client
## 1.3. Install jsencrypt https://github.com/travist/jsencrypt
## 1.4. Install react-native-webrtc https://github.com/oney/react-native-webrtc




# 2. Sdk

## 2.1. Initial

```javascript
import { AZStackSdk } from '{path_to_libs}/azstack/';
```

```javascript
    this.AZStackSdk = new AZStackSdk({
        azstackConfig: {
            requestTimeout: 60000,
            intervalPingTime: 60000,
            logLevel: 'DEBUG',
            authenticatingData: {
                appId: 'bd7095762179b886c094c31b8f5e4646',
                publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs1XFclMmD+l83OY3oOqN2a4JH4PkFvi9O/SOAnASmgfjXliWm7XeVMHeTfNKWKcEZKzWp8rFdwVlO5dXqKquLmcmnr4gb+yvakXNnRm6z135BQDQKCAvrDyEuzr31mmtk935+Yxms8Lfiuxmi5hWZszfTyJDBp2xokeOXbDLjqhunMO3wfxs+lao0qxWxfk4Eb0847/3sY+Zt7hMIceZEYhg7rwdnkl+zNJusPnWYFsf5povE1/qke+KCAL5z2Xte7xcpSv3b29Tl5W4iMfGOqh4ikytfRL/OTRXH3U0wuLuxSDsD7Lms0foAEPCdRJzbGnoNmsV/ongwKRrONitFQIDAQAB',
                azStackUserId: 'test_user_1',
                userCredentials: '',
                fullname: 'Test User 1',
                namespace: ''
            }
        },
        languageCode: 'en',
        themeName: 'classic'
    });
    this.AZStackSdk.AZStackCore.connect();
```

#### Configs
> - azstackConfig(required): config of azstack
>   - requestTimeout(optional): must be number, default 60000
>   - intervalPingTime(optional): must be number, default 60000
>   - logLevel(optional): can be one of
>       - NONE: no log (default)
>       - ERROR: just when error occur
>       - INFO: log the error and info of porocess running
>       - DEBUG: log the error, infor and data send/receiced
>   - authenticatingData(required):
>       - appId(required): the id of your azstack application
>       - publicKey(required): the public key of ypur azstack application
>       - azStackUserId(required): an unique string for authenticating user in your application
>       - userCredentials(optional): the creadentials of authenticating user
>       - fullname(required): the name of authenticating user
>       - namespace(optional): the namespace of authenticating user
> - languageCode(optional): language code, default is 'en', can be 'en'
> - themeName(optional): theme name, default is 'classic', can be 'classic'



## 2.2. Connection 

### 2.2.1. Connect

```javascript 
this.AZStackSdk.connect({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackSdk.connect({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

#### error:
> - code: error code
> - message: error message

#### result:
> - azStackUserId: unique key string of users
> - userId: userId of user in azstack
> - fullname: fullname of user

### 2.2.2. Disconnect

```javascript 
this.AZStackSdk.disconnect({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackSdk.disconnect({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

#### error:
> - code: error code
> - message: error message




## 2.3. Render

### 2.3.1. Conversations List

```javascript
this.AZStackSdk.renderConversationsList({
    onBackButtonPressed: () => {}
});
```

#### params
> - onBackButtonPressed: on back button clicked function

#### result
> - Conversations component





# 3. Core 

## 3.2. Initial 

### 3.2.1. Import our core 

```javascript 
import { AZStackCore } from '{path_to_libs}/azstack/';
```

### 3.2.2. Config 

```javascript 
this.AZStackCore = new AZStackCore({
    requestTimeout: 60000,
    intervalPingTime: 60000,
    logLevel: azstack.logLevelConstants.LOG_LEVEL_NONE,
    authenticatingData: {
        appId: 'bd7095762179b886c094c31b8f5e4646',
        publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs1XFclMmD+l83OY3oOqN2a4JH4PkFvi9O/SOAnASmgfjXliWm7XeVMHeTfNKWKcEZKzWp8rFdwVlO5dXqKquLmcmnr4gb+yvakXNnRm6z135BQDQKCAvrDyEuzr31mmtk935+Yxms8Lfiuxmi5hWZszfTyJDBp2xokeOXbDLjqhunMO3wfxs+lao0qxWxfk4Eb0847/3sY+Zt7hMIceZEYhg7rwdnkl+zNJusPnWYFsf5povE1/qke+KCAL5z2Xte7xcpSv3b29Tl5W4iMfGOqh4ikytfRL/OTRXH3U0wuLuxSDsD7Lms0foAEPCdRJzbGnoNmsV/ongwKRrONitFQIDAQAB',
        azStackUserId: 'test_user_1',
        userCredentials: '',
        fullname: 'Test User 1',
        namespace: ''
    }
});
```

#### requestTimeout(optional):
> - must be number, default 60000

#### intervalPingTime(optional):
> - must be number, default 60000

#### logLevel(optional):
> - NONE: no log (default)
> - ERROR: just when error occur
> - INFO: log the error and info of porocess running
> - DEBUG: log the error, infor and data send/receiced

#### authenticatingData(optional):
> - appId(required): the id of your azstack application
> - publicKey(required): the public key of ypur azstack application
> - azStackUserId(required): an unique string for authenticating user in your application
> - userCredentials(optional): the creadentials of authenticating user
> - fullname(required): the name of authenticating user
> - namespace(optional): the namespace of authenticating user



## 3.3. Constants

### 3.3.1. Log levels
> - LOG_LEVEL_NONE: no log
> - LOG_LEVEL_ERROR: just when error occur
> - LOG_LEVEL_INFO: log the error and info of porocess running
> - LOG_LEVEL_DEBUG: log the error, infor and data send/receiced

### 3.3.2. Error codes:
> - ERR_SOCKET_CONNECT: cannot connect to socket
> - ERR_SOCKET_PARSE_BODY: cannot parse socket packet's body
> - ERR_SOCKET_UNKNOWN_SERVICE: unknow socket packet's service
> - ERR_SOCKET_NOT_CONNECTED: socket not connected
> - ERR_REQUEST_TIMEOUT: request timeout exceed
> - ERR_UNEXPECTED_DATA: some params invalid when handling in process
> - ERR_UNEXPECTED_SEND_DATA: some params invalid in send data
> - ERR_UNEXPECTED_RECEIVED_DATA: some params invalid in received data

### 3.3.3. Call constants

#### 3.3.3.1. WebRTC
> - CALL_WEBRTC_AUDIO_STATE_OFF(0): audio off
> - CALL_WEBRTC_AUDIO_STATE_ON(1): audio on

> - CALL_WEBRTC_VIDEO_STATE_OFF(0): video off
> - CALL_WEBRTC_VIDEO_STATE_ON(1): video on

> - CALL_WEBRTC_CAMERA_TYPE_FRONT('user'): camera front
> - CALL_WEBRTC_CAMERA_TYPE_BACK('environment): camera back

#### 3.3.3.2. Media type
> - CALL_MEDIA_TYPE_AUDIO(1): audio
> - CALL_MEDIA_TYPE_VIDEO(2): video

#### 3.3.3.3. Free call
> - CALL_STATUS_FREE_CALL_UNKNOWN(0): initial busy;
> - CALL_STATUS_FREE_CALL_CONNECTING(100): status connecting;
> - CALL_STATUS_FREE_CALL_RINGING(180): status ringing;
> - CALL_STATUS_FREE_CALL_ANSWERED(200): status answered;
> - CALL_STATUS_FREE_CALL_BUSY(600): status busy;
> - CALL_STATUS_FREE_CALL_REJECTED(603): status rejected;
> - CALL_STATUS_FREE_CALL_STOP(700): status stop;
> - CALL_STATUS_FREE_CALL_NOT_ANSWERED(400): status not answered;

#### 3.3.3.4. Callout
> - CALL_STATUS_CALLOUT_INITIAL_BUSY(-3): initial busy;
> - CALL_STATUS_CALLOUT_INITIAL_NOT_ENOUGH_BALANCE(-4): initial not enough balance;
> - CALL_STATUS_CALLOUT_INITIAL_INVALID_NUMBER(-5): initial invalid number;
> - CALL_STATUS_CALLOUT_STATUS_UNKNOWN(0): status unknown;
> - CALL_STATUS_CALLOUT_STATUS_CONNECTING(100): status connecting;
> - CALL_STATUS_CALLOUT_STATUS_RINGING(183): status ringing;
> - CALL_STATUS_CALLOUT_STATUS_ANSWERED(200): status answered;
> - CALL_STATUS_CALLOUT_STATUS_BUSY(486): status busy;
> - CALL_STATUS_CALLOUT_STATUS_NOT_ANSWERED(480): status answered;
> - CALL_STATUS_CALLOUT_STATUS_STOP(700): status stop;
> - CALL_STATUS_CALLOUT_STATUS_NOT_ENOUGH_BALANCE(702): status not enough balance;

#### 3.3.3.5. Callin
> - CALL_STATUS_CALLIN_STATUS_UNKNOWN(0): status unknown;
> - CALL_STATUS_CALLIN_STATUS_RINGING(183): status ringing;
> - CALL_STATUS_CALLIN_STATUS_ANSWERED(200): status answered;
> - CALL_STATUS_CALLIN_STATUS_BUSY(486): status busy;
> - CALL_STATUS_CALLIN_STATUS_NOT_ANSWERED(403): status answered;
> - CALL_STATUS_CALLIN_STATUS_RINGING_STOP(702): status ringing stop;
> - CALL_STATUS_CALLIN_STATUS_STOP(700): status stop;

#### 3.3.3.6. Paid call log
> - CALL_PAID_LOG_CALL_TYPE_CALLOUT(1): callout type
> - CALL_PAID_LOG_CALL_TYPE_CALLIN(2): callin type

> - CALL_PAID_LOG_CALL_STATUS_ANSWERED(0): status answered
> - CALL_PAID_LOG_CALL_STATUS_REJECTED(1): status rejected
> - CALL_PAID_LOG_CALL_STATUS_NOT_ANSWERED(2): status not answered

### 3.3.4. List constants

#### 3.3.4.1. Done
> - GET_LIST_DONE(1): done
> - GET_LIST_UNDONE(0): undone

### 3.3.5. Chat constants

#### 3.3.5.1. Chat Types
> - CHAT_TYPE_USER(1): chat with user
> - CHAT_TYPE_GROUP(2): chat with group

#### 3.3.5.2. Conversation Deleted
> - CONVERSATION_DELETED_FALSE(0): not deleted
> - CONVERSATION_DELETED_TRUE(1): deleted

#### 3.3.5.3. Message Types
> - MESSAGE_TYPE_TEXT(1): text message
> - MESSAGE_TYPE_STICKER(2): sticker message
> - MESSAGE_TYPE_FILE(3): file message
> - MESSAGE_TYPE_GROUP_CREATED(4): create group message
> - MESSAGE_TYPE_GROUP_INVITED(5): invite group message
> - MESSAGE_TYPE_GROUP_LEFT(6): leave group message
> - MESSAGE_TYPE_GROUP_RENAMED(7): rename group message
> - MESSAGE_TYPE_GROUP_ADMIN_CHANGED(8): change admin group message
> - MESSAGE_TYPE_GROUP_PUBLIC_JOINED(9): join public group message

#### 3.3.5.4. Message Statuses
> - MESSAGE_STATUS_SENDING(0): status sending
> - MESSAGE_STATUS_SENT(1): status sent
> - MESSAGE_STATUS_DELIVERED(2): status delivered
> - MESSAGE_STATUS_SEEN(3): status seen
> - MESSAGE_STATUS_CANCELLED(6): status cancelled

#### 3.3.5.5. Message Deleted
> - MESSAGE_DELETED_FALSE(0): not deleted
> - MESSAGE_DELETED_TRUE(1): deleted

#### 3.3.5.6. Message file types
> - MESSAGE_FILE_TYPE_UNKNOWN(0): file type unknown
> - MESSAGE_FILE_TYPE_IMAGE(1): file type image
> - MESSAGE_FILE_TYPE_AUDIO(2): file type audio
> - MESSAGE_FILE_TYPE_VIDEO(3): file type video
> - MESSAGE_FILE_TYPE_EXCEL(4): file type excel
> - MESSAGE_FILE_TYPE_WORD(5): file type word
> - MESSAGE_FILE_TYPE_POWERPOINT(6): file type power point
> - MESSAGE_FILE_TYPE_PDF(7): file type pdf
> - MESSAGE_FILE_TYPE_TEXT(8): file type text
> - MESSAGE_FILE_TYPE_CODE(9): file type code
> - MESSAGE_FILE_TYPE_ARCHIVE(10): file type archive

### 3.3.6. User constants

#### 3.3.6.1. User status
> - USER_STATUS_ONLINE(1): online
> - USER_STATUS_NOT_ONLINE(0): not online

### 3.3.7. Group constants

#### 3.3.7.1. Group types
> - GROUP_TYPE_PRIVATE(0): private group
> - GROUP_TYPE_PUBLIC(1): public group

#### 3.3.7.2. Group is in
> - GROUP_IS_NOT_IN(0): not in group
> - GROUP_IS_IN(1): in group

#### 3.3.7.2. Group is auto join
> - GROUP_IS_NOT_AUTO_JOIN(0): group is not auto join
> - GROUP_IS_AUTO_JOIN(1): group is auto join




## 3.4. Connection 

### 3.4.1. Connect

```javascript 
this.AZStackCore.connect({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.connect({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onAuthencationReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.connect({});
```

#### error:
> - code: error code
> - message: error message

#### result:
> - azStackUserId: unique key string of users
> - userId: userId of user in azstack
> - fullname: fullname of user

### 3.4.2. Disconnect

```javascript 
this.AZStackCore.disconnect({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.disconnect({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onDisconnectReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.disconnect({});
```

#### error:
> - code: error code
> - message: error message

### 3.4.3. Delegates

```javascript 
this.AZStackCore.Delegates.onDisconnected = (error, result) => {
    console.log(error, result);
};
```



## 3.5. Calls 

### 3.5.1. Free call

#### 3.5.1.1. Start function

```javascript 
this.AZStackCore.startFreeCall({
    mediaType: this.AZStackCore.callConstants.CALL_MEDIA_TYPE_AUDIO,
    toUserId: 1234
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.startFreeCall({
    mediaType: this.AZStackCore.callConstants.CALL_MEDIA_TYPE_AUDIO,
    toUserId: 1234
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onStartFreeCallReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.startFreeCall({
    mediaType: this.AZStackCore.callConstants.CALL_MEDIA_TYPE_AUDIO,
    toUserId: 1234
});
```

#### params(required):
> - mediaType(required): media type
> - toUserId(required): target user id

#### error:
> - code: error code
> - status: callout status
> - message: error message

#### 3.5.1.2. Stop function

```javascript 
this.AZStackCore.stopFreeCall({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.stopFreeCall({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onStopFreeCallReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.stopFreeCall({});
```

#### error:
> - code: error code
> - message: error message

#### 3.5.1.3. Answer function

```javascript 
this.AZStackCore.answerFreeCall({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.answerFreeCall({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onAnswerFreeCallReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.answerFreeCall({});
```

#### error:
> - code: error code
> - message: error message

#### 3.5.1.4. Reject function

```javascript 
this.AZStackCore.rejectFreeCall({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.rejectFreeCall({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onRejectFreeCallReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.rejectFreeCall({});
```

#### error:
> - code: error code
> - message: error message

#### 3.5.1.5. Not answer function

```javascript 
this.AZStackCore.notAnswerFreeCall({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.notAnswerFreeCall({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onNotAnswerFreeCallReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.notAnswerFreeCall({});
```

#### error:
> - code: error code
> - message: error message

#### 3.5.1.6. Delegates

```javascript 
this.AZStackCore.Delegates.onFreeCallStart = (error, result) => {
    console.log(error, result);
};
```

#### error:
> - code: error code
> - message: error message

#### result:
> - mediaType: media type
> - fromUserId: from user id
> - toUserId: to user id

```javascript 
this.AZStackCore.Delegates.onFreeCallStatusChanged = (error, result) => {
    console.log(error, result);
};
```

#### error:
> - code: error code
> - message: error message

#### result:
> - status: call status
> - message: status message

```javascript 
this.AZStackCore.Delegates.onFreeCallStatusChangedByMe = (error, result) => {
    console.log(error, result);
};
```

#### error:
> - code: error code
> - message: error message

#### result:
> - status: call status
> - message: status message

```javascript 
this.AZStackCore.Delegates.onLocalStreamArrived = (error, result) => {
    console.log(error, result);
};
```

#### error:
> - code: error code
> - message: error message

#### result:
> - stream: call media stream

```javascript 
this.AZStackCore.Delegates.onLocalStreamArrived = (error, result) => {
    console.log(error, result);
};
```

#### error:
> - code: error code
> - message: error message

#### result:
> - stream: call media stream

### 3.5.2. Callout

#### 3.5.2.1. Start function

```javascript 
this.AZStackCore.startCallout({
    toPhoneNumber: '123456789'
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.startCallout({
    toPhoneNumber: '123456789'
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onStartCalloutReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.startCallout({
    toPhoneNumber: '123456789'
});
```

#### params(required):
> - toPhoneNumber(required): target phone number

#### error:
> - code: error code
> - status: callout status
> - message: error message

#### 3.5.2.2. Stop function

```javascript 
this.AZStackCore.stopCallout({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.stopCallout({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onStopCalloutReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.stopCallout({});
```

#### error:
> - code: error code
> - message: error message

#### 3.5.2.3. Delegates

```javascript 
this.AZStackCore.Delegates.onCalloutStatusChanged = (error, result) => {
    console.log(error, result);
};
```
#### error:
> - code: error code
> - message: error message

#### result:
> - status: call status
> - message: status message

### 3.5.3. Callin

#### 3.5.3.1. Answer function

```javascript 
this.AZStackCore.answerCallin({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.answerCallin({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onAnswerCallinReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.answerCallin({});
```

#### error:
> - code: error code
> - message: error message

#### 3.5.3.2. Reject function

```javascript 
this.AZStackCore.rejectCallin({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.rejectCallin({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onRejectCallinReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.rejectCallin({});
```

#### error:
> - code: error code
> - message: error message

#### 3.5.3.3. Not Answered function

```javascript 
this.AZStackCore.notAnsweredCallin({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.notAnsweredCallin({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onNotAnsweredCallinReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.notAnsweredCallin({});
```

#### error:
> - code: error code
> - message: error message

#### 3.5.3.4. Stop function

```javascript 
this.AZStackCore.stopCallin({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.stopCallin({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onStopCallinReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.stopCallin({});
```

#### error:
> - code: error code
> - message: error message

#### 3.5.3.5. Delegates

```javascript 
this.AZStackCore.Delegates.onCallinStart = (error, result) => {
    console.log(error, result);
};
```
#### error:
> - code: error code
> - message: error message

#### result:
> - fromPhoneNumber: from phone number
> - toPhoneNumber: to phone number

```javascript 
this.AZStackCore.Delegates.onCallinStatusChanged = (error, result) => {
    console.log(error, result);
};
```

#### error:
> - code: error code
> - message: error message

#### result:
> - status: call status
> - message: status message

```javascript 
this.AZStackCore.Delegates.onCallinStatusChangedByMe = (error, result) => {
    console.log(error, result);
};
```

#### error:
> - code: error code
> - message: error message

#### result:
> - status: call status by me
> - message: status message

### 3.5.4. Ultilities

#### 3.5.4.1. Toggle audio state function

```javascript 
this.AZStackCore.toggleAudioState({
    state: this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_OFF
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.toggleAudioState({
    state: this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_OFF
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onToggleAudioStateReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.toggleAudioState({
    state: this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_OFF
});
```

#### options(optional):
> - state(optional): audio state

#### error:
> - code: error code
> - message: error message

#### result:
> - audioState: audio state

#### 3.5.4.2. Toggle video state function

```javascript 
this.AZStackCore.toggleVideoState({
    state: this.AZStackCore.callConstants.CALL_WEBRTC_VIDEO_STATE_OFF
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.toggleVideoState({
    state: this.AZStackCore.callConstants.CALL_WEBRTC_VIDEO_STATE_OFF
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onToggleVideoStateReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.toggleVideoState({
    state: this.AZStackCore.callConstants.CALL_WEBRTC_VIDEO_STATE_OFF
});
```

#### options(optional):
> - state(optional): video state

#### error:
> - code: error code
> - message: error message

#### result:
> - videoState: video state

#### 3.5.4.3. Switch camera type function

```javascript 
this.AZStackCore.switchCameraType({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.switchCameraType({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onSwitchCameraTypeReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.switchCameraType({});
```

#### error:
> - code: error code
> - message: error message

#### result:
> - cameraType: camera type

### 3.5.5. Paid call logs

#### 3.5.5.1. Get paid call logs

```javascript 
this.AZStackCore.getPaidCallLogs({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.getPaidCallLogs({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onGetPaidCallLogsReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.getPaidCallLogs({});
```

#### error:
> - code: error code
> - message: error message

#### result: list of callLog with
> - callId: id of call
> - callType: type of call
> - callStatus: status of call
> - userId: id of user
> - fromPhoneNumber: from phone number
> - toPhoneNumber: to phone number
> - recordTime: recording time
> - recordUrl: recording url

#### 3.5.5.2. Delegates

```javascript 
this.AZStackCore.Delegates.onPaidCallLogReturn = (error, result) => {
    console.log(error, result);
};
```

#### error:
> - code: error code
> - message: error message

#### result:
> - callId: id of call
> - callType: type of call
> - callStatus: status of call
> - userId: id of user
> - fromPhoneNumber: from phone number
> - toPhoneNumber: to phone number
> - recordTime: recording time
> - recordUrl: recording url



## 3.6. Conversations

### 3.6.1 Get modified conversations

```javascript 
this.AZStackCore.getModifiedConversations({
    page: 1,
    lastCreated: new Date().getTime()
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.getModifiedConversations({
    page: 1,
    lastCreated: new Date().getTime()
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onGetModifiedConversationsReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.getModifiedConversations({
    page: 1,
    lastCreated: new Date().getTime()
});
```
#### params
> - page(required): page number
> - lastCreated(required): last created date time

#### error:
> - code: error code
> - message: error message

#### result:
> - done: done or not
> - page: page number
> - list: modified conversations list
>   - chatType: chat type
>   - chatId: chat id
>   - modified: modified date time stamp
>   - unread: number of unread message
>   - deleted: deleted or not
>   - lastMessage: last message 
>       - chatType: chat type
>       - chatId: chat id
>       - senderId: id of sender
>       - receiverId: id of receiver
>       - msgId: id of message
>       - type: type of message
>       - status: status of message
>       - deleted: message deleted
>       - created: created time
>       - modified: modified time
>       - text: text of message
>       - sticker: sticker of message
>       - file: file of message
>           - type: file type
>       - createdGroup: created group
>           - groupId: id of group
>           - adminId: id of admin
>           - name: name of group
>           - created: created time
>       - invited: invited data
>           - groupId: id of group
>           - inviteIds: id of inviteds
>       - left: left data
>           - groupId: id of group
>           - leaveId: id of leaver
>           - newAdminId: id of new admin
>       - renamed: renamed data
>           - groupId: id of group
>           - newName: new name
>       - adminChanged: admin changed data
>           - groupId: id of group
>           - newAdminId: new admin id
>       - joined: joined data
>           - groupId: id of group
>           - joinId: join id

### 3.6.2 Delete conversation

```javascript 
this.AZStackCore.deleteConversation({
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_GROUP,
    chatId: 1234
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.deleteConversation({
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_GROUP,
    chatId: 1234
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onDeleteConversationReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.deleteConversation({
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_GROUP,
    chatId: 1234
});
```
#### params
> - chatType(required): chat type
> - chatId(required): chat id

#### error:
> - code: error code
> - message: error message

#### result:
> - chatType: chat type
> - chatId: chat id




## 3.7. Messages

### 3.7.1. Get list

#### 3.7.1.1. Get unread messages

```javascript 
this.AZStackCore.getUnreadMessages({
    page: 1,
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.getUnreadMessages({
    page: 1,
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.getUnreadMessages = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.onGetUnreadMessagesReturn({
    page: 1,
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345
});
```
#### params
> - page(required): page number
> - chatType(required): chat type
> - chatId(required): chatId

#### error:
> - code: error code
> - message: error message

#### result:
> - chatType: chat type
> - chatId: chat id
> - done: done or not
> - page: page number
> - list: unread messages list
>   - chatType: chat type
>   - chatId: chat id
>   - senderId: id of sender
>   - receiverId: id of receiverId
>   - msgId: id of message
>   - type: type of message
>   - status: status of message
>   - deleted: message deleted
>   - created: created time
>   - modified: modified time
>   - text: text of message
>   - sticker: sticker of message
>       - name: name
>       - catId: catId
>       - url: url
>   - file: file of message
>       - name: name
>       - length: length
>       - type: type
>       - url: url
>   - createdGroup: created group
>       - type: group type
>       - groupId: id of group
>       - adminId: id of admin
>       - name: name of group
>       - memberIds: ids of members
>       - created: created time
>   - invited: invited data
>       - groupId: id of group
>       - inviteIds: id of inviteds
>   - left: left data
>       - groupId: id of group
>       - leaveId: id of leaver
>       - newAdminId: id of new admin
>   - renamed: renamed data
>       - groupId: id of group
>       - newName: new name
>   - adminChanged: admin changed data
>       - groupId: id of group
>       - newAdminId: new admin id
>   - joined: joined data
>       - groupId: id of group
>       - joinId: join id

#### 3.7.1.2 Get modified messages

```javascript 
this.AZStackCore.getModifiedMessages({
    page: 1,
    lastCreated: new Date().getTime(),
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.getModifiedMessages({
    page: 1,
    lastCreated: new Date().getTime(),
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onGetModifiedMessagesReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.getModifiedMessages({
    page: 1,
    lastCreated: new Date().getTime(),
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345
});
```
#### params
> - page(required): page number
> - lastCreated(required): last created date time
> - chatType(required): chat type
> - chatId(required): chatId

#### error:
> - code: error code
> - message: error message

#### result:
> - chatType: chat type
> - chatId: chat id
> - done: done or not
> - page: page number
> - list: modified messages list
>   - chatType: chat type
>   - chatId: chat id
>   - senderId: id of sender
>   - receiverId: id of receiverId
>   - msgId: id of message
>   - type: type of message
>   - status: status of message
>   - deleted: message deleted
>   - created: created time
>   - modified: modified time
>   - text: text of message
>   - sticker: sticker of message
>       - name: name
>       - catId: catId
>       - url: url
>   - file: file of message
>       - name: name
>       - length: length
>       - type: type
>       - url: url
>   - createdGroup: created group
>       - type: group type
>       - groupId: id of group
>       - adminId: id of admin
>       - name: name of group
>       - memberIds: ids of members
>       - created: created time
>   - invited: invited data
>       - groupId: id of group
>       - inviteIds: id of inviteds
>   - left: left data
>       - groupId: id of group
>       - leaveId: id of leaver
>       - newAdminId: id of new admin
>   - renamed: renamed data
>       - groupId: id of group
>       - newName: new name
>   - adminChanged: admin changed data
>       - groupId: id of group
>       - newAdminId: new admin id
>   - joined: joined data
>       - groupId: id of group
>       - joinId: join id

#### 3.7.1.3 Get modified files

```javascript 
this.AZStackCore.getModifiedFiles({
    lastCreated: new Date().getTime(),
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.getModifiedFiles({
    lastCreated: new Date().getTime(),
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onGetModifiedFilesReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.getModifiedFiles({
    lastCreated: new Date().getTime(),
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345
});
```
#### params
> - lastCreated(required): last created date time
> - chatType(optional): chat type
> - chatId(optional): chatId

#### error:
> - code: error code
> - message: error message

#### result:
> - done: done or not
> - list: modified files list
>   - chatType: chat type
>   - chatId: chat id
>   - senderId: id of sender
>   - receiverId: id of receiverId
>   - msgId: id of message
>   - type: type of message
>   - status: status of message
>   - deleted: message deleted
>   - created: created time
>   - modified: modified time
>   - file: file of message
>       - name: name
>       - length: length
>       - type: type
>       - url: url

### 3.7.2. Sending

#### 3.7.2.1. New message

```javascript 
this.AZStackCore.newMessage({
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345,
    text: 'text',
    sticker: {
        name: 'name',
        catId: 1,
        url: 'http://azstack.com/api/public_html/sticker/1/002.png'
    },
    file: {
        name: 'logo.png',
        length: 5183,
        type: this.chatConstants.MESSAGE_FILE_TYPE_IMAGE,
        url: 'https://azstack.com/static/images/logo.png'
    }
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.newMessage({
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345,
    text: 'text',
    sticker: {
        name: 'name',
        catId: 1,
        url: 'http://azstack.com/api/public_html/sticker/1/002.png'
    },
    file: {
        name: 'logo.png',
        length: 5183,
        type: this.chatConstants.MESSAGE_FILE_TYPE_IMAGE,
        url: 'https://azstack.com/static/images/logo.png'
    }
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onNewMessageReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.newMessage({
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345,
    text: 'text',
    sticker: {
        name: 'name',
        catId: 1,
        url: 'http://azstack.com/api/public_html/sticker/1/002.png'
    },
    file: {
        name: 'logo.png',
        length: 5183,
        type: this.chatConstants.MESSAGE_FILE_TYPE_IMAGE,
        url: 'https://azstack.com/static/images/logo.png'
    }
});
```
#### params
> - chatType(required): chat type
> - chatId(required): chatId
> - text(optional): text message
> - sticker(optional): sticker of message
>   - name(required): name
>   - catId(required): catId
>   - url(required): url
> - file(optional): file of message
>   - name(required): name
>   - length(required): length
>   - type(required): type
>   - url(required): url

#### error:
> - code: error code
> - message: error message

#### result:
> - chatType: chat type
> - chatId: chat id
> - senderId: id of sender
> - receiverId: id of receiverId
> - msgId: id of message
> - type: type of message
> - status: status of message
> - deleted: message deleted
> - created: created time
> - modified: modified time
> - text: text of message
> - sticker: sticker of message
>   - name: name
>   - catId: catId
>   - url: url
> - file: file of message
>   - name: name
>   - length: length
>   - type: type
>   - url: url

#### 3.7.2.2. Change message status

```javascript 
this.AZStackCore.changeMessageStatus({
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345,
    messageSenderId: 1111,
    messageStatus: this.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED,
    msgId: 54321
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.changeMessageStatus({
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345,
    messageSenderId: 1111,
    messageStatus: this.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED,
    msgId: 54321
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onChangeMessageStatusReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.changeMessageStatus({
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345,
    messageSenderId: 1111,
    messageStatus: this.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED,
    msgId: 54321
});
```

#### params
> - chatType(required): chat type
> - chatId(required): chatId
> - messageSenderId(required): message senderId
> - messageStatus(required): message status
> - msgId(required): message id

#### error:
> - code: error code
> - message: error message

#### 3.7.2.3. Delete message

```javascript 
this.AZStackCore.deleteMessage({
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345,
    messageSenderId: 1111,
    msgId: 54321
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.deleteMessage({
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345,
    messageSenderId: 1111,
    msgId: 54321
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onMessageDeleted = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.deleteMessage({
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345,
    messageSenderId: 1111,
    msgId: 54321
});
```

#### params
> - chatType(required): chat type
> - chatId(required): chatId
> - messageSenderId(required): message senderId
> - msgId(required): message id

#### error:
> - code: error code
> - message: error message

#### 3.7.2.4. Send typing

```javascript 
this.AZStackCore.sendTyping({
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.sendTyping({
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onSendTypingReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.sendTyping({
    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
    chatId: 12345
});
```

#### params
> - chatType(required): chat type
> - chatId(required): chatId

#### error:
> - code: error code
> - message: error message

### 3.7.3. Delegates

#### 3.7.3.1. On new message

```javascript 
this.AZStackCore.Delegates.onHasNewMessage = (error, result) => {
    console.log(error, result);
};
```

#### error:
> - code: error code
> - message: error message

#### result:
> - chatType: chat type
> - chatId: chat id
> - senderId: id of sender
> - receiverId: id of receiverId
> - msgId: id of message
> - type: type of message
> - status: status of message
> - deleted: message deleted
> - created: created time
> - modified: modified time
> - text: text of message
> - sticker: sticker of message
>   - name: name
>   - catId: catId
>   - url: url
> - file: file of message
>   - name: name
>   - length: length
>   - type: type
>   - url: url

#### 3.7.3.2. On message from me

```javascript 
this.AZStackCore.Delegates.onMessageFromMe = (error, result) => {
    console.log(error, result);
};
```

#### error:
> - code: error code
> - message: error message

#### result:
> - chatType: chat type
> - chatId: chat id
> - senderId: id of sender
> - receiverId: id of receiverId
> - msgId: id of message
> - type: type of message
> - status: status of message
> - deleted: message deleted
> - created: created time
> - modified: modified time
> - text: text of message
> - sticker: sticker of message
>   - name: name
>   - catId: catId
>   - url: url
> - file: file of message
>   - name: name
>   - length: length
>   - type: type
>   - url: url

#### 3.7.3.3. On message status changed

```javascript 
this.AZStackCore.Delegates.onMessageStatusChanged = (error, result) => {
    console.log(error, result);
};
```

#### error:
> - code: error code
> - message: error message

#### result:
> - chatType: chat type
> - chatId: chat id
> - senderId: id of sender
> - receiverId: id of receiverId
> - msgId: id of message
> - messageStatus: status of message

#### 3.7.3.4. On typing

```javascript 
this.AZStackCore.Delegates.onTyping = (error, result) => {
    console.log(error, result);
};
```

#### error:
> - code: error code
> - message: error message

#### result:
> - chatType: chat type
> - chatId: chat id
> - senderId: id of sender
> - receiverId: id of receiverId



## 3.8. User

### 3.8.1. Get users information

```javascript 
this.AZStackCore.getUsersInformation({
    userIds: [123],
    azStackUserIds: ['abcd']
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.getUsersInformation({
    userIds: [123],
    azStackUserIds: ['abcd']
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onGetUsersInformationReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.getUsersInformation({
    userIds: [123],
    azStackUserIds: ['abcd']
});
```

#### params
> - userIds(optional): array of userIds (number)
> - azStackUserIds(optional): array of azStackUserIds (string)

#### error:
> - code: error code
> - message: error message

#### result:
> - done: done or not
> - list: users information list
>   - userId: id of user
>   - azStackUserId: unique string of user
>   - fullname: fullname of user
>   - status: status of user
>   - lastVisitDate: last visit date of user



## 3.9. Group

### 3.9.1. Group actions

#### 3.9.1.1. Create group

```javascript 
this.AZStackCore.createGroup({
    type: this.AZStackCore.groupConstants.GROUP_TYPE_PRIVATE,
    name: 'Group name',
    memberIds: [1234, 4321]
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.createGroup({
    type: this.AZStackCore.groupConstants.GROUP_TYPE_PRIVATE,
    name: 'Group name',
    memberIds: [1234, 4321]
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onGroupCreateReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.createGroup({
    type: this.AZStackCore.groupConstants.GROUP_TYPE_PRIVATE,
    name: 'Group name',
    memberIds: [1234, 4321]
});
```

#### params
> - type(required): group type
> - name(required): group name
> - memberIds(required): array of user ids (number)

#### error:
> - code: error code
> - message: error message

#### result:
> - type: group type
> - groupId: id of group
> - msgId: id of create group message
> - adminId: id of admin
> - name: name of group
> - memberIds: ids of members
> - created: created time

#### 3.9.1.2. Invite group

```javascript 
this.AZStackCore.inviteGroup({
    groupId: 1234,
    inviteIds: [4321]
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.inviteGroup({
    groupId: 1234,
    inviteIds: [4321]
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onGroupInviteReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.inviteGroup({
    groupId: 1234,
    inviteIds: [4321]
});
```

#### params
> - groupId(required): id of group
> - inviteIds(required): array of user ids (number)

#### error:
> - code: error code
> - message: error message

#### result:
> - groupId: id of group
> - msgId: id of create group message
> - inviteIds: id of inviteds
> - created: created time

#### 3.9.1.3. Leave group

```javascript 
this.AZStackCore.leaveGroup({
    groupId: 1234,
    leaveId: 4321,
    newAdminId: 1122
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.leaveGroup({
    groupId: 1234,
    leaveId: 4321,
    newAdminId: 1122
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onGroupLeaveReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.leaveGroup({
    groupId: 1234,
    leaveId: 4321,
    newAdminId: 1122
});
```

#### params
> - groupId(required): id of group
> - leaveId(required): user ids 
> - newAdminId(optional): user ids (required in case leave with role admin)

#### error:
> - code: error code
> - message: error message

#### result:
> - groupId: id of group
> - msgId: id of create group message
> - leaveId: id of leaver
> - created: created time

#### 3.9.1.4. Rename group

```javascript 
this.AZStackCore.renameGroup({
    groupId: 1234,
    newName: 'Test Group'
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.renameGroup({
    groupId: 1234,
    newName: 'Test Group'
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onGroupRenameReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.renameGroup({
    groupId: 1234,
    newName: 'Test Group'
});
```

#### params
> - groupId(required): id of group
> - newName(required): new name

#### error:
> - code: error code
> - message: error message

#### result:
> - groupId: id of group
> - msgId: id of create group message
> - newName: new name
> - created: created time

#### 3.9.1.5. Change admin group

```javascript 
this.AZStackCore.changeAdminGroup({
    groupId: 1234,
    newAdminId: 4321
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.changeAdminGroup({
    groupId: 1234,
    newAdminId: 4321
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onGroupAdminChangeReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.changeAdminGroup({
    groupId: 1234,
    newAdminId: 4321
});
```

#### params
> - groupId(required): id of group
> - newAdminId(required): new admin id

#### error:
> - code: error code
> - message: error message

#### result:
> - groupId: id of group
> - msgId: id of create group message
> - newAdminId: new admin id
> - created: created time

#### 3.9.1.6. Join public group

```javascript 
this.AZStackCore.joinPublicGroup({
    groupId: 1234
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.joinPublicGroup({
    groupId: 1234
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onGroupJoinPublicReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.joinPublicGroup({
    groupId: 1234
});
```

#### params
> - groupId(required): id of group

#### error:
> - code: error code
> - message: error message

#### result:
> - groupId: id of group
> - msgId: id of create group message
> - joinId: join id
> - created: created time

### 3.9.2. Get functions

#### 3.9.2.1. Get group details

```javascript 
this.AZStackCore.getDetailsGroup({
    groupId: 1234
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.getDetailsGroup({
    groupId: 1234
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onGroupGetDetailsReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.getDetailsGroup({
    groupId: 1234
});
```

#### params
> - groupId(required): id of group

#### error:
> - code: error code
> - message: error message

#### result:
> - type: type of group
> - groupId: id of group
> - adminId: id of group admin
> - name: name of group
> - memberIds: array of member user ids
> - members: array of members
>   - userId: id of user
>   - azStackUserId: unique string of user
>   - fullname: fullname of user
>   - status: status of user

#### 3.9.2.2. Get groups list

```javascript 
this.AZStackCore.getListGroups({
    groupType: this.AZStackCore.groupConstants.GROUP_TYPE_PRIVATE
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStackCore.getListGroups({
    groupType: this.AZStackCore.groupConstants.GROUP_TYPE_PRIVATE
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStackCore.Delegates.onGroupGetListReturn = (error, result) => {
    console.log(error, result);
};
this.AZStackCore.getListGroups({
    groupType: this.AZStackCore.groupConstants.GROUP_TYPE_PRIVATE
});
```

#### params
> - groupType(required): group type

#### error:
> - code: error code
> - message: error message

#### result:
> - done: is done or not
> - list: list of groups
>   - type: type of group
>   - groupId: id of group
>   - adminId: id of group admin
>   - name: name of group
>   - membersCount: total members
>   - isIn: is in group
>   - isAutojoin: is group auto join

### 3.9.3. Delegates

#### 3.9.3.1. On group created

```javascript 
this.AZStackCore.Delegates.onGroupCreated = (error, result) => {
    console.log(error, result);
};
```

#### error:
> - code: error code
> - message: error message

#### result:
> - chatType: chat type
> - chatId: chat id
> - senderId: id of sender
> - receiverId: id of receiverId
> - msgId: id of message
> - type: type of message
> - status: status of message
> - deleted: message deleted
> - created: created time
> - modified: modified time
> - createdGroup: created group
>   - type: group type
>   - groupId: id of group
>   - adminId: id of admin
>   - name: name of group
>   - memberIds: ids of members
>   - created: created time

#### 3.9.3.2. On group invited

```javascript 
this.AZStackCore.Delegates.onGroupInvited = (error, result) => {
    console.log(error, result);
};
```

#### error:
> - code: error code
> - message: error message

#### result:
> - chatType: chat type
> - chatId: chat id
> - senderId: id of sender
> - receiverId: id of receiverId
> - msgId: id of message
> - type: type of message
> - status: status of message
> - deleted: message deleted
> - created: created time
> - modified: modified time
> - invited: invited data
>   - groupId: id of group
>   - inviteIds: id of inviteds

#### 3.9.3.3. On group left

```javascript 
this.AZStackCore.Delegates.onGroupLeft = (error, result) => {
    console.log(error, result);
};
```

#### error:
> - code: error code
> - message: error message

#### result:
> - chatType: chat type
> - chatId: chat id
> - senderId: id of sender
> - receiverId: id of receiverId
> - msgId: id of message
> - type: type of message
> - status: status of message
> - deleted: message deleted
> - created: created time
> - modified: modified time
> - left: left data
>   - groupId: id of group
>   - leaveId: id of leaver
>   - newAdminId: id of new admin

#### 3.9.3.4. On group renamed

```javascript 
this.AZStackCore.Delegates.onGroupRenamed = (error, result) => {
    console.log(error, result);
};
```

#### error:
> - code: error code
> - message: error message

#### result:
> - chatType: chat type
> - chatId: chat id
> - senderId: id of sender
> - receiverId: id of receiverId
> - msgId: id of message
> - type: type of message
> - status: status of message
> - deleted: message deleted
> - created: created time
> - modified: modified time
> - renamed: renamed data
>   - groupId: id of group
>   - newName: new name

#### 3.9.3.5. On group admin changed

```javascript 
this.AZStackCore.Delegates.onGroupAdminChanged = (error, result) => {
    console.log(error, result);
};
```

#### error:
> - code: error code
> - message: error message

#### result:
> - chatType: chat type
> - chatId: chat id
> - senderId: id of sender
> - receiverId: id of receiverId
> - msgId: id of message
> - type: type of message
> - status: status of message
> - deleted: message deleted
> - created: created time
> - modified: modified time
> - adminChanged: admin changed data
>   - groupId: id of group
>   - newAdminId: new admin id

#### 3.9.3.6. On group public joined

```javascript 
this.AZStackCore.Delegates.onGroupPublicJoined = (error, result) => {
    console.log(error, result);
};
```

#### error:
> - code: error code
> - message: error message

#### result:
> - chatType: chat type
> - chatId: chat id
> - senderId: id of sender
> - receiverId: id of receiverId
> - msgId: id of message
> - type: type of message
> - status: status of message
> - deleted: message deleted
> - created: created time
> - modified: modified time
> - joined: joined data
>   - groupId: id of group
>   - joinId: join id