import React from 'react';
import {
    Alert,
    BackHandler,
    View,
    TouchableOpacity,
    Text,
    Image
} from 'react-native';
import { AudioRecorder, AudioUtils } from 'react-native-audio';
import Video from 'react-native-video';

class ChatInputAudioRecordBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.state = {
            recording: {
                isOn: false,
                time: 0
            },
            playback: {
                filePath: '',
                isOn: false,
                currentTime: 0,
                duration: 0
            }
        };
        this.intervalRecoringTime = null;

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);
        this.clearAndClose = this.clearAndClose.bind(this);

        this.onVideoLoadStart = this.onVideoLoadStart.bind(this);
        this.onVideoLoad = this.onVideoLoad.bind(this);
        this.onVideoProcess = this.onVideoProcess.bind(this);
        this.onVideoEnd = this.onVideoEnd.bind(this);
        this.onVideoError = this.onVideoError.bind(this);
        this.onVideoBuffer = this.onVideoBuffer.bind(this);
        this.onVideoTimedMetadata = this.onVideoTimedMetadata.bind(this);

        this.onStartRecordingButtonPressed = this.onStartRecordingButtonPressed.bind(this);
        this.onStopRecordingButtonPressed = this.onStopRecordingButtonPressed.bind(this);
        this.onPlayButtonPressed = this.onPlayButtonPressed.bind(this);
        this.onPauseButtonPressed = this.onPauseButtonPressed.bind(this);
        this.onConfirmButtonPressed = this.onConfirmButtonPressed.bind(this);
        this.onCancelButtonPressed = this.onCancelButtonPressed.bind(this);
    };

    onHardBackButtonPressed() {
        this.clearAndClose();
        return true;
    };
    clearAndClose() {
        if (this.state.recording.isOn || this.state.playback.filePath) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_CONFIRM_TEXT'),
                this.coreInstances.Language.getText('CHAT_INPUT_DISCARD_RECORDED_AUDIO_CONFIRMATION_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_CANCEL_TEXT'), onPress: () => { } },
                    {
                        text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => {
                            if (this.state.recording.isOn) {
                                AudioRecorder.stopRecording();
                                clearInterval(this.intervalRecoringTime);
                            }
                            this.props.onCloseButtonPressed();
                        }
                    }
                ],
                { cancelable: true }
            );
            return;
        }
        this.props.onCloseButtonPressed();
    };

    prepareRecordingPath() {
        AudioRecorder.prepareRecordingAtPath(
            `${AudioUtils.DocumentDirectoryPath}/audio-record-${this.coreInstances.DateTimeFormatter.currentDatetimeString('-')}.aac`,
            {
                SampleRate: 22050,
                Channels: 1,
                AudioQuality: 'Low',
                AudioEncoding: 'aac',
                AudioEncodingBitRate: 32000
            }
        );
    };

    onVideoLoadStart(data) { };
    onVideoLoad(data) {
        this.setState({ playback: Object.assign({}, this.state.playback, { duration: data.duration }) });
    };
    onVideoProcess(data) {
        this.setState({ playback: Object.assign({}, this.state.playback, { currentTime: data.currentTime }) });
    };
    onVideoEnd(data) {
        this.setState({ playback: Object.assign({}, this.state.playback, { isOn: false, currentTime: 0 }) });
    };
    onVideoError(data) {
        this.setState({ playback: Object.assign({}, this.state.playback, { isOn: false }) });
    };
    onVideoBuffer(data) { };
    onVideoTimedMetadata(data) { };

    async onStartRecordingButtonPressed() {
        this.prepareRecordingPath();
        this.setState({ recording: Object.assign({}, this.state.recording, { isOn: true, time: 0 }) });
        this.intervalRecoringTime = setInterval(() => {
            this.setState({ recording: Object.assign({}, this.state.recording, { time: this.state.recording.time + 1 }) });
        }, 1000);
        const filePath = await AudioRecorder.startRecording();
    };
    async onStopRecordingButtonPressed() {
        const filePath = await AudioRecorder.stopRecording();
        clearInterval(this.intervalRecoringTime);
        this.setState({
            recording: Object.assign({}, this.state.recording, { isOn: false, time: 0 }),
            playback: Object.assign({}, this.state.playback, { filePath: `file://${filePath}` })
        });
    };
    onPlayButtonPressed() {
        this.setState({ playback: Object.assign({}, this.state.playback, { isOn: true, time: 0 }) });
    };
    onPauseButtonPressed() {
        this.setState({ playback: Object.assign({}, this.state.playback, { isOn: false }) });
    };
    onConfirmButtonPressed() {
        this.props.onAudioFileGenerated(this.state.playback.filePath);
        this.setState({
            recording: Object.assign({}, this.state.recording, { isOn: false, time: 0 }),
            playback: Object.assign({}, this.state.playback, { filePath: '', isOn: false, currentTime: 0, duration: 0 })
        });
    };
    onCancelButtonPressed() {
        Alert.alert(
            this.coreInstances.Language.getText('ALERT_TITLE_CONFIRM_TEXT'),
            this.coreInstances.Language.getText('CHAT_INPUT_DISCARD_RECORDED_AUDIO_CONFIRMATION_TEXT'),
            [
                { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_CANCEL_TEXT'), onPress: () => { } },
                {
                    text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => {
                        this.setState({
                            recording: Object.assign({}, this.state.recording, { isOn: false, time: 0 }),
                            playback: Object.assign({}, this.state.playback, { filePath: '', isOn: false, currentTime: 0, duration: 0 })
                        });
                    }
                }
            ],
            { cancelable: true }
        );
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
                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_CONTENT_BLOCK_STYLE')}
            >
                <View
                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_AUDIO_RECORDING_BLOCK_STYLE')}
                >
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_AUDIO_RECORDING_TIME_BLOCK_STYLE')}
                    >
                        {
                            !this.state.playback.filePath && (
                                <Text
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_AUDIO_RECORDING_TIME_TEXT_STYLE')}
                                >
                                    {this.coreInstances.FileConverter.timeAsString(this.state.recording.time)}
                                </Text>
                            )
                        }
                        {
                            !!this.state.playback.filePath && (
                                <Text
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_AUDIO_RECORDING_TIME_TEXT_STYLE')}
                                >
                                    {this.coreInstances.FileConverter.timeAsString(this.state.playback.currentTime)}
                                    /
                                    {this.coreInstances.FileConverter.timeAsString(this.state.playback.duration)}
                                </Text>
                            )
                        }
                    </View>
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_AUDIO_RECORDING_CONTROL_BLOCK_STYLE')}
                    >
                        {
                            !!this.state.playback.filePath && (
                                <TouchableOpacity
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_AUDIO_RECORDING_CONTROL_CANCEL_BUTTON_STYLE')}
                                    activeOpacity={0.5}
                                    onPress={this.onCancelButtonPressed}
                                >
                                    <Text
                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_AUDIO_RECORDING_CONTROL_CANCEL_TEXT_STYLE')}
                                    >×</Text>
                                </TouchableOpacity>
                            )
                        }
                        {
                            !this.state.playback.filePath && (
                                <TouchableOpacity
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_AUDIO_RECORDING_CONTROL_MAIN_BUTTON_STYLE')}
                                    activeOpacity={0.5}
                                    onPress={this.state.recording.isOn ? this.onStopRecordingButtonPressed : this.onStartRecordingButtonPressed}
                                >
                                    {
                                        !this.state.recording.isOn && (
                                            <Image
                                                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_AUDIO_RECORDING_CONTROL_MAIN_IMAGE_STYLE')}
                                                source={this.coreInstances.CustomStyle.getImage('IMAGE_VOICE')}
                                            />
                                        )
                                    }
                                    {
                                        this.state.recording.isOn && (
                                            <Image
                                                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_AUDIO_RECORDING_CONTROL_MAIN_IMAGE_BIG_STYLE')}
                                                source={this.coreInstances.CustomStyle.getImage('IMAGE_PAUSE_ICON_ONLY')}
                                            />
                                        )
                                    }
                                </TouchableOpacity>
                            )
                        }
                        {
                            !!this.state.playback.filePath && (
                                <TouchableOpacity
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_AUDIO_RECORDING_CONTROL_MAIN_BUTTON_STYLE')}
                                    activeOpacity={0.5}
                                    onPress={this.state.playback.isOn ? this.onPauseButtonPressed : this.onPlayButtonPressed}
                                >
                                    {
                                        !this.state.playback.isOn && (
                                            <Image
                                                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_AUDIO_RECORDING_CONTROL_MAIN_IMAGE_BIG_STYLE')}
                                                source={this.coreInstances.CustomStyle.getImage('IMAGE_PLAY_ICON_ONLY')}
                                            />
                                        )
                                    }
                                    {
                                        this.state.playback.isOn && (
                                            <Image
                                                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_AUDIO_RECORDING_CONTROL_MAIN_IMAGE_BIG_STYLE')}
                                                source={this.coreInstances.CustomStyle.getImage('IMAGE_PAUSE_ICON_ONLY')}
                                            />
                                        )
                                    }
                                </TouchableOpacity>
                            )
                        }
                        {
                            !!this.state.playback.filePath && (
                                <TouchableOpacity
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_AUDIO_RECORDING_CONTROL_CONFIRM_BUTTON_STYLE')}
                                    activeOpacity={0.5}
                                    onPress={this.onConfirmButtonPressed}
                                >
                                    <Text
                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_AUDIO_RECORDING_CONTROL_CONFIRM_TEXT_STYLE')}
                                    >✓</Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>
                    {
                        !!this.state.playback.filePath && (
                            <Video source={{ uri: this.state.playback.filePath }}
                                rate={1.0}
                                volume={1.0}
                                muted={false}
                                paused={!this.state.playback.isOn}
                                resizeMode='cover'
                                repeat={false}
                                playInBackground={false}
                                playWhenInactive={false}
                                ignoreSilentSwitch={'ignore'}
                                progressUpdateInterval={250.0}
                                onLoadStart={this.onVideoLoadStart}
                                onLoad={this.onVideoLoad}
                                onProgress={this.onVideoProcess}
                                onEnd={this.onVideoEnd}
                                onError={this.onVideoError}
                                onBuffer={this.onVideoBuffer}
                                onTimedMetadata={this.onVideoTimedMetadata}
                            />
                        )
                    }
                </View>
                <TouchableOpacity
                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_CLOSE_BUTTON_BLOCK_STYLE')}
                    activeOpacity={0.5}
                    onPress={this.clearAndClose}
                >
                    <Text
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_CLOSE_BUTTON_TEXT_STYLE')}
                    >×</Text>
                </TouchableOpacity>
            </View>
        );
    };
};

export default ChatInputAudioRecordBlockComponent;