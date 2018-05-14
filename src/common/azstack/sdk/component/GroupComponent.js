import React from 'react';
import {
    BackHandler,
    Alert,
    View,
    TouchableOpacity,
    Text,
    Image,
    FlatList,
    TextInput
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
            group: null,
            inGroup: false,
            editName: {
                show: false,
                newName: ''
            }
        };

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);

        this.onGroupNamePressed = this.onGroupNamePressed.bind(this);
        this.onAddMemberButtonPressed = this.onAddMemberButtonPressed.bind(this);
        this.onLeaveGroupButtonPressed = this.onLeaveGroupButtonPressed.bind(this);
        this.onJoinButtonPressed = this.onJoinButtonPressed.bind(this);
        this.onChangeAdminButtonPressed = this.onChangeAdminButtonPressed.bind(this);
        this.onKickMemberButtonPressed = this.onKickMemberButtonPressed.bind(this);

        this.onGroupNameInputTextChanged = this.onGroupNameInputTextChanged.bind(this);
        this.onGroupNameInputCancelButtonPressed = this.onGroupNameInputCancelButtonPressed.bind(this);
        this.onGroupNameInputDoneButtonPressed = this.onGroupNameInputDoneButtonPressed.bind(this);
    };

    onHardBackButtonPressed() {
        this.props.onBackButtonPressed();
        return true;
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
        this.subscriptions.onReconnected = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_RECONNECT_RETURN, ({ error, result }) => {
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

    isInGroup(me, members) {
        for (let i = 0; i < members.length; i++) {
            if (me.userId === members[i].userId) {
                return true;
            }
        }
        return false;
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
            this.setState({
                group: result,
                inGroup: this.isInGroup(this.coreInstances.AZStackCore.authenticatedUser, result.members)
            });
        }).catch((error) => { });
    };
    initRun() {
        this.state.group = null;
        this.getGroup();
    };

    onGroupNamePressed() {
        this.setState({ editName: Object.assign({}, this.state.editName, { show: true, newName: this.state.group.name }) }, () => {
            this.refs.NameInput.focus();
        });
    };
    onAddMemberButtonPressed() {
        this.props.showSelectMembers({
            headerTitle: this.coreInstances.Language.getText('GROUP_SELECT_NEW_MEMBERS_TEXT'),
            ignoreMembers: this.state.group.members.map((member) => {
                return member.userId
            }),
            onSelectDone: (event) => {
                Alert.alert(
                    this.coreInstances.Language.getText('ALERT_TITLE_CONFIRM_TEXT'),
                    `${this.coreInstances.Language.getText('GROUP_ACTION_INVITE_PART_1_TEXT')} ${event.selected.map((member) => { return member.fullname }).join(', ')}${this.coreInstances.Language.getText('GROUP_ACTION_INVITE_PART_2_TEXT')}`,
                    [
                        { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_CANCEL_TEXT'), onPress: () => { } },
                        {
                            text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => {
                                this.addMember(event.selected);
                            }
                        }
                    ],
                    { cancelable: true }
                );
            }
        });
    };
    onLeaveGroupButtonPressed() {
        if (this.state.group.adminId !== this.coreInstances.AZStackCore.authenticatedUser.userId) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_CONFIRM_TEXT'),
                `${this.coreInstances.Language.getText('GROUP_ACTION_LEAVE_PART_1_TEXT')}${this.coreInstances.Language.getText('GROUP_ACTION_LEAVE_PART_2_TEXT')}`,
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_CANCEL_TEXT'), onPress: () => { } },
                    {
                        text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => {
                            this.leaveGroup();
                        }
                    }
                ],
                { cancelable: true }
            );
            return;
        }
        this.props.showSelectMember({
            headerTitle: this.coreInstances.Language.getText('GROUP_SELECT_NEW_ADMIN_TEXT'),
            members: this.state.group.members.filter((member) => {
                return member.userId !== this.coreInstances.AZStackCore.authenticatedUser.userId
            }),
            onSelectDone: (event) => {
                Alert.alert(
                    this.coreInstances.Language.getText('ALERT_TITLE_CONFIRM_TEXT'),
                    `${this.coreInstances.Language.getText('GROUP_ACTION_LEAVE_AND_CHANGE_ADMIN_PART_1_TEXT')} ${event.selected.fullname}${this.coreInstances.Language.getText('GROUP_ACTION_LEAVE_AND_CHANGE_ADMIN_PART_2_TEXT')}`,
                    [
                        { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_CANCEL_TEXT'), onPress: () => { } },
                        {
                            text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => {
                                this.leaveAndChangeAdmin(event.selected);
                            }
                        }
                    ],
                    { cancelable: true }
                );
            }
        });
    };
    onJoinButtonPressed() {
        Alert.alert(
            this.coreInstances.Language.getText('ALERT_TITLE_CONFIRM_TEXT'),
            `${this.coreInstances.Language.getText('GROUP_ACTION_JOIN_PART_1_TEXT')}${this.coreInstances.Language.getText('GROUP_ACTION_JOIN_PART_2_TEXT')}`,
            [
                { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_CANCEL_TEXT'), onPress: () => { } },
                {
                    text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => {
                        this.joinGroup();
                    }
                }
            ],
            { cancelable: true }
        );
    };
    onChangeAdminButtonPressed(event) {
        Alert.alert(
            this.coreInstances.Language.getText('ALERT_TITLE_CONFIRM_TEXT'),
            `${this.coreInstances.Language.getText('GROUP_ACTION_CHANGE_ADMIN_PART_1_TEXT')} ${event.member.fullname}${this.coreInstances.Language.getText('GROUP_ACTION_CHANGE_ADMIN_PART_2_TEXT')}`,
            [
                { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_CANCEL_TEXT'), onPress: () => { } },
                {
                    text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => {
                        this.changeAdmin(event.member);
                    }
                }
            ],
            { cancelable: true }
        );
    };
    onKickMemberButtonPressed(event) {
        Alert.alert(
            this.coreInstances.Language.getText('ALERT_TITLE_CONFIRM_TEXT'),
            `${this.coreInstances.Language.getText('GROUP_ACTION_KICK_PART_1_TEXT')} ${event.member.fullname}${this.coreInstances.Language.getText('GROUP_ACTION_KICK_PART_2_TEXT')}`,
            [
                { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_CANCEL_TEXT'), onPress: () => { } },
                {
                    text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => {
                        this.kickMember(event.member);
                    }
                }
            ],
            { cancelable: true }
        );
    };

    onGroupNameInputTextChanged(newText) {
        this.setState({ editName: Object.assign({}, this.state.editName, { newName: newText }) });
    };
    onGroupNameInputCancelButtonPressed() {
        this.setState({ editName: Object.assign({}, this.state.editName, { show: false }) });
    };
    onGroupNameInputDoneButtonPressed() {

        if (!this.state.editName.newName) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('GROUP_NEW_NAME_EMPTY_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_CANCEL_TEXT'), onPress: () => { } },
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
            return;
        }

        if (this.state.editName.newName === this.state.group.name) {
            this.setState({ editName: Object.assign({}, this.state.editName, { show: false }) });
            return;
        }

        Alert.alert(
            this.coreInstances.Language.getText('ALERT_TITLE_CONFIRM_TEXT'),
            `${this.coreInstances.Language.getText('GROUP_ACTION_RENAME_PART_1_TEXT')} ${this.state.editName.newName}${this.coreInstances.Language.getText('GROUP_ACTION_RENAME_PART_2_TEXT')}`,
            [
                { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_CANCEL_TEXT'), onPress: () => { } },
                {
                    text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => {
                        this.setState({ editName: Object.assign({}, this.state.editName, { show: false }) });
                        this.renameGroup(this.state.editName.newName);
                    }
                }
            ],
            { cancelable: true }
        );
    };

    renameGroup(newGroupName) {
        if (!this.coreInstances.AZStackCore.slaveSocketConnected) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('GROUP_ACTION_RENAME_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
            return;
        }

        this.coreInstances.AZStackCore.renameGroup({
            groupId: this.props.groupId,
            newName: newGroupName
        }).then((result) => {

        }).catch((error) => {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('GROUP_ACTION_RENAME_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
        });
    };
    addMember(members) {
        if (!this.coreInstances.AZStackCore.slaveSocketConnected) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('GROUP_ACTION_INVITE_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
            return;
        }

        this.coreInstances.AZStackCore.inviteGroup({
            groupId: this.props.groupId,
            inviteIds: members.map((member) => { return member.userId })
        }).then((result) => {

        }).catch((error) => {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('GROUP_ACTION_INVITE_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
        });
    };
    leaveGroup() {
        if (!this.coreInstances.AZStackCore.slaveSocketConnected) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('GROUP_ACTION_LEAVE_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
            return;
        }

        this.coreInstances.AZStackCore.leaveGroup({
            groupId: this.props.groupId,
            leaveId: this.coreInstances.AZStackCore.authenticatedUser.userId
        }).then((result) => {

        }).catch((error) => {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('GROUP_ACTION_LEAVE_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
        });
    };
    leaveAndChangeAdmin(member) {
        if (!this.coreInstances.AZStackCore.slaveSocketConnected) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('GROUP_ACTION_LEAVE_AND_CHANGE_ADMIN_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
            return;
        }

        this.coreInstances.AZStackCore.leaveGroup({
            groupId: this.props.groupId,
            leaveId: this.coreInstances.AZStackCore.authenticatedUser.userId,
            newAdminId: member.userId
        }).then((result) => {

        }).catch((error) => {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('GROUP_ACTION_LEAVE_AND_CHANGE_ADMIN_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
        });
    };
    joinGroup() {
        if (!this.coreInstances.AZStackCore.slaveSocketConnected) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('GROUP_ACTION_JOIN_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
            return;
        }

        this.coreInstances.AZStackCore.joinPublicGroup({
            groupId: this.props.groupId
        }).then((result) => {

        }).catch((error) => {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('GROUP_ACTION_JOIN_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
        });
    };
    changeAdmin(member) {
        if (!this.coreInstances.AZStackCore.slaveSocketConnected) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('GROUP_ACTION_CHANGE_ADMIN_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
            return;
        }

        this.coreInstances.AZStackCore.changeAdminGroup({
            groupId: this.props.groupId,
            newAdminId: member.userId
        }).then((result) => {

        }).catch((error) => {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('GROUP_ACTION_CHANGE_ADMIN_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
        });
    };
    kickMember(member) {
        if (!this.coreInstances.AZStackCore.slaveSocketConnected) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('GROUP_ACTION_KICK_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
            return;
        }

        this.coreInstances.AZStackCore.leaveGroup({
            groupId: this.props.groupId,
            leaveId: member.userId
        }).then((result) => {

        }).catch((error) => {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('GROUP_ACTION_KICK_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
        });
    };

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
        this.setState({
            group: group,
            inGroup: this.isInGroup(this.coreInstances.AZStackCore.authenticatedUser, group.members)
        });
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
        this.setState({
            group: group,
            inGroup: this.isInGroup(this.coreInstances.AZStackCore.authenticatedUser, group.members)
        });
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
        this.setState({
            group: group,
            inGroup: this.isInGroup(this.coreInstances.AZStackCore.authenticatedUser, group.members)
        });
    };

    componentDidMount() {
        this.addSubscriptions();
        this.initRun();
        BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
    };
    componentWillUnmount() {
        this.clearSubscriptions();
        BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
    };

    render() {
        return (
            <ScreenBlockComponent
                fullScreen={false}
                withStatusbar={this.props.withStatusbar}
                getCoreInstances={this.props.getCoreInstances}
                style={this.props.style}
            >
                {
                    (this.props.withHeader || (this.props.withHeader === undefined && this.coreInstances.defaultLayout.withHeader)) && (
                        <ScreenHeaderBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            onBackButtonPressed={this.props.onBackButtonPressed}
                            title={this.coreInstances.Language.getText('GROUP_HEADER_TITLE_TEXT')}
                        />
                    )
                }
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
                                        style={this.coreInstances.CustomStyle.getStyle('GROUP_LEFT_BLOCK_STYLE')}
                                    >

                                        <ChatAvatarBlockComponent
                                            getCoreInstances={this.props.getCoreInstances}
                                            containerStyle={this.coreInstances.CustomStyle.getStyle('GROUP_AVATAR_BLOCK_STYLE')}
                                            chatType={this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_GROUP}
                                            chatTarget={this.state.group}
                                            textStyle={this.coreInstances.CustomStyle.getStyle('GROUP_AVATAR_TEXT_STYLE')}
                                        />
                                    </View>
                                    <View
                                        style={this.coreInstances.CustomStyle.getStyle('GROUP_RIGHT_BLOCK_STYLE')}
                                    >
                                        {
                                            !this.state.editName.show && (
                                                <TouchableOpacity
                                                    activeOpacity={0.5}
                                                    onPress={this.onGroupNamePressed}
                                                >
                                                    <Text
                                                        style={this.coreInstances.CustomStyle.getStyle('GROUP_NAME_TEXT_STYLE')}
                                                    >
                                                        {this.state.group.name}
                                                    </Text>
                                                </TouchableOpacity>
                                            )
                                        }
                                        {
                                            this.state.editName.show && (
                                                <View
                                                    style={this.coreInstances.CustomStyle.getStyle('GROUP_NAME_INPUT_BLOCK')}
                                                >
                                                    <TextInput
                                                        ref={'NameInput'}
                                                        style={this.coreInstances.CustomStyle.getStyle('GROUP_NAME_INPUT_STYLE')}
                                                        onChangeText={this.onGroupNameInputTextChanged}
                                                        value={this.state.editName.newName}
                                                        placeholder={this.coreInstances.Language.getText('GROUP_NEW_NAME_INPUT_PLACE_HOLDER_TEXT')}
                                                        returnKeyType='done'
                                                        {
                                                        ...this.coreInstances.CustomStyle.getStyle('GROUP_NAME_INPUT_PROPS_STYLE')
                                                        }
                                                    />
                                                    <TouchableOpacity
                                                        style={this.coreInstances.CustomStyle.getStyle('GROUP_NAME_INPUT_ACTION_BUTTON_BLOCK_STYLE')}
                                                        activeOpacity={0.5}
                                                        onPress={this.onGroupNameInputDoneButtonPressed}
                                                    >
                                                        <Image
                                                            style={this.coreInstances.CustomStyle.getStyle('GROUP_NAME_INPUT_ACTION_BUTTON_IMAGE_STYLE')}
                                                            source={this.coreInstances.CustomStyle.getImage('IMAGE_CHECK_MARK')}
                                                        />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={this.coreInstances.CustomStyle.getStyle('GROUP_NAME_INPUT_ACTION_BUTTON_BLOCK_STYLE')}
                                                        activeOpacity={0.5}
                                                        onPress={this.onGroupNameInputCancelButtonPressed}
                                                    >
                                                        <Text
                                                            style={this.coreInstances.CustomStyle.getStyle('GROUP_NAME_INPUT_ACTION_BUTTON_TEXT_STYLE')}
                                                        >×</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )
                                        }
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
                                    </View>
                                </View>
                                {
                                    this.state.inGroup && (
                                        <View
                                            style={this.coreInstances.CustomStyle.getStyle('GROUP_ACTION_BLOCK_STYLE')}
                                        >
                                            <TouchableOpacity
                                                style={[
                                                    this.coreInstances.CustomStyle.getStyle('GROUP_ACTION_BUTTON_HALF_STYLE'),
                                                    this.coreInstances.CustomStyle.getStyle('GROUP_ACTION_BUTTON_FIRST_HALF_STYLE')
                                                ]}
                                                activeOpacity={0.5}
                                                onPress={this.onAddMemberButtonPressed}
                                            >
                                                <Text
                                                    style={this.coreInstances.CustomStyle.getStyle('GROUP_ACTION_BUTTON_TEXT_STYLE')}
                                                >
                                                    {this.coreInstances.Language.getText('GROUP_ADD_MEMBERS_TEXT')}
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[
                                                    this.coreInstances.CustomStyle.getStyle('GROUP_ACTION_BUTTON_HALF_STYLE'),
                                                    this.coreInstances.CustomStyle.getStyle('GROUP_ACTION_BUTTON_SECOND_HALF_STYLE')
                                                ]}
                                                activeOpacity={0.5}
                                                onPress={this.onLeaveGroupButtonPressed}
                                            >
                                                <Text
                                                    style={this.coreInstances.CustomStyle.getStyle('GROUP_ACTION_BUTTON_TEXT_STYLE')}
                                                >
                                                    {this.coreInstances.Language.getText('GROUP_LEAVE_TEXT')}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                }
                                {
                                    !this.state.inGroup &&
                                    this.state.group.type === this.coreInstances.AZStackCore.groupConstants.GROUP_TYPE_PUBLIC && (
                                        <View
                                            style={this.coreInstances.CustomStyle.getStyle('GROUP_ACTION_BLOCK_STYLE')}
                                        >
                                            <TouchableOpacity
                                                style={this.coreInstances.CustomStyle.getStyle('GROUP_ACTION_BUTTON_STYLE')}
                                                activeOpacity={0.5}
                                                onPress={this.onJoinButtonPressed}
                                            >
                                                <Text
                                                    style={this.coreInstances.CustomStyle.getStyle('GROUP_ACTION_BUTTON_TEXT_STYLE')}
                                                >
                                                    {this.coreInstances.Language.getText('GROUP_JOIN_TEXT')}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                }
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