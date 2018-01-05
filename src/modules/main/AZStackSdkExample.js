import React from 'react';
import {
    StatusBar,
    Dimensions,
    ScrollView,
    View,
    Text,
    Button
} from 'react-native';

import { AZStackSdk } from '../../common/azstack/';

class AZStackSdkExample extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            authenticatedUser: null,
            showings: {
                conversationsList: false,
                onCall: false,
                contact: false,
                numberPad: false,
            }
        };

        this.showConversationsList = this.showConversationsList.bind(this);
        this.onConversationsListBackButtonPressed = this.onConversationsListBackButtonPressed.bind(this);

        this.AZStackSdk = new AZStackSdk({
            azstackConfig: this.props.azstackConfig,
            languageCode: this.props.languageCode,
            themeName: this.props.themeName
        });
    };

    showConversationsList() {
        this.setState({
            showings: Object.assign(this.state.showings, { conversationsList: true })
        });
    };

    showOnCall() {
        this.setState({
            showings: Object.assign(this.state.showings, { onCall: true })
        });
    };

    showContact() {
        this.setState({
            showings: Object.assign(this.state.showings, { contact: true })
        });
    }

    showNumberPad() {
        this.setState({
            showings: Object.assign(this.state.showings, { numberPad: true })
        });
    }

    onConversationsListBackButtonPressed() {
        this.setState({
            showings: Object.assign(this.state.showings, { conversationsList: false })
        });
    };
    
    onOnCallBackButtonPressed() {
        this.setState({
            showings: Object.assign(this.state.showings, { onCall: false })
        });
    };

    onContactButtonPress() {
        this.setState({
            showings: Object.assign(this.state.showings, { contact: false })
        });
    }

    onNumberPadButtonPress() {
        this.setState({
            showings: Object.assign(this.state.showings, { numberPad: false })
        });
    }

    componentDidMount() {
        this.AZStackSdk.connect().then((result) => {
            this.setState({ authenticatedUser: result });
        }).catch((error) => {
            console.log(error);
        });
    };

    componentWillUnmount() {
        this.AZStackSdk.disconnect().then((result) => {
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
                    <Button onPress={this.showConversationsList} title='Show conversations list'></Button>
                    <Button onPress={() => this.showOnCall()} title='Call User 1'></Button>
                    <Button onPress={() => this.showContact()} title='Contact List'></Button>
                    <Button onPress={() => this.showNumberPad()} title='Callout'></Button>
                </ScrollView>
                {
                    this.state.showings.conversationsList && this.AZStackSdk.renderConversationsList({
                        onBackButtonPressed: this.onConversationsListBackButtonPressed
                    })
                }
                {
                    this.state.showings.onCall && this.AZStackSdk.renderOnCall({
                        onBackButtonPressed: () => this.onOnCallBackButtonPressed()
                    })
                }
                {
                    this.state.showings.contact && this.AZStackSdk.renderContact({
                        onBackButtonPressed: () => this.onContactButtonPress()
                    })
                }
                {
                    this.state.showings.numberPad && this.AZStackSdk.renderNumberPad({
                        onBackButtonPressed: () => this.onNumberPadButtonPress()
                    })
                }
            </View>
        );
    };
};

export default AZStackSdkExample;