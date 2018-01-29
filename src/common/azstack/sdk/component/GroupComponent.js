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

        this.coreInstances = props.getCoreInstances();

        this.subscriptions = {};

        this.state = {
            group: null
        };

        this.onStartChatButtonPressed = this.onStartChatButtonPressed.bind(this);
        this.onEditNameButtonPressed = this.onEditNameButtonPressed.bind(this);
        this.onAddMemberButtonPressed = this.onAddMemberButtonPressed.bind(this);
        this.onLeaveGroupButtonPressed = this.onLeaveGroupButtonPressed.bind(this);
        this.onChangeAdminButtonPressed = this.onChangeAdminButtonPressed.bind(this);
        this.onKickMemberButtonPressed = this.onKickMemberButtonPressed.bind(this);
    };

    addSubscriptions() {
        this.subscriptions.onConnected = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_CONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
        this.subscriptions.onAutoReconnected = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_AUTO_RECONNECTED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
        this.subscriptions.onReconnected = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_RECONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
        this.subscriptions.onGroupInvited = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_GROUP_INVITED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onGroupInvited(result);
        });
        this.subscriptions.onGroupLeft = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_GROUP_LEFT, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onGroupLeft(result);
        });
        this.subscriptions.onGroupRenamed = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_GROUP_RENAMED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onGroupRenamed(result);
        });
        this.subscriptions.onGroupAdminChanged = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_GROUP_ADMIN_CHANGED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onGroupAdminChanged(result);
        });
        this.subscriptions.onGroupPublicJoined = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_GROUP_PUBLIC_JOINED, ({ error, result }) => {
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
        if (!this.coreInstances.AZStackCore.slaveSocketConnected) {
            return;
        }
        this.coreInstances.AZStackCore.getDetailsGroup({
            groupId: this.props.groupId
        }).then((result) => {
            result.members.sort((a, b) => {
                if (a.userId === result.adminId) {
                    return -1;
                }
                if (b.userId === result.adminId) {
                    return 1;
                }
                if (a.userId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
                    return -1;
                }
                if (b.userId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
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
    onAddMemberButtonPressed() {
        this.props.showSelectMembers({
            ignoreMembers: this.state.group.members.map((member) => {
                return member.userId
            }),
            onSelectDone: (event) => {
                console.log(event);
            }
        });
    };
    onLeaveGroupButtonPressed() {
        this.props.showSelectMember({
            ignoreMembers: [this.coreInstances.AZStackCore.authenticatedUser.userId],
            onSelectDone: (event) => {
                console.log(event);
            }
        });
    };
    onChangeAdminButtonPressed(event) { };
    onKickMemberButtonPressed(event) { };

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
            if (a.userId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
                return -1;
            }
            if (b.userId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
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
            if (a.userId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
                return -1;
            }
            if (b.userId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
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
            if (a.userId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
                return -1;
            }
            if (b.userId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
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
            if (a.userId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
                return -1;
            }
            if (b.userId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
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
            if (a.userId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
                return -1;
            }
            if (b.userId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
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
                getCoreInstances={this.props.getCoreInstances}
                statusbar={this.props.statusbar}
                style={this.props.style}
            >
                {this.props.hidden !== 'hidden' && <ScreenHeaderBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    onBackButtonPressed={this.props.onBackButtonPressed}
                    title={this.coreInstances.Language.getText('GROUP_HEADER_TITLE_TEXT')}
                />}
                <ScreenBodyBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    style={this.props.contentContainerStyle}
                >
                    {
                        !this.state.group && <EmptyBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            emptyText={this.coreInstances.Language.getText('GROUP_EMPTY_TEXT')}
                        />
                    }
                    {
                        !!this.state.group && (
                            <View
                                style={this.coreInstances.CustomStyle.getStyle('GROUP_BLOCK_STYLE')}
                            >
                                <View
                                    style={this.coreInstances.CustomStyle.getStyle('GROUP_INFO_BLOCK_STYLE')}
                                >
                                    <View
                                        style={this.coreInstances.CustomStyle.getStyle('GROUP_AVATAR_BLOCK_STYLE')}
                                    >
                                        <ChatAvatarBlockComponent
                                            getCoreInstances={this.props.getCoreInstances}
                                            chatType={this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_GROUP}
                                            chatTarget={this.state.group}
                                            textStyle={this.coreInstances.CustomStyle.getStyle('GROUP_AVATAR_TEXT_STYLE')}
                                        />
                                    </View>
                                    <View
                                        style={this.coreInstances.CustomStyle.getStyle('GROUP_DETAILS_BLOCK_STYLE')}
                                    >
                                        <Text
                                            style={this.coreInstances.CustomStyle.getStyle('GROUP_NAME_TEXT_STYLE')}
                                        >
                                            {this.state.group.name}
                                        </Text>
                                        <Text
                                            style={this.coreInstances.CustomStyle.getStyle('GROUP_TYPE_TEXT_STYLE')}
                                        >
                                            {this.coreInstances.Language.getText(this.state.group.type === this.coreInstances.AZStackCore.groupConstants.GROUP_TYPE_PRIVATE ? 'GROUP_TYPE_PRIVATE' : 'GROUP_TYPE_PUBLIC')}
                                        </Text>
                                        <Text
                                            style={this.coreInstances.CustomStyle.getStyle('GROUP_MEMBERS_TEXT_STYLE')}
                                        >
                                            {`${this.state.group.members.length} `}
                                            {this.coreInstances.Language.getText(this.state.group.members.length > 1 ? 'GROUP_MEMBER_MANY_TEXT' : 'GROUP_MEMBER_TEXT')}
                                        </Text>
                                        <View
                                            style={this.coreInstances.CustomStyle.getStyle('GROUP_ACTION_BLOCK_STYLE')}
                                        >
                                            <TouchableOpacity
                                                style={this.coreInstances.CustomStyle.getStyle('GROUP_ACTION_BUTTON_STYLE')}
                                                activeOpacity={0.5}
                                                onPress={this.onStartChatButtonPressed}
                                            >
                                                <Image
                                                    style={this.coreInstances.CustomStyle.getStyle('GROUP_ACTION_BUTTON_IMAGE_STYLE')}
                                                    source={this.coreInstances.CustomStyle.getImage('IMAGE_START_CHAT')}
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={this.coreInstances.CustomStyle.getStyle('GROUP_ACTION_BUTTON_STYLE')}
                                                activeOpacity={0.5}
                                                onPress={this.onEditNameButtonPressed}
                                            >
                                                <Image
                                                    style={this.coreInstances.CustomStyle.getStyle('GROUP_ACTION_BUTTON_IMAGE_STYLE')}
                                                    source={this.coreInstances.CustomStyle.getImage('IMAGE_PENCIL')}
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={this.coreInstances.CustomStyle.getStyle('GROUP_ACTION_BUTTON_STYLE')}
                                                activeOpacity={0.5}
                                                onPress={this.onAddMemberButtonPressed}
                                            >
                                                <Image
                                                    style={this.coreInstances.CustomStyle.getStyle('GROUP_ACTION_BUTTON_IMAGE_STYLE')}
                                                    source={this.coreInstances.CustomStyle.getImage('IMAGE_ADD_MEMBER')}
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={this.coreInstances.CustomStyle.getStyle('GROUP_ACTION_BUTTON_STYLE')}
                                                activeOpacity={0.5}
                                                onPress={this.onLeaveGroupButtonPressed}
                                            >
                                                <Image
                                                    style={this.coreInstances.CustomStyle.getStyle('GROUP_ACTION_BUTTON_IMAGE_STYLE')}
                                                    source={this.coreInstances.CustomStyle.getImage('IMAGE_LEAVE')}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                                <View
                                    style={this.coreInstances.CustomStyle.getStyle('GROUP_MEMBERS_BLOCK_STYLE')}
                                >
                                    {
                                        this.state.group.members.length === 0 && (
                                            <EmptyBlockComponent
                                                getCoreInstances={this.props.getCoreInstances}
                                                emptyText={this.coreInstances.Language.getText('GROUP_MEMBER_EMPTY_TEXT')}
                                            />
                                        )
                                    }
                                    {
                                        this.state.group.members.length > 0 && (
                                            <FlatList
                                                style={this.coreInstances.CustomStyle.getStyle('GROUP_MEMBERS_LIST_BLOCK_STYLE')}
                                                data={this.state.group.members}
                                                keyExtractor={(item, index) => ('group_member_' + item.userId)}
                                                renderItem={({ item }) => {
                                                    return (
                                                        <GroupMemberBlockComponent
                                                            getCoreInstances={this.props.getCoreInstances}
                                                            member={item}
                                                            adminId={this.state.group.adminId}
                                                            onMemberPressed={this.props.onMemberPressed}
                                                            onChangeAdminButtonPressed={this.onChangeAdminButtonPressed}
                                                            onKickMemberButtonPressed={this.onKickMemberButtonPressed}
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
                        getCoreInstances={this.props.getCoreInstances}
                    />
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    };
};

export default GroupComponent;