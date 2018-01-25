import React from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    Image
} from 'react-native';

import ChatAvatarBlockComponent from '../common/ChatAvatarBlockComponent';
import TimeFromNowBlockComponent from '../common/TimeFromNowBlockComponent';

class GroupMemberBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.onMemberPressed = this.onMemberPressed.bind(this);
        this.onKickButtonPressed = this.onKickButtonPressed.bind(this);
    };

    getNameSender(sender) {
        if (sender.userId === this.props.AZStackCore.authenticatedUser.userId) {
            return this.props.Language.getText('MESSAGE_SENDER_ME_TEXT');
        }
        return sender.fullname;
    };

    onMemberPressed() {
        this.props.onMemberPressed({
            member: this.props.member
        });
    };
    onKickButtonPressed() {
        this.props.onKickButtonPressed({
            member: this.props.member
        });
    };

    render() {
        return (
            <View
                style={this.props.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_BLOCK_STYLE')}
            >
                <TouchableOpacity
                    style={this.props.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_INFO_BLOCK_STYLE')}
                    activeOpacity={0.5}
                    onPress={this.onMemberPressed}
                >
                    <View
                        style={this.props.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_AVATAR_BLOCK_STYLE')}
                    >
                        <ChatAvatarBlockComponent
                            CustomStyle={this.props.CustomStyle}
                            chatType={this.props.AZStackCore.chatConstants.CHAT_TYPE_USER}
                            chatTarget={this.props.member}
                            textStyle={this.props.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_AVATAR_TEXT_STYLE')}
                        />
                    </View>
                    <View
                        style={this.props.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_TEXTS_BLOCK_STYLE')}
                    >
                        <Text
                            style={this.props.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_NAME_TEXT_STYLE')}
                        >
                            {this.getNameSender(this.props.member)}
                            {
                                this.props.adminId === this.props.member.userId && (
                                    <Text
                                        style={this.props.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_ADMIN_TEXT_STYLE')}
                                    >
                                        {` (${this.props.Language.getText('GROUP_ADMIN_TEXT')})`}
                                    </Text>
                                )
                            }
                        </Text>
                        {
                            this.props.member.status === this.props.AZStackCore.userConstants.USER_STATUS_ONLINE && (
                                <Text
                                    style={this.props.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_ONLINE_TEXT_STYLE')}
                                >
                                    {this.props.Language.getText('USER_ONLINE_TEXT')}
                                </Text>
                            )
                        }
                        {
                            this.props.member.status === this.props.AZStackCore.userConstants.USER_STATUS_NOT_ONLINE && (
                                <Text
                                    style={this.props.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_OFFLINE_TEXT_STYLE')}
                                >
                                    {`${this.props.Language.getText('USER_OFFLINE_TEXT')} `}
                                    <TimeFromNowBlockComponent
                                        Language={this.props.Language}
                                        CustomStyle={this.props.CustomStyle}
                                        textStyle={this.props.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_OFFLINE_TEXT_STYLE')}
                                        time={this.props.member.lastVisitDate * 1000}
                                    />
                                </Text>
                            )
                        }
                    </View>
                </TouchableOpacity>
                {
                    this.props.adminId === this.props.AZStackCore.authenticatedUser.userId &&
                    this.props.member.userId !== this.props.AZStackCore.authenticatedUser.userId && (
                        <TouchableOpacity
                            style={this.props.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_KICK_BUTTON_BLOCK_STYLE')}
                            activeOpacity={0.5}
                            onPress={this.onKickButtonPressed}
                        >
                            <Image
                                style={this.props.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_KICK_BUTTON_IMAGE_STYLE')}
                                source={this.props.CustomStyle.getImage('IMAGE_KICK_MEMBER')}
                            />
                        </TouchableOpacity>
                    )
                }
            </View>
        );
    };
};

export default GroupMemberBlockComponent;