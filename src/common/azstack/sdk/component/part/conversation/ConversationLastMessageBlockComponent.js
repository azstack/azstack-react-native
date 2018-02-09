import React from 'react';
import {
    View,
    Text
} from 'react-native';

import MessageStatusBlockComponent from '../common/MessageStatusBlockComponent';

class ConversationLastMessageBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.getNameSender = this.getNameSender.bind(this);
        this.getNameReceiver = this.getNameReceiver.bind(this);
    };

    getNameSender(sender) {
        if (sender.userId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
            return this.coreInstances.Language.getText('MESSAGE_SENDER_ME_TEXT');
        }
        return sender.fullname;
    };
    getNameReceiver(receiver) {
        if (receiver.userId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
            return this.coreInstances.Language.getText('MESSAGE_RECEIVER_ME_TEXT');
        }
        return receiver.fullname;
    };

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_BLOCK_STYLE')}
            >
                <Text
                    style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_TEXT_STYLE')}
                    numberOfLines={1}
                >
                    {
                        this.props.lastMessage.status === this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED && (
                            <Text>
                                <Text
                                    style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_TEXT_BOLD_STYLE')}
                                >
                                    {this.getNameSender(this.props.lastMessage.sender)}
                                </Text>
                                <Text
                                    style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_TEXT_BOLD_STYLE')}
                                >
                                    {
                                        [
                                            this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT,
                                            this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER,
                                            this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_FILE,
                                            this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_LOCATION
                                        ].indexOf(this.props.lastMessage.type) > -1 ? ':' : ''
                                    }
                                </Text>
                                <Text>
                                    {`[ ${this.coreInstances.Language.getText('MESSAGE_STATUS_CANCELED_TEXT')} ]`}
                                </Text>
                            </Text>
                        )
                    }
                    {
                        this.props.lastMessage.status !== this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED && (
                            <Text>
                                <Text
                                    style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_TEXT_BOLD_STYLE')}
                                >
                                    {this.getNameSender(this.props.lastMessage.sender)}
                                </Text>
                                <Text
                                    style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_TEXT_BOLD_STYLE')}
                                >
                                    {
                                        [
                                            this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT,
                                            this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER,
                                            this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_FILE,
                                            this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_LOCATION
                                        ].indexOf(this.props.lastMessage.type) > -1 ? ':' : ''
                                    }
                                </Text>
                                {
                                    this.props.lastMessage.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT && (
                                        <Text>
                                            {` ${this.props.lastMessage.text}`}
                                        </Text>
                                    )
                                }
                                {
                                    this.props.lastMessage.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER && (
                                        <Text>
                                            {` [${this.coreInstances.Language.getText('MESSAGE_TYPE_STICKER_TEXT')}]`}
                                        </Text>
                                    )
                                }
                                {
                                    this.props.lastMessage.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_FILE && (
                                        <Text>
                                            {` [${this.coreInstances.Language.getText('MESSAGE_TYPE_FILE_TEXT')}]`}
                                        </Text>
                                    )
                                }
                                {
                                    this.props.lastMessage.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_LOCATION && (
                                        <Text>
                                            {` [${this.coreInstances.Language.getText('MESSAGE_TYPE_LOCATION_TEXT')}]`}
                                        </Text>
                                    )
                                }
                                {
                                    this.props.lastMessage.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_CREATED && (
                                        <Text>
                                            <Text>
                                                {` ${this.coreInstances.Language.getText('MESSAGE_TYPE_GROUP_CREATED_ACTION_TEXT')}`}
                                            </Text>
                                            <Text>
                                                {` ${this.props.lastMessage.receiver.type === this.coreInstances.AZStackCore.groupConstants.GROUP_TYPE_PRIVATE ? this.coreInstances.Language.getText('GROUP_TYPE_PRIVATE') : this.coreInstances.Language.getText('GROUP_TYPE_PUBLIC')}`}
                                            </Text>
                                            <Text>
                                                {` ${this.coreInstances.Language.getText('GROUP_TEXT')}`}
                                            </Text>
                                        </Text>
                                    )
                                }
                                {
                                    this.props.lastMessage.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_INVITED && (
                                        <Text>
                                            <Text>
                                                {` ${this.coreInstances.Language.getText('MESSAGE_TYPE_GROUP_INVITED_ACTION_TEXT')}`}
                                            </Text>
                                            <Text
                                                style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_TEXT_BOLD_STYLE')}
                                            >
                                                {` ${
                                                    this.props.lastMessage.invited.invites.map((invite) => {
                                                        return this.getNameReceiver(invite);
                                                    }).join(', ')
                                                    }`}
                                            </Text>
                                            <Text>
                                                {` ${this.coreInstances.Language.getText('MESSAGE_TYPE_GROUP_INVITED_PREPOSITION_TEXT')}`}
                                            </Text>
                                            <Text>
                                                {` ${this.coreInstances.Language.getText('GROUP_TEXT')}`}
                                            </Text>
                                        </Text>
                                    )
                                }
                                {
                                    this.props.lastMessage.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_LEFT && (
                                        <Text>
                                            <Text>
                                                {` ${this.coreInstances.Language.getText(this.props.lastMessage.sender.userId === this.props.lastMessage.left.leave.userId ? 'MESSAGE_TYPE_GROUP_SENDER_LEFT_ACTION_TEXT' : 'MESSAGE_TYPE_GROUP_RECEIVER_LEFT_ACTION_TEXT')}`}
                                            </Text>
                                            {
                                                this.props.lastMessage.sender.userId !== this.props.lastMessage.left.leave.userId && (
                                                    <Text
                                                        style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_TEXT_BOLD_STYLE')}
                                                    >
                                                        {` ${this.getNameReceiver(this.props.lastMessage.left.leave)}`}
                                                    </Text>
                                                )
                                            }
                                            <Text>
                                                {` ${this.coreInstances.Language.getText('MESSAGE_TYPE_GROUP_LEFT_PREPOSITION_TEXT')}`}
                                            </Text>
                                            <Text>
                                                {` ${this.coreInstances.Language.getText('GROUP_TEXT')}`}
                                            </Text>
                                            {
                                                !!this.props.lastMessage.left.newAdmin && (
                                                    <Text>
                                                        <Text>
                                                            {`, ${this.coreInstances.Language.getText('MESSAGE_TYPE_GROUP_LEFT_AND_TEXT')}`}
                                                        </Text>
                                                        <Text>
                                                            {` ${this.coreInstances.Language.getText('MESSAGE_TYPE_GROUP_CHANGED_ADMIN_ACTION_TEXT')}`}
                                                        </Text>
                                                        <Text>
                                                            {` ${this.coreInstances.Language.getText('MESSAGE_TYPE_GROUP_CHANGED_ADMIN_PREPOSITION_TEXT')}`}
                                                        </Text>
                                                        <Text
                                                            style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_TEXT_BOLD_STYLE')}
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
                                    this.props.lastMessage.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_RENAMED && (
                                        <Text>
                                            <Text>
                                                {` ${this.coreInstances.Language.getText('MESSAGE_TYPE_GROUP_RENAMED_ACTION_TEXT')}`}
                                            </Text>
                                            <Text>
                                                {` ${this.coreInstances.Language.getText('GROUP_TEXT')}`}
                                            </Text>
                                            <Text>
                                                {` ${this.coreInstances.Language.getText('MESSAGE_TYPE_GROUP_RENAMED_PREPOSITION_TEXT')}`}
                                            </Text>
                                            <Text
                                                style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_TEXT_BOLD_STYLE')}
                                            >
                                                {` ${this.props.lastMessage.renamed.newName}`}
                                            </Text>
                                        </Text>
                                    )
                                }
                                {
                                    this.props.lastMessage.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_ADMIN_CHANGED && (
                                        <Text>
                                            <Text>
                                                {` ${this.coreInstances.Language.getText('MESSAGE_TYPE_GROUP_CHANGED_ADMIN_ACTION_TEXT')}`}
                                            </Text>
                                            <Text>
                                                {` ${this.coreInstances.Language.getText('GROUP_TEXT')}`}
                                            </Text>
                                            <Text>
                                                {` ${this.coreInstances.Language.getText('MESSAGE_TYPE_GROUP_CHANGED_ADMIN_PREPOSITION_TEXT')}`}
                                            </Text>
                                            <Text
                                                style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_TEXT_BOLD_STYLE')}
                                            >
                                                {` ${this.getNameReceiver(this.props.lastMessage.adminChanged.newAdmin)}`}
                                            </Text>
                                        </Text>
                                    )
                                }
                                {
                                    this.props.lastMessage.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_PUBLIC_JOINED && (
                                        <Text>
                                            <Text>
                                                {` ${this.coreInstances.Language.getText('MESSAGE_TYPE_GROUP_JOINED_ACTION_TEXT')}`}
                                            </Text>
                                            <Text>
                                                {` ${this.coreInstances.Language.getText('GROUP_TEXT')}`}
                                            </Text>
                                        </Text>
                                    )
                                }
                            </Text>
                        )
                    }
                </Text>
                {
                    this.props.lastMessage.status !== this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED &&
                    this.props.lastMessage.sender.userId === this.coreInstances.AZStackCore.authenticatedUser.userId &&
                    [
                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT,
                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER,
                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_FILE,
                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_LOCATION
                    ].indexOf(this.props.lastMessage.type) > -1 &&
                    this.props.lastMessage.status !== this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED &&
                    (
                        <View
                            style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_STATUS_BLOCK_STYLE')}
                        >
                            <MessageStatusBlockComponent
                                getCoreInstances={this.props.getCoreInstances}
                                textStyle={this.coreInstances.CustomStyle.getStyle('CONVERSATION_LAST_MESSAGE_STATUS_TEXT_STYLE')}
                                status={this.props.lastMessage.status}
                            />
                        </View>
                    )
                }
            </View>
        );
    };
};

export default ConversationLastMessageBlockComponent;