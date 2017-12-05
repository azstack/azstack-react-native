import React from 'react';
import {
    View,
    Text,
    TextInput,
    Button
} from 'react-native';

import AZStack from '../../common/azstack/';

class AppMain extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            authenticatedUser: null,
            calloutToPhoneNumber: ''
        };

        this.disconnect = this.disconnect.bind(this);

        this.toggleAutioState = this.toggleAutioState.bind(this);

        this.startCallout = this.startCallout.bind(this);
        this.stopCallout = this.stopCallout.bind(this);

        this.answerCallin = this.answerCallin.bind(this);
        this.rejectCallin = this.rejectCallin.bind(this);
        this.notAnsweredCallin = this.notAnsweredCallin.bind(this);
        this.stopCallin = this.stopCallin.bind(this);

        this.getPaidCallLogs = this.getPaidCallLogs.bind(this);

        this.getUnreadMessages = this.getUnreadMessages.bind(this);

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
        //user 1: test_user_1 381032
        //user 2: test_user_2 387212

        this.AZStack.connect({}).then((authenticatedUser) => {
            this.setState({ authenticatedUser: authenticatedUser })
        }).catch((error) => { });
    };

    disconnect() {
        this.AZStack.disconnect({}).then(() => { }).catch(() => { });
    };

    toggleAutioState() {
        this.AZStack.toggleAutioState({}).then(() => { }).catch(() => { });
    };

    startCallout() {
        this.AZStack.startCallout({
            callData: {
                toPhoneNumber: this.state.calloutToPhoneNumber
            }
        }).then(() => { }).catch(() => { });
    };
    stopCallout() {
        this.AZStack.stopCallout({}).then(() => { }).catch(() => { });
    };

    answerCallin() {
        this.AZStack.answerCallin().then(() => { }).catch(() => { });
    };
    rejectCallin() {
        this.AZStack.rejectCallin().then(() => { }).catch(() => { });
    };
    notAnsweredCallin() {
        this.AZStack.notAnsweredCallin().then(() => { }).catch(() => { });
    };
    stopCallin() {
        this.AZStack.stopCallin().then(() => { }).catch(() => { });
    };

    getPaidCallLogs() {
        this.AZStack.getPaidCallLogs({}).then(() => { }).catch(() => { });
    };

    getUnreadMessages() {
        this.AZStack.getUnreadMessages({
            page: 1,
            chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
            chatId: 387212
        }).then(() => { }).catch(() => { });
    };

    render() {
        return (
            <View>
                <Text>
                    {this.state.authenticatedUser ? `Connected, user ${this.state.authenticatedUser.fullname}` : 'Connecting'}
                </Text>
                <Button onPress={this.disconnect} title="Disconnect" />
                <Text>{'\n'}{'\n'}</Text>
                <Button onPress={this.toggleAutioState} title="Toggle Audio State" />
                <Text>{'\n'}{'\n'}</Text>
                <TextInput
                    placeholder="Callout toPhoneNumber"
                    onChangeText={(text) => this.setState({ calloutToPhoneNumber: text })}
                />
                <Button onPress={this.startCallout} title="Start Callout" />
                <Button onPress={this.stopCallout} title="Stop Callout" />
                <Text>{'\n'}{'\n'}</Text>
                <Button onPress={this.answerCallin} title="Anwser Callin" />
                <Button onPress={this.rejectCallin} title="Reject Callin" />
                <Button onPress={this.notAnsweredCallin} title="Not answer Callin" />
                <Button onPress={this.stopCallin} title="Stop Callin" />
                <Text>{'\n'}{'\n'}</Text>
                <Button onPress={this.getPaidCallLogs} title="Get paid call logs" />
                <Text>{'\n'}{'\n'}</Text>
                <Button onPress={this.getUnreadMessages} title="Get unread messages" />
            </View>
        );
    };
};

export default AppMain;