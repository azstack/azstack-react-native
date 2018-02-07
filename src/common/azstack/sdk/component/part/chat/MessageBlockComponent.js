import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity
} from 'react-native';

import ChatAvatarBlockComponent from '../common/ChatAvatarBlockComponent';
import MessageStatusBlockComponent from '../common/MessageStatusBlockComponent';
import MessageImageBlockComponent from './MessageImageBlockComponent';
import MessageAudioBlockComponent from './MessageAudioBlockComponent';
import MessageVideoBlockComponent from './MessageVideoBlockComponent';

class MessageBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.maxSizes = {
            stickerImage: {
                width: 60,
                height: 60
            }
        };

        this.subscriptions = {};

        this.state = {
            showDetails: false
        };

        this.toggleMessageDetails = this.toggleMessageDetails.bind(this);
        this.onSenderPressed = this.onSenderPressed.bind(this);
    };

    addSubscriptions() {
        this.subscriptions.onMessageDetailsShowed = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_MESSAGE_DETAILS_SHOWED, ({ error, result }) => {
            if (error) {
                return;
            }

            if (result.msgId !== this.props.message.msgId) {
                this.setState({ showDetails: false });
            }
        });
    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
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
    getMessageStatusText(status) {
        switch (status) {
            case -1:
                return this.coreInstances.Language.getText('MESSAGE_STATUS_ERROR_TEXT');
            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_SENDING:
                return this.coreInstances.Language.getText('MESSAGE_STATUS_SENDING_TEXT');
            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_SENT:
                return this.coreInstances.Language.getText('MESSAGE_STATUS_SENT_TEXT');
            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED:
                return this.coreInstances.Language.getText('MESSAGE_STATUS_DELIVERED_TEXT');
            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN:
                return this.coreInstances.Language.getText('MESSAGE_STATUS_SEEN_TEXT');
            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED:
                return this.coreInstances.Language.getText('MESSAGE_STATUS_CANCELED_TEXT');
            default:
                return '';
        }
    };

    toggleMessageDetails() {
        if (!this.state.showDetails) {
            this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_MESSAGE_DETAILS_SHOWED, { error: null, result: { msgId: this.props.message.msgId } });
        }
        this.setState({ showDetails: !this.state.showDetails });
    };
    onSenderPressed() {
        this.props.onSenderPressed({
            userId: this.props.message.sender.userId
        });
    };

    componentDidMount() {
        this.addSubscriptions();
    };
    componentWillUnmount() {
        this.clearSubscriptions();
    };

    render() {
        return (
            <TouchableOpacity
                style={this.coreInstances.CustomStyle.getStyle('MESSAGE_BLOCK_STYLE')}
                activeOpacity={0.5}
                onPress={this.toggleMessageDetails}
            >
                {
                    (this.props.shouldRenderTimeMark || this.state.showDetails) && (
                        <Text
                            style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TIME_MARK_TEXT_STYLE')}
                        >
                            {`${this.coreInstances.DateTimeFormatter.toDayString(this.props.message.created)} ${this.coreInstances.DateTimeFormatter.toTimeString(this.props.message.created)}`}
                        </Text>
                    )
                }
                {
                    [
                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_CREATED,
                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_INVITED,
                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_LEFT,
                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_RENAMED,
                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_ADMIN_CHANGED,
                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_PUBLIC_JOINED
                    ].indexOf(this.props.message.type) > -1 && (
                        <Text
                            style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_ACTION_TEXT_STYLE')}
                        >
                            <Text
                                style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_ACTION_BOLD_TEXT_STYLE')}
                            >
                                {this.getNameSender(this.props.message.sender)}
                            </Text>
                            {
                                this.props.message.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_CREATED && (
                                    <Text>
                                        <Text>
                                            {` ${this.coreInstances.Language.getText('MESSAGE_TYPE_GROUP_CREATED_ACTION_TEXT')}`}
                                        </Text>
                                        <Text>
                                            {` ${this.props.message.receiver.type === this.coreInstances.AZStackCore.groupConstants.GROUP_TYPE_PRIVATE ? this.coreInstances.Language.getText('GROUP_TYPE_PRIVATE') : this.coreInstances.Language.getText('GROUP_TYPE_PUBLIC')}`}
                                        </Text>
                                        <Text>
                                            {` ${this.coreInstances.Language.getText('GROUP_TEXT')}`}
                                        </Text>
                                    </Text>
                                )
                            }
                            {
                                this.props.message.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_INVITED && (
                                    <Text>
                                        <Text>
                                            {` ${this.coreInstances.Language.getText('MESSAGE_TYPE_GROUP_INVITED_ACTION_TEXT')}`}
                                        </Text>
                                        <Text
                                            style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_ACTION_BOLD_TEXT_STYLE')}
                                        >
                                            {` ${
                                                this.props.message.invited.invites.map((invite) => {
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
                                this.props.message.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_LEFT && (
                                    <Text>
                                        <Text>
                                            {` ${this.coreInstances.Language.getText(this.props.message.sender.userId === this.props.message.left.leave.userId ? 'MESSAGE_TYPE_GROUP_SENDER_LEFT_ACTION_TEXT' : 'MESSAGE_TYPE_GROUP_RECEIVER_LEFT_ACTION_TEXT')}`}
                                        </Text>
                                        {
                                            this.props.message.sender.userId !== this.props.message.left.leave.userId && (
                                                <Text
                                                    style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_ACTION_BOLD_TEXT_STYLE')}
                                                >
                                                    {` ${this.getNameReceiver(this.props.message.left.leave)}`}
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
                                            !!this.props.message.left.newAdmin && (
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
                                                        style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_ACTION_BOLD_TEXT_STYLE')}
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
                                this.props.message.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_RENAMED && (
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
                                            style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_ACTION_BOLD_TEXT_STYLE')}
                                        >
                                            {` ${this.props.message.renamed.newName}`}
                                        </Text>
                                    </Text>
                                )
                            }
                            {
                                this.props.message.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_ADMIN_CHANGED && (
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
                                            style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_ACTION_BOLD_TEXT_STYLE')}
                                        >
                                            {` ${this.getNameReceiver(this.props.message.adminChanged.newAdmin)}`}
                                        </Text>
                                    </Text>
                                )
                            }
                            {
                                this.props.message.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_PUBLIC_JOINED && (
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
                {
                    [
                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT,
                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER,
                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_FILE
                    ].indexOf(this.props.message.type) > -1 && (
                        <View
                            style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_BLOCK_STYLE')}
                        >
                            {
                                this.props.message.sender.userId !== this.coreInstances.AZStackCore.authenticatedUser.userId &&
                                this.props.shouldRenderSender && (
                                    <TouchableOpacity
                                        style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_SENDER_BLOCK_STYLE')}
                                        activeOpacity={0.5}
                                        onPress={this.onSenderPressed}
                                    >
                                        <ChatAvatarBlockComponent
                                            getCoreInstances={this.props.getCoreInstances}
                                            containerStyle={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_SENDER_AVATAR_BLOCK_STYLE')}
                                            chatType={this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_USER}
                                            chatTarget={this.props.message.sender}
                                            textStyle={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_SENDER_AVATAR_TEXT_STYLE')}
                                        />
                                        <Text
                                            style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_SENDER_TEXT_STYLE')}
                                        >
                                            {this.getNameSender(this.props.message.sender)}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            }
                            <View
                                style={[
                                    this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_CONTENT_STYLE'),
                                    (this.props.message.sender.userId === this.coreInstances.AZStackCore.authenticatedUser.userId ? this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_CONTENT_FROM_ME_STYLE') : {})
                                ]}
                            >
                                {
                                    this.props.message.sender.userId === this.coreInstances.AZStackCore.authenticatedUser.userId &&
                                    this.props.message.status !== this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED &&
                                    this.state.showDetails && (
                                        <Text
                                            style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_DETAILS_STATUS_TEXT_STYLE')}
                                        >
                                            {this.getMessageStatusText(this.props.message.status)}
                                        </Text>
                                    )
                                }
                                {
                                    this.props.message.status === this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED && (
                                        <Text
                                            style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_CANCELED_STYLE')}
                                        >
                                            {`[${this.coreInstances.Language.getText('MESSAGE_STATUS_CANCELED_TEXT')}]`}
                                        </Text>
                                    )
                                }
                                {
                                    this.props.message.status !== this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED &&
                                    this.props.message.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT && (
                                        <Text
                                            style={[
                                                this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_TEXT_STYLE'),
                                                (this.props.message.sender.userId === this.coreInstances.AZStackCore.authenticatedUser.userId ? this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_TEXT_FROM_ME_STYLE') : {})
                                            ]}
                                        >
                                            {this.props.message.text}
                                        </Text>
                                    )
                                }
                                {
                                    this.props.message.status !== this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED &&
                                    this.props.message.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER && (
                                        <Image
                                            style={[
                                                this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_STICKER_STYLE'),
                                                this.coreInstances.FileConverter.ajustImageSizes(this.props.message.sticker, this.maxSizes.stickerImage)
                                            ]}
                                            source={{
                                                uri: this.props.message.sticker.url
                                            }}
                                        />
                                    )
                                }
                                {
                                    this.props.message.status !== this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED &&
                                    this.props.message.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_FILE &&
                                    [
                                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_UNKNOWN,
                                        // this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_IMAGE,
                                        // this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_AUDIO,
                                        // this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_VIDEO,
                                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_EXCEL,
                                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_WORD,
                                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_POWERPOINT,
                                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_PDF,
                                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_TEXT,
                                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_CODE,
                                        this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_ARCHIVE
                                    ].indexOf(this.props.message.file.type) > -1 && (
                                        <View
                                            style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_BLOCK_STYLE')}
                                        >
                                            <View
                                                style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_IMAGE_BLOCK_STYLE')}
                                            >
                                                <Image
                                                    style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_IMAGE_HOLDER_STYLE')}
                                                    source={this.coreInstances.CustomStyle.getImage('IMAGE_FILE')}
                                                />
                                            </View>
                                            <TouchableOpacity
                                                style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_DOWNLOAD_BLOCK_STYLE')}
                                                activeOpacity={0.5}
                                                onPress={() => { }}
                                            >
                                                <View
                                                    style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_DOWNLOAD_INFO_BLOCK_STYLE')}
                                                >
                                                    <Text
                                                        style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_DOWNLOAD_INFO_NAME_TEXT_STYLE')}
                                                    >
                                                        {this.props.message.file.name}
                                                    </Text>
                                                    <Text
                                                        style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_DOWNLOAD_INFO_SIZE_TEXT_STYLE')}
                                                    >
                                                        {this.coreInstances.FileConverter.sizeAsString(this.props.message.file.length, true)}
                                                    </Text>
                                                </View>
                                                <View
                                                    style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_DOWNLOAD_IMAGE_BLOCK_STYLE')}
                                                >
                                                    <Image
                                                        style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_DOWNLOAD_IMAGE_HOLDER_STYLE')}
                                                        source={this.coreInstances.CustomStyle.getImage('IMAGE_FILE')}
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                }
                                {
                                    this.props.message.status !== this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED &&
                                    this.props.message.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_FILE &&
                                    this.props.message.file.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_IMAGE && (
                                        <MessageImageBlockComponent
                                            getCoreInstances={this.props.getCoreInstances}
                                            imageFile={this.props.message.file}
                                        />
                                    )
                                }
                                {
                                    this.props.message.status !== this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED &&
                                    this.props.message.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_FILE &&
                                    this.props.message.file.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_AUDIO && (
                                        <MessageAudioBlockComponent
                                            getCoreInstances={this.props.getCoreInstances}
                                            audioFile={this.props.message.file}
                                        />
                                    )
                                }
                                {
                                    this.props.message.status !== this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED &&
                                    this.props.message.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_FILE &&
                                    this.props.message.file.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_VIDEO && (
                                        <MessageVideoBlockComponent
                                            getCoreInstances={this.props.getCoreInstances}
                                            videoFile={this.props.message.file}
                                        />
                                    )
                                }
                                {
                                    this.props.message.status !== this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED &&
                                    this.props.message.sender.userId === this.coreInstances.AZStackCore.authenticatedUser.userId && (
                                        <View
                                            style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_STATUS_BLOCK_STYLE')}
                                        >
                                            <MessageStatusBlockComponent
                                                getCoreInstances={this.props.getCoreInstances}
                                                textStyle={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_STATUS_TEXT_STYLE')}
                                                status={this.props.message.status}
                                            />
                                        </View>
                                    )
                                }
                                {
                                    this.props.message.sender.userId !== this.coreInstances.AZStackCore.authenticatedUser.userId &&
                                    this.props.message.status !== this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED &&
                                    this.state.showDetails && (
                                        <Text
                                            style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_DETAILS_STATUS_TEXT_STYLE')}
                                        >
                                            {this.getMessageStatusText(this.props.message.status)}
                                        </Text>
                                    )
                                }
                            </View>
                        </View>
                    )
                }
            </TouchableOpacity>
        );
    };
};

export default MessageBlockComponent;