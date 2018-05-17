console.disableYellowBox = true;
import React from 'react';
import {
    View
} from 'react-native';
import AZStackCoreExample from './AZStackCoreExample';
import AZStackSdkExample from './AZStackSdkExample';

class AppMain extends React.Component {

    constructor(props) {
        super(props);

        this.exampleType = 'sdk';
        this.azstackConfig = {
            requestTimeout: 60000,
            intervalPingTime: 60000,
            autoReconnect: true,
            autoReconnectLimitTries: 10,
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
        this.defaultLayout = {
            withStatusbar: true,
            withHeader: true,
            screenStyle: {},
            statusbarStyle: {}
        };
        this.languageCode = 'en';
        this.themeName = 'classic';
        this.getInitialMembers = this.getInitialMembers.bind(this);
        this.getMoreMembers = this.getMoreMembers.bind(this);
        this.getNumbers = this.getNumbers.bind(this);
        this.onBeforeMessageSend = this.onBeforeMessageSend.bind(this);
        this.onBeforeCalloutStart = this.onBeforeCalloutStart.bind(this);
    };

    getInitialMembers = (options) => {
        return new Promise((resolve, reject) => {
            resolve(['test_user_1', 'test_user_2', 'test_user_3'].filter((member) => {
                return member.indexOf(options.searchText) > -1;
            }));
        });
    };
    getMoreMembers = (options) => {
        return new Promise((resolve, reject) => {
            resolve(false);
        });
    };
    getNumbers = (options) => {
        return new Promise((resolve, reject) => {
            resolve(['0123456789', '0987654321']);
        });
    };
    onBeforeMessageSend = (message) => {
        return new Promise((resolve, reject) => {
            resolve(message);
        });
    };
    onBeforeCalloutStart = (calloutData) => {
        return new Promise((resolve, reject) => {
            resolve(calloutData);
        });
    };

    render() {
        return (
            <View style={{ flex: 1 }}>
                {
                    this.exampleType === 'core' && <AZStackCoreExample
                        azstackConfig={this.azstackConfig}
                    />
                }
                {
                    this.exampleType === 'sdk' && <AZStackSdkExample
                        azstackConfig={this.azstackConfig}
                        defaultLayout={this.defaultLayout}
                        languageCode={this.languageCode}
                        themeName={this.themeName}
                        getInitialMembers={this.getInitialMembers}
                        getMoreMembers={this.getMoreMembers}
                        getNumbers={this.getNumbers}
                        onBeforeMessageSend={this.onBeforeMessageSend}
                        onBeforeCalloutStart={this.onBeforeCalloutStart}
                    />}
            </View>
        );
    };
};

export default AppMain;