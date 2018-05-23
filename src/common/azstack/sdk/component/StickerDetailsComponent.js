import React from 'react';
import {
    Alert,
    BackHandler,
    Dimensions,
    Image,
    View,
    Text,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import RNFS from 'react-native-fs';
import { unzip, subscribe } from 'react-native-zip-archive';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';
import ConnectionBlockComponent from './part/common/ConnectionBlockComponent';

class StickerDetailsComponent extends React.Component {
    constructor(props) {

        super(props);

        this.coreInstances = props.getCoreInstances();

        this.state = {
            fullCoverSizes: {
                width: 0,
                height: 0
            },
            downloaded: false,
            process: {
                running: false,
                jobId: null,
                downloaded: '0%',
                extracted: '0%'
            }
        };

        this.zipProgress = null;

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);

        this.onDownloadButtonPressed = this.onDownloadButtonPressed.bind(this);
        this.onStopDownloadButtonPressed = this.onStopDownloadButtonPressed.bind(this);
        this.onRemoveButtonPressed = this.onRemoveButtonPressed.bind(this);
    };

    onHardBackButtonPressed() {
        this.props.onBackButtonPressed();
        return true;
    };

    getFullCoverSizes() {
        Image.getSize(this.props.sticker.urls.fullCover, (imageWidth, imageHeight) => {
            if (!imageWidth || !imageHeight) {
                return;
            }

            let imageSizes = {
                width: imageWidth,
                height: imageHeight
            };

            const { height, width } = Dimensions.get('window');

            if (imageWidth > width - 30) {
                imageSizes.width = width - 30;
                imageSizes.height = (width - 30) / imageWidth * imageHeight;
            }

            this.setState({ fullCoverSizes: imageSizes });
        });
    };
    checkStickerDownloaded() {
        RNFS.exists(`${RNFS.DocumentDirectoryPath}/stickers/${this.props.sticker.catId}`).then((isExist) => {
            this.setState({ downloaded: isExist });
        }).catch((error) => { });
    };
    registerZipProcessListener() {
        this.zipProgress = subscribe((data) => {
            this.setState({ process: Object.assign({}, this.state.process, { extracted: `${data.progress * 100}%` }) });
        });
    };
    unregisterZipProcessListener() {
        this.zipProgress.remove();
    };

    onDownloadButtonPressed() {
        let fileName = this.coreInstances.FileConverter.nameFromPath(this.props.sticker.urls.download);
        RNFS.exists(`${RNFS.DocumentDirectoryPath}/download`).then((isExist) => {
            if (isExist) {
                return new Promise((resolve, reject) => {
                    resolve();
                });
            }
            return RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/download`);
        }).then(() => {
            return new Promise((resolve, reject) => {
                let downloadProcess = null;
                downloadProcess = RNFS.downloadFile({
                    fromUrl: this.props.sticker.urls.download,
                    toFile: `${RNFS.DocumentDirectoryPath}/download/${fileName}`,
                    begin: (data) => {
                        this.setState({ process: Object.assign({}, this.state.process, { running: true, jobId: data.jobId, downloaded: '0%', extracted: '0%' }) });
                    },
                    progress: (data) => {
                        this.setState({ process: Object.assign({}, this.state.process, { downloaded: `${data.bytesWritten / data.contentLength * 100}%` }) });
                    }
                });
                downloadProcess.promise.then(() => {
                    this.setState({ process: Object.assign({}, this.state.process, { downloaded: '100%' }) });
                    resolve();
                }).catch((error) => {
                    this.setState({ process: Object.assign({}, this.state.process, { running: false, jobId: null, downloaded: '0%', extracted: '0%' }) });
                    Alert.alert(
                        this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                        this.coreInstances.Language.getText('STICKER_DETAILS_DOWNLOAD_ERROR_TEXT'),
                        [
                            { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                        ],
                        { cancelable: true }
                    );
                });
            });
        }).then(() => {
            RNFS.exists(`${RNFS.DocumentDirectoryPath}/stickers`).then((isExist) => {
                if (isExist) {
                    return new Promise((resolve, reject) => {
                        resolve();
                    });
                }
                return RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/stickers`);
            });
        }).then(() => {
            unzip(
                `${RNFS.DocumentDirectoryPath}/download/${fileName}`,
                `${RNFS.DocumentDirectoryPath}/stickers`
            ).then((path) => {
                this.setState({
                    process: Object.assign({}, this.state.process, { running: false, jobId: null, downloaded: '0%', extracted: '0%' }),
                    downloaded: true
                });
                this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_STICKER_PACKET_DOWNLOAD_STATUS_CHANGED, { error: null, result: { catId: this.props.sticker.catId, downloaded: true } });
            }).catch((error) => {
                this.setState({ process: Object.assign({}, this.state.process, { running: false, jobId: null, downloaded: '0%', extracted: '0%' }) });
                Alert.alert(
                    this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                    this.coreInstances.Language.getText('STICKER_DETAILS_EXTRACT_ERROR_TEXT'),
                    [
                        { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                    ],
                    { cancelable: true }
                );
            });
        }).catch((error) => {
            this.setState({ process: Object.assign({}, this.state.process, { running: false, jobId: null, downloaded: '0%', extracted: '0%' }) });
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
    onStopDownloadButtonPressed() {
        Alert.alert(
            this.coreInstances.Language.getText('ALERT_TITLE_CONFIRM_TEXT'),
            this.coreInstances.Language.getText('STICKER_DETAILS_STOP_DOWNLOAD_CONFIRM_TEXT'),
            [
                { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_CANCEL_TEXT'), onPress: () => { } },
                {
                    text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => {
                        if (this.state.process.jobId !== null && this.state.process.downloaded !== '100%') {
                            RNFS.stopDownload(this.state.process.jobId);
                            this.setState({ process: Object.assign({}, this.state.process, { running: false, jobId: null, downloaded: '0%', extracted: '0%' }) });
                        }
                    }
                }
            ],
            { cancelable: true }
        );
    };
    onRemoveButtonPressed() {
        Alert.alert(
            this.coreInstances.Language.getText('ALERT_TITLE_CONFIRM_TEXT'),
            this.coreInstances.Language.getText('STICKER_DETAILS_REMOVE_CONFIRM_TEXT'),
            [
                { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_CANCEL_TEXT'), onPress: () => { } },
                {
                    text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => {
                        RNFS.unlink(`${RNFS.DocumentDirectoryPath}/stickers/${this.props.sticker.catId}`).then(() => {
                            this.setState({ downloaded: false });
                            this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_STICKER_PACKET_DOWNLOAD_STATUS_CHANGED, { error: null, result: { catId: this.props.sticker.catId, downloaded: false } });
                        }).catch((error) => {
                            Alert.alert(
                                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                                this.coreInstances.Language.getText('STICKER_DETAILS_REMOVE_ERROR_TEXT'),
                                [
                                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                                ],
                                { cancelable: true }
                            );
                        });
                    }
                }
            ],
            { cancelable: true }
        );
    };

    componentDidMount() {
        if (this.props.withBackButtonHandler) {
            BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
        }
        this.getFullCoverSizes();
        this.checkStickerDownloaded();
        this.registerZipProcessListener();
    };
    componentWillUnmount() {
        if (this.props.withBackButtonHandler) {
            BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
        }
        this.unregisterZipProcessListener();
    };

    render() {
        return (
            <ScreenBlockComponent
                fullScreen={false}
                withStatusbar={this.props.withStatusbar}
                screenStyle={this.props.screenStyle}
                statusbarStyle={this.props.statusbarStyle}
                getCoreInstances={this.props.getCoreInstances}
            >
                {
                    (this.props.withHeader || (this.props.withHeader === undefined && this.coreInstances.defaultLayout.withHeader)) && (
                        <ScreenHeaderBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            onBackButtonPressed={this.props.onBackButtonPressed}
                            title={this.coreInstances.Language.getText('STICKER_DETAILS_HEADER_TITLE_TEXT')}
                        />
                    )
                }
                <ScreenBodyBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                >
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_MAIN_BLOCK_STYLE')}
                    >
                        <Image
                            style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_MINI_COVER_IMAGE')}
                            source={{
                                uri: this.props.sticker.urls.miniCover
                            }}
                        />
                        <View
                            style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_LEFT_CONTENT_STYLE')}
                        >
                            <View
                                style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_CONTENT_STYLE')}
                            >
                                <Text
                                    style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_NAME_TEXT_STYLE')}
                                >
                                    {this.props.sticker.name}
                                </Text>
                                {
                                    !this.state.downloaded && !this.state.process.running && (
                                        <TouchableOpacity
                                            style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_ACTION_BUTTON_STYLE')}
                                            activeOpacity={0.5}
                                            onPress={this.onDownloadButtonPressed}
                                        >
                                            <Image
                                                style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_ACTION_BUTTON_IMAGE_STYLE')}
                                                source={this.coreInstances.CustomStyle.getImage('IMAGE_DOWNLOAD')}
                                            />
                                        </TouchableOpacity>
                                    )
                                }
                                {
                                    this.state.downloaded && !this.state.process.running && (
                                        <TouchableOpacity
                                            style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_ACTION_BUTTON_STYLE')}
                                            activeOpacity={0.5}
                                            onPress={this.onRemoveButtonPressed}
                                        >
                                            <Image
                                                style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_ACTION_BUTTON_IMAGE_STYLE')}
                                                source={this.coreInstances.CustomStyle.getImage('IMAGE_TRASH')}
                                            />
                                        </TouchableOpacity>
                                    )
                                }
                            </View>
                            {
                                this.state.process.running && (
                                    <View
                                        style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_DOWNLOAD_BLOCK_STYLE')}
                                    >
                                        <View
                                            style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_DOWNLOAD_LINES_BLOCK_STYLE')}
                                        >
                                            <View
                                                style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_DOWNLOAD_LENGTH_LINE_STYLE')}
                                            />
                                            <View
                                                style={[
                                                    this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_DOWNLOAD_DOWNLOADED_LINE_STYLE'),
                                                    { width: this.state.process.downloaded }
                                                ]}
                                            />
                                            <View
                                                style={[
                                                    this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_DOWNLOAD_EXTRACTING_LINE_STYLE'),
                                                    { width: this.state.process.extracted }
                                                ]}
                                            />
                                        </View>
                                        {
                                            this.state.process.downloaded !== '100%' && (
                                                <TouchableOpacity
                                                    style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_DOWNLOAD_STOP_BUTTON_BLOCK_STYLE')}
                                                    activeOpacity={0.5}
                                                    onPress={this.onStopDownloadButtonPressed}
                                                >
                                                    <Text
                                                        style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_DOWNLOAD_STOP_BUTTON_TEXT_STYLE')}
                                                    >×</Text>
                                                </TouchableOpacity>
                                            )
                                        }
                                    </View>
                                )
                            }
                            {
                                this.state.process.running && (
                                    <Text
                                        style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_DOWNLOAD_TITLE_TEXT_STYLE')}
                                    >
                                        {this.coreInstances.Language.getText(this.state.process.downloaded !== '100%' ? 'STICKER_DETAILS_DOWNLOAING_TITLE_TEXT' : 'STICKER_DETAILS_EXTRACTING_TITLE_TEXT')}
                                    </Text>
                                )
                            }
                        </View>
                    </View>
                    <ScrollView
                        style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_FULL_COVER_BLOCK_STYLE')}
                        contentContainerStyle={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_FULL_COVER_CONTAINER_BLOCK_STYLE')}
                    >
                        <Image
                            style={{ width: this.state.fullCoverSizes.width, height: this.state.fullCoverSizes.height }}
                            source={{ uri: this.props.sticker.urls.fullCover }}
                        />
                    </ScrollView>
                    <ConnectionBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                    />
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    };
};

export default StickerDetailsComponent;