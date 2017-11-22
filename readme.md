
# 1. requirement 

1. Get out sdk
2. Install socket.io-client https://github.com/socketio/socket.io-client
3. Install jsencrypt https://github.com/travist/jsencrypt

# 2. setup 

### import out sdk 

```javascript 
import AZStack from '../../common/azstack/';
```

### config 

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

> #### requestTimeout(optional):
> - must be number, default 60000
> #### logLevel(optional):
> - NONE: no log (default)
> - ERROR: just when error occur
> - INFO: log the error and info of porocess running
> - DEBUG: log the error, infor and data send/receiced
> #### authenticatingData(required):
> - appId(required): the id of your azstack application
> - publicKey(required): the public key of ypur azstack application
> - azStackUserId(required): an unique string for authenticaing user in your application
> - userCredentials(optional): the creadentials of authenticaing user
> - fullname(required): the name of authenticaing user
> - namespace(optional): the namespace of authenticaing user

# 3. constants

### Log levels

> - LOG_LEVEL_NONE: no log
> - LOG_LEVEL_ERROR: just when error occur
> - LOG_LEVEL_INFO: log the error and info of porocess running
> - LOG_LEVEL_DEBUG: log the error, infor and data send/receiced

### Error codes:

##### ERR_SOCKET_CONNECT: cannot connect to socket
##### ERR_SOCKET_PARSE_BODY: cannot parse socket packet's body
##### ERR_SOCKET_UNKNOWN_SERVICE: unknow socket packet's service
##### ERR_REQUEST_TIMEOUT: request timeout exceed
##### ERR_UNEXPECTED_SEND_DATA: some params missing
##### ERR_UNEXPECTED_RECEIVED_DATA: error in response

# 4. connect 

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
this.AZStack.Delegates.onAuthencationComplete = (error, authenticatedUser) => {
    console.log(error, authenticatedUser);
}
this.AZStack.connect();
```