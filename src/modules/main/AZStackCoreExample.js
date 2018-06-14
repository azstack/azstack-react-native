import React from 'react';
import {
    ScrollView,
    View,
    Text,
    TextInput,
    Button
} from 'react-native';
import {
    RTCView
} from 'react-native-webrtc';

import AZStackCore from '../../common/azstack/core/';

class AZStackCoreExample extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            authenticatedUser: null,
            calloutToPhoneNumber: '',
            freeCall: {
                localVideoUrl: null,
                remoteVideoUrl: null
            }
        };

        this.reconnect = this.reconnect.bind(this);
        this.disconnect = this.disconnect.bind(this);

        this.toggleAudioState = this.toggleAudioState.bind(this);
        this.toggleVideoState = this.toggleVideoState.bind(this);
        this.switchCameraType = this.switchCameraType.bind(this);

        this.startFreeCallVoice = this.startFreeCallVoice.bind(this);
        this.startFreeCallVideo = this.startFreeCallVideo.bind(this);
        this.stopFreeCall = this.stopFreeCall.bind(this);
        this.answerFreeCall = this.answerFreeCall.bind(this);
        this.rejectFreeCall = this.rejectFreeCall.bind(this);
        this.notAnswerFreeCall = this.notAnswerFreeCall.bind(this);

        this.startCallout = this.startCallout.bind(this);
        this.stopCallout = this.stopCallout.bind(this);

        this.answerCallin = this.answerCallin.bind(this);
        this.rejectCallin = this.rejectCallin.bind(this);
        this.notAnsweredCallin = this.notAnsweredCallin.bind(this);
        this.stopCallin = this.stopCallin.bind(this);

        this.getPaidCallLogs = this.getPaidCallLogs.bind(this);

        this.getModifiedConversations = this.getModifiedConversations.bind(this);

        this.deleteConversation = this.deleteConversation.bind(this);

        this.getUnreadMessagesTypeUser = this.getUnreadMessagesTypeUser.bind(this);
        this.getModifiedMessagesTypeUser = this.getModifiedMessagesTypeUser.bind(this);
        this.getUnreadMessagesTypeGroup = this.getUnreadMessagesTypeGroup.bind(this);
        this.getModifiedMessagesTypeGroup = this.getModifiedMessagesTypeGroup.bind(this);
        this.getModifiedFilesAll = this.getModifiedFilesAll.bind(this);
        this.getModifiedFilesOfUser = this.getModifiedFilesOfUser.bind(this);
        this.getModifiedFilesOfGroup = this.getModifiedFilesOfGroup.bind(this);

        this.newMessageWithUserTypeText = this.newMessageWithUserTypeText.bind(this);
        this.newMessageWithUserTypeSticker = this.newMessageWithUserTypeSticker.bind(this);
        this.newMessageWithUserTypeFile = this.newMessageWithUserTypeFile.bind(this);
        this.newMessageWithUserTypeLocation = this.newMessageWithUserTypeLocation.bind(this);
        this.newMessageWithGroupTypeText = this.newMessageWithGroupTypeText.bind(this);
        this.newMessageWithGroupTypeSticker = this.newMessageWithGroupTypeSticker.bind(this);
        this.newMessageWithGroupTypeFile = this.newMessageWithGroupTypeFile.bind(this);
        this.newMessageWithGroupTypeLocation = this.newMessageWithGroupTypeLocation.bind(this);

        this.changeMessageStatusDeliveredWithUser = this.changeMessageStatusDeliveredWithUser.bind(this);
        this.changeMessageStatusSeenWithUser = this.changeMessageStatusSeenWithUser.bind(this);
        this.changeMessageStatusCancelledWithUser = this.changeMessageStatusCancelledWithUser.bind(this);
        this.changeMessageStatusDeliveredWithGroup = this.changeMessageStatusDeliveredWithGroup.bind(this);
        this.changeMessageStatusSeenWithGroup = this.changeMessageStatusSeenWithGroup.bind(this);
        this.changeMessageStatusCancelledWithGroup = this.changeMessageStatusCancelledWithGroup.bind(this);

        this.deleteMessageWithUser = this.deleteMessageWithUser.bind(this);
        this.deleteMessageWithGroup = this.deleteMessageWithGroup.bind(this);

        this.sendTypingWithUser = this.sendTypingWithUser.bind(this);
        this.sendTypingWithGroup = this.sendTypingWithGroup.bind(this);

        this.getUsersInfomationWithId = this.getUsersInfomationWithId.bind(this);
        this.getUsersInfomationWithAzstackUserId = this.getUsersInfomationWithAzstackUserId.bind(this);

        this.createGroup = this.createGroup.bind(this);
        this.inviteGroup = this.inviteGroup.bind(this);
        this.kickGroup = this.kickGroup.bind(this);
        this.leaveGroup = this.leaveGroup.bind(this);
        this.renameGroup = this.renameGroup.bind(this);
        this.changeAdminGroup = this.changeAdminGroup.bind(this);
        this.leavePublicGroup = this.leavePublicGroup.bind(this);
        this.joinPublicGroup = this.joinPublicGroup.bind(this);

        this.getDetailsGroup = this.getDetailsGroup.bind(this);
        this.getListGroupsPrivate = this.getListGroupsPrivate.bind(this);
        this.getListGroupsPublic = this.getListGroupsPublic.bind(this);

        this.changeApplicationState = this.changeApplicationState.bind(this);

        this.notificationRegisterDevice = this.notificationRegisterDevice.bind(this);

        this.getDefaultStickersList = this.getDefaultStickersList.bind(this);
        this.getNotDefaultStickersList = this.getNotDefaultStickersList.bind(this);

        this.AZStackCore = new AZStackCore(this.props.azstackConfig);

        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_DISCONNECTED] = (error, result) => {
            this.setState({
                authenticatedUser: null
            });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_AUTO_RECONNECTED] = (error, result) => {
            if (error) {
                return;
            }
            this.setState({
                authenticatedUser: result
            });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_LOCAL_STREAM_ARRIVED] = (error, result) => {
            this.setState({
                freeCall: Object.assign({}, this.state.freeCall, { localVideoUrl: result.stream.toURL() })
            });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_REMOTE_STREAM_ARRIVED] = (error, result) => {
            this.setState({
                freeCall: Object.assign({}, this.state.freeCall, { remoteVideoUrl: result.stream.toURL() })
            });
        };
    };

    reconnect() {
        this.AZStackCore.reconnect({}).then((result) => {
            this.setState({ authenticatedUser: result });
        }).catch(() => { });
    };
    disconnect() {
        this.AZStackCore.disconnect({}).then(() => {
            this.setState({ authenticatedUser: null });
        }).catch(() => { });
    };

    toggleAudioState() {
        this.AZStackCore.toggleAudioState({}).then(() => { }).catch(() => { });
    };
    toggleVideoState() {
        this.AZStackCore.toggleVideoState({}).then(() => { }).catch(() => { });
    };
    switchCameraType() {
        this.AZStackCore.switchCameraType({}).then(() => { }).catch(() => { });
    };

    startFreeCallVoice() {
        this.AZStackCore.startFreeCall({
            mediaType: this.AZStackCore.callConstants.CALL_MEDIA_TYPE_AUDIO,
            toUserId: 387212
        }).then(() => { }).catch(() => { });
    };
    startFreeCallVideo() {
        this.AZStackCore.startFreeCall({
            mediaType: this.AZStackCore.callConstants.CALL_MEDIA_TYPE_VIDEO,
            toUserId: 387212
        }).then(() => { }).catch(() => { });
    };
    stopFreeCall() {
        this.AZStackCore.stopFreeCall({}).then(() => { }).catch(() => { });
    };
    answerFreeCall() {
        this.AZStackCore.answerFreeCall({}).then(() => { }).catch(() => { });
    };
    rejectFreeCall() {
        this.AZStackCore.rejectFreeCall({}).then(() => { }).catch(() => { });
    };
    notAnswerFreeCall() {
        this.AZStackCore.notAnswerFreeCall({}).then(() => { }).catch(() => { });
    };

    startCallout() {
        this.AZStackCore.startCallout({
            toPhoneNumber: this.state.calloutToPhoneNumber
        }).then(() => { }).catch(() => { });
    };
    stopCallout() {
        this.AZStackCore.stopCallout({}).then(() => { }).catch(() => { });
    };

    answerCallin() {
        this.AZStackCore.answerCallin({}).then(() => { }).catch(() => { });
    };
    rejectCallin() {
        this.AZStackCore.rejectCallin({}).then(() => { }).catch(() => { });
    };
    notAnsweredCallin() {
        this.AZStackCore.notAnsweredCallin({}).then(() => { }).catch(() => { });
    };
    stopCallin() {
        this.AZStackCore.stopCallin().then(() => { }).catch(() => { });
    };

    getPaidCallLogs() {
        this.AZStackCore.getPaidCallLogs({}).then(() => { }).catch(() => { });
    };

    getModifiedConversations() {
        this.AZStackCore.getModifiedConversations({
            page: 1,
            lastCreated: new Date().getTime()
        }).then(() => { }).catch(() => { });
    };

    deleteConversation() {
        this.AZStackCore.deleteConversation({
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_GROUP,
            chatId: 7433
        }).then(() => { }).catch(() => { });
    };

    getUnreadMessagesTypeUser() {
        this.AZStackCore.getUnreadMessages({
            page: 1,
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
            chatId: 387212
        }).then(() => { }).catch(() => { });
    };
    getModifiedMessagesTypeUser() {
        this.AZStackCore.getModifiedMessages({
            page: 1,
            lastCreated: new Date().getTime(),
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
            chatId: 387212
        }).then(() => { }).catch(() => { });
    };
    getUnreadMessagesTypeGroup() {
        this.AZStackCore.getUnreadMessages({
            page: 1,
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_GROUP,
            chatId: 7436
        }).then(() => { }).catch(() => { });
    };
    getModifiedMessagesTypeGroup() {
        this.AZStackCore.getModifiedMessages({
            page: 1,
            lastCreated: new Date().getTime(),
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_GROUP,
            chatId: 7436
        }).then(() => { }).catch(() => { });
    };
    getModifiedFilesAll() {
        this.AZStackCore.getModifiedFiles({
            lastCreated: new Date().getTime()
        }).then(() => { }).catch(() => { });
    };
    getModifiedFilesOfUser() {
        this.AZStackCore.getModifiedFiles({
            lastCreated: new Date().getTime(),
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
            chatId: 387212
        }).then(() => { }).catch(() => { });
    };
    getModifiedFilesOfGroup() {
        this.AZStackCore.getModifiedFiles({
            lastCreated: new Date().getTime(),
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_GROUP,
            chatId: 7436
        }).then(() => { }).catch(() => { });
    };

    newMessageWithUserTypeText() {
        this.AZStackCore.newMessage({
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
            chatId: 387212,
            text: 'text'
        }).then(() => { }).catch(() => { });
    };
    newMessageWithUserTypeSticker() {
        this.AZStackCore.newMessage({
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
            chatId: 387212,
            sticker: {
                name: '002.png',
                catId: 1,
                url: 'https://az1.azstack.com/sticker/1/002.png',
                width: 256,
                height: 256
            }
        }).then(() => { }).catch(() => { });
    };
    newMessageWithUserTypeFile() {
        this.AZStackCore.newMessage({
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
            chatId: 387212,
            file: {
                name: 'logo.png',
                length: 5183,
                type: this.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_IMAGE,
                url: 'https://azstack.com/static/images/logo.png',
                width: 171,
                height: 49
            }
        }).then(() => { }).catch(() => { });
    };
    newMessageWithUserTypeLocation() {
        this.AZStackCore.newMessage({
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
            chatId: 387212,
            location: {
                address: '2-1 Hoàng Đạo Thúy, Nhân Chính, Thanh Xuân, Hà Nội, Vietnam',
                longitude: 105.804364,
                latitude: 21.006021
            }
        }).then(() => { }).catch(() => { });
    };
    newMessageWithGroupTypeText() {
        this.AZStackCore.newMessage({
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_GROUP,
            chatId: 7436,
            text: 'text'
        }).then(() => { }).catch(() => { });
    };
    newMessageWithGroupTypeSticker() {
        this.AZStackCore.newMessage({
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_GROUP,
            chatId: 7436,
            sticker: {
                name: '002.png',
                catId: 1,
                url: 'https://az1.azstack.com/sticker/1/002.png',
                width: 256,
                height: 256
            }
        }).then(() => { }).catch(() => { });
    };
    newMessageWithGroupTypeFile() {
        this.AZStackCore.newMessage({
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_GROUP,
            chatId: 7436,
            file: {
                name: 'logo.png',
                length: 5183,
                type: this.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_IMAGE,
                url: 'https://azstack.com/static/images/logo.png',
                width: 171,
                height: 49
            }
        }).then(() => { }).catch(() => { });
    };
    newMessageWithGroupTypeLocation() {
        this.AZStackCore.newMessage({
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_GROUP,
            chatId: 7436,
            location: {
                address: '2-1 Hoàng Đạo Thúy, Nhân Chính, Thanh Xuân, Hà Nội, Vietnam',
                longitude: 105.804364,
                latitude: 21.006021
            }
        }).then(() => { }).catch(() => { });
    };

    changeMessageStatusDeliveredWithUser() {
        this.AZStackCore.changeMessageStatus({
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
            chatId: 387212,
            messageSenderId: 387212,
            messageStatus: this.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED,
            msgId: 1512639092
        }).then(() => { }).catch(() => { });
    };
    changeMessageStatusSeenWithUser() {
        this.AZStackCore.changeMessageStatus({
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
            chatId: 387212,
            messageSenderId: 387212,
            messageStatus: this.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN,
            msgId: 1512639092
        }).then(() => { }).catch(() => { });
    };
    changeMessageStatusCancelledWithUser() {
        this.AZStackCore.changeMessageStatus({
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
            chatId: 387212,
            messageSenderId: 381032,
            messageStatus: this.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED,
            msgId: 1512989141
        }).then(() => { }).catch(() => { });
    };
    changeMessageStatusDeliveredWithGroup() {
        this.AZStackCore.changeMessageStatus({
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_GROUP,
            chatId: 7436,
            messageSenderId: 387212,
            messageStatus: this.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED,
            msgId: 1513566057
        }).then(() => { }).catch(() => { });
    };
    changeMessageStatusSeenWithGroup() {
        this.AZStackCore.changeMessageStatus({
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_GROUP,
            chatId: 7436,
            messageSenderId: 387212,
            messageStatus: this.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN,
            msgId: 1513566057
        }).then(() => { }).catch(() => { });
    };
    changeMessageStatusCancelledWithGroup() {
        this.AZStackCore.changeMessageStatus({
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_GROUP,
            chatId: 7436,
            messageSenderId: 381032,
            messageStatus: this.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED,
            msgId: 1513584232
        }).then(() => { }).catch(() => { });
    };

    deleteMessageWithUser() {
        this.AZStackCore.deleteMessage({
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
            chatId: 387212,
            messageSenderId: 381032,
            msgId: 1512987550
        }).then(() => { }).catch(() => { });
    };
    deleteMessageWithGroup() {
        this.AZStackCore.deleteMessage({
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_GROUP,
            chatId: 7436,
            messageSenderId: 381032,
            msgId: 1513571274
        }).then(() => { }).catch(() => { });
    };

    sendTypingWithUser() {
        this.AZStackCore.sendTyping({
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
            chatId: 387212
        }).then(() => { }).catch(() => { });
    };
    sendTypingWithGroup() {
        this.AZStackCore.sendTyping({
            chatType: this.AZStackCore.chatConstants.CHAT_TYPE_GROUP,
            chatId: 7436
        }).then(() => { }).catch(() => { });
    };

    getUsersInfomationWithId() {
        this.AZStackCore.getUsersInformation({
            userIds: [387212]
        }).then(() => { }).catch(() => { });
    };
    getUsersInfomationWithAzstackUserId() {
        this.AZStackCore.getUsersInformation({
            azStackUserIds: ['test_user_2']
        }).then(() => { }).catch(() => { });
    };

    createGroup() {
        this.AZStackCore.createGroup({
            type: this.AZStackCore.groupConstants.GROUP_TYPE_PRIVATE,
            name: 'Test group',
            memberIds: [387212, 391658]
        }).then(() => { }).catch(() => { });
    };
    inviteGroup() {
        this.AZStackCore.inviteGroup({
            groupId: 7436,
            inviteIds: [387212]
        }).then(() => { }).catch(() => { });
    };
    kickGroup() {
        this.AZStackCore.leaveGroup({
            groupId: 7436,
            leaveId: 387212
        }).then(() => { }).catch(() => { });
    };
    leaveGroup() {
        this.AZStackCore.leaveGroup({
            groupId: 7436,
            leaveId: 381032,
            newAdminId: 387212
        }).then(() => { }).catch(() => { });
    };
    renameGroup() {
        this.AZStackCore.renameGroup({
            groupId: 7436,
            newName: 'Test group'
        }).then(() => { }).catch(() => { });
    };
    changeAdminGroup() {
        this.AZStackCore.changeAdminGroup({
            groupId: 7436,
            newAdminId: 387212
        }).then(() => { }).catch(() => { });
    };
    leavePublicGroup() {
        this.AZStackCore.leaveGroup({
            groupId: 7437,
            leaveId: 381032
        }).then(() => { }).catch(() => { });
    };
    joinPublicGroup() {
        this.AZStackCore.joinPublicGroup({
            groupId: 7437
        }).then(() => { }).catch(() => { });
    };

    getDetailsGroup() {
        this.AZStackCore.getDetailsGroup({
            groupId: 7436
        }).then(() => { }).catch(() => { });
    };
    getListGroupsPrivate() {
        this.AZStackCore.getListGroups({
            groupType: this.AZStackCore.groupConstants.GROUP_TYPE_PRIVATE
        }).then(() => { }).catch(() => { });
    };
    getListGroupsPublic() {
        this.AZStackCore.getListGroups({
            groupType: this.AZStackCore.groupConstants.GROUP_TYPE_PUBLIC
        }).then(() => { }).catch(() => { });
    };

    changeApplicationState() {
        this.AZStackCore.changeApplicationState({
            state: this.AZStackCore.applicationStateConstants.APPLICATION_STATE_FOREGROUND
        }).then(() => { }).catch(() => { });
    };

    notificationRegisterDevice() {
        this.AZStackCore.notificationRegisterDevice({
            deviceToken: 'this-is-device-token',
            devicePlatformOS: this.AZStackCore.platformConstants.PLATFORM_ANDROID,
            applicationBundleId: 'com.azstack_react_native_sdk'
        }).then(() => { }).catch(() => { });
    };

    getDefaultStickersList() {
        this.AZStackCore.getStickersList({
            isDefault: true
        }).then(() => { }).catch(() => { });
    };
    getNotDefaultStickersList() {
        this.AZStackCore.getStickersList({
            isDefault: false
        }).then(() => { }).catch(() => { });
    };

    componentDidMount() {
        this.AZStackCore.connect({}).then((result) => {
            this.setState({ authenticatedUser: result });
        }).catch((error) => { });
    };

    componentWillUnmount() {
        this.AZStackCore.disconnect({}).then(() => {
            this.setState({ authenticatedUser: null });
        }).catch(() => { });
    };

    render() {
        return (
            <ScrollView>
                <View>
                    <Text>
                        {this.state.authenticatedUser ? `Connected, user ${this.state.authenticatedUser.fullname}` : 'Connecting'}
                    </Text>
                    <Button onPress={this.reconnect} title='Reconnect' />
                    <Button onPress={this.disconnect} title='Disconnect' />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.toggleAudioState} title='Toggle Audio State' />
                    <Button onPress={this.toggleVideoState} title='Toggle Video State' />
                    <Button onPress={this.switchCameraType} title='Switch Camera Type' />
                    <Text>{'\n'}{'\n'}</Text>
                    <RTCView streamURL={this.state.freeCall.localVideoUrl} style={{ width: 200, height: 150 }} />
                    <RTCView streamURL={this.state.freeCall.remoteVideoUrl} style={{ width: 200, height: 150 }} />
                    <Button onPress={this.startFreeCallVoice} title='Start free call voice' />
                    <Button onPress={this.startFreeCallVideo} title='Start free call video' />
                    <Button onPress={this.stopFreeCall} title='Stop free call' />
                    <Button onPress={this.answerFreeCall} title='Answer free call' />
                    <Button onPress={this.rejectFreeCall} title='Reject free call' />
                    <Button onPress={this.notAnswerFreeCall} title='Not answer free call' />
                    <Text>{'\n'}{'\n'}</Text>
                    <TextInput
                        placeholder='Callout toPhoneNumber'
                        onChangeText={(text) => this.setState({ calloutToPhoneNumber: text })}
                    />
                    <Button onPress={this.startCallout} title='Start Callout' />
                    <Button onPress={this.stopCallout} title='Stop Callout' />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.answerCallin} title='Anwser Callin' />
                    <Button onPress={this.rejectCallin} title='Reject Callin' />
                    <Button onPress={this.notAnsweredCallin} title='Not answer Callin' />
                    <Button onPress={this.stopCallin} title='Stop Callin' />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.getPaidCallLogs} title='Get paid call logs' />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.getModifiedConversations} title='Get modified conversations' />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.deleteConversation} title='Delete conversation' />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.getUnreadMessagesTypeUser} title='Get unread messages type user' />
                    <Button onPress={this.getModifiedMessagesTypeUser} title='Get modified messages type user' />
                    <Button onPress={this.getUnreadMessagesTypeGroup} title='Get unread messages type group' />
                    <Button onPress={this.getModifiedMessagesTypeGroup} title='Get modified messages type group' />
                    <Button onPress={this.getModifiedFilesAll} title='Get modified files all' />
                    <Button onPress={this.getModifiedFilesOfUser} title='Get modified files of user' />
                    <Button onPress={this.getModifiedFilesOfGroup} title='Get modified files of group' />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.newMessageWithUserTypeText} title='New message with user type text' />
                    <Button onPress={this.newMessageWithUserTypeSticker} title='New message with user type sticker' />
                    <Button onPress={this.newMessageWithUserTypeFile} title='New message with user type file' />
                    <Button onPress={this.newMessageWithUserTypeLocation} title='New message with user type location' />
                    <Button onPress={this.newMessageWithGroupTypeText} title='New message with group type text' />
                    <Button onPress={this.newMessageWithGroupTypeSticker} title='New message with group type sticker' />
                    <Button onPress={this.newMessageWithGroupTypeFile} title='New message with group type file' />
                    <Button onPress={this.newMessageWithGroupTypeLocation} title='New message with group type location' />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.changeMessageStatusDeliveredWithUser} title='Change message status delivered with user' />
                    <Button onPress={this.changeMessageStatusSeenWithUser} title='Change message status seen with user' />
                    <Button onPress={this.changeMessageStatusCancelledWithUser} title='Change message status cancelled with user' />
                    <Button onPress={this.changeMessageStatusDeliveredWithGroup} title='Change message status delivered with group' />
                    <Button onPress={this.changeMessageStatusSeenWithGroup} title='Change message status seen with group' />
                    <Button onPress={this.changeMessageStatusCancelledWithGroup} title='Change message status cancelled with group' />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.deleteMessageWithUser} title='Delete message with user' />
                    <Button onPress={this.deleteMessageWithGroup} title='Delete message with group' />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.sendTypingWithUser} title='Send typing with user' />
                    <Button onPress={this.sendTypingWithGroup} title='Send typing with group' />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.getUsersInfomationWithId} title='Get users onformation with id' />
                    <Button onPress={this.getUsersInfomationWithAzstackUserId} title='Get users onformation with azStackUserId' />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.createGroup} title='Create group' />
                    <Button onPress={this.inviteGroup} title='Invite group' />
                    <Button onPress={this.kickGroup} title='Kick group' />
                    <Button onPress={this.leaveGroup} title='Leave group' />
                    <Button onPress={this.renameGroup} title='Rename group' />
                    <Button onPress={this.changeAdminGroup} title='Change admin group' />
                    <Button onPress={this.leavePublicGroup} title='Leave public group' />
                    <Button onPress={this.joinPublicGroup} title='Join public group' />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.getDetailsGroup} title='Get details group' />
                    <Button onPress={this.getListGroupsPrivate} title='Get list groups private' />
                    <Button onPress={this.getListGroupsPublic} title='Get list groups public' />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.changeApplicationState} title='Change application state' />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.notificationRegisterDevice} title='Notification register device' />
                    <Text>{'\n'}{'\n'}</Text>
                    <Button onPress={this.getDefaultStickersList} title='Get default stickers list' />
                    <Button onPress={this.getNotDefaultStickersList} title='Get not default stickers list' />
                    <Text>{'\n'}{'\n'}</Text>
                </View>
            </ScrollView>
        );
    };
};

export default AZStackCoreExample;