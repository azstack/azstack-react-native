import React from 'react';
import {
    BackHandler,
    Alert,
    View,
    TextInput,
    Image,
    TouchableOpacity
} from 'react-native';

import ChatInputStickerBlockComponent from './ChatInputStickerBlockComponent';
import ChatInputFileBlockComponent from './ChatInputFileBlockComponent';

class ChatInputComponentBlock extends React.Component {
    constructor(props) {

        super(props);

        this.coreInstances = props.getCoreInstances();

        this.subscriptions = {};

        this.state = {
            text: {
                focused: false,
                val: ''
            },
            sticker: {
                showed: false
            },
            file: {
                showed: false
            }
        };

        this.sendingMessageFailChecks = {};

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);

        this.onTextInputChanged = this.onTextInputChanged.bind(this);
        this.onTextInputFocused = this.onTextInputFocused.bind(this);
        this.onTextInputBlured = this.onTextInputBlured.bind(this);

        this.showStickerBox = this.showStickerBox.bind(this);
        this.closeStickerBox = this.closeStickerBox.bind(this);

        this.closeFileBox = this.closeFileBox.bind(this);
        this.showFileBox = this.showFileBox.bind(this);

        this.sendTextMessage = this.sendTextMessage.bind(this);
        this.sendStickerMessage = this.sendStickerMessage.bind(this);
        this.sendFileMessages = this.sendFileMessages.bind(this);
    };

    onHardBackButtonPressed() {
        if (this.state.sticker.showed) {
            this.closeStickerBox();
            return true;
        }
        if (this.state.file.showed) {
            this.closeFileBox();
            return true;
        }
        return false;
    };

    addSubscriptions() {
        this.subscriptions.onMessageStatusChanged = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_MESSAGE_STATUS_CHANGED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onMessageStatusChanged(result);
        });
        this.subscriptions.onNewMessageReturn = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onNewMessageReturn(result);
        });
    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

    onMessageStatusChanged(myMessage) {
        if (myMessage.chatType !== this.props.chatType || myMessage.chatId !== this.props.chatId) {
            return;
        }

        if (this.sendingMessageFailChecks[myMessage.msgId]) {
            clearTimeout(this.sendingMessageFailChecks[myMessage.msgId]);
            delete this.sendingMessageFailChecks[myMessage.msgId];
        }
    };
    onNewMessageReturn(newStatus) {
        if (newStatus.chatType !== this.props.chatType || newStatus.chatId !== this.props.chatId) {
            return;
        }

        if (this.sendingMessageFailChecks[newStatus.msgId]) {
            clearTimeout(this.sendingMessageFailChecks[newStatus.msgId]);
            delete this.sendingMessageFailChecks[newStatus.msgId];
        }
    };

    onTextInputChanged(newText) {
        this.setState({ text: Object.assign({}, this.state.text, { val: newText }) });
    };
    onTextInputFocused() {
        if (this.state.sticker.showed) {
            this.setState({ sticker: Object.assign({}, this.state.sticker, { showed: false }) });
        }
        if (this.state.file.showed) {
            this.setState({ file: Object.assign({}, this.state.file, { showed: false }) });
        }
        this.setState({ text: Object.assign({}, this.state.text, { focused: true }) });
    };
    onTextInputBlured() {
        this.setState({ text: Object.assign({}, this.state.text, { focused: false }) });
    };

    showStickerBox() {
        if (this.state.sticker.showed) {
            return;
        }

        if (this.state.text.focused) {
            this.refs.TextInput.blur();
        }

        if (this.state.file.showed) {
            this.setState({ file: Object.assign({}, this.state.file, { showed: false }) });
        }

        this.setState({ sticker: Object.assign({}, this.state.sticker, { showed: true }) });
    };
    closeStickerBox() {
        this.setState({ sticker: Object.assign({}, this.state.sticker, { showed: false }) });
    };

    showFileBox() {
        if (this.state.file.showed) {
            return;
        }

        if (this.state.text.focused) {
            this.refs.TextInput.blur();
        }

        if (this.state.sticker.showed) {
            this.setState({ sticker: Object.assign({}, this.state.sticker, { showed: false }) });
        }

        this.setState({ file: Object.assign({}, this.state.file, { showed: true }) });
    };
    closeFileBox() {
        this.setState({ file: Object.assign({}, this.state.file, { showed: false }) });
    };

    sendTextMessage() {

        if (!this.coreInstances.AZStackCore.slaveSocketConnected) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('CHAT_INPUT_SEND_MESSAGE_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
            return;
        }

        if (!this.state.text.val) {
            return;
        }

        let currentTime = new Date().getTime();
        this.coreInstances.AZStackCore.newUniqueId();
        let textMessage = {
            chatType: this.props.chatType,
            chatId: this.props.chatId,
            senderId: this.coreInstances.AZStackCore.authenticatedUser.userId,
            sender: this.coreInstances.AZStackCore.authenticatedUser,
            receiverId: this.props.chatId,
            receiver: this.props.chatTarget,
            msgId: this.coreInstances.AZStackCore.uniqueId,
            type: this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT,
            status: this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_SENDING,
            deleted: this.coreInstances.AZStackCore.chatConstants.MESSAGE_DELETED_FALSE,
            created: currentTime,
            modified: currentTime,
            text: this.state.text.val
        };
        this.setState({ text: Object.assign({}, this.state.text, { val: '' }) });
        this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...textMessage } });

        this.sendingMessageFailChecks[textMessage.msgId] = setTimeout(() => {
            textMessage.status = -1;
            this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...textMessage } });
            delete this.sendingMessageFailChecks[textMessage.msgId];
        }, 5000);

        this.coreInstances.AZStackCore.newMessage({
            chatType: this.props.chatType,
            chatId: this.props.chatId,
            msgId: textMessage.msgId,
            text: textMessage.text
        }).then((result) => { }).catch((error) => { });
    };
    sendStickerMessage(stickerMessage) {
        this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...stickerMessage } });

        this.sendingMessageFailChecks[stickerMessage.msgId] = setTimeout(() => {
            stickerMessage.status = -1;
            this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...stickerMessage } });
            delete this.sendingMessageFailChecks[stickerMessage.msgId];
        }, 5000);

        this.coreInstances.AZStackCore.newMessage({
            chatType: this.props.chatType,
            chatId: this.props.chatId,
            msgId: stickerMessage.msgId,
            sticker: {
                name: stickerMessage.sticker.name,
                catId: stickerMessage.sticker.catId,
                url: stickerMessage.sticker.url,
                width: stickerMessage.sticker.width,
                height: stickerMessage.sticker.height
            }
        }).then((result) => { }).catch((error) => { });
    };
    sendFileMessages(fileMessages) {
        fileMessages.map((fileMessage) => {
            if (fileMessage.status === -1) {
                this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...fileMessage } });
                return;
            }

            this.sendingMessageFailChecks[fileMessage.msgId] = setTimeout(() => {
                fileMessage.status = -1;
                this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...fileMessage } });
                delete this.sendingMessageFailChecks[fileMessage.msgId];
            }, 5000);

            this.coreInstances.AZStackCore.newMessage({
                chatType: this.props.chatType,
                chatId: this.props.chatId,
                msgId: fileMessage.msgId,
                file: {
                    name: fileMessage.file.name,
                    length: fileMessage.file.length,
                    type: fileMessage.file.type,
                    url: fileMessage.file.url,
                    width: fileMessage.file.width,
                    height: fileMessage.file.height
                }
            }).then((result) => { }).catch((error) => { });
        });
    };

    onInputContentChangeSize(e) {
    };

    componentDidMount() {
        this.addSubscriptions();
        BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
    };
    componentWillUnmount() {
        this.clearSubscriptions();
        BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
    };

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_BLOCK_STYLE')}
            >
                <View
                    style={[this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_INPUT_BLOCK_STYLE'), { borderWidth: 0 }]}
                >
                    <TouchableOpacity
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BUTTON_BLOCK_STYLE')}
                        activeOpacity={0.5}
                        onPress={this.showStickerBox}
                    >
                        <Image
                            style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BUTTON_IMAGE_STYLE')}
                            source={this.coreInstances.CustomStyle.getImage('IMAGE_STICKER')}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_ATTACH_BUTTON_BLOCK_STYLE')}
                        activeOpacity={0.5}
                        onPress={this.showFileBox}
                    >
                        <Image
                            style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_ATTACH_BUTTON_IMAGE_STYLE')}
                            source={this.coreInstances.CustomStyle.getImage('IMAGE_ATTACH')}
                        />
                    </TouchableOpacity>
                    <View
                        style={[this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_TEXT_INPUT_BLOCK_STYLE')]}
                    >
                        <TextInput
                            ref={'TextInput'}
                            style={[this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_TEXT_INPUT_STYLE')]}
                            onChangeText={this.onTextInputChanged}
                            onFocus={this.onTextInputFocused}
                            onBlur={this.onTextInputBlured}
                            value={this.state.text.val}
                            placeholder={this.coreInstances.Language.getText('CHAT_INPUT_TEXT_INPUT_PLACEHOLDER_TEXT')}
                            returnKeyType={'done'}
                            autoCapitalize={'none'}
                            autoGrow
                            multiline
                            {
                            ...this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_TEXT_INPUT_PROPS_STYLE')
                            }
                            onContentSizeChange={(e) => this.onInputContentChangeSize(e)}
                        />
                    </View>
                    <TouchableOpacity
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_SEND_BUTTON_BLOCK_STYLE')}
                        activeOpacity={0.5}
                        onPress={this.sendTextMessage}
                    >
                        <Image
                            style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_SEND_BUTTON_IMAGE_STYLE')}
                            source={this.coreInstances.CustomStyle.getImage('IMAGE_SEND')}
                        />
                    </TouchableOpacity>
                </View>
                {
                    !!this.state.sticker.showed && (
                        <ChatInputStickerBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            onCloseButtonPressed={this.closeStickerBox}
                            onStickerMessageGenerated={this.sendStickerMessage}
                        />
                    )
                }
                {
                    !!this.state.file.showed && (
                        <ChatInputFileBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            onCloseButtonPressed={this.closeFileBox}
                            onFilesMessageGenerated={this.sendFileMessages}
                        />
                    )
                }
            </View>
        );
    };
};

export default ChatInputComponentBlock;