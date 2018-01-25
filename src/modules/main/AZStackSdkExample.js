import React from 'react';
import {
    Dimensions,
    ScrollView,
    View,
    Text,
    Button,
    Platform
} from 'react-native';

import {
    AZStackSdk,
} from '../../common/azstack/';

class AZStackSdkExample extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            authenticatedUser: null,
        };
    };

    showConversations() {
        this.refs.AZStackSdk.showConversations({});
    };

    startChatUser(options) {
        this.refs.AZStackSdk.startChat({
            chatType: this.refs.AZStackSdk.AZStackCore.chatConstants.CHAT_TYPE_USER,
            chatId: 387212
        });
    };

    startChatGroup(options) {
        this.refs.AZStackSdk.startChat({
            chatType: this.refs.AZStackSdk.AZStackCore.chatConstants.CHAT_TYPE_GROUP,
            chatId: 7436
        });
    };

    showContact() {
        this.refs.AZStackSdk.showContacts({});
    };

    showNumberPad() {
        this.refs.AZStackSdk.showNumberPad({});
    };

    audioCall() {
        this.refs.AZStackSdk.startAudioCall({
            info: {
                name: 'User 2',
                phoneNumber: '',
                userId: 387212, // must be number
            },
            onEndCall: () => {
                // or whatever you want here
            },
        });
    };

    videoCall() {
        this.refs.AZStackSdk.startVideoCall({
            info: {
                name: 'User 2',
                phoneNumber: '',
                userId: 387212, // must be number
            },
            onEndCall: () => {
                // or whatever you want here
            },
        });
    };

    showCallLogs() {
        this.refs.AZStackSdk.showCallLogs({});
    };

    showUser() {
        this.refs.AZStackSdk.showUser({ userId: 387212 });
    };

    showGroup() {
        this.refs.AZStackSdk.showGroup({ groupId: 7436 });
    };

    componentDidMount() {
        this.refs.AZStackSdk.connect().then((result) => {
            this.setState({ authenticatedUser: result });
        }).catch((error) => {});
    };

    componentWillUnmount() {
        this.refs.AZStackSdk.disconnect().then((result) => {
            this.setState({ authenticatedUser: null });
        }).catch((error) => { });
    };

    render() {
        const { width, height } = Dimensions.get('window');
        return (
            <AZStackSdk
                ref={"AZStackSdk"}
                options={{
                    azstackConfig: this.props.azstackConfig,
                    languageCode: this.props.languageCode,
                    themeName: this.props.themeName,
                    members: this.props.members
                }}
            >
                <View
                    style={{
                        flex: 1,
                        ...Platform.select({
                            ios: {
                                paddingTop: 20
                            }
                        }),
                    }}
                >
                    <ScrollView>
                        <Text>{this.state.authenticatedUser ? 'Connected, ' + this.state.authenticatedUser.fullname : 'Connecting...'}</Text>
                        <Text>{'\n'}{'\n'}</Text>
                        <Button onPress={() => this.showConversations()} title='Show conversations'></Button>
                        <Button onPress={() => this.startChatGroup()} title='Chat with group'></Button>
                        <Button onPress={() => this.startChatUser()} title='Chat with user'></Button>
                        <Button onPress={() => this.audioCall()} title='Voice Call User 2'></Button>
                        <Button onPress={() => this.videoCall()} title='Video Call User 2'></Button>
                        <Button onPress={() => this.showContact()} title='Contact List'></Button>
                        <Button onPress={() => this.showNumberPad()} title='Callout'></Button>
                        <Button onPress={() => this.showCallLogs()} title='Show call logs'></Button>
                        <Button onPress={() => this.showUser()} title='Show user'></Button>
                        <Button onPress={() => this.showGroup()} title='Show group'></Button>
                    </ScrollView>
                </View>
            </AZStackSdk>
        );
    };
};

export default AZStackSdkExample;