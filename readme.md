
# Table of Contents

* [1. Requirements](#1-requirements)
* [2. Setup](#2-setup)
* [3. Constants](#3-constants)
    * [3.1. Log levels](#31-log-levels)
    * [3.2. Error codes](#32-error-codes)
    * [3.3. Call statuses](#33-call-statuses)
        * [3.3.1. Callout](#331-callout)
        * [3.3.2. Callin](#332-callin)
        * [3.3.3. Call log](#333-call-log)
* [4. Connect](#4-connect)
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
        * [5.4.2. Delegates](#542-delegates)



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
#### logLevel(optional):
> - NONE: no log (default)
> - ERROR: just when error occur
> - INFO: log the error and info of porocess running
> - DEBUG: log the error, infor and data send/receiced
#### authenticatingData(optional):
> - appId(required): the id of your azstack application
> - publicKey(required): the public key of ypur azstack application
> - azStackUserId(required): an unique string for authenticaing user in your application
> - userCredentials(optional): the creadentials of authenticaing user
> - fullname(required): the name of authenticaing user
> - namespace(optional): the namespace of authenticaing user



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
> - CALL_STATUS_CALLOUT_ERROR: error
> - CALL_STATUS_CALLOUT_ERROR_NOT_ENOUGH_BALANCE: not enough balance
> - CALL_STATUS_CALLOUT_ERROR_INVALID_NUMBER: invalid number
> - CALL_STATUS_CALLOUT_CONNECTING: connecting
> - CALL_STATUS_CALLOUT_RINGING: ringing
> - CALL_STATUS_CALLOUT_ANSWERED: answered
> - CALL_STATUS_CALLOUT_BUSY: busy
> - CALL_STATUS_CALLOUT_NOT_ANSWERED: not answered
> - CALL_STATUS_CALLOUT_STOP: stop
> - CALL_STATUS_CALLOUT_UNKNOWN: unknown

#### 3.3.2. Callin
> - CALL_STATUS_CALLIN_ERROR: error
> - CALL_STATUS_CALLIN_RINGING_STOP: ringing stop
> - CALL_STATUS_CALLIN_STOP: stop
> - CALL_STATUS_CALLOUT_UNKNOWN: unknown

> - CALL_STATUS_CALLIN_BY_ME_ERROR: error by me
> - CALL_STATUS_CALLIN_BY_ME_RINGING: ringing by me
> - CALL_STATUS_CALLIN_BY_ME_ANSWERED: answered by me
> - CALL_STATUS_CALLIN_BY_ME_BUSY: busy by me
> - CALL_STATUS_CALLIN_BY_ME_REJECTED: rejected by me
> - CALL_STATUS_CALLIN_BY_ME_STOP: stop by me
> - CALL_STATUS_CALLIN_BY_ME_NOT_ANSWERED: not answered by me
> - CALL_STATUS_CALLIN_BY_ME_UNKNOWN: unknown by me

#### 3.3.3. Call log
> - CALL_PAID_LOG_CALL_TYPE_UNKNOWN: unknown type
> - CALL_PAID_LOG_CALL_TYPE_CALLOUT: callout type
> - CALL_PAID_LOG_CALL_TYPE_CALLIN: callin type

> - CALL_PAID_LOG_CALL_STATUS_UNKNOWN: unknown status
> - CALL_PAID_LOG_CALL_STATUS_ANSWERED: status answered
> - CALL_PAID_LOG_CALL_STATUS_REJECTED: status rejected
> - CALL_PAID_LOG_CALL_STATUS_NOT_ANSWERED: status not answered


# 4. Connect 

```javascript 
this.AZStack.connect((error, authenticatedUser) => {
    console.log(error);
    console.log(authenticatedUser);
});
```

OR

```javascript 
this.AZStack.connect().then((authenticatedUser) => {
    console.log(authenticatedUser);
}).catch((error) => {
    console.log(error);
});
```

OR

```javascript 
this.AZStack.Delegates.onAuthencationReturn = (error, authenticatedUser) => {
    console.log(error, authenticatedUser);
};
this.AZStack.connect();
```

#### error:
> - code: error code
> - message: error message
#### authenticatedUser:
> - azStackUserId: unique key string of users
> - userId: userId of user in azstack
> - fullname: fullname of user



# 5. Calls 

### 5.1. Callout

#### 5.1.1. Start function

```javascript 
this.AZStack.startCallout({
    callData: {
        toPhoneNumber: '123456789'
    }
}, (error, result) => {
    console.log(error);
    console.log(result);
});
```

OR

```javascript 
this.AZStack.startCallout({
    callData: {
        toPhoneNumber: '123456789'
    }
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
    callData: {
        toPhoneNumber: '123456789'
    }
});
```

#### callData(required):
> - phoneNumber(required): target phone number
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