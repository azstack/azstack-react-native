import React from 'react';
import {
    View,
    Text
} from 'react-native';

class ChatAvatarBlockComponent extends React.Component {

    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.colors = ['#4C87B9', '#1BA39C', '#E35B5A', '#5E738B', '#C49F47', '#F3C200', '#95A5A6', '#C8D046', '#8775A7'];
    }

    getColor(options) {
        if (!options.text) {
            return this.colors[0];
        }
        return this.colors[options.text.charCodeAt(0) % this.colors.length];
    };
    getFirstLetters(options) {
        if (!options.text) {
            return '-';
        }
        if ([1, 2].indexOf(options.getNumber) === -1 || options.getNumber === 1) {
            return options.text[0].toUpperCase();
        }
        let textParts = options.text.split(' ');
        for (let i = textParts.length - 1; i >= 0; i--) {
            if (!textParts[i]) {
                textParts.splice(i, 1);
            }
        }
        if (textParts.length === 0) {
            return '--'.toUpperCase();
        }
        if (textParts.length === 1) {
            return (textParts[0][0] + (textParts[0].length === 1 ? '-' : textParts[0][1])).toUpperCase();
        }
        return (textParts[0][0] + textParts[1][0]).toUpperCase();
    };

    render() {
        return (
            <View
                style={{
                    ...this.coreInstances.CustomStyle.getStyle('AVATAR_BLOCK_STYLE'),
                    backgroundColor: this.getColor({ text: this.props.chatTarget.fullname ? this.props.chatTarget.fullname : this.props.chatTarget.name })
                }}
            >
                <Text
                    style={{
                        ...this.coreInstances.CustomStyle.getStyle('AVATAR_TEXT_STYLE'),
                        ...this.props.textStyle
                    }}
                >
                    {this.getFirstLetters({ text: this.props.chatTarget.fullname ? this.props.chatTarget.fullname : this.props.chatTarget.name, getNumber: this.props.chatType })}
                </Text>
            </View>
        );
    };
};

export default ChatAvatarBlockComponent;