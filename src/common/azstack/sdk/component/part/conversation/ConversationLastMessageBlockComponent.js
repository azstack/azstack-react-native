import React from 'react';
import {
    Text
} from 'react-native';

class ConversationLastMessageBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.getNameSender = this.getNameSender.bind(this);
        this.getNameReceiver = this.getNameReceiver.bind(this);
    };

    getNameSender(sender) {
        if (sender.userId === this.props.AZStackCore.authenticatedUser.userId) {
            return this.props.Language.getText('MESSAGE_SENDER_ME_TEXT');
        }
        return sender.fullname;
    };
    getNameReceiver(receiver) {
        if (receiver.userId === this.props.AZStackCore.authenticatedUser.userId) {
            return this.props.Language.getText('MESSAGE_RECEIVER_ME_TEXT');
        }
        return receiver.fullname;
    };

    render() {
        return (
            <Text
                style={this.props.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_BLOCK_STYLE')}
            >
                {
                    this.props.lastMessage.status === this.props.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED && (
                        <Text>
                            <Text
                                style={this.props.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_TEXT_BOLD_STYLE')}
                            >
                                {this.getNameSender(this.props.lastMessage.sender)}
                            </Text>
                            <Text
                                style={this.props.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_TEXT_BOLD_STYLE')}
                            >
                                {
                                    [
                                        this.props.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT,
                                        this.props.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER,
                                        this.props.AZStackCore.chatConstants.MESSAGE_TYPE_FILE
                                    ].indexOf(this.props.lastMessage.type) > -1 ? ':' : ''
                                }
                            </Text>
                            <Text>
                                {`[ ${this.props.Language.getText('MESSAGE_STATUS_CANCELED_TEXT')} ]`}
                            </Text>
                        </Text>
                    )
                }
                {
                    this.props.lastMessage.status !== this.props.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED && (
                        <Text>
                            <Text
                                style={this.props.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_TEXT_BOLD_STYLE')}
                            >
                                {this.getNameSender(this.props.lastMessage.sender)}
                            </Text>
                            <Text
                                style={this.props.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_TEXT_BOLD_STYLE')}
                            >
                                {
                                    [
                                        this.props.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT,
                                        this.props.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER,
                                        this.props.AZStackCore.chatConstants.MESSAGE_TYPE_FILE
                                    ].indexOf(this.props.lastMessage.type) > -1 ? ':' : ''
                                }
                            </Text>
                            {
                                this.props.lastMessage.type === this.props.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT && (
                                    <Text>
                                        {` ${this.props.lastMessage.text}`}
                                    </Text>
                                )
                            }
                            {
                                this.props.lastMessage.type === this.props.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER && (
                                    <Text>
                                        {` [${this.props.Language.getText('MESSAGE_TYPE_STICKER_TEXT')}]`}
                                    </Text>
                                )
                            }
                            {
                                this.props.lastMessage.type === this.props.AZStackCore.chatConstants.MESSAGE_TYPE_FILE && (
                                    <Text>
                                        {` [${this.props.Language.getText('MESSAGE_TYPE_FILE_TEXT')}]`}
                                    </Text>
                                )
                            }
                            {
                                this.props.lastMessage.type === this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_CREATED && (
                                    <Text>
                                        <Text>
                                            {` ${this.props.Language.getText('MESSAGE_TYPE_GROUP_CREATED_ACTION_TEXT')}`}
                                        </Text>
                                        <Text>
                                            {` ${this.props.lastMessage.receiver.type === this.props.AZStackCore.groupConstants.GROUP_TYPE_PRIVATE ? this.props.Language.getText('GROUP_TYPE_PRIVATE') : this.props.Language.getText('GROUP_TYPE_PUBLIC')}`}
                                        </Text>
                                        <Text>
                                            {` ${this.props.Language.getText('GROUP_TEXT')}`}
                                        </Text>
                                    </Text>
                                )
                            }
                            {
                                this.props.lastMessage.type === this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_INVITED && (
                                    <Text>
                                        <Text>
                                            {` ${this.props.Language.getText('MESSAGE_TYPE_GROUP_INVITED_ACTION_TEXT')}`}
                                        </Text>
                                        <Text
                                            style={this.props.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_TEXT_BOLD_STYLE')}
                                        >
                                            {` ${
                                                this.props.lastMessage.invited.invites.map((invite) => {
                                                    return this.getNameReceiver(invite);
                                                }).join(', ')
                                                }`}
                                        </Text>
                                        <Text>
                                            {` ${this.props.Language.getText('MESSAGE_TYPE_GROUP_INVITED_PREPOSITION_TEXT')}`}
                                        </Text>
                                        <Text>
                                            {` ${this.props.Language.getText('GROUP_TEXT')}`}
                                        </Text>
                                    </Text>
                                )
                            }
                            {
                                this.props.lastMessage.type === this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_LEFT && (
                                    <Text>
                                        <Text>
                                            {` ${this.props.Language.getText(this.props.lastMessage.sender.userId === this.props.lastMessage.left.leave.userId ? 'MESSAGE_TYPE_GROUP_SENDER_LEFT_ACTION_TEXT' : 'MESSAGE_TYPE_GROUP_RECEIVER_LEFT_ACTION_TEXT')}`}
                                        </Text>
                                        {
                                            this.props.lastMessage.sender.userId !== this.props.lastMessage.left.leave.userId && (
                                                <Text
                                                    style={this.props.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_TEXT_BOLD_STYLE')}
                                                >
                                                    {` ${this.getNameReceiver(this.props.lastMessage.left.leave)}`}
                                                </Text>
                                            )
                                        }
                                        <Text>
                                            {` ${this.props.Language.getText('MESSAGE_TYPE_GROUP_LEFT_PREPOSITION_TEXT')}`}
                                        </Text>
                                        <Text>
                                            {` ${this.props.Language.getText('GROUP_TEXT')}`}
                                        </Text>
                                        {
                                            !!this.props.lastMessage.left.newAdmin && (
                                                <Text>
                                                    <Text>
                                                        {`, ${this.props.Language.getText('MESSAGE_TYPE_GROUP_LEFT_AND_TEXT')}`}
                                                    </Text>
                                                    <Text>
                                                        {` ${this.props.Language.getText('MESSAGE_TYPE_GROUP_CHANGED_ADMIN_ACTION_TEXT')}`}
                                                    </Text>
                                                    <Text>
                                                        {` ${this.props.Language.getText('MESSAGE_TYPE_GROUP_CHANGED_ADMIN_PREPOSITION_TEXT')}`}
                                                    </Text>
                                                    <Text
                                                        style={this.props.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_TEXT_BOLD_STYLE')}
                                                    >
                                                        {` ${this.getNameReceiver(this.props.lastMessage.left.newAdmin)}`}
                                                    </Text>
                                                </Text>
                                            )
                                        }
                                    </Text>
                                )
                            }
                            {
                                this.props.lastMessage.type === this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_RENAMED && (
                                    <Text>
                                        <Text>
                                            {` ${this.props.Language.getText('MESSAGE_TYPE_GROUP_RENAMED_ACTION_TEXT')}`}
                                        </Text>
                                        <Text>
                                            {` ${this.props.Language.getText('GROUP_TEXT')}`}
                                        </Text>
                                        <Text>
                                            {` ${this.props.Language.getText('MESSAGE_TYPE_GROUP_RENAMED_PREPOSITION_TEXT')}`}
                                        </Text>
                                        <Text
                                            style={this.props.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_TEXT_BOLD_STYLE')}
                                        >
                                            {` ${this.props.lastMessage.renamed.newName}`}
                                        </Text>
                                    </Text>
                                )
                            }
                            {
                                this.props.lastMessage.type === this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_ADMIN_CHANGED && (
                                    <Text>
                                        <Text>
                                            {` ${this.props.Language.getText('MESSAGE_TYPE_GROUP_CHANGED_ADMIN_ACTION_TEXT')}`}
                                        </Text>
                                        <Text>
                                            {` ${this.props.Language.getText('GROUP_TEXT')}`}
                                        </Text>
                                        <Text>
                                            {` ${this.props.Language.getText('MESSAGE_TYPE_GROUP_CHANGED_ADMIN_PREPOSITION_TEXT')}`}
                                        </Text>
                                        <Text
                                            style={this.props.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_TEXT_BOLD_STYLE')}
                                        >
                                            {` ${this.getNameReceiver(this.props.lastMessage.adminChanged.newAdmin)}`}
                                        </Text>
                                    </Text>
                                )
                            }
                            {
                                this.props.lastMessage.type === this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_PUBLIC_JOINED && (
                                    <Text>
                                        <Text>
                                            {` ${this.props.Language.getText('MESSAGE_TYPE_GROUP_JOINED_ACTION_TEXT')}`}
                                        </Text>
                                        <Text>
                                            {` ${this.props.Language.getText('GROUP_TEXT')}`}
                                        </Text>
                                    </Text>
                                )
                            }
                        </Text>
                    )
                }
            </Text>
        );
    };
};

export default ConversationLastMessageBlockComponent;