import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image
} from 'react-native';

class ConversationsListComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            conversations: []
        };
    };

    render() {
        return (
            <View
                style={{
                    ...this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_BLOCK_STYLE'),
                    ...this.props.Sizes
                }}
            >
                <View
                    style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_HEADER_BLOCK_STYLE')}
                >
                    <TouchableOpacity
                        style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_HEADER_BACK_BUTTON_STYLE')}
                        activeOpacity={0.5}
                        onPress={this.props.onBackButtonPressed}
                    >
                        <Image
                            style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_HEADER_BACK_BUTTON_IMAGE_STYLE')}
                            source={require('../image/back.png')}
                        />
                    </TouchableOpacity>
                    <Text
                        style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_HEADER_TITLE_TEXT_STYLE')}
                    >
                        {this.props.Language.getText('CONVERSATIONS_LIST_HEADER_TITLE_TEXT')}
                    </Text>
                </View>
                {
                    this.state.conversations.length === 0 && <View
                        style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_EMPTY_BLOCK_STYLE')}
                    >
                        <Text
                            style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_EMPTY_TEXT_STYLE')}
                        >
                            {this.props.Language.getText('CONVERSATIONS_LIST_EMPTY_TEXT')}
                        </Text>
                    </View>
                }
            </View >
        );
    };
};

export default ConversationsListComponent;