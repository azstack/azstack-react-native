import React from 'react';
import {
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
            },
            hasDraftData: false
        };

        this.sendingMessageFailChecks = {};

        this.onTextInputChanged = this.onTextInputChanged.bind(this);
        this.onTextInputFocused = this.onTextInputFocused.bind(this);
        this.onTextInputBlured = this.onTextInputBlured.bind(this);

        this.showStickerBox = this.showStickerBox.bind(this);
        this.closeStickerBox = this.closeStickerBox.bind(this);

        this.closeFileBox = this.closeFileBox.bind(this);
        this.showFileBox = this.showFileBox.bind(this);

        this.onChatInputDraftDataStatusChanged = this.onChatInputDraftDataStatusChanged.bind(this);

        this.sendTextMessage = this.sendTextMessage.bind(this);
        this.sendStickerMessage = this.sendStickerMessage.bind(this);
        this.sendFileMessages = this.sendFileMessages.bind(this);
        this.sendLocationMessage = this.sendLocationMessage.bind(this);
    };

    addSubscriptions() {
        this.subscriptions.onMessageListScrollStart = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_MESSAGE_LIST_SCROLL_START, ({ error, result }) => {
            if (error) {
                return;
            }

            if (this.state.sticker.showed) {
                this.setState({ sticker: Object.assign({}, this.state.sticker, { showed: false }) });
            }
            if (this.state.file.showed) {
                this.setState({ file: Object.assign({}, this.state.file, { showed: false }) });
            }
        });
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

    onChatInputDraftDataStatusChanged(status) {
        this.setState({ hasDraftData: status });
        this.props.onChatInputDraftDataStatusChanged(status);
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

        this.coreInstances.Message.onBeforeMessageSend({
            chatType: this.props.chatType,
            chatId: this.props.chatId,
            text: textMessage.text
        }).then((preparedMessage) => {

            let invalidData = false;

            if (!preparedMessage || typeof preparedMessage !== 'object') {
                invalidData = true;
            } else if (preparedMessage.chatType !== textMessage.chatType || preparedMessage.chatId !== textMessage.chatId) {
                invalidData = true;
            } else if (!preparedMessage.text || typeof preparedMessage.text !== 'string') {
                invalidData = true;
            }

            if (invalidData) {
                textMessage.status = -1;
                this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...textMessage } });
                return;
            }

            textMessage.text = preparedMessage.text;
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
        }).catch((error) => {
            textMessage.status = -1;
            this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...textMessage } });
        });
    };
    sendStickerMessage(stickerMessage) {
        this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...stickerMessage } });

        this.coreInstances.Message.onBeforeMessageSend({
            chatType: this.props.chatType,
            chatId: this.props.chatId,
            sticker: {
                name: stickerMessage.sticker.name,
                catId: stickerMessage.sticker.catId,
                url: stickerMessage.sticker.url,
                width: stickerMessage.sticker.width,
                height: stickerMessage.sticker.height
            }
        }).then((preparedMessage) => {

            let invalidData = false;

            if (!preparedMessage || typeof preparedMessage !== 'object') {
                invalidData = true;
            } else if (preparedMessage.chatType !== stickerMessage.chatType || preparedMessage.chatId !== stickerMessage.chatId) {
                invalidData = true;
            } else if (
                !preparedMessage.sticker || typeof preparedMessage.sticker !== 'object' ||
                !preparedMessage.sticker.name || typeof preparedMessage.sticker.name !== 'string' ||
                !preparedMessage.sticker.catId || typeof preparedMessage.sticker.catId !== 'number' ||
                !preparedMessage.sticker.url || typeof preparedMessage.sticker.url !== 'string' || !/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(preparedMessage.sticker.url) ||
                (preparedMessage.sticker.width && typeof preparedMessage.sticker.width !== 'number') ||
                (preparedMessage.sticker.height && typeof preparedMessage.sticker.height !== 'number')
            ) {
                invalidData = true;
            }

            if (invalidData) {
                stickerMessage.status = -1;
                this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...stickerMessage } });
                return;
            }

            stickerMessage.sticker.name = preparedMessage.sticker.name;
            stickerMessage.sticker.catId = preparedMessage.sticker.catId;
            stickerMessage.sticker.url = preparedMessage.sticker.url;
            stickerMessage.sticker.width = preparedMessage.sticker.width;
            stickerMessage.sticker.height = preparedMessage.sticker.height;

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
        }).catch((error) => {
            stickerMessage.status = -1;
            this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...stickerMessage } });
        });
    };
    sendFileMessages(fileMessages) {
        fileMessages.map((fileMessage) => {
            if (fileMessage.status === -1) {
                this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...fileMessage } });
                return;
            }

            this.coreInstances.Message.onBeforeMessageSend({
                chatType: this.props.chatType,
                chatId: this.props.chatId,
                file: {
                    name: fileMessage.file.name,
                    length: fileMessage.file.length,
                    type: fileMessage.file.type,
                    url: fileMessage.file.url,
                    width: fileMessage.file.width,
                    height: fileMessage.file.height
                }
            }).then((preparedMessage) => {

                let invalidData = false;

                if (!preparedMessage || typeof preparedMessage !== 'object') {
                    invalidData = true;
                } else if (preparedMessage.chatType !== fileMessage.chatType || preparedMessage.chatId !== fileMessage.chatId) {
                    invalidData = true;
                } else if (
                    !preparedMessage.file || typeof preparedMessage.file !== 'object' ||
                    !preparedMessage.file.name || typeof preparedMessage.file.name !== 'string' ||
                    !preparedMessage.file.length || typeof preparedMessage.file.length !== 'number' ||
                    !preparedMessage.file.type || typeof preparedMessage.file.type !== 'number' ||
                    !preparedMessage.file.url || typeof preparedMessage.file.url !== 'string' || !/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(preparedMessage.file.url) ||
                    (preparedMessage.file.width && typeof preparedMessage.file.width !== 'number') ||
                    (preparedMessage.file.height && typeof preparedMessage.file.height !== 'number')
                ) {
                    invalidData = true;
                }

                if (invalidData) {
                    fileMessage.status = -1;
                    this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...fileMessage } });
                    return;
                }

                fileMessage.file.name = preparedMessage.file.name;
                fileMessage.file.length = preparedMessage.file.length;
                fileMessage.file.type = preparedMessage.file.type;
                fileMessage.file.url = preparedMessage.file.url;
                fileMessage.file.width = preparedMessage.file.width;
                fileMessage.file.height = preparedMessage.file.height;

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
            }).catch((error) => {
                fileMessage.status = -1;
                this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...fileMessage } });
            });
        });
    };
    sendLocationMessage(location) {

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

        let currentTime = new Date().getTime();
        this.coreInstances.AZStackCore.newUniqueId();
        let locationMessage = {
            chatType: this.props.chatType,
            chatId: this.props.chatId,
            senderId: this.coreInstances.AZStackCore.authenticatedUser.userId,
            sender: this.coreInstances.AZStackCore.authenticatedUser,
            receiverId: this.props.chatId,
            receiver: this.props.chatTarget,
            msgId: this.coreInstances.AZStackCore.uniqueId,
            type: this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_LOCATION,
            status: this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_SENDING,
            deleted: this.coreInstances.AZStackCore.chatConstants.MESSAGE_DELETED_FALSE,
            created: currentTime,
            modified: currentTime,
            location: {
                address: location.address,
                latitude: location.latitude,
                longitude: location.longitude
            }
        };
        this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...locationMessage } });

        this.coreInstances.Message.onBeforeMessageSend({
            chatType: this.props.chatType,
            chatId: this.props.chatId,
            location: {
                address: locationMessage.location.address,
                latitude: locationMessage.location.latitude,
                longitude: locationMessage.location.longitude
            }
        }).then((preparedMessage) => {

            let invalidData = false;

            if (!preparedMessage || typeof preparedMessage !== 'object') {
                invalidData = true;
            } else if (preparedMessage.chatType !== locationMessage.chatType || preparedMessage.chatId !== locationMessage.chatId) {
                invalidData = true;
            } else if (
                !preparedMessage.location || typeof preparedMessage.location !== 'object' ||
                !preparedMessage.location.address || typeof preparedMessage.location.address !== 'string' ||
                (preparedMessage.location.latitude !== 0 && !preparedMessage.location.latitude) || typeof preparedMessage.location.latitude !== 'number' ||
                (preparedMessage.location.longitude !== 0 && !preparedMessage.location.longitude) || typeof preparedMessage.location.longitude !== 'number'
            ) {
                invalidData = true;
            }

            if (invalidData) {
                locationMessage.status = -1;
                this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...locationMessage } });
                return;
            }

            locationMessage.location.address = preparedMessage.location.address;
            locationMessage.location.latitude = preparedMessage.location.latitude;
            locationMessage.location.longitude = preparedMessage.location.longitude;

            this.sendingMessageFailChecks[locationMessage.msgId] = setTimeout(() => {
                locationMessage.status = -1;
                this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...locationMessage } });
                delete this.sendingMessageFailChecks[locationMessage.msgId];
            }, 5000);

            this.coreInstances.AZStackCore.newMessage({
                chatType: this.props.chatType,
                chatId: this.props.chatId,
                msgId: locationMessage.msgId,
                location: {
                    address: locationMessage.location.address,
                    latitude: locationMessage.location.latitude,
                    longitude: locationMessage.location.longitude
                }
            }).then((result) => { }).catch((error) => { });
        }).catch((error) => {
            locationMessage.status = -1;
            this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...locationMessage } });
        });
    };

    onInputContentChangeSize(e) {
    };

    componentDidMount() {
        this.addSubscriptions();
    };
    componentWillUnmount() {
        this.clearSubscriptions();
    };

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_BLOCK_STYLE')}
            >
                <View
                    style={[this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_INPUT_BLOCK_STYLE'), { borderWidth: 0 }]}
                >
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_INPUT_CONTENT_BLOCK_STYLE')}
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
                        this.state.hasDraftData && (
                            <View
                                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_INPUT_DISABLE_TOUCH_BLOCK_STYLE')}
                            />
                        )
                    }
                </View>
                {
                    !!this.state.sticker.showed && (
                        <ChatInputStickerBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            onCloseButtonPressed={this.closeStickerBox}
                            onStickerMessageGenerated={this.sendStickerMessage}
                            chatType={this.props.chatType}
                            chatId={this.props.chatId}
                            chatTarget={this.props.chatTarget}
                            showStickersList={this.props.showStickersList}
                            showStickerDetails={this.props.showStickerDetails}
                        />
                    )
                }
                {
                    !!this.state.file.showed && (
                        <ChatInputFileBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            onCloseButtonPressed={this.closeFileBox}
                            onFilesMessageGenerated={this.sendFileMessages}
                            onLocationSelected={this.sendLocationMessage}
                            chatType={this.props.chatType}
                            chatId={this.props.chatId}
                            chatTarget={this.props.chatTarget}
                            onChatInputDraftDataStatusChanged={this.onChatInputDraftDataStatusChanged}
                            showSketchDrawing={this.props.showSketchDrawing}
                        />
                    )
                }
            </View>
        );
    };
};

export default ChatInputComponentBlock;