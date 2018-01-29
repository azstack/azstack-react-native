import React from 'react';
import {
    View,
    Text
} from 'react-native';

class ChatInputDisabledComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();
    };

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_DISABLED_BLOCK_STYLE')}
            >
                <Text
                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_DISABLED_TEXT_STYLE')}
                >
                    {this.coreInstances.Language.getText('CHAT_INPUT_DISABLED_TEXT')}
                </Text>
            </View>
        );
    };
};

export default ChatInputDisabledComponent;