import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    FlatList
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';
import ConnectionBlockComponent from './part/common/ConnectionBlockComponent';
import ChatAvatarBlockComponent from './part/common/ChatAvatarBlockComponent';
import GroupMemberBlockComponent from './part/group/GroupMemberBlockComponent';

class GroupComponent extends React.Component {
    constructor(props) {

        super(props);

        this.subscriptions = {};

        this.state = {
            group: null,
            members: this.props.members
        };

        this.onStartChatButtonPressed = this.onStartChatButtonPressed.bind(this);
        this.onEditNameButtonPressed = this.onEditNameButtonPressed.bind(this);
        this.onAddMemberButtonPressed = this.onAddMemberButtonPressed.bind(this);
        this.onLeaveGroupButtonPressed = this.onLeaveGroupButtonPressed.bind(this);
        this.onKickButtonPressed = this.onKickButtonPressed.bind(this);
    };

    addSubscriptions() {
        this.subscriptions.onConnected = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_CONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
        this.subscriptions.onAutoReconnected = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_AUTO_RECONNECTED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
        this.subscriptions.onReconnected = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_RECONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
        this.subscriptions.onMembersChanged = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_MEMBERS_CHANGED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.setState({ members: result });
        });
        this.subscriptions.onGroupInvited = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_GROUP_INVITED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onGroupInvited(result);
        });
        this.subscriptions.onGroupLeft = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_GROUP_LEFT, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onGroupLeft(result);
        });
        this.subscriptions.onGroupRenamed = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_GROUP_RENAMED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onGroupRenamed(result);
        });
        this.subscriptions.onGroupAdminChanged = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_GROUP_ADMIN_CHANGED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onGroupAdminChanged(result);
        });
        this.subscriptions.onGroupPublicJoined = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_GROUP_PUBLIC_JOINED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onGroupPublicJoined(result);
        });
    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

    getGroup() {
        if (!this.props.AZStackCore.slaveSocketConnected) {
            return;
        }
        this.props.AZStackCore.getDetailsGroup({
            groupId: this.props.groupId
        }).then((result) => {
            result.members.sort((a, b) => {
                if (a.userId === result.adminId) {
                    return -1;
                }
                if (b.userId === result.adminId) {
                    return 1;
                }
                if (a.userId === this.props.AZStackCore.authenticatedUser.userId) {
                    return -1;
                }
                if (b.userId === this.props.AZStackCore.authenticatedUser.userId) {
                    return 1;
                }
                return a.fullname > b.fullname ? 1 : -1;
            });
            this.setState({ group: result });
        }).catch((error) => { });
    };
    initRun() {
        this.state.group = null;
        this.getGroup();
    };

    onStartChatButtonPressed() {
        this.props.onStartChatButtonPressed({
            groupId: this.props.groupId
        });
    };
    onEditNameButtonPressed() { };
    onAddMemberButtonPressed() { };
    onLeaveGroupButtonPressed() { };
    onKickButtonPressed(event) { };

    onGroupInvited(newMessage) {
        if (newMessage.chatId !== this.props.groupId) {
            return;
        }

        let group = { ...newMessage.receiver };
        group.members.sort((a, b) => {
            if (a.userId === group.adminId) {
                return -1;
            }
            if (b.userId === group.adminId) {
                return 1;
            }
            if (a.userId === this.props.AZStackCore.authenticatedUser.userId) {
                return -1;
            }
            if (b.userId === this.props.AZStackCore.authenticatedUser.userId) {
                return 1;
            }
            return a.fullname > b.fullname ? 1 : -1;
        });
        this.setState({ group: group });
    };
    onGroupLeft(newMessage) {
        if (newMessage.chatId !== this.props.groupId) {
            return;
        }

        let group = { ...newMessage.receiver };
        group.members.sort((a, b) => {
            if (a.userId === group.adminId) {
                return -1;
            }
            if (b.userId === group.adminId) {
                return 1;
            }
            if (a.userId === this.props.AZStackCore.authenticatedUser.userId) {
                return -1;
            }
            if (b.userId === this.props.AZStackCore.authenticatedUser.userId) {
                return 1;
            }
            return a.fullname > b.fullname ? 1 : -1;
        });
        this.setState({ group: group });
    };
    onGroupRenamed(newMessage) {
        if (newMessage.chatId !== this.props.groupId) {
            return;
        }

        let group = { ...newMessage.receiver };
        group.members.sort((a, b) => {
            if (a.userId === group.adminId) {
                return -1;
            }
            if (b.userId === group.adminId) {
                return 1;
            }
            if (a.userId === this.props.AZStackCore.authenticatedUser.userId) {
                return -1;
            }
            if (b.userId === this.props.AZStackCore.authenticatedUser.userId) {
                return 1;
            }
            return a.fullname > b.fullname ? 1 : -1;
        });
        this.setState({ group: group });
    };
    onGroupAdminChanged(newMessage) {
        if (newMessage.chatId !== this.props.groupId) {
            return;
        }

        let group = { ...newMessage.receiver };
        group.members.sort((a, b) => {
            if (a.userId === group.adminId) {
                return -1;
            }
            if (b.userId === group.adminId) {
                return 1;
            }
            if (a.userId === this.props.AZStackCore.authenticatedUser.userId) {
                return -1;
            }
            if (b.userId === this.props.AZStackCore.authenticatedUser.userId) {
                return 1;
            }
            return a.fullname > b.fullname ? 1 : -1;
        });
        this.setState({ group: group });
    };
    onGroupPublicJoined(newMessage) {
        if (newMessage.chatId !== this.props.groupId) {
            return;
        }

        let group = { ...newMessage.receiver };
        group.members.sort((a, b) => {
            if (a.userId === group.adminId) {
                return -1;
            }
            if (b.userId === group.adminId) {
                return 1;
            }
            if (a.userId === this.props.AZStackCore.authenticatedUser.userId) {
                return -1;
            }
            if (b.userId === this.props.AZStackCore.authenticatedUser.userId) {
                return 1;
            }
            return a.fullname > b.fullname ? 1 : -1;
        });
        this.setState({ group: group });
    };

    componentDidMount() {
        this.addSubscriptions();
        this.initRun();
    };
    componentWillUnmount() {
        this.clearSubscriptions();
    };

    render() {
        return (
            <ScreenBlockComponent
                fullScreen={false}
                CustomStyle={this.props.CustomStyle}
                style={this.props.style}
            >
                {this.props.hidden !== 'hidden' && <ScreenHeaderBlockComponent
                    CustomStyle={this.props.CustomStyle}
                    onBackButtonPressed={this.props.onBackButtonPressed}
                    title={this.props.Language.getText('GROUP_HEADER_TITLE_TEXT')}
                />}
                <ScreenBodyBlockComponent
                    CustomStyle={this.props.CustomStyle}
                    style={this.props.contentContainerStyle}
                >
                    {
                        !this.state.group && <EmptyBlockComponent
                            CustomStyle={this.props.CustomStyle}
                            emptyText={this.props.Language.getText('GROUP_EMPTY_TEXT')}
                        />
                    }
                    {
                        !!this.state.group && (
                            <View
                                style={this.props.CustomStyle.getStyle('GROUP_BLOCK_STYLE')}
                            >
                                <View
                                    style={this.props.CustomStyle.getStyle('GROUP_AVATAR_BLOCK_STYLE')}
                                >
                                    <ChatAvatarBlockComponent
                                        CustomStyle={this.props.CustomStyle}
                                        chatType={this.props.AZStackCore.chatConstants.CHAT_TYPE_GROUP}
                                        chatTarget={this.state.group}
                                        textStyle={this.props.CustomStyle.getStyle('GROUP_AVATAR_TEXT_STYLE')}
                                    />
                                </View>
                                <Text
                                    style={this.props.CustomStyle.getStyle('GROUP_NAME_TEXT_STYLE')}
                                >
                                    {this.state.group.name}
                                </Text>
                                <Text
                                    style={this.props.CustomStyle.getStyle('GROUP_MEMBERS_TEXT_STYLE')}
                                >
                                    {`${this.state.group.members.length} `}
                                    {this.props.Language.getText(this.state.group.members.length > 1 ? 'GROUP_MEMBER_MANY_TEXT' : 'GROUP_MEMBER_TEXT')}
                                </Text>
                                <View
                                    style={this.props.CustomStyle.getStyle('GROUP_ACTION_BLOCK_STYLE')}
                                >
                                    <TouchableOpacity
                                        style={this.props.CustomStyle.getStyle('GROUP_ACTION_BUTTON_STYLE')}
                                        activeOpacity={0.5}
                                        onPress={this.onStartChatButtonPressed}
                                    >
                                        <Image
                                            style={this.props.CustomStyle.getStyle('GROUP_ACTION_BUTTON_IMAGE_STYLE')}
                                            source={this.props.CustomStyle.getImage('IMAGE_START_CHAT')}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={this.props.CustomStyle.getStyle('GROUP_ACTION_BUTTON_STYLE')}
                                        activeOpacity={0.5}
                                        onPress={this.onEditNameButtonPressed}
                                    >
                                        <Image
                                            style={this.props.CustomStyle.getStyle('GROUP_ACTION_BUTTON_IMAGE_STYLE')}
                                            source={this.props.CustomStyle.getImage('IMAGE_PENCIL')}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={this.props.CustomStyle.getStyle('GROUP_ACTION_BUTTON_STYLE')}
                                        activeOpacity={0.5}
                                        onPress={this.onAddMemberButtonPressed}
                                    >
                                        <Image
                                            style={this.props.CustomStyle.getStyle('GROUP_ACTION_BUTTON_IMAGE_STYLE')}
                                            source={this.props.CustomStyle.getImage('IMAGE_ADD_MEMBER')}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={this.props.CustomStyle.getStyle('GROUP_ACTION_BUTTON_STYLE')}
                                        activeOpacity={0.5}
                                        onPress={this.onLeaveGroupButtonPressed}
                                    >
                                        <Image
                                            style={this.props.CustomStyle.getStyle('GROUP_ACTION_BUTTON_IMAGE_STYLE')}
                                            source={this.props.CustomStyle.getImage('IMAGE_LEAVE')}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View
                                    style={this.props.CustomStyle.getStyle('GROUP_MEMBERS_BLOCK_STYLE')}
                                >
                                    {
                                        this.state.group.members.length === 0 && (
                                            <EmptyBlockComponent
                                                CustomStyle={this.props.CustomStyle}
                                                emptyText={this.props.Language.getText('GROUP_MEMBER_EMPTY_TEXT')}
                                            />
                                        )
                                    }
                                    {
                                        this.state.group.members.length > 0 && (
                                            <FlatList
                                                style={this.props.CustomStyle.getStyle('GROUP_MEMBERS_LIST_BLOCK_STYLE')}
                                                data={this.state.group.members}
                                                keyExtractor={(item, index) => ('group_member_' + item.userId)}
                                                renderItem={({ item }) => {
                                                    return (
                                                        <GroupMemberBlockComponent
                                                            Language={this.props.Language}
                                                            CustomStyle={this.props.CustomStyle}
                                                            AZStackCore={this.props.AZStackCore}
                                                            member={item}
                                                            adminId={this.state.group.adminId}
                                                            onMemberPressed={this.props.onMemberPressed}
                                                            onKickButtonPressed={this.onKickButtonPressed}
                                                        />
                                                    );
                                                }}
                                            />
                                        )
                                    }
                                </View>
                            </View>
                        )
                    }
                    <ConnectionBlockComponent
                        Language={this.props.Language}
                        CustomStyle={this.props.CustomStyle}
                        eventConstants={this.props.eventConstants}
                        AZStackCore={this.props.AZStackCore}
                        EventEmitter={this.props.EventEmitter}
                    />
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    };
};

export default GroupComponent;