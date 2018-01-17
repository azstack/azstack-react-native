import React from 'react';
import {
    View,
    Text,
    Image
} from 'react-native';

import ChatAvatarBlockComponent from '../common/ChatAvatarBlockComponent';
import MessageStatusBlockComponent from '../common/MessageStatusBlockComponent';

class MessageBlockComponent extends React.Component {
    constructor(props) {
        super(props);
    };

    toTimeString(date) {
        if (!date) {
            return '';
        }
        if (new Date(date) === 'Invalid Date' || isNaN(new Date(date))) {
            return '';
        }
        let handleDate = new Date(date);
        let hour = handleDate.getHours();
        let minute = handleDate.getMinutes();
        return `${hour > 9 ? hour : '0' + hour}:${minute > 9 ? minute : '0' + minute}`;
    };

    toDayString(date) {
        if (!date) {
            return '';
        }
        if (new Date(date) === 'Invalid Date' || isNaN(new Date(date))) {
            return '';
        }
        let handleDate = new Date(date);
        let year = handleDate.getFullYear();
        let month = handleDate.getMonth() + 1;
        let day = handleDate.getDate();
        return `${year}/${month > 9 ? month : '0' + month}/${day > 9 ? day : '0' + day}`;
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
            <View
                style={this.props.CustomStyle.getStyle('MESSAGE_BLOCK_STYLE')}
            >
                {
                    this.props.shouldRenderTimeMark && (
                        <Text
                            style={this.props.CustomStyle.getStyle('MESSAGE_TIME_MARK_TEXT_STYLE')}
                        >
                            {this.toDayString(this.props.message.created)}
                        </Text>
                    )
                }
                {
                    [
                        this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_CREATED,
                        this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_INVITED,
                        this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_LEFT,
                        this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_RENAMED,
                        this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_ADMIN_CHANGED,
                        this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_PUBLIC_JOINED
                    ].indexOf(this.props.message.type) > -1 && (
                        <Text
                            style={this.props.CustomStyle.getStyle('MESSAGE_TYPE_ACTION_TEXT_STYLE')}
                        >
                            <Text
                                style={this.props.CustomStyle.getStyle('MESSAGE_TYPE_ACTION_BOLD_TEXT_STYLE')}
                            >
                                {this.getNameSender(this.props.message.sender)}
                            </Text>
                            {
                                this.props.message.type === this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_CREATED && (
                                    <Text>
                                        <Text>
                                            {` ${this.props.Language.getText('MESSAGE_TYPE_GROUP_CREATED_ACTION_TEXT')}`}
                                        </Text>
                                        <Text>
                                            {` ${this.props.message.receiver.type === this.props.AZStackCore.groupConstants.GROUP_TYPE_PRIVATE ? this.props.Language.getText('GROUP_TYPE_PRIVATE') : this.props.Language.getText('GROUP_TYPE_PUBLIC')}`}
                                        </Text>
                                        <Text>
                                            {` ${this.props.Language.getText('GROUP_TEXT')}`}
                                        </Text>
                                    </Text>
                                )
                            }
                            {
                                this.props.message.type === this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_INVITED && (
                                    <Text>
                                        <Text>
                                            {` ${this.props.Language.getText('MESSAGE_TYPE_GROUP_INVITED_ACTION_TEXT')}`}
                                        </Text>
                                        <Text
                                            style={this.props.CustomStyle.getStyle('MESSAGE_TYPE_ACTION_BOLD_TEXT_STYLE')}
                                        >
                                            {` ${
                                                this.props.message.invited.invites.map((invite) => {
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
                                this.props.message.type === this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_LEFT && (
                                    <Text>
                                        <Text>
                                            {` ${this.props.Language.getText(this.props.message.sender.userId === this.props.message.left.leave.userId ? 'MESSAGE_TYPE_GROUP_SENDER_LEFT_ACTION_TEXT' : 'MESSAGE_TYPE_GROUP_RECEIVER_LEFT_ACTION_TEXT')}`}
                                        </Text>
                                        {
                                            this.props.message.sender.userId !== this.props.message.left.leave.userId && (
                                                <Text
                                                    style={this.props.CustomStyle.getStyle('MESSAGE_TYPE_ACTION_BOLD_TEXT_STYLE')}
                                                >
                                                    {` ${this.getNameReceiver(this.props.message.left.leave)}`}
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
                                            !!this.props.message.left.newAdmin && (
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
                                                        style={this.props.CustomStyle.getStyle('MESSAGE_TYPE_ACTION_BOLD_TEXT_STYLE')}
                                                    >
                                                        {` ${this.getNameReceiver(this.props.message.left.newAdmin)}`}
                                                    </Text>
                                                </Text>
                                            )
                                        }
                                    </Text>
                                )
                            }
                            {
                                this.props.message.type === this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_RENAMED && (
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
                                            style={this.props.CustomStyle.getStyle('MESSAGE_TYPE_ACTION_BOLD_TEXT_STYLE')}
                                        >
                                            {` ${this.props.message.renamed.newName}`}
                                        </Text>
                                    </Text>
                                )
                            }
                            {
                                this.props.message.type === this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_ADMIN_CHANGED && (
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
                                            style={this.props.CustomStyle.getStyle('MESSAGE_TYPE_ACTION_BOLD_TEXT_STYLE')}
                                        >
                                            {` ${this.getNameReceiver(this.props.message.adminChanged.newAdmin)}`}
                                        </Text>
                                    </Text>
                                )
                            }
                            {
                                this.props.message.type === this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_PUBLIC_JOINED && (
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
                            <Text
                                style={this.props.CustomStyle.getStyle('MESSAGE_TYPE_ACTION_TIME_TEXT_STYLE')}
                            >
                                {` ${this.toTimeString(this.props.message.created)}`}
                            </Text>
                        </Text>
                    )
                }
                {
                    [
                        this.props.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT,
                        this.props.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER,
                        this.props.AZStackCore.chatConstants.MESSAGE_TYPE_FILE
                    ].indexOf(this.props.message.type) > -1 && (
                        <View
                            style={this.props.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_BLOCK_STYLE')}
                        >
                            {
                                this.props.message.sender.userId !== this.props.AZStackCore.authenticatedUser.userId &&
                                this.props.shouldRenderSender && (
                                    <View
                                        style={this.props.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_SENDER_BLOCK_STYLE')}
                                    >
                                        <View
                                            style={this.props.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_SENDER_AVATAR_BLOCK_STYLE')}
                                        >
                                            <ChatAvatarBlockComponent
                                                CustomStyle={this.props.CustomStyle}
                                                chatType={this.props.AZStackCore.chatConstants.CHAT_TYPE_USER}
                                                chatTarget={this.props.message.sender}
                                                textStyle={this.props.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_SENDER_AVATAR_TEXT_STYLE')}
                                            />
                                        </View>
                                        <Text
                                            style={this.props.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_SENDER_TEXT_STYLE')}
                                        >
                                            {this.getNameSender(this.props.message.sender)}
                                        </Text>
                                    </View>
                                )
                            }
                            <View
                                style={[
                                    this.props.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_CONTENT_STYLE'),
                                    (this.props.message.sender.userId === this.props.AZStackCore.authenticatedUser.userId ? this.props.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_CONTENT_FROM_ME_STYLE') : {})
                                ]}
                            >
                                {
                                    this.props.message.sender.userId === this.props.AZStackCore.authenticatedUser.userId && (
                                        <Text
                                            style={this.props.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_TIME_TEXT_STYLE')}
                                        >
                                            {this.toTimeString(this.props.message.created)}
                                        </Text>
                                    )
                                }
                                {
                                    this.props.message.type === this.props.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT && (
                                        <Text
                                            style={[
                                                this.props.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_TEXT_STYLE'),
                                                (this.props.message.sender.userId === this.props.AZStackCore.authenticatedUser.userId ? this.props.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_TEXT_FROM_ME_STYLE') : {})
                                            ]}
                                        >
                                            {this.props.message.text}
                                        </Text>
                                    )
                                }
                                {
                                    this.props.message.type === this.props.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER && (
                                        <Image
                                            style={this.props.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_STICKER_STYLE')}
                                            source={{
                                                uri: this.props.message.sticker.url
                                            }}
                                        />
                                    )
                                }
                                {
                                    this.props.message.sender.userId !== this.props.AZStackCore.authenticatedUser.userId && (
                                        <Text
                                            style={this.props.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_TIME_TEXT_STYLE')}
                                        >
                                            {this.toTimeString(this.props.message.created)}
                                        </Text>
                                    )
                                }
                            </View>
                        </View>
                    )
                }
            </View>
        );
    };
};

export default MessageBlockComponent;