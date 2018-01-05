import React from 'react';
import {
    View,
    TouchableOpacity,
    Text
} from 'react-native';

import ChatAvatarBlockComponent from '../common/ChatAvatarBlockComponent';
import TimeFromNowBlockComponent from '../common/TimeFromNowBlockComponent';
import MessageStatusBlockComponent from '../common/MessageStatusBlockComponent';
import ConversationLastMessageBlockComponent from './ConversationLastMessageBlockComponent';

class ConversationBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.onConversationClicked = this.onConversationClicked.bind(this);
        this.isConversationOnline = this.isConversationOnline.bind(this);
    };

    onConversationClicked() {
        this.props.onConversationClicked(this.props.conversation);
    };

    isConversationOnline() {
        if (this.props.conversation.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_USER) {
            return this.props.conversation.chatTarget.status === this.props.AZStackCore.userConstants.USER_STATUS_ONLINE;
        }
        let aUserOnline = false;
        for (let i = 0; i < this.props.conversation.chatTarget.members.length; i++) {
            if (this.props.conversation.chatTarget.members[i].userId !== this.props.AZStackCore.authenticatedUser.userId && this.props.conversation.chatTarget.members[i].status === this.props.AZStackCore.userConstants.USER_STATUS_ONLINE) {
                aUserOnline = true;
                break;
            }
        }
        return aUserOnline;
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
                        textStyle={this.props.CustomStyle.getStyle('CONVERSATION_AVATAR_TEXT_STYLE')}
                    />
                    <View
                        style={[
                            this.props.CustomStyle.getStyle('CONVERSATION_STATUS_BLOCK_STYLE'),
                            (this.isConversationOnline() ? this.props.CustomStyle.getStyle('CONVERSATION_STATUS_ONLINE_STYLE') : {})
                        ]}
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
                    <TimeFromNowBlockComponent
                        Language={this.props.Language}
                        CustomStyle={this.props.CustomStyle}
                        time={this.props.conversation.lastMessage.created}
                    />
                    {
                        this.props.conversation.unread > 0 && (
                            <View
                                style={this.props.CustomStyle.getStyle('CONVERSATION_UNREAD_BLOCK_STYLE')}
                            >

                                <Text
                                    style={this.props.CustomStyle.getStyle('CONVERSATION_UNREAD_TEXT_STYLE')}
                                >
                                    {this.props.conversation.unread > 9 ? '9+' : this.props.conversation.unread}
                                </Text>
                            </View>
                        )
                    }
                    {
                        this.props.conversation.lastMessage.sender.userId === this.props.AZStackCore.authenticatedUser.userId &&
                        [
                            this.props.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT,
                            this.props.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER,
                            this.props.AZStackCore.chatConstants.MESSAGE_TYPE_FILE
                        ].indexOf(this.props.conversation.lastMessage.type) > -1 &&
                        this.props.conversation.lastMessage.status !== this.props.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED &&
                        (
                            <View
                                style={this.props.CustomStyle.getStyle('CONVERSATION_MESSAGE_STATUS_BLOCK_STYLE')}
                            >
                                <MessageStatusBlockComponent
                                    CustomStyle={this.props.CustomStyle}
                                    AZStackCore={this.props.AZStackCore}
                                    textStyle={this.props.CustomStyle.getStyle('CONVERSATION_MESSAGE_STATUS_TEXT_STYLE')}
                                    status={this.props.conversation.lastMessage.status}
                                />
                            </View>
                        )
                    }
                </View>
            </TouchableOpacity>
        );
    };
};

export default ConversationBlockComponent;