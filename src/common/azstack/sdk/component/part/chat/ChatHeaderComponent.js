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
    };

    isTargetOnline() {
        if (this.props.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_USER) {
            return this.props.chatTarget.status === this.props.AZStackCore.userConstants.USER_STATUS_ONLINE;
        }
        let aUserOnline = false;
        for (let i = 0; i < this.props.chatTarget.members.length; i++) {
            if (this.props.chatTarget.members[i].userId !== this.props.AZStackCore.authenticatedUser.userId && this.props.chatTarget.members[i].status === this.props.AZStackCore.userConstants.USER_STATUS_ONLINE) {
                aUserOnline = true;
                break;
            }
        }
        return aUserOnline;
    };

    render() {
        return (
            <View
                style={this.props.CustomStyle.getStyle('CHAT_HEADER_BLOCK_STYLE')}
            >
                <View
                    style={this.props.CustomStyle.getStyle('CHAT_HEADER_BACK_BUTTON_STYLE')}
                >
                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={this.props.onBackButtonPressed}
                    >
                        <Image
                            style={this.props.CustomStyle.getStyle('CHAT_HEADER_BACK_BUTTON_IMAGE_STYLE')}
                            source={this.props.CustomStyle.getImage('IMAGE_BACK')}
                        />
                    </TouchableOpacity>
                </View>
                <View
                    style={this.props.CustomStyle.getStyle('CHAT_HEADER_INFO_BLOCK_STYLE')}
                >
                    <View
                        style={this.props.CustomStyle.getStyle('CHAT_HEADER_AVATAR_BLOCK_STYLE')}
                    >
                        <ChatAvatarBlockComponent
                            CustomStyle={this.props.CustomStyle}
                            chatType={this.props.chatType}
                            chatTarget={this.props.chatTarget}
                            textStyle={this.props.CustomStyle.getStyle('CHAT_HEADER_AVATAR_TEXT_STYLE')}
                        />
                    </View>
                    <View
                        style={this.props.CustomStyle.getStyle('CHAT_HEADER_TEXT_BLOCK_STYLE')}
                    >
                        <Text
                            style={this.props.CustomStyle.getStyle('CHAT_HEADER_NAME_TEXT_STYLE')}
                        >
                            {this.props.chatTarget.fullname ? this.props.chatTarget.fullname : this.props.chatTarget.name}
                        </Text>
                        {
                            this.props.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_USER &&
                            this.isTargetOnline() && (
                                <Text
                                    style={this.props.CustomStyle.getStyle('CHAT_HEADER_ONLINE_TEXT_STYLE')}
                                >
                                    {this.props.Language.getText('USER_ONLINE_TEXT')}
                                </Text>
                            )
                        }
                        {
                            this.props.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_USER &&
                            !this.isTargetOnline() && (
                                <Text
                                    style={this.props.CustomStyle.getStyle('CHAT_HEADER_OFFLINE_TEXT_STYLE')}
                                >
                                    {`${this.props.Language.getText('USER_OFFLINE_TEXT')} `}
                                    <TimeFromNowBlockComponent
                                        Language={this.props.Language}
                                        CustomStyle={this.props.CustomStyle}
                                        textStyle={this.props.CustomStyle.getStyle('CHAT_HEADER_OFFLINE_TEXT_STYLE')}
                                        time={this.props.chatTarget.lastVisitDate * 1000}
                                    />
                                </Text>
                            )
                        }
                        {
                            this.props.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_GROUP && (
                                <Text
                                    style={this.props.CustomStyle.getStyle('CHAT_HEADER_MEMBERS_TEXT_STYLE')}
                                >
                                    {`${this.props.chatTarget.members.length} `}
                                    {this.props.Language.getText(this.props.chatTarget.members.length > 1 ? 'GROUP_MEMBER_MANY_TEXT' : 'GROUP_MEMBER_TEXT')}
                                </Text>
                            )
                        }
                    </View>
                </View>
            </View>
        );
    };
};

export default ChatHeaderComponent;