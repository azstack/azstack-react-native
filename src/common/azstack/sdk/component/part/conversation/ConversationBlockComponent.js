import React from 'react';
import {
    View,
    TouchableOpacity,
    Text
} from 'react-native';

import ChatAvatarBlockComponent from '../common/ChatAvatarBlockComponent';
import TypingBlockComponent from '../common/TypingBlockComponent';
import TimeFromNowBlockComponent from '../common/TimeFromNowBlockComponent';
import ConversationLastMessageBlockComponent from './ConversationLastMessageBlockComponent';

class ConversationBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.onConversationPressed = this.onConversationPressed.bind(this);
        this.isConversationOnline = this.isConversationOnline.bind(this);
    };

    onConversationPressed() {
        this.props.onConversationPressed({ conversation: this.props.conversation });
    };

    isConversationOnline() {
        if (this.props.conversation.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_USER) {
            return this.props.conversation.chatTarget.status === this.coreInstances.AZStackCore.userConstants.USER_STATUS_ONLINE;
        }
        let aUserOnline = false;
        for (let i = 0; i < this.props.conversation.chatTarget.members.length; i++) {
            if (this.props.conversation.chatTarget.members[i].userId !== this.coreInstances.AZStackCore.authenticatedUser.userId && this.props.conversation.chatTarget.members[i].status === this.coreInstances.AZStackCore.userConstants.USER_STATUS_ONLINE) {
                aUserOnline = true;
                break;
            }
        }
        return aUserOnline;
    };

    render() {
        return (
            <TouchableOpacity
                style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_BLOCK_STYLE')}
                activeOpacity={0.5}
                onPress={this.onConversationPressed}
            >
                <View
                    style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_AVATAR_CONTAINER_BLOCK_STYLE')}
                >
                    <ChatAvatarBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                        containerStyle={this.coreInstances.CustomStyle.getStyle('CONVERSATION_AVATAR_BLOCK_STYLE')}
                        chatType={this.props.conversation.chatType}
                        chatTarget={this.props.conversation.chatTarget}
                        textStyle={this.coreInstances.CustomStyle.getStyle('CONVERSATION_AVATAR_TEXT_STYLE')}
                    />
                    <View
                        style={[
                            this.coreInstances.CustomStyle.getStyle('CONVERSATION_STATUS_BLOCK_STYLE'),
                            (this.isConversationOnline() ? this.coreInstances.CustomStyle.getStyle('CONVERSATION_STATUS_ONLINE_STYLE') : {})
                        ]}
                    />
                </View>
                <View
                    style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_INFORMATION_BLOCK_STYLE')}
                >
                    <Text
                        style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_NAME_TEXT_STYLE')}
                        numberOfLines={1}
                    >
                        {this.props.conversation.chatTarget.fullname ? this.props.conversation.chatTarget.fullname : this.props.conversation.chatTarget.name}
                    </Text>
                    {
                        (!this.props.conversation.typing || this.props.conversation.typing.senders.length === 0) &&
                        <ConversationLastMessageBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            lastMessage={this.props.conversation.lastMessage}
                        />
                    }
                    {
                        !!this.props.conversation.typing &&
                        this.props.conversation.typing.senders.length > 0 &&
                        <TypingBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            textStyle={this.coreInstances.CustomStyle.getStyle('CONVERSATION_TYPING_TEXT_STYLE')}
                            typing={this.props.conversation.typing}
                        />
                    }
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_FROM_NOW_BLOCK_STYLE')}
                    >
                        <TimeFromNowBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            textStyle={this.coreInstances.CustomStyle.getStyle('CONVERSATION_FROM_NOW_TEXT_STYLE')}
                            time={this.props.conversation.lastMessage.created}
                        />
                    </View>
                    {
                        this.props.conversation.unread > 0 && (
                            <View
                                style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_UNREAD_BLOCK_STYLE')}
                            >

                                <Text
                                    style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_UNREAD_TEXT_STYLE')}
                                >
                                    {this.props.conversation.unread > 9 ? '9+' : this.props.conversation.unread}
                                </Text>
                            </View>
                        )
                    }
                </View>
            </TouchableOpacity>
        );
    };
};

export default ConversationBlockComponent;