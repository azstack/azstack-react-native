import React from 'react';
import {
    BackHandler,
    Dimensions,
    Alert,
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    Text
} from 'react-native';
import RNFS from 'react-native-fs';

class ChatInputStickerBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.subscriptions = {};

        this.defaultSticker = {
            catId: 1,
            miniCover: `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/icon.png`,
            files: [
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/001.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/002.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/003.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/004.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/005.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/006.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/007.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/008.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/009.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/010.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/011.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/012.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/013.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/014.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/015.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/016.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/017.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/018.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/019.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/020.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/021.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/022.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/023.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/024.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/025.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/026.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/027.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/028.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/029.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/030.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/031.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/032.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/033.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/034.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/035.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/036.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/037.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/038.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/039.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/040.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/041.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/042.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/043.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/044.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/045.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/046.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/047.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/048.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/049.png`,
                `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}1/050.png`
            ]
        };
        this.allStickers = [];

        this.state = {
            selected: 0,
            items: [{ ...this.defaultSticker }]
        };

        this.stickerSize = 70;
        this.itemsPerLine = Math.floor(Dimensions.get('window').width / this.stickerSize);

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);

        this.changeStickerTab = this.changeStickerTab.bind(this);
        this.onStickerPressed = this.onStickerPressed.bind(this);

        this.onAddStickerPressed = this.onAddStickerPressed.bind(this);
    };

    onHardBackButtonPressed() {
        this.props.onCloseButtonPressed();
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
        this.subscriptions.onStickerPacketDownloadStatusChanged = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_STICKER_PACKET_DOWNLOAD_STATUS_CHANGED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onStickerDownloadStatusChanged(result);
        });
    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

    initRun() {
        this.getStickers();
    };
    getStickers() {
        if (!this.coreInstances.AZStackCore.slaveSocketConnected) {
            return;
        }

        this.coreInstances.AZStackCore.getStickersList({
            isDefault: true
        }).then((result) => {
            this.allStickers = [...result.list];
            this.getDownloadedStickers(result.list).then((downloadedSticker) => {
                this.setState({ items: [{ ...this.defaultSticker }, ...downloadedSticker] });
            }).catch((error) => { });
        }).catch((error) => { });
    };
    getDownloadedStickers(allStickers) {
        return new Promise((resolve, reject) => {
            let downloadedStickers = [];
            RNFS.readdir(`${RNFS.DocumentDirectoryPath}/stickers`).then((folders) => {
                folders.map((folder) => {
                    for (let i = 0; i < allStickers.length; i++) {
                        if (allStickers[i].catId === parseInt(folder)) {
                            downloadedStickers.push({
                                catId: parseInt(folder),
                                miniCover: allStickers[i].urls.miniCover,
                                files: []
                            });
                            break;
                        }
                    }
                });
                return Promise.all(
                    downloadedStickers.map((downloadedSticker) => {
                        return new Promise((resolve, reject) => {
                            RNFS.readdir(`${RNFS.DocumentDirectoryPath}/stickers/${downloadedSticker.catId}`).then((files) => {
                                files.map((file) => {
                                    downloadedSticker.files.push(`file://${RNFS.DocumentDirectoryPath}/stickers/${downloadedSticker.catId}/${file}`);
                                });
                                if (downloadedSticker.files.length % this.itemsPerLine !== 0) {
                                    let missingItemTotal = this.itemsPerLine - downloadedSticker.files.length % this.itemsPerLine;
                                    for (let i = 0; i < missingItemTotal; i++) {
                                        downloadedSticker.files.push('');
                                    }
                                }
                                resolve(downloadedSticker);
                            }).catch((error) => {
                                reject(error);
                            })
                        });
                    })
                );
            }).then((downloadedStickers) => {
                resolve(downloadedStickers);
            }).catch((error) => {
                reject(error);
            });
        });
    };
    onStickerDownloadStatusChanged(changedSticker) {
        if (changedSticker.downloaded) {
            let stickers = this.state.items;
            let newSticker = {};
            for (let i = 0; i < this.allStickers.length; i++) {
                if (this.allStickers[i].catId === changedSticker.catId) {
                    newSticker = {
                        catId: changedSticker.catId,
                        miniCover: this.allStickers[i].urls.miniCover,
                        files: []
                    }
                    break;
                }
            }

            if (!newSticker.catId) {
                return;
            }

            RNFS.readdir(`${RNFS.DocumentDirectoryPath}/stickers/${newSticker.catId}`).then((files) => {
                files.map((file) => {
                    newSticker.files.push(`file://${RNFS.DocumentDirectoryPath}/stickers/${newSticker.catId}/${file}`);
                });
                if (newSticker.files.length % this.itemsPerLine !== 0) {
                    let missingItemTotal = this.itemsPerLine - newSticker.files.length % this.itemsPerLine;
                    for (let i = 0; i < missingItemTotal; i++) {
                        newSticker.files.push('');
                    }
                }
                stickers.push(newSticker);
                stickers.sort((a, b) => {
                    if (a.catId < b.catId) {
                        return -1;
                    } else {
                        return 1;
                    }
                });
                this.setState({
                    selected: 0,
                    items: stickers
                });
            }).catch((error) => { });
        } else {
            let stickers = this.state.items;
            for (let i = 0; i < stickers.length; i++) {
                if (stickers[i].catId === changedSticker.catId) {
                    stickers.splice(i, 1);
                    break;
                }
            }
            this.setState({
                selected: 0,
                items: stickers
            });
        }
    };

    changeStickerTab(index) {
        this.setState({ selected: index });
    };
    onStickerPressed(event) {
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

        let fileName = this.coreInstances.FileConverter.nameFromPath(event.url);

        Image.getSize(`${this.coreInstances.linkConstants.LINK_API_URL_STICKER}${event.catId}/${fileName}`, (width, height) => {
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
                    name: fileName,
                    catId: event.catId,
                    url: `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}${event.catId}/${fileName}`,
                    width: width,
                    height: height
                }
            };
            this.props.onStickerMessageGenerated(stickerMessage);
        }, (error) => {

        });
    };

    onAddStickerPressed() {
        this.props.showStickersList({
            showStickerDetails: this.props.showStickerDetails
        });
    };

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
        this.addSubscriptions();
        this.initRun();
    };
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
        this.clearSubscriptions();
    };

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_BLOCK_STYLE')}
            >
                <View
                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_HEADER_BLOCK_STYLE')}
                >
                    <TouchableOpacity
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_TABS_TAB_BUTTON_STYLE')}
                        activeOpacity={0.5}
                        onPress={() => { this.onAddStickerPressed() }}
                    >
                        <Image
                            style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_TABS_TAB_IMAGE_STYLE')}
                            source={this.coreInstances.CustomStyle.getImage('IMAGE_CROSS')}
                        />
                    </TouchableOpacity>
                    <ScrollView
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_TABS_BLOCK_STYLE')}
                        horizontal={true}
                    >
                        {
                            this.state.items.map((item, index) => {
                                return (
                                    <TouchableOpacity
                                        style={[
                                            this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_TABS_TAB_BUTTON_STYLE'),
                                            (this.state.selected === index ? this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_TABS_TAB_BUTTON_ACTIVE_STYLE') : {})
                                        ]}
                                        activeOpacity={0.5}
                                        onPress={() => { this.changeStickerTab(index) }}
                                        key={`sticker_tab_${item.catId}`}
                                    >
                                        <Image
                                            style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_TABS_TAB_IMAGE_STYLE')}
                                            source={{
                                                uri: item.miniCover
                                            }}
                                        />
                                    </TouchableOpacity>
                                );
                            })
                        }
                    </ScrollView>
                    <TouchableOpacity
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_CLOSE_BUTTON_BLOCK_STYLE')}
                        activeOpacity={0.5}
                        onPress={this.props.onCloseButtonPressed}
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
                            this.state.items[this.state.selected].files.map((item, index) => {
                                return (
                                    <TouchableOpacity
                                        style={[
                                            this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_STICKERS_STICKER_BUTTON_STYLE'),
                                            { width: this.stickerSize, height: this.stickerSize }
                                        ]}
                                        activeOpacity={0.5}
                                        onPress={() => { this.onStickerPressed({ catId: this.state.items[this.state.selected].catId, url: item }) }}
                                        key={`sticker_${this.state.items[this.state.selected].catId}_${this.coreInstances.FileConverter.nameFromPath(item) ? this.coreInstances.FileConverter.nameFromPath(item) : index}`}
                                    >
                                        <Image
                                            style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_STICKERS_STICKER_IMAGE_STYLE')}
                                            source={{
                                                uri: item
                                            }}
                                        />
                                    </TouchableOpacity>
                                );
                            })
                        }
                    </ScrollView>
                </View>
            </View>
        );
    };
};

export default ChatInputStickerBlockComponent;