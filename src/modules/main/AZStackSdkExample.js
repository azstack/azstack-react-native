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
                conversationsList: false
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

    componentDidMount() {
        this.AZStackSdk.connect().then((result) => {
            this.setState({ authenticatedUser: result });
        }).catch({});
    };
    componentWillUnmount() {
        this.AZStackSdk.disconnect().then((result) => {
            this.setState({ authenticatedUser: null });
        }).catch({});
    };

    showConversationsList() {
        this.setState({
            showings: Object.assign(this.state.showings, { conversationsList: true })
        });
    };
    onConversationsListBackButtonPressed() {
        this.setState({
            showings: Object.assign(this.state.showings, { conversationsList: false })
        });
    };

    render() {
        const { width, height } = Dimensions.get('window');
        return (
            <View
                style={{
                    width,
                    height: height - StatusBar.currentHeight
                }}
            >
                <ScrollView>
                    <Text>{this.state.authenticatedUser ? 'Connected, ' + this.state.authenticatedUser.fullname : 'Connecting...'}</Text>
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.showConversationsList} title='Show conversations list'></Button>
                </ScrollView>
                {
                    this.state.showings.conversationsList && this.AZStackSdk.renderConversationsList({
                        onBackButtonPressed: this.onConversationsListBackButtonPressed
                    })
                }
            </View>
        );
    };
};

export default AZStackSdkExample;