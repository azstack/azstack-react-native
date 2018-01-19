import React from 'react';
import {
    View,
    TextInput,
    Image,
    TouchableOpacity
} from 'react-native';

class ChatInputComponentBlock extends React.Component {
    constructor(props) {
        super(props);

        this.subscriptions = {};

        this.state = {
            messageText: ''
        };

        this.onMessageTextChanged = this.onMessageTextChanged.bind(this);
    }

    onMessageTextChanged(newText) {
        this.setState({ messageText: newText });
    };

    render() {
        return (
            <View
                style={this.props.CustomStyle.getStyle('CHAT_INPUT_BLOCK_STYLE')}
            >
                <View
                    style={this.props.CustomStyle.getStyle('CHAT_INPUT_INPUT_BLOCK_STYLE')}
                >
                    <TouchableOpacity
                        style={this.props.CustomStyle.getStyle('CHAT_INPUT_STICKER_BUTTON_BLOCK_STYLE')}
                        activeOpacity={0.5}
                        onPress={() => { }}
                    >
                        <Image
                            style={this.props.CustomStyle.getStyle('CHAT_INPUT_STICKER_BUTTON_IMAGE_STYLE')}
                            source={this.props.CustomStyle.getImage('IMAGE_STICKER')}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={this.props.CustomStyle.getStyle('CHAT_INPUT_ATTACH_BUTTON_BLOCK_STYLE')}
                        activeOpacity={0.5}
                        onPress={() => { }}
                    >
                        <Image
                            style={this.props.CustomStyle.getStyle('CHAT_INPUT_ATTACH_BUTTON_IMAGE_STYLE')}
                            source={this.props.CustomStyle.getImage('IMAGE_ATTACH')}
                        />
                    </TouchableOpacity>
                    <View
                        style={this.props.CustomStyle.getStyle('CHAT_INPUT_TEXT_INPUT_BLOCK_STYLE')}
                    >
                        <TextInput
                            ref={'TextInput'}
                            style={this.props.CustomStyle.getStyle('CHAT_INPUT_TEXT_INPUT_STYLE')}
                            onChangeText={this.onMessageTextChanged}
                            value={this.state.messageText}
                            placeholder={this.props.Language.getText('CHAT_INPUT_TEXT_INPUT_PLACEHOLDER_TEXT')}
                            returnKeyType='done'
                            autogrow={true}
                            multiline={true}
                            {
                            ...this.props.CustomStyle.getStyle('CHAT_INPUT_TEXT_INPUT_PROPS_STYLE')
                            }
                        />
                    </View>
                    <TouchableOpacity
                        style={this.props.CustomStyle.getStyle('CHAT_INPUT_SEND_BUTTON_BLOCK_STYLE')}
                        activeOpacity={0.5}
                        onPress={() => { }}
                    >
                        <Image
                            style={this.props.CustomStyle.getStyle('CHAT_INPUT_SEND_BUTTON_IMAGE_STYLE')}
                            source={this.props.CustomStyle.getImage('IMAGE_SEND')}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };
};

export default ChatInputComponentBlock;