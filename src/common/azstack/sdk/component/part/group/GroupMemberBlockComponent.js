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

        this.coreInstances = props.getCoreInstances();

        this.onMemberPressed = this.onMemberPressed.bind(this);
        this.onChangeAdminButtonPressed = this.onChangeAdminButtonPressed.bind(this);
        this.onKickMemberButtonPressed = this.onKickMemberButtonPressed.bind(this);
    };

    getNameSender(sender) {
        if (sender.userId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
            return this.coreInstances.Language.getText('MESSAGE_SENDER_ME_TEXT');
        }
        return sender.fullname;
    };

    onMemberPressed() {
        this.props.onMemberPressed({
            member: this.props.member
        });
    };
    onChangeAdminButtonPressed() {
        this.props.onChangeAdminButtonPressed({
            member: this.props.member
        });
    };
    onKickMemberButtonPressed() {
        this.props.onKickMemberButtonPressed({
            member: this.props.member
        });
    };

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_BLOCK_STYLE')}
            >
                <TouchableOpacity
                    style={this.coreInstances.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_INFO_BLOCK_STYLE')}
                    activeOpacity={0.5}
                    onPress={this.onMemberPressed}
                >
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_AVATAR_BLOCK_STYLE')}
                    >
                        <ChatAvatarBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            chatType={this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_USER}
                            chatTarget={this.props.member}
                            textStyle={this.coreInstances.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_AVATAR_TEXT_STYLE')}
                        />
                    </View>
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_TEXTS_BLOCK_STYLE')}
                    >
                        <Text
                            style={this.coreInstances.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_NAME_TEXT_STYLE')}
                        >
                            {this.getNameSender(this.props.member)}
                            {
                                this.props.adminId === this.props.member.userId && (
                                    <Text
                                        style={this.coreInstances.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_ADMIN_TEXT_STYLE')}
                                    >
                                        {` (${this.coreInstances.Language.getText('GROUP_ADMIN_TEXT')})`}
                                    </Text>
                                )
                            }
                        </Text>
                        {
                            this.props.member.status === this.coreInstances.AZStackCore.userConstants.USER_STATUS_ONLINE && (
                                <Text
                                    style={this.coreInstances.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_ONLINE_TEXT_STYLE')}
                                >
                                    {this.coreInstances.Language.getText('USER_ONLINE_TEXT')}
                                </Text>
                            )
                        }
                        {
                            this.props.member.status === this.coreInstances.AZStackCore.userConstants.USER_STATUS_NOT_ONLINE && (
                                <Text
                                    style={this.coreInstances.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_OFFLINE_TEXT_STYLE')}
                                >
                                    {`${this.coreInstances.Language.getText('USER_OFFLINE_TEXT')} `}
                                    <TimeFromNowBlockComponent
                                        getCoreInstances={this.props.getCoreInstances}
                                        textStyle={this.coreInstances.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_OFFLINE_TEXT_STYLE')}
                                        time={this.props.member.lastVisitDate * 1000}
                                    />
                                </Text>
                            )
                        }
                    </View>
                </TouchableOpacity>
                {
                    this.props.adminId === this.coreInstances.AZStackCore.authenticatedUser.userId &&
                    this.props.member.userId !== this.coreInstances.AZStackCore.authenticatedUser.userId && (
                        <TouchableOpacity
                            style={this.coreInstances.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_CHANGE_ADMIN_BUTTON_BLOCK_STYLE')}
                            activeOpacity={0.5}
                            onPress={this.onChangeAdminButtonPressed}
                        >
                            <Image
                                style={this.coreInstances.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_CHANGE_ADMIN_BUTTON_IMAGE_STYLE')}
                                source={this.coreInstances.CustomStyle.getImage('IMAGE_CHANGE_ADMIN')}
                            />
                        </TouchableOpacity>
                    )
                }
                {
                    this.props.adminId === this.coreInstances.AZStackCore.authenticatedUser.userId &&
                    this.props.member.userId !== this.coreInstances.AZStackCore.authenticatedUser.userId && (
                        <TouchableOpacity
                            style={this.coreInstances.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_KICK_MEMBER_BUTTON_BLOCK_STYLE')}
                            activeOpacity={0.5}
                            onPress={this.onKickMemberButtonPressed}
                        >
                            <Image
                                style={this.coreInstances.CustomStyle.getStyle('GROUP_MEMBERS_LIST_MEMBER_KICK_MEMBER_BUTTON_IMAGE_STYLE')}
                                source={this.coreInstances.CustomStyle.getImage('IMAGE_KICK_MEMBER')}
                            />
                        </TouchableOpacity>
                    )
                }
            </View>
        );
    };
};

export default GroupMemberBlockComponent;