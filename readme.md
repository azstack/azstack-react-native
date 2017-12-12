
# Table of Contents

* [1. Requirements](#1-requirements)
* [2. Setup](#2-setup)
* [3. Constants](#3-constants)
    * [3.1. Log levels](#31-log-levels)
    * [3.2. Error codes](#32-error-codes)
    * [3.3. Call constants](#33-call-constants)
        * [3.3.1. Callout](#331-callout)
        * [3.3.2. Callin](#332-callin)
        * [3.3.3. Paid call log](#333-paid-call-log)
    * [3.4. List constants](#34-list-constants)
        * [3.4.1. Done](#341-done)
    * [3.5. Chat constants](#35-chat-constants)
        * [3.5.1. Chat Types](#351-chat-types)
        * [3.5.2. Message Types](#352-message-types)
        * [3.5.3. Message Statuses](#353-message-statuses)
        * [3.5.4. Message Deleted](#354-message-deleted)
        * [3.5.5. Message file types](#355-message-file-types)
    * [3.6. User constants](#36-user-constants)
        * [3.6.1. User status](#361-user-status)
    * [3.7. Group constants](#37-group-constants)
        * [3.7.1. Group types](#371-group-types)
* [4. Connection](#4-connection)
    * [4.1. Connect](#41-connect)
    * [4.2. Disconnect](#42-disconnect)
* [5. Calls](#5-calls)
    * [5.1 Callout](#51-callout)
        * [5.1.1. Start function](#511-start-function)
        * [5.1.2. Stop function](#512-stop-function)
        * [5.1.3. Delegates](#513-delegates)
    * [5.2 Callin](#52-callin)
        * [5.2.1. Answer function](#521-answer-function)
        * [5.2.2. Reject function](#522-reject-function)
        * [5.2.3. Not Answered function](#523-not-answered-function)
        * [5.2.4. Stop function](#524-stop-function)
        * [5.2.5. Delegates](#525-delegates)
    * [5.3. Ultilities](#53-ultilities)
        * [5.3.1. Toggle audio state function](#531-toggle-audio-state-function)
    * [5.4. Paid call logs](#54-paid-call-logs)
        * [5.4.1. Get paid call logs](#541-get-paid-call-logs)
        * [5.4.2. Delegates](#542-delegates)
* [6. Conversations](#6-conversations)
    * [6.1 Get modified conversations](#61-get-modified-conversations)
* [7. Messages](#7-messages)
    * [7.1. Get list](#71-get-list)
        * [7.1.1 Get unread messages](#711-get-unread-messages)
        * [7.1.2 Get modified messages](#712-get-modified-messages)
    * [7.2. Sending](#72-sending)
        * [7.2.1. New message](#721-new-message)
        * [7.2.2. Change message status](#722-change-message-status)
        * [7.2.3. Delete message](#723-delete-message)
        * [7.2.4. Send typing](#724-send-typing)
    * [7.3. Delegates](#73-delegates)
        * [7.3.1. On new message](#731-on-new-message)
        * [7.3.2. On message from me](#732-on-message-from-me)
        * [7.3.3. On message status changed](#733-on-message-status-changed)
        * [7.3.4. On typing](#734-on-typing)
* [8. User](#8-user)
    * [8.1. Get users information](#81-get-users-information)



# 1. Requirements

### 1.1. Get our sdk
### 1.2. Install socket.io-client https://github.com/socketio/socket.io-client
### 1.3. Install jsencrypt https://github.com/travist/jsencrypt
### 1.4. Install react-native-webrtc https://github.com/oney/react-native-webrtc



# 2. Setup 

### 2.1. Import our sdk 

```javascript 
import AZStack from '{path_to_libs}/azstack/';
```

### 2.2. Config 

```javascript 
const azstack = new AZStack();
azstack.config({
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



# 3. Constants

### 3.1. Log levels
> - LOG_LEVEL_NONE: no log
> - LOG_LEVEL_ERROR: just when error occur
> - LOG_LEVEL_INFO: log the error and info of porocess running
> - LOG_LEVEL_DEBUG: log the error, infor and data send/receiced

### 3.2. Error codes:
> - ERR_SOCKET_CONNECT: cannot connect to socket
> - ERR_SOCKET_PARSE_BODY: cannot parse socket packet's body
> - ERR_SOCKET_UNKNOWN_SERVICE: unknow socket packet's service
> - ERR_SOCKET_NOT_CONNECTED: socket not connected
> - ERR_REQUEST_TIMEOUT: request timeout exceed
> - ERR_UNEXPECTED_DATA: some params invalid when handling in process
> - ERR_UNEXPECTED_SEND_DATA: some params invalid in send data
> - ERR_UNEXPECTED_RECEIVED_DATA: some params invalid in received data

### 3.3. Call constants

#### 3.3.1. Callout
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

#### 3.3.2. Callin
> - CALL_STATUS_CALLIN_STATUS_UNKNOWN(0): status unknown;
> - CALL_STATUS_CALLIN_STATUS_RINGING(183): status ringing;
> - CALL_STATUS_CALLIN_STATUS_ANSWERED(200): status answered;
> - CALL_STATUS_CALLIN_STATUS_BUSY(486): status busy;
> - CALL_STATUS_CALLIN_STATUS_NOT_ANSWERED(403): status answered;
> - CALL_STATUS_CALLIN_STATUS_RINGING_STOP(702): status ringing stop;
> - CALL_STATUS_CALLIN_STATUS_STOP(700): status stop;

#### 3.3.3. Paid call log
> - CALL_PAID_LOG_CALL_TYPE_CALLOUT(1): callout type
> - CALL_PAID_LOG_CALL_TYPE_CALLIN(2): callin type

> - CALL_PAID_LOG_CALL_STATUS_ANSWERED(0): status answered
> - CALL_PAID_LOG_CALL_STATUS_REJECTED(1): status rejected
> - CALL_PAID_LOG_CALL_STATUS_NOT_ANSWERED(2): status not answered

### 3.4. List constants

#### 3.4.1. Done
> - GET_LIST_DONE(1): done
> - GET_LIST_UNDONE(0): undone

### 3.5. Chat constants

#### 3.5.1. Chat Types
> - CHAT_TYPE_USER(1): chat with user
> - CHAT_TYPE_GROUP(2): chat with group

#### 3.5.2. Message Types
> - MESSAGE_TYPE_TEXT(1): text message
> - MESSAGE_TYPE_STICKER(2): sticker message
> - MESSAGE_TYPE_FILE(3): file message

#### 3.5.3. Message Statuses
> - MESSAGE_STATUS_SENDING(0): status sending
> - MESSAGE_STATUS_SENT(1): status sent
> - MESSAGE_STATUS_DELIVERED(2): status delivered
> - MESSAGE_STATUS_SEEN(3): status seen
> - MESSAGE_STATUS_CANCELLED(6): status cancelled

#### 3.5.4. Message Deleted
> - MESSAGE_DELETED_FALSE(0): not deleted
> - MESSAGE_DELETED_TRUE(1): deleted

#### 3.5.5. Message file types
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

### 3.6. User constants

#### 3.6.1. User status
> - USER_STATUS_ONLINE(1): online
> - USER_STATUS_NOT_ONLINE(0): not online

### 3.7. Group constants

#### 3.7.1. Group types
> - GROUP_TYPE_PRIVATE(0): private group
> - GROUP_TYPE_PUBLIC(1): public group



# 4. Connection 

### 4.1. Connect

```javascript 
this.AZStack.connect({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStack.connect({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStack.Delegates.onAuthencationReturn = (error, result) => {
    console.log(error, result);
};
this.AZStack.connect({});
```

#### error:
> - code: error code
> - message: error message

#### result:
> - azStackUserId: unique key string of users
> - userId: userId of user in azstack
> - fullname: fullname of user

### 4.2. Disconnect

```javascript 
this.AZStack.disconnect({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStack.disconnect({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStack.Delegates.onDisconnectReturn = (error, result) => {
    console.log(error, result);
};
this.AZStack.disconnect({});
```

#### error:
> - code: error code
> - message: error message



# 5. Calls 

### 5.1. Callout

#### 5.1.1. Start function

```javascript 
this.AZStack.startCallout({
    toPhoneNumber: '123456789'
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStack.startCallout({
    toPhoneNumber: '123456789'
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStack.Delegates.onStartCalloutReturn = (error, result) => {
    console.log(error, result);
};
this.AZStack.startCallout({
    toPhoneNumber: '123456789'
});
```

#### params(required):
> - toPhoneNumber(required): target phone number

#### error:
> - code: error code
> - status: callout status
> - message: error message

#### 5.1.2. Stop function

```javascript 
this.AZStack.stopCallout({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStack.stopCallout({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStack.Delegates.onStopCalloutReturn = (error, result) => {
    console.log(error, result);
};
this.AZStack.stopCallout({});
```

#### error:
> - code: error code
> - message: error message

#### 5.1.3. Delegates

```javascript 
this.AZStack.Delegates.onCalloutStatusChanged = (error, result) => {
    console.log(error, result);
};
```
#### error:
> - code: error code
> - message: error message

#### result:
> - status: call status
> - message: status message

### 5.2. Callin

#### 5.2.1. Answer function

```javascript 
this.AZStack.answerCallin({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStack.answerCallin({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStack.Delegates.onAnswerCallinReturn = (error, result) => {
    console.log(error, result);
};
this.AZStack.answerCallin({});
```

#### error:
> - code: error code
> - message: error message

#### 5.2.2. Reject function

```javascript 
this.AZStack.rejectCallin({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStack.rejectCallin({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStack.Delegates.onRejectCallinReturn = (error, result) => {
    console.log(error, result);
};
this.AZStack.rejectCallin({});
```

#### error:
> - code: error code
> - message: error message

#### 5.2.3. Not Answered function

```javascript 
this.AZStack.notAnsweredCallin({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStack.notAnsweredCallin({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStack.Delegates.onNotAnsweredCallinReturn = (error, result) => {
    console.log(error, result);
};
this.AZStack.notAnsweredCallin({});
```

#### error:
> - code: error code
> - message: error message

#### 5.2.4. Stop function

```javascript 
this.AZStack.stopCallin({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStack.stopCallin({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStack.Delegates.onStopCallinReturn = (error, result) => {
    console.log(error, result);
};
this.AZStack.stopCallin({});
```

#### error:
> - code: error code
> - message: error message

#### 5.2.5. Delegates

```javascript 
this.AZStack.Delegates.onCallinStart = (error, result) => {
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
this.AZStack.Delegates.onCallinStatusChanged = (error, result) => {
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
this.AZStack.Delegates.onCallinStatusChangedByMe = (error, result) => {
    console.log(error, result);
};
```

#### error:
> - code: error code
> - message: error message

#### result:
> - status: call status by me
> - message: status message

### 5.3. Ultilities

#### 5.3.1. Toggle audio state function

```javascript 
this.AZStack.toggleAudioState({
    state: false
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStack.toggleAudioState({
    state: false
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStack.Delegates.onToggleAudioStateReturn = (error, result) => {
    console.log(error, result);
};
this.AZStack.toggleAudioState({
    state: false
});
```

#### options(optional):
> - state(optional): boolean for on or off

#### error:
> - code: error code
> - message: error message

### 5.4. Paid call logs

#### 5.4.1. Get paid call logs

```javascript 
this.AZStack.getPaidCallLogs({}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStack.getPaidCallLogs({}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStack.Delegates.onGetPaidCallLogsReturn = (error, result) => {
    console.log(error, result);
};
this.AZStack.getPaidCallLogs({});
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

#### 5.4.2. Delegates

```javascript 
this.AZStack.Delegates.onPaidCallLogReturn = (error, result) => {
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



# 6. Conversations

#### 6.1 Get modified conversations

```javascript 
this.AZStack.getModifiedConversations({
    page: 1,
    lastCreated: new Date().getTime()
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStack.getModifiedConversations({
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
this.AZStack.Delegates.onGetModifiedConversationsReturn = (error, result) => {
    console.log(error, result);
};
this.AZStack.getModifiedConversations({
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
>   - lastMessage: last message 
>       - chatType: chat type
>       - chatId: chat id
>       - senderId: id of sender
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



# 7. Messages

### 7.1. Get list

#### 7.1.1. Get unread messages

```javascript 
this.AZStack.getUnreadMessages({
    page: 1,
    chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
    chatId: 12345
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStack.getUnreadMessages({
    page: 1,
    chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
    chatId: 12345
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStack.Delegates.getUnreadMessages = (error, result) => {
    console.log(error, result);
};
this.AZStack.onGetUnreadMessagesReturn({
    page: 1,
    chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
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

#### 7.1.2 Get modified messages

```javascript 
this.AZStack.getModifiedMessages({
    page: 1,
    lastCreated: new Date().getTime(),
    chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
    chatId: 12345
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStack.getModifiedMessages({
    page: 1,
    lastCreated: new Date().getTime(),
    chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
    chatId: 12345
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStack.Delegates.onGetModifiedMessagesReturn = (error, result) => {
    console.log(error, result);
};
this.AZStack.getModifiedMessages({
    page: 1,
    lastCreated: new Date().getTime(),
    chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
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

### 7.2. Sending

### 7.2.1. New message

```javascript 
this.AZStack.newMessage({
    chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
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
this.AZStack.newMessage({
    chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
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
this.AZStack.Delegates.onNewMessageReturn = (error, result) => {
    console.log(error, result);
};
this.AZStack.newMessage({
    chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
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

### 7.2.2. Change message status

```javascript 
this.AZStack.changeMessageStatus({
    chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
    chatId: 12345,
    messageSenderId: 1111,
    messageStatus: this.AZStack.chatConstants.MESSAGE_STATUS_DELIVERED,
    msgId: 54321
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStack.changeMessageStatus({
    chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
    chatId: 12345,
    messageSenderId: 1111,
    messageStatus: this.AZStack.chatConstants.MESSAGE_STATUS_DELIVERED,
    msgId: 54321
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStack.Delegates.onChangeMessageStatusReturn = (error, result) => {
    console.log(error, result);
};
this.AZStack.changeMessageStatus({
    chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
    chatId: 12345,
    messageSenderId: 1111,
    messageStatus: this.AZStack.chatConstants.MESSAGE_STATUS_DELIVERED,
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

### 7.2.3. Delete message

```javascript 
this.AZStack.deleteMessage({
    chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
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
this.AZStack.deleteMessage({
    chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
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
this.AZStack.Delegates.onMessageDeleted = (error, result) => {
    console.log(error, result);
};
this.AZStack.deleteMessage({
    chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
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

### 7.2.4. Send typing

```javascript 
this.AZStack.sendTyping({
    chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
    chatId: 12345
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStack.sendTyping({
    chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
    chatId: 12345
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStack.Delegates.onSendTypingReturn = (error, result) => {
    console.log(error, result);
};
this.AZStack.sendTyping({
    chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
    chatId: 12345
});
```

#### params
> - chatType(required): chat type
> - chatId(required): chatId

#### error:
> - code: error code
> - message: error message

### 7.3. Delegates

#### 7.3.1. On new message

```javascript 
this.AZStack.Delegates.onHasNewMessage = (error, result) => {
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

#### 7.3.2. On message from me

```javascript 
this.AZStack.Delegates.onMessageFromMe = (error, result) => {
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

#### 7.3.3. On message status changed

```javascript 
this.AZStack.Delegates.onMessageStatusChanged = (error, result) => {
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

#### 7.3.4. On typing

```javascript 
this.AZStack.Delegates.onTyping = (error, result) => {
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



# 8. User

### 8.1. Get users information

```javascript 
this.AZStack.getUsersInformation({
    userIds: [123],
    azStackUserIds: ['abcd']
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStack.getUsersInformation({
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
this.AZStack.Delegates.getUsersInformation = (error, result) => {
    console.log(error, result);
};
this.AZStack.onGetUsersInformationReturn({
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