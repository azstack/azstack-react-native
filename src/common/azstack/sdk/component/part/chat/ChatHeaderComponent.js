import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image
} from 'react-native';

import ChatAvatarBlockComponent from '../common/ChatAvatarBlockComponent';
import TimeFromNowBlockComponent from '../common/TimeFromNowBlockComponent';

class ChatHeaderComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.onBackButtonPressed = this.onBackButtonPressed.bind(this);
        this.onChatTargetPressed = this.onChatTargetPressed.bind(this);
        this.onVoiceCallButtonPressed = this.onVoiceCallButtonPressed.bind(this);
        this.onVideoCallButtonPressed = this.onVideoCallButtonPressed.bind(this);
    };

    isTargetOnline() {
        if (this.props.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_USER) {
            return this.props.chatTarget.status === this.coreInstances.AZStackCore.userConstants.USER_STATUS_ONLINE;
        }
        let aUserOnline = false;
        for (let i = 0; i < this.props.chatTarget.members.length; i++) {
            if (this.props.chatTarget.members[i].userId !== this.coreInstances.AZStackCore.authenticatedUser.userId && this.props.chatTarget.members[i].status === this.coreInstances.AZStackCore.userConstants.USER_STATUS_ONLINE) {
                aUserOnline = true;
                break;
            }
        }
        return aUserOnline;
    };

    onBackButtonPressed() {
        this.props.onBackButtonPressed();
    };
    onChatTargetPressed() {
        this.props.onChatTargetPressed({
            chatType: this.props.chatType,
            chatTarget: this.props.chatTarget
        });
    };
    onVoiceCallButtonPressed() {
        this.props.onVoiceCallButtonPressed({
            userId: this.props.chatTarget.userId,
            fullname: this.props.chatTarget.fullname
        });
    };
    onVideoCallButtonPressed() {
        this.props.onVideoCallButtonPressed({
            userId: this.props.chatTarget.userId
        });
    };

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('CHAT_HEADER_BLOCK_STYLE')}
            >
                <TouchableOpacity
                    style={this.coreInstances.CustomStyle.getStyle('CHAT_HEADER_BACK_BUTTON_STYLE')}
                    activeOpacity={0.5}
                    onPress={this.onBackButtonPressed}
                >
                    <Image
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_HEADER_BACK_BUTTON_IMAGE_STYLE')}
                        source={this.coreInstances.CustomStyle.getImage('IMAGE_BACK')}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={this.coreInstances.CustomStyle.getStyle('CHAT_HEADER_INFO_BLOCK_STYLE')}
                    activeOpacity={0.5}
                    onPress={this.onChatTargetPressed}
                >
                    <ChatAvatarBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                        containerStyle={this.coreInstances.CustomStyle.getStyle('CHAT_HEADER_AVATAR_BLOCK_STYLE')}
                        chatType={this.props.chatType}
                        chatTarget={this.props.chatTarget}
                        textStyle={this.coreInstances.CustomStyle.getStyle('CHAT_HEADER_AVATAR_TEXT_STYLE')}
                    />
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_HEADER_TEXT_BLOCK_STYLE')}
                    >
                        <Text
                            style={this.coreInstances.CustomStyle.getStyle('CHAT_HEADER_NAME_TEXT_STYLE')}
                        >
                            {this.props.chatTarget.fullname ? this.props.chatTarget.fullname : this.props.chatTarget.name}
                        </Text>
                        {
                            this.props.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_USER &&
                            this.isTargetOnline() && (
                                <Text
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_HEADER_ONLINE_TEXT_STYLE')}
                                >
                                    {this.coreInstances.Language.getText('USER_ONLINE_TEXT')}
                                </Text>
                            )
                        }
                        {
                            this.props.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_USER &&
                            !this.isTargetOnline() && (
                                <Text
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_HEADER_OFFLINE_TEXT_STYLE')}
                                >
                                    {`${this.coreInstances.Language.getText('USER_OFFLINE_TEXT')} `}
                                    <TimeFromNowBlockComponent
                                        getCoreInstances={this.props.getCoreInstances}
                                        textStyle={this.coreInstances.CustomStyle.getStyle('CHAT_HEADER_OFFLINE_TEXT_STYLE')}
                                        time={this.props.chatTarget.lastVisitDate * 1000}
                                    />
                                </Text>
                            )
                        }
                        {
                            this.props.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_GROUP && (
                                <Text
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_HEADER_MEMBERS_TEXT_STYLE')}
                                >
                                    {`${this.props.chatTarget.members.length} `}
                                    {this.coreInstances.Language.getText(this.props.chatTarget.members.length > 1 ? 'GROUP_MEMBER_MANY_TEXT' : 'GROUP_MEMBER_TEXT')}
                                </Text>
                            )
                        }
                    </View>
                </TouchableOpacity>
                {
                    this.props.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_USER && (
                        <TouchableOpacity
                            style={this.coreInstances.CustomStyle.getStyle('CHAT_HEADER_ACTION_BUTTON_STYLE')}
                            activeOpacity={0.5}
                            onPress={this.onVoiceCallButtonPressed}
                        >
                            <Image
                                style={this.coreInstances.CustomStyle.getStyle('CHAT_HEADER_ACTION_BUTTON_IMAGE_STYLE')}
                                source={this.coreInstances.CustomStyle.getImage('IMAGE_VOICE_CALL')}
                            />
                        </TouchableOpacity>
                    )
                }
                {
                    this.props.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_USER && (
                        <TouchableOpacity
                            style={this.coreInstances.CustomStyle.getStyle('CHAT_HEADER_ACTION_BUTTON_STYLE')}
                            activeOpacity={0.5}
                            onPress={this.onVideoCallButtonPressed}
                        >
                            <Image
                                style={this.coreInstances.CustomStyle.getStyle('CHAT_HEADER_ACTION_BUTTON_IMAGE_STYLE')}
                                source={this.coreInstances.CustomStyle.getImage('IMAGE_VIDEO_CALL')}
                            />
                        </TouchableOpacity>
                    )
                }
            </View>
        );
    };
};

export default ChatHeaderComponent;