import React from 'react';
import {
    TouchableOpacity,
    View,
    Text,
    Image
} from 'react-native';

import ChatAvatarBlockComponent from '../common/ChatAvatarBlockComponent';
import TimeFromNowBlockComponent from '../common/TimeFromNowBlockComponent';

class SelectMemberBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.onMemberPressed = this.onMemberPressed.bind(this);
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

    render() {
        return (
            <TouchableOpacity
                style={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBER_BLOCK_STYLE')}
                activeOpacity={0.5}
                onPress={this.onMemberPressed}
            >
                <ChatAvatarBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    containerStyle={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBER_AVATAR_BLOCK_STYLE')}
                    chatType={this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_USER}
                    chatTarget={this.props.member}
                    textStyle={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBER_AVATAR_TEXT_STYLE')}
                />
                <View
                    style={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBER_TEXTS_BLOCK_STYLE')}
                >
                    <Text
                        style={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBER_NAME_TEXT_STYLE')}
                    >
                        {this.getNameSender(this.props.member)}
                    </Text>
                    {
                        this.props.member.status === this.coreInstances.AZStackCore.userConstants.USER_STATUS_ONLINE && (
                            <Text
                                style={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBER_ONLINE_TEXT_STYLE')}
                            >
                                {this.coreInstances.Language.getText('USER_ONLINE_TEXT')}
                            </Text>
                        )
                    }
                    {
                        this.props.member.status === this.coreInstances.AZStackCore.userConstants.USER_STATUS_NOT_ONLINE && (
                            <Text
                                style={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBER_OFFLINE_TEXT_STYLE')}
                            >
                                {`${this.coreInstances.Language.getText('USER_OFFLINE_TEXT')} `}
                                <TimeFromNowBlockComponent
                                    getCoreInstances={this.props.getCoreInstances}
                                    textStyle={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBER_OFFLINE_TEXT_STYLE')}
                                    time={this.props.member.lastVisitDate * 1000}
                                />
                            </Text>
                        )
                    }
                </View>
                {
                    this.props.isSelected && (
                        <View
                            style={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBER_SELECTED_BLOCK_STYLE')}
                        >
                            <Image
                                style={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBER_SELECTED_IMAGE_STYLE')}
                                source={this.coreInstances.CustomStyle.getImage('IMAGE_CHECK_MARK')}
                            />
                        </View>
                    )
                }
            </TouchableOpacity>
        );
    };
};

export default SelectMemberBlockComponent;