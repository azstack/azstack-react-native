import React from 'react';
import {
    Alert,
    Platform,
    PermissionsAndroid,
    BackHandler,
    View,
    TouchableOpacity,
    Text,
    Image
} from 'react-native';

class ChatInputRecordingBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.permissions = {
            microphone: false
        };

        this.state = {
            recording: {
                isOn: false,
                time: 0,
                filePath: ''
            },
            playback: {
                isOn: false,
                currentTime: 0,
                totalTime: 0
            }
        };

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);
        this.clearAndClose = this.clearAndClose.bind(this);

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
        this.props.onCloseButtonPressed();
    };

    checkPermission() {
        if (Platform.OS !== 'android') {
            this.permissions.microphone = true;
            return;
        }

        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
            title: this.coreInstances.Language.getText('PERMISSION_REQUEST_MICROPHONE_TITLE_TEXT'),
            message: this.coreInstances.Language.getText('PERMISSION_REQUEST_MICROPHONE_DESCRIPTION_TEXT')
        }).then((result) => {
            if (result === PermissionsAndroid.RESULTS.GRANTED) {
                this.permissions.microphone = true;
            }
        });
    };

    onStartRecordingButtonPressed() {
        if (!this.permissions.microphone) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('CHAT_INPUT_NO_MICROPHONE_PERMISSION_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
            return;
        }
    };
    onStopRecordingButtonPressed() { };
    onPlayButtonPressed() { };
    onPauseButtonPressed() { };
    onConfirmButtonPressed() { };
    onCancelButtonPressed() { };

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
        this.checkPermission();
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
                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_BLOCK_STYLE')}
                >
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_TIME_BLOCK_STYLE')}
                    >
                        {
                            !this.state.recording.filePath && (
                                <Text
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_TIME_TEXT_STYLE')}
                                >
                                    {this.coreInstances.FileConverter.timeAsString(this.state.recording.time)}
                                </Text>
                            )
                        }
                        {
                            !!this.state.recording.filePath && (
                                <Text
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_TIME_TEXT_STYLE')}
                                >
                                    {this.coreInstances.FileConverter.timeAsString(this.state.playback.currentTime)}
                                    /
                                    {this.coreInstances.FileConverter.timeAsString(this.state.playback.totalTime)}
                                </Text>
                            )
                        }
                    </View>
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_CONTROL_BLOCK_STYLE')}
                    >
                        {
                            !!this.state.recording.filePath && (
                                <TouchableOpacity
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_CONTROL_CANCEL_BUTTON_STYLE')}
                                    activeOpacity={0.5}
                                    onPress={this.onCancelButtonPressed}
                                >
                                    <Text
                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_CONTROL_CANCEL_TEXT_STYLE')}
                                    >×</Text>
                                </TouchableOpacity>
                            )
                        }
                        {
                            !this.state.recording.filePath && (
                                <TouchableOpacity
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_CONTROL_MAIN_BUTTON_STYLE')}
                                    activeOpacity={0.5}
                                    onPress={this.state.recording.isOn ? this.onStopRecordingButtonPressed : this.onStartRecordingButtonPressed}
                                >
                                    {
                                        !this.state.recording.isOn && (
                                            <Image
                                                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_CONTROL_MAIN_IMAGE_STYLE')}
                                                source={this.coreInstances.CustomStyle.getImage('IMAGE_VOICE')}
                                            />
                                        )
                                    }
                                    {
                                        this.state.recording.isOn && (
                                            <Image
                                                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_CONTROL_MAIN_IMAGE_STYLE')}
                                                source={this.coreInstances.CustomStyle.getImage('IMAGE_PAUSE')}
                                            />
                                        )
                                    }
                                </TouchableOpacity>
                            )
                        }
                        {
                            !!this.state.recording.filePath && (
                                <TouchableOpacity
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_CONTROL_MAIN_BUTTON_STYLE')}
                                    activeOpacity={0.5}
                                    onPress={this.state.playback.isOn ? this.onPauseButtonPressed : this.onPlayButtonPressed}
                                >
                                    {
                                        !this.state.playback.isOn && (
                                            <Image
                                                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_CONTROL_MAIN_IMAGE_STYLE')}
                                                source={this.coreInstances.CustomStyle.getImage('IMAGE_PLAY')}
                                            />
                                        )
                                    }
                                    {
                                        this.state.playback.isOn && (
                                            <Image
                                                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_CONTROL_MAIN_IMAGE_STYLE')}
                                                source={this.coreInstances.CustomStyle.getImage('IMAGE_PAUSE')}
                                            />
                                        )
                                    }
                                </TouchableOpacity>
                            )
                        }
                        {
                            !!this.state.recording.filePath && (
                                <TouchableOpacity
                                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_CONTROL_CONFIRM_BUTTON_STYLE')}
                                    activeOpacity={0.5}
                                    onPress={this.onConfirmButtonPressed}
                                >
                                    <Text
                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_CONTROL_CONFIRM_TEXT_STYLE')}
                                    >✓</Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>
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

export default ChatInputRecordingBlockComponent;