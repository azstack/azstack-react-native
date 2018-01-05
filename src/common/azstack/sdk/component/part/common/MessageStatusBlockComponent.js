import React from 'react';
import {
    View,
    Text
} from 'react-native';

class MessageStatusBlockComponent extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        return (
            <View
                style={[
                    this.props.CustomStyle.getStyle('MESSAGE_STATUS_BLOCK_STYLE'),
                    (this.props.status === this.props.AZStackCore.chatConstants.MESSAGE_STATUS_SENDING ? this.props.CustomStyle.getStyle('MESSAGE_STATUS_BLOCK_SENDING_STYLE') : {}),
                    (this.props.status === this.props.AZStackCore.chatConstants.MESSAGE_STATUS_SENT ? this.props.CustomStyle.getStyle('MESSAGE_STATUS_BLOCK_SENT_STYLE') : {}),
                    (this.props.status === this.props.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED ? this.props.CustomStyle.getStyle('MESSAGE_STATUS_BLOCK_DELIVERED_STYLE') : {}),
                    (this.props.status === this.props.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN ? this.props.CustomStyle.getStyle('MESSAGE_STATUS_BLOCK_SEEN_STYLE') : {})
                ]}
            >
                <Text
                    style={[
                        this.props.CustomStyle.getStyle('MESSAGE_STATUS_TEXT_STYLE'),
                        (this.props.status === this.props.AZStackCore.chatConstants.MESSAGE_STATUS_SENDING ? this.props.CustomStyle.getStyle('MESSAGE_STATUS_TEXT_SENDING_STYLE') : {}),
                        (this.props.status === this.props.AZStackCore.chatConstants.MESSAGE_STATUS_SENT ? this.props.CustomStyle.getStyle('MESSAGE_STATUS_TEXT_SENT_STYLE') : {}),
                        (this.props.status === this.props.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED ? this.props.CustomStyle.getStyle('MESSAGE_STATUS_TEXT_DELIVERED_STYLE') : {}),
                        (this.props.status === this.props.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN ? this.props.CustomStyle.getStyle('MESSAGE_STATUS_TEXT_SEEN_STYLE') : {}),
                        (this.props.textStyle ? this.props.textStyle : {})
                    ]}
                >✓</Text>
            </View>
        );
    };
};

export default MessageStatusBlockComponent;