
# 1. Requirements

### 1. Get out sdk
### 2. Install socket.io-client https://github.com/socketio/socket.io-client
### 3. Install jsencrypt https://github.com/travist/jsencrypt
### 4. Install react-native-webrtc https://github.com/oney/react-native-webrtc

# 2. Setup 

### 1. Import out sdk 

```javascript 
import AZStack from '{path_to_libs}/azstack/';
```

### 2. Config 

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

### 1. Log levels

> - LOG_LEVEL_NONE: no log
> - LOG_LEVEL_ERROR: just when error occur
> - LOG_LEVEL_INFO: log the error and info of porocess running
> - LOG_LEVEL_DEBUG: log the error, infor and data send/receiced

### 2. Error codes:

> - ERR_SOCKET_CONNECT: cannot connect to socket
> - ERR_SOCKET_PARSE_BODY: cannot parse socket packet's body
> - ERR_SOCKET_UNKNOWN_SERVICE: unknow socket packet's service
> - ERR_SOCKET_NOT_CONNECTED: socket not connected
> - ERR_REQUEST_TIMEOUT: request timeout exceed
> - ERR_UNEXPECTED_DATA: some params invalid when handling in process
> - ERR_UNEXPECTED_SEND_DATA: some params invalid in send data
> - ERR_UNEXPECTED_RECEIVED_DATA: some params invalid in received data

### 3. Call statuses
#### Callout
> - CALL_STATUS_CALLOUT_ERROR: error
> - CALL_STATUS_CALLOUT_ERROR_NOT_ENOUGH_BALANCE: not enough balance
> - CALL_STATUS_CALLOUT_ERROR_INVALID_NUMBER: invalid number
> - CALL_STATUS_CALLOUT_CONNECTING: connecting
> - CALL_STATUS_CALLOUT_RINGING: ringing
> - CALL_STATUS_CALLOUT_ANSWERED: answered
> - CALL_STATUS_CALLOUT_BUSY: busy
> - CALL_STATUS_CALLOUT_NOT_ANSWERED: not answered
> - CALL_STATUS_CALLOUT_STOP: stop

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

# 4. Calls 

### 1. Callout

#### Start function

```javascript 
this.AZStack.startCallout({
    callData: {
        callId: Math.round(new Date().getTime() / 1000),
        phoneNumber: '123456789'
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
        callId: Math.round(new Date().getTime() / 1000),
        phoneNumber: '123456789'
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
        callId: Math.round(new Date().getTime() / 1000),
        phoneNumber: '123456789'
    }
});
```

#### callData(required):
> - callId(required): an unique number
> - phoneNumber(required): target phone number
#### error:
> - code: error code
> - status: callout status
> - message: error message

#### 2. Stop function

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
> - status: callout status
> - message: error message

#### 3. Delegates

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