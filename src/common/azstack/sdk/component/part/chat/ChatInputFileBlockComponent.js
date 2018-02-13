import React from 'react';
import {
    BackHandler,
    Alert,
    View
} from 'react-native';

import ImagePicker from 'react-native-image-crop-picker';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';

import ChatInputFileOptionsBlockComponent from './ChatInputFileOptionsBlockComponent';
import ChatInputLocationBlockComponent from './ChatInputLocationBlockComponent';
import ChatInputRecordingBlockComponent from './ChatInputRecordingBlockComponent';
import ChatInputDrawingBlockComponent from './ChatInputDrawingBlockComponent';

class ChatInputFileBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.state = {
            location: {
                showed: false,
            },
            recording: {
                showed: false
            },
            drawing: {
                showed: false
            }
        };

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);

        this.onFileBoxOptionGalleryButtonPressed = this.onFileBoxOptionGalleryButtonPressed.bind(this);
        this.onFileBoxOptionCameraButtonPressed = this.onFileBoxOptionCameraButtonPressed.bind(this);
        this.onFileBoxOptionFileButtonPressed = this.onFileBoxOptionFileButtonPressed.bind(this);
        this.onFileBoxOptionLocationButtonPressed = this.onFileBoxOptionLocationButtonPressed.bind(this);
        this.onFileBoxOptionVoiceButtonPressed = this.onFileBoxOptionVoiceButtonPressed.bind(this);
        this.onFileBoxOptionDrawingButtonPressed = this.onFileBoxOptionDrawingButtonPressed.bind(this);

        this.closeLocation = this.closeLocation.bind(this);
        this.closeRecording = this.closeRecording.bind(this);
        this.closeDrawing = this.closeDrawing.bind(this);
    };

    onHardBackButtonPressed() {
        this.props.onCloseButtonPressed();
        return true;
    };

    detectFileType(mimeType) {

        let mimeTypes = {
            word: [
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
                'application/vnd.ms-word.document.macroEnabled.12',
                'application/vnd.ms-word.template.macroEnabled.12'
            ],
            excel: [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
                'application/vnd.ms-excel.sheet.macroEnabled.12',
                'application/vnd.ms-excel.template.macroEnabled.12',
                'application/vnd.ms-excel.addin.macroEnabled.12',
                'application/vnd.ms-excel.sheet.binary.macroEnabled.12'
            ],
            powerpoint: [
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/vnd.openxmlformats-officedocument.presentationml.template',
                'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
                'application/vnd.ms-powerpoint.addin.macroEnabled.12',
                'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
                'application/vnd.ms-powerpoint.template.macroEnabled.12',
                'application/vnd.ms-powerpoint.slideshow.macroEnabled.12'
            ],
            pdf: [
                'application/pdf'
            ],
            plaintext: [
                'text/plain',
                'text/csv'
            ],
            archive: [
                'application/x-tar',
                'application/gzip',
                'application/x-7z-compressed',
                'application/vnd.android.package-archive',
                'application/x-apple-diskimage',
                'application/x-rar-compressed',
                'application/x-gtar',
                'application/zip'
            ]
        }

        if (mimeType.indexOf('image') > -1) {
            return this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_IMAGE;
        }
        if (mimeType.indexOf('audio') > -1) {
            return this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_AUDIO;
        }
        if (mimeType.indexOf('video') > -1) {
            return this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_VIDEO;
        }
        if (mimeTypes.excel.indexOf(mimeType) > -1) {
            return this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_EXCEL;
        }
        if (mimeTypes.word.indexOf(mimeType) > -1) {
            return this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_WORD;
        }
        if (mimeTypes.powerpoint.indexOf(mimeType) > -1) {
            return this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_POWERPOINT;
        }
        if (mimeTypes.pdf.indexOf(mimeType) > -1) {
            return this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_PDF;
        }
        if (mimeTypes.plaintext.indexOf(mimeType) > -1) {
            return this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_TEXT;
        }
        if (mimeType.indexOf('text') > -1) {
            return this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_CODE;
        }
        if (mimeTypes.archive.indexOf(mimeType) > -1) {
            return this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_ARCHIVE;
        }
        return this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_UNKNOWN;
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
                this.props.onFilesMessageGenerated(sendingImages);
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
    onFileBoxOptionCameraButtonPressed() {
        ImagePicker.openCamera({}).then((capturedImage) => {
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

            if (capturedImage.size > this.coreInstances.limitConstants.LIMIT_MAX_FILE_SIZE) {
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
            sendingImage = {
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
                    name: this.coreInstances.FileConverter.nameFromPath(capturedImage.path),
                    length: capturedImage.size,
                    type: this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_IMAGE,
                    url: capturedImage.path,
                    width: capturedImage.width,
                    height: capturedImage.height,
                    mimeType: capturedImage.mime
                }
            };

            this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...sendingImage } });

            Promise.all([
                new Promise((resolve, reject) => {
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
                })
            ]).then(() => {
                this.props.onFilesMessageGenerated([sendingImage]);
            }).catch((error) => { });

        }).catch((error) => { });
    };
    onFileBoxOptionFileButtonPressed() {
        DocumentPicker.show({
            filetype: [DocumentPickerUtil.allFiles()],
        }, (error, selectedFile) => {
            if (error) {
                return;
            }

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

            if (selectedFile.fileSize > this.coreInstances.limitConstants.LIMIT_MAX_FILE_SIZE) {
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
            sendingFile = {
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
                    name: selectedFile.fileName,
                    length: selectedFile.fileSize,
                    type: this.detectFileType(selectedFile.type),
                    url: selectedFile.uri,
                    mimeType: selectedFile.type
                }
            };

            Promise.all([
                new Promise((resolve, reject) => {
                    switch (sendingFile.file.type) {
                        case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_IMAGE:
                            Image.getSize(sendingFile.file.url, (width, height) => {
                                sendingFile.file.width = width;
                                sendingFile.file.height = height;
                                resolve(null);
                            }, (error) => {
                                resolve(null);
                            });
                            break;
                        case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_AUDIO:
                        case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_VIDEO:
                        case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_EXCEL:
                        case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_WORD:
                        case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_POWERPOINT:
                        case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_PDF:
                        case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_TEXT:
                        case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_CODE:
                        case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_ARCHIVE:
                        case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_UNKNOWN:
                        default:
                            resolve(null);
                            break;
                    }
                })
            ]).then(() => {
                this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: { ...sendingFile } });

                Promise.all([
                    new Promise((resolve, reject) => {
                        const data = new FormData();
                        data.append('uid', this.coreInstances.AZStackCore.authenticatedUser.azStackUserId);
                        data.append('msgId', sendingFile.msgId);
                        data.append('hash', this.coreInstances.FileConverter.MD5(`${sendingFile.msgId}abc_d123_##$$${this.coreInstances.AZStackCore.authenticatedUser.azStackUserId}`))
                        data.append('fileToUpload', {
                            uri: sendingFile.file.url,
                            type: sendingFile.file.mimeType,
                            name: sendingFile.file.name
                        });
                        fetch(this.coreInstances.linkConstants.LINK_API_URL_UPLOAD_FILE, {
                            method: 'post',
                            body: data
                        }).then((response) => response.json()).then((responseJson) => {
                            if (responseJson.status === 1000) {
                                sendingFile.file.url = responseJson.data.replace('http://', 'https://');
                            } else {
                                sendingFile.status = -1;
                            }
                            resolve(null);
                        }).catch((error) => {
                            sendingFile.status = -1;
                            resolve(null);
                        });;
                    })
                ]).then(() => {
                    this.props.onFilesMessageGenerated([sendingFile]);
                }).catch((error) => {
                    console.log(error);
                });

            }).catch((error) => {
                console.log(error);
            });
        });
    };
    onFileBoxOptionLocationButtonPressed() {
        this.setState({ location: Object.assign({}, this.state.location, { showed: true }) });
    };
    onFileBoxOptionVoiceButtonPressed() {
        this.setState({ recording: Object.assign({}, this.state.recording, { showed: true }) });
    };
    onFileBoxOptionDrawingButtonPressed() {
        this.setState({ drawing: Object.assign({}, this.state.drawing, { showed: true }) });
    };

    closeLocation() {
        this.setState({ location: Object.assign({}, this.state.location, { showed: false }) });
    };

    closeRecording() {
        this.setState({ recording: Object.assign({}, this.state.recording, { showed: false }) });
    };

    closeDrawing() {
        this.setState({ drawing: Object.assign({}, this.state.drawing, { showed: false }) });
    };

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
    };
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
    };

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_BLOCK_STYLE')}
            >
                {
                    !this.state.location.showed &&
                    !this.state.recording.showed &&
                    !this.state.drawing.showed && (
                        <ChatInputFileOptionsBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            onCloseButtonPressed={this.props.onCloseButtonPressed}
                            onFileBoxOptionGalleryButtonPressed={this.onFileBoxOptionGalleryButtonPressed}
                            onFileBoxOptionCameraButtonPressed={this.onFileBoxOptionCameraButtonPressed}
                            onFileBoxOptionFileButtonPressed={this.onFileBoxOptionFileButtonPressed}
                            onFileBoxOptionLocationButtonPressed={this.onFileBoxOptionLocationButtonPressed}
                            onFileBoxOptionVoiceButtonPressed={this.onFileBoxOptionVoiceButtonPressed}
                            onFileBoxOptionDrawingButtonPressed={this.onFileBoxOptionDrawingButtonPressed}
                        />
                    )
                }
                {
                    this.state.location.showed && (
                        <ChatInputRecordingBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            onCloseButtonPressed={this.closeLocation}
                        />
                    )
                }
                {
                    this.state.recording.showed && (
                        <ChatInputRecordingBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            onCloseButtonPressed={this.closeRecording}
                        />
                    )
                }
                {
                    this.state.drawing.showed && (
                        <ChatInputDrawingBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            onCloseButtonPressed={this.closeDrawing}
                        />
                    )
                }
            </View>
        );
    };
};

export default ChatInputFileBlockComponent;