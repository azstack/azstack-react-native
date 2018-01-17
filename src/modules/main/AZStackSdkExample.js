import React from 'react';
import {
    StatusBar,
    Dimensions,
    ScrollView,
    View,
    Text,
    Button
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
        this.refs.AZStackSdk.navigate(this.refs.AZStackSdk.getNavigation().ConversationsComponent, {});
    };

    showChat() {
        this.refs.AZStackSdk.navigate(this.refs.AZStackSdk.getNavigation().ChatComponent, {});
    };

    showContact() {
        this.refs.AZStackSdk.showContacts({});
    }

    showNumberPad() {
        this.refs.AZStackSdk.showNumberPad();
    }

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
    }

    showCallLogs() {
        this.refs.AZStackSdk.showCallLogs({});
    }

    componentDidMount() {
        this.refs.AZStackSdk.connect().then((result) => {
            this.setState({ authenticatedUser: result });
        }).catch((error) => {
            console.log(error);
        });
    };

    componentWillUnmount() {
        this.refs.AZStackSdk.disconnect().then((result) => {
            this.setState({ authenticatedUser: null });
        }).catch((error) => { });
    };

    render() {
        const { width, height } = Dimensions.get('window');
        return (
            <View
                style={{
                    width,
                    height: height - StatusBar.currentHeight,
                }}
            >
                <ScrollView>
                    <Text>{this.state.authenticatedUser ? 'Connected, ' + this.state.authenticatedUser.fullname : 'Connecting...'}</Text>
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={() => this.showConversations()} title='Show conversations'></Button>
                    <Button onPress={() => this.showChat()} title='Show chat'></Button>
                    <Button onPress={() => this.audioCall()} title='Call User 2'></Button>
                    <Button onPress={() => this.videoCall()} title='Video Call User 2'></Button>
                    <Button onPress={() => this.showContact()} title='Contact List'></Button>
                    <Button onPress={() => this.showNumberPad()} title='Callout'></Button>
                    <Button onPress={() => this.showCallLogs()} title='Show call logs'></Button>
                </ScrollView>
                <AZStackSdk
                    ref={"AZStackSdk"}
                    options={{
                        azstackConfig: this.props.azstackConfig,
                        languageCode: this.props.languageCode,
                        themeName: this.props.themeName
                    }}
                />
            </View>
        );
    };
};

export default AZStackSdkExample;