import React from 'react';
import {
    TouchableOpacity,
    Text,
    View
} from 'react-native';
import MapView from 'react-native-maps';

class MessageTextBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.onUrlPressed = this.onUrlPressed.bind(this);
    };

    extractText() {
        let textParts = [];
        let stringParts = this.props.text.split(' ');
        stringParts.map((stringPart, index) => {
            if (stringPart) {
                if (/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(stringPart)) {
                    textParts.push({
                        type: 1,
                        content: stringPart
                    });
                } else {
                    let textContent = `${stringPart}${index !== stringParts - 1 ? ' ' : ''}`;

                    if (textParts.length && textParts[textParts.length - 1].type === 0) {
                        textParts[textParts.length - 1].content += textContent;
                    } else {
                        textParts.push({
                            type: 0,
                            content: textContent
                        });
                    }
                }
            }
        });
        return textParts;
    };

    onUrlPressed(url) {
        this.props.onMessageUrlPressed({
            url: url
        });
    };

    render() {
        return (
            <View
                style={[
                    this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_TEXT_BLOCK_STYLE'),
                    (this.props.isFromMe ? this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_TEXT_FROM_ME_STYLE') : {})
                ]}
            >
                {
                    this.extractText().map((textPart, index) => {
                        if (textPart.type === 0) {
                            return (
                                <Text
                                    style={[
                                        this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_TEXT_TEXT_STYLE'),
                                        (this.props.isFromMe ? this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_TEXT_TEXT_FROM_ME_STYLE') : {})
                                    ]}
                                    key={`azstack_message_${this.props.msgId}_part_${index}`}
                                >
                                    {textPart.content}
                                </Text>
                            );
                        }

                        if (textPart.type === 1) {
                            return (
                                <TouchableOpacity
                                    key={`azstack_message_${this.props.msgId}_part_${index}`}
                                    activeOpacity={0.5}
                                    onPress={() => this.onUrlPressed(textPart.content)}
                                >
                                    <Text
                                        style={[
                                            this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_TEXT_TEXT_STYLE'),
                                            this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_TEXT_TEXT_URL_STYLE'),
                                            (this.props.isFromMe ? this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_TEXT_TEXT_FROM_ME_STYLE') : {})
                                        ]}
                                    >
                                        {textPart.content}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }

                        return (null);
                    })
                }
            </View>
        );
    };
};

export default MessageTextBlockComponent;