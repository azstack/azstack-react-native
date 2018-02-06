import React from 'react';
import {
    Alert,
    View,
    TextInput,
    Image,
    TouchableOpacity,
    ScrollView,
    Text
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

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
                showed: false,
                selected: 0,
                items: [
                    {
                        catId: 1,
                        iconName: 'icon.png',
                        content: [
                            '001.png', '002.png', '003.png', '004.png', '005.png',
                            '006.png', '007.png', '008.png', '009.png', '010.png',
                            '011.png', '012.png', '013.png', '014.png', '015.png',
                            '016.png', '017.png', '018.png', '019.png', '020.png',
                            '021.png', '022.png', '023.png', '024.png', '025.png',
                            '026.png', '027.png', '028.png', '029.png', '030.png',
                            '031.png', '032.png', '033.png', '034.png', '035.png',
                            '036.png', '037.png', '038.png', '039.png', '040.png',
                            '041.png', '042.png', '043.png', '044.png', '045.png',
                            '046.png', '047.png', '048.png', '049.png', '050.png'
                        ]
                    }
                ]
            },
            file: {
                showed: false
            }
        };

        this.sendingMessageFailChecks = {};

        this.onTextInputChanged = this.onTextInputChanged.bind(this);
        this.onTextInputFocused = this.onTextInputFocused.bind(this);
        this.onTextInputBlured = this.onTextInputBlured.bind(this);

        this.showStickerBox = this.showStickerBox.bind(this);
        this.closeStickerBox = this.closeStickerBox.bind(this);
        this.changeStickerTab = this.changeStickerTab.bind(this);

        this.closeFileBox = this.closeFileBox.bind(this);
        this.showFileBox = this.showFileBox.bind(this);
        this.onFileBoxOptionGalleryButtonPressed = this.onFileBoxOptionGalleryButtonPressed.bind(this);
        this.onFileBoxOptionCameraButtonPressed = this.onFileBoxOptionCameraButtonPressed.bind(this);
        this.onFileBoxOptionFileButtonPressed = this.onFileBoxOptionFileButtonPressed.bind(this);
        this.onFileBoxOptionLocationButtonPressed = this.onFileBoxOptionLocationButtonPressed.bind(this);
        this.onFileBoxOptionVoiceButtonPressed = this.onFileBoxOptionVoiceButtonPressed.bind(this);
        this.onFileBoxOptionDrawingButtonPressed = this.onFileBoxOptionDrawingButtonPressed.bind(this);

        this.sendTextMessage = this.sendTextMessage.bind(this);
        this.sendStickerMessage = this.sendStickerMessage.bind(this);
        this.sendFileMessage = this.sendFileMessage.bind(this);
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
    changeStickerTab(index) {

        if (this.state.sticker.selected === index) {
            return;
        }

        this.setState({ sticker: Object.assign({}, this.state.sticker, { selected: index }) });
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
    sendStickerMessage(itemName) {

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

        Image.getSize(`${this.coreInstances.linkConstants.LINK_API_URL_STICKER}${this.state.sticker.items[this.state.sticker.selected].catId}/${itemName}`, (width, height) => {
            let currentTime = new Date().getTime();
            this.coreInstances.AZStackCore.newUniqueId();
            let stickerMessage = {
                chatType: this.props.chatType,
                chatId: this.props.chatId,
                senderId: this.coreInstances.AZStackCore.authenticatedUser.userId,
                sender: this.coreInstances.AZStackCore.authenticatedUser,
                receiverId: this.props.chatId,
                receiver: this.props.chatTarget,
                msgId: this.coreInstances.AZStackCore.uniqueId,
                type: this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER,
                status: this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_SENDING,
                deleted: this.coreInstances.AZStackCore.chatConstants.MESSAGE_DELETED_FALSE,
                created: currentTime,
                modified: currentTime,
                sticker: {
                    name: itemName,
                    catId: this.state.sticker.items[this.state.sticker.selected].catId,
                    url: `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}${this.state.sticker.items[this.state.sticker.selected].catId}/${itemName}`,
                    width: width,
                    height: height
                }
            };
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
        }, (error) => {

        });
    };
    sendFileMessage(fileMessages) {
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

    onFileBoxOptionGalleryButtonPressed() {
        ImagePicker.openPicker({
            multiple: true,
            mediaType: 'photo'
        }).then((selectedImages) => {

            if (!this.coreInstances.AZStackCore.slaveSocketConnected) {
                Alert.alert(
                    this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                    this.coreInstances.Language.getText('CHAT_INPUT_SEND_MESSAGE_ERROR_TEXT'),
                    [
                        { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                    ],
                    { cancelable: true }
                );
            }

            let sendingImages = [];
            for (let i = 0; i < selectedImages.length; i++) {
                let selectedImage = selectedImages[i];
                if (selectedImage.size > this.coreInstances.limitConstants.LIMIT_MAX_FILE_SIZE) {
                    Alert.alert(
                        this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                        `${this.coreInstances.Language.getText('CHAT_INPUT_FILE_SIZE_TOO_BIG_ERROR_TEXT')} ${this.coreInstances.FileConverter.sizeAsString(this.coreInstances.limitConstants.LIMIT_MAX_FILE_SIZE, true)}`,
                        [
                            { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                        ],
                        { cancelable: true }
                    );
                    return;
                }

                let currentTime = new Date().getTime();
                this.coreInstances.AZStackCore.newUniqueId();
                sendingImages.push({
                    chatType: this.props.chatType,
                    chatId: this.props.chatId,
                    senderId: this.coreInstances.AZStackCore.authenticatedUser.userId,
                    sender: this.coreInstances.AZStackCore.authenticatedUser,
                    receiverId: this.props.chatId,
                    receiver: this.props.chatTarget,
                    msgId: this.coreInstances.AZStackCore.uniqueId,
                    type: this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_FILE,
                    status: this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_SENDING,
                    deleted: this.coreInstances.AZStackCore.chatConstants.MESSAGE_DELETED_FALSE,
                    created: currentTime,
                    modified: currentTime,
                    file: {
                        name: this.coreInstances.FileConverter.nameFromPath(selectedImage.path),
                        length: selectedImage.size,
                        type: this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_IMAGE,
                        url: selectedImage.path,
                        width: selectedImage.width,
                        height: selectedImage.height,
                        mimeType: selectedImage.mime
                    }
                });
            }

            sendingImages.map((sendingImage) => {
                this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...sendingImage } });
            });
            Promise.all(
                sendingImages.map((sendingImage) => {
                    return new Promise((resolve, reject) => {
                        const data = new FormData();
                        data.append('uid', this.coreInstances.AZStackCore.authenticatedUser.azStackUserId);
                        data.append('msgId', sendingImage.msgId);
                        data.append('hash', this.coreInstances.FileConverter.MD5(`${sendingImage.msgId}abc_d123_##$$${this.coreInstances.AZStackCore.authenticatedUser.azStackUserId}`))
                        data.append('fileToUpload', {
                            uri: sendingImage.file.url,
                            type: sendingImage.file.mimeType,
                            name: sendingImage.file.name
                        });
                        fetch(this.coreInstances.linkConstants.LINK_API_URL_UPLOAD_FILE, {
                            method: 'post',
                            body: data
                        }).then((response) => response.json()).then((responseJson) => {
                            if (responseJson.status === 1000) {
                                sendingImage.file.url = responseJson.data.replace('http://', 'https://');
                            } else {
                                sendingImage.status = -1;
                            }
                            resolve(null);
                        }).catch((error) => {
                            sendingImage.status = -1;
                            resolve(null);
                        });;
                    });
                })
            ).then(() => {
                this.sendFileMessage(sendingImages);
            }).catch((error) => { });

        }).catch((error) => {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('ALERT_GENERAL_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
        });
    };
    onFileBoxOptionCameraButtonPressed() { };
    onFileBoxOptionFileButtonPressed() { };
    onFileBoxOptionLocationButtonPressed() { };
    onFileBoxOptionVoiceButtonPressed() { };
    onFileBoxOptionDrawingButtonPressed() { };

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
                        <View
                            style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_BLOCK_STYLE')}
                        >
                            <View
                                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_HEADER_BLOCK_STYLE')}
                            >
                                <View
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_TABS_BLOCK_STYLE')}
                                >
                                    {
                                        this.state.sticker.items.map((item, index) => {
                                            return (
                                                <TouchableOpacity
                                                    style={[
                                                        this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_TABS_TAB_BUTTON_STYLE'),
                                                        (this.state.sticker.selected === index ? this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_TABS_TAB_BUTTON_ACTIVE_STYLE') : {})
                                                    ]}
                                                    activeOpacity={0.5}
                                                    onPress={() => { this.changeStickerTab(index) }}
                                                    key={`sticker_tab_${item.catId}`}
                                                >
                                                    <Image
                                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_TABS_TAB_IMAGE_STYLE')}
                                                        source={{
                                                            uri: `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}${item.catId}/${item.iconName}`
                                                        }}
                                                    />
                                                </TouchableOpacity>
                                            );
                                        })
                                    }
                                </View>
                                <TouchableOpacity
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_CLOSE_BUTTON_BLOCK_STYLE')}
                                    activeOpacity={0.5}
                                    onPress={this.closeStickerBox}
                                >
                                    <Text
                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_CLOSE_BUTTON_TEXT_STYLE')}
                                    >×</Text>
                                </TouchableOpacity>
                            </View>
                            <View
                                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_BODY_BLOCK_STYLE')}
                            >
                                <ScrollView
                                    contentContainerStyle={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_STICKERS_BLOCK_STYLE')}
                                >
                                    {
                                        this.state.sticker.items[this.state.sticker.selected].content.map((item) => {
                                            return (
                                                <TouchableOpacity
                                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_STICKERS_STICKER_BUTTON_STYLE')}
                                                    activeOpacity={0.5}
                                                    onPress={() => { this.sendStickerMessage(item) }}
                                                    key={`sticker_${this.state.sticker.items[this.state.sticker.selected].catId}_${item}`}
                                                >
                                                    <Image
                                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_STICKERS_STICKER_IMAGE_STYLE')}
                                                        source={{
                                                            uri: `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}${this.state.sticker.items[this.state.sticker.selected].catId}/${item}`
                                                        }}
                                                    />
                                                </TouchableOpacity>
                                            );
                                        })
                                    }
                                </ScrollView>
                            </View>
                        </View>
                    )
                }
                {
                    !!this.state.file.showed && (
                        <View
                            style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_BLOCK_STYLE')}
                        >
                            <View
                                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_CONTENT_BLOCK_STYLE')}
                            >
                                <TouchableOpacity
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTION_BUTTON_BLOCK_STYLE')}
                                    activeOpacity={0.5}
                                    onPress={this.onFileBoxOptionGalleryButtonPressed}
                                >
                                    <Image
                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTION_IMAGE_BLOCK_STYLE')}
                                        source={this.coreInstances.CustomStyle.getImage('IMAGE_GALLERY')}
                                    />
                                    <Text
                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTION_TEXT_BLOCK_STYLE')}
                                    >
                                        {this.coreInstances.Language.getText('CHAT_INPUT_FILE_OPTION_GALLERY_TEXT')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTION_BUTTON_BLOCK_STYLE')}
                                    activeOpacity={0.5}
                                    onPress={this.onFileBoxOptionCameraButtonPressed}
                                >
                                    <Image
                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTION_IMAGE_BLOCK_STYLE')}
                                        source={this.coreInstances.CustomStyle.getImage('IMAGE_CAMERA')}
                                    />
                                    <Text
                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTION_TEXT_BLOCK_STYLE')}
                                    >
                                        {this.coreInstances.Language.getText('CHAT_INPUT_FILE_OPTION_CAMERA_TEXT')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTION_BUTTON_BLOCK_STYLE')}
                                    activeOpacity={0.5}
                                    onPress={this.onFileBoxOptionFileButtonPressed}
                                >
                                    <Image
                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTION_IMAGE_BLOCK_STYLE')}
                                        source={this.coreInstances.CustomStyle.getImage('IMAGE_FILE')}
                                    />
                                    <Text
                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTION_TEXT_BLOCK_STYLE')}
                                    >
                                        {this.coreInstances.Language.getText('CHAT_INPUT_FILE_OPTION_FILE_TEXT')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTION_BUTTON_BLOCK_STYLE')}
                                    activeOpacity={0.5}
                                    onPress={this.onFileBoxOptionLocationButtonPressed}
                                >
                                    <Image
                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTION_IMAGE_BLOCK_STYLE')}
                                        source={this.coreInstances.CustomStyle.getImage('IMAGE_LOCATION')}
                                    />
                                    <Text
                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTION_TEXT_BLOCK_STYLE')}
                                    >
                                        {this.coreInstances.Language.getText('CHAT_INPUT_FILE_OPTION_LOCATION_TEXT')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTION_BUTTON_BLOCK_STYLE')}
                                    activeOpacity={0.5}
                                    onPress={this.onFileBoxOptionVoiceButtonPressed}
                                >
                                    <Image
                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTION_IMAGE_BLOCK_STYLE')}
                                        source={this.coreInstances.CustomStyle.getImage('IMAGE_VOICE')}
                                    />
                                    <Text
                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTION_TEXT_BLOCK_STYLE')}
                                    >
                                        {this.coreInstances.Language.getText('CHAT_INPUT_FILE_OPTION_VOICE_TEXT')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTION_BUTTON_BLOCK_STYLE')}
                                    activeOpacity={0.5}
                                    onPress={this.onFileBoxOptionDrawingButtonPressed}
                                >
                                    <Image
                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTION_IMAGE_BLOCK_STYLE')}
                                        source={this.coreInstances.CustomStyle.getImage('IMAGE_DRAWING')}
                                    />
                                    <Text
                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTION_TEXT_BLOCK_STYLE')}
                                    >
                                        {this.coreInstances.Language.getText('CHAT_INPUT_FILE_OPTION_DRAWING_TEXT')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_CLOSE_BUTTON_BLOCK_STYLE')}
                                activeOpacity={0.5}
                                onPress={this.closeFileBox}
                            >
                                <Text
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_CLOSE_BUTTON_TEXT_STYLE')}
                                >×</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }
            </View>
        );
    };
};

export default ChatInputComponentBlock;