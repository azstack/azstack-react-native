import React from 'react';
import {
    View,
    TouchableOpacity,
    Text
} from 'react-native';

import ChatAvatarBlockComponent from '../common/ChatAvatarBlockComponent';
import ConversationLastMessageBlockComponent from './ConversationLastMessageBlockComponent';

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
                        chatTarget={this.props.conversation.chatTarget}
                    />
                </View>
                <View
                    style={this.props.CustomStyle.getStyle('CONVERSATION_INFORMATION_BLOCK_STYLE')}
                >
                    <Text
                        style={this.props.CustomStyle.getStyle('CONVERSATION_NAME_TEXT_STYLE')}
                    >
                        {this.props.conversation.chatTarget.fullname ? this.props.conversation.chatTarget.fullname : this.props.conversation.chatTarget.name}
                    </Text>
                    <ConversationLastMessageBlockComponent
                        Language={this.props.Language}
                        CustomStyle={this.props.CustomStyle}
                        AZStackCore={this.props.AZStackCore}
                        lastMessage={this.props.conversation.lastMessage}
                    />
                </View>
            </TouchableOpacity>
        );
    };
};

export default ConversationBlockComponent;