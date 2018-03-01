console.disableYellowBox = true;
import React from 'react';
import {
    View
} from 'react-native';
import AZStackCoreExample from './AZStackCoreExample';
import AZStackSdkExample from './AZStackSdkExample';

class AppMain extends React.Component {
    render() {
        let exampleType = 'sdk';
        let azstackConfig = {
            requestTimeout: 60000,
            intervalPingTime: 60000,
            autoReconnect: true,
            autoReconnectLimitTries: 0,
            autoReconnectIntervalTime: 5000,
            logLevel: 'ERROR',
            authenticatingData: {
                appId: 'bd7095762179b886c094c31b8f5e4646',
                publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs1XFclMmD+l83OY3oOqN2a4JH4PkFvi9O/SOAnASmgfjXliWm7XeVMHeTfNKWKcEZKzWp8rFdwVlO5dXqKquLmcmnr4gb+yvakXNnRm6z135BQDQKCAvrDyEuzr31mmtk935+Yxms8Lfiuxmi5hWZszfTyJDBp2xokeOXbDLjqhunMO3wfxs+lao0qxWxfk4Eb0847/3sY+Zt7hMIceZEYhg7rwdnkl+zNJusPnWYFsf5povE1/qke+KCAL5z2Xte7xcpSv3b29Tl5W4iMfGOqh4ikytfRL/OTRXH3U0wuLuxSDsD7Lms0foAEPCdRJzbGnoNmsV/ongwKRrONitFQIDAQAB',
                azStackUserId: 'test_user_1',
                userCredentials: '',
                fullname: 'Test User 1',
                namespace: ''
            }
        };
        //user 1: test_user_1 381032
        //user 2: test_user_2 387212
        //user 3: test_user_3 391658

        return (
            <View style={{ flex: 1 }}>
                {exampleType === 'core' && <AZStackCoreExample azstackConfig={azstackConfig} />}
                {exampleType === 'sdk' && <AZStackSdkExample azstackConfig={azstackConfig} languageCode='en' themeName='classic' googleApiKey='AIzaSyD_Pki-HgFU7WNpdpzEJBtpw1w6-YxOpUw' members={['test_user_1', 'test_user_2', 'test_user_3']} />}
            </View>
        );
    };
};

export default AppMain;