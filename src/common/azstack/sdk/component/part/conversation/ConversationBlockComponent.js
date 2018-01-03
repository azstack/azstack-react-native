import React from 'react';
import {
    View,
    TouchableOpacity
} from 'react-native';

import ChatAvatarBlockComponent from '../common/ChatAvatarBlockComponent';

class ConversationBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.onConversationClicked = this.onConversationClicked.bind(this);
    };

    onConversationClicked() {
        this.props.onConversationClicked(this.props.conversation);
    };

    render() {
        return (
            <TouchableOpacity
                style={this.props.CustomStyle.getStyle('CONVERSATION_BLOCK_STYLE')}
                activeOpacity={0.5}
                onPress={this.onConversationClicked}
            >
                <View
                    style={this.props.CustomStyle.getStyle('CONVERSATION_AVATAR_BLOCK_STYLE')}
                >
                    <ChatAvatarBlockComponent
                        CustomStyle={this.props.CustomStyle}
                        chatType={this.props.conversation.chatType}
                        chatTarget={this.props.conversation.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_USER ? this.props.conversation.user : this.props.conversation.group}
                    />
                </View>
            </TouchableOpacity>
        );
    };
};

export default ConversationBlockComponent;