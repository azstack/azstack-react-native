import React from 'react';
import { Text } from 'react-native';

import AZStack from '../../common/azstack/';

class AppMain extends React.Component {

    constructor(props) {
        super(props);
        this.AZStack = new AZStack();
        this.AZStack.config({
            requestTimeout: 60000,
            logLevel: this.AZStack.logLevelConstants.LOG_LEVEL_DEBUG,
            authenticatingData: {
                appId: 'bd7095762179b886c094c31b8f5e4646',
                publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs1XFclMmD+l83OY3oOqN2a4JH4PkFvi9O/SOAnASmgfjXliWm7XeVMHeTfNKWKcEZKzWp8rFdwVlO5dXqKquLmcmnr4gb+yvakXNnRm6z135BQDQKCAvrDyEuzr31mmtk935+Yxms8Lfiuxmi5hWZszfTyJDBp2xokeOXbDLjqhunMO3wfxs+lao0qxWxfk4Eb0847/3sY+Zt7hMIceZEYhg7rwdnkl+zNJusPnWYFsf5povE1/qke+KCAL5z2Xte7xcpSv3b29Tl5W4iMfGOqh4ikytfRL/OTRXH3U0wuLuxSDsD7Lms0foAEPCdRJzbGnoNmsV/ongwKRrONitFQIDAQAB',
                azStackUserId: 'test_user_1',
                userCredentials: '',
                fullname: 'Test User 1',
                namespace: ''
            }
        });
        this.AZStack.connect((error, authenticatedUser) => {
            console.log(error);
            console.log(authenticatedUser);
        }).then((authenticatedUser) => {
            console.log(authenticatedUser);
        }).catch((error) => {
            console.log(error);
        });
    };

    render() {
        return (
            <Text>Hello world</Text>
        );
    };
};

export default AppMain;