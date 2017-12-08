import React from 'react';
import {
    ScrollView,
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

        this.getModifiedConversations = this.getModifiedConversations.bind(this);

        this.getUnreadMessagesTypeUser = this.getUnreadMessagesTypeUser.bind(this);
        this.getModifiedMessagesTypeUser = this.getModifiedMessagesTypeUser.bind(this);

        this.newMessageWithUserTypeText = this.newMessageWithUserTypeText.bind(this);
        this.newMessageWithUserTypeSticker = this.newMessageWithUserTypeSticker.bind(this);

        this.sendTypingWithUser = this.sendTypingWithUser.bind(this);

        this.getUsersInfomationWithId = this.getUsersInfomationWithId.bind(this);
        this.getUsersInfomationWithAzstackUserId = this.getUsersInfomationWithAzstackUserId.bind(this);

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
            toPhoneNumber: this.state.calloutToPhoneNumber
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

    getModifiedConversations() {
        this.AZStack.getModifiedConversations({
            page: 1,
            lastCreated: new Date().getTime()
        }).then(() => { }).catch(() => { });
    };

    getUnreadMessagesTypeUser() {
        this.AZStack.getUnreadMessages({
            page: 1,
            chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
            chatId: 387212
        }).then(() => { }).catch(() => { });
    };
    getModifiedMessagesTypeUser() {
        this.AZStack.getModifiedMessages({
            page: 1,
            lastCreated: new Date().getTime(),
            chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
            chatId: 387212
        }).then(() => { }).catch(() => { });
    };

    newMessageWithUserTypeText() {
        this.AZStack.newMessage({
            chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
            chatId: 387212,
            text: 'text'
        }).then(() => { }).catch(() => { });
    };
    newMessageWithUserTypeSticker() {
        this.AZStack.newMessage({
            chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
            chatId: 387212,
            sticker: {
                name: '002.png',
                catId: 1,
                url: 'http://azstack.com/api/public_html/sticker/1/002.png'
            }
        }).then(() => { }).catch(() => { });
    };

    sendTypingWithUser() {
        this.AZStack.sendTyping({
            chatType: this.AZStack.chatConstants.CHAT_TYPE_USER,
            chatId: 387212
        }).then(() => { }).catch(() => { });
    };

    getUsersInfomationWithId() {
        this.AZStack.getUsersInformation({
            userIds: [387212]
        }).then(() => { }).catch(() => { });
    };
    getUsersInfomationWithAzstackUserId() {
        this.AZStack.getUsersInformation({
            azStackUserIds: ['test_user_2']
        }).then(() => { }).catch(() => { });
    };

    render() {
        return (
            <ScrollView>
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
                    <Button onPress={this.getModifiedConversations} title="Get modified conversations" />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.getUnreadMessagesTypeUser} title="Get unread messages type user" />
                    <Button onPress={this.getModifiedMessagesTypeUser} title="Get modified messages type user" />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.newMessageWithUserTypeText} title="New message with user type text" />
                    <Button onPress={this.newMessageWithUserTypeSticker} title="New message with user type sticker" />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.sendTypingWithUser} title="Send typing with user" />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.getUsersInfomationWithId} title="Get users onformation with id" />
                    <Button onPress={this.getUsersInfomationWithAzstackUserId} title="Get users onformation with azStackUserId" />
                </View>
            </ScrollView>
        );
    };
};

export default AppMain;