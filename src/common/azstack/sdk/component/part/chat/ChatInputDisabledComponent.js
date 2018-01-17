import React from 'react';
import {
    View,
    Text
} from 'react-native';

class ChatInputDisabledComponent extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        return (
            <View
                style={this.props.CustomStyle.getStyle('CHAT_INPUT_DISABLED_BLOCK_STYLE')}
            >
                <Text
                    style={this.props.CustomStyle.getStyle('CHAT_INPUT_DISABLED_TEXT_STYLE')}
                >
                    {this.props.Language.getText('CHAT_INPUT_DISABLED_TEXT')}
                </Text>
            </View>
        );
    };
};

export default ChatInputDisabledComponent;