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

    showConversationsList() {
        this.refs.AZStackSdk.navigate(this.refs.AZStackSdk.getNavigation().ConversationsListComponent, {});
    };

    showContact() {
        this.refs.AZStackSdk.showContacts();
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
                    <Button onPress={() => this.showConversationsList()} title='Show conversations list'></Button>
                    <Button onPress={() => this.audioCall()} title='Call User 2'></Button>
                    <Button onPress={() => this.videoCall()} title='Video Call User 2'></Button>
                    <Button onPress={() => this.showContact()} title='Contact List'></Button>
                    <Button onPress={() => this.showNumberPad()} title='Callout'></Button>
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