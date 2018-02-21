import React from 'react';
import {
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

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);
        this.clearAndClose = this.clearAndClose.bind(this);
    };

    onHardBackButtonPressed() {
        this.clearAndClose();
        return true;
    };
    clearAndClose() {
        this.props.onCloseButtonPressed();
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
                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_BLOCK_STYLE')}
                >
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_TIME_BLOCK_STYLE')}
                    >
                        <Text
                            style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_TIME_TEXT_STYLE')}
                        >
                            {'00:00'}
                        </Text>
                    </View>
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_CONTROL_BLOCK_STYLE')}
                    >
                        <TouchableOpacity
                            style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_CONTROL_CANCEL_BUTTON_STYLE')}
                            activeOpacity={0.5}
                            onPress={() => { }}
                        >
                            <Text
                                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_CONTROL_CANCEL_TEXT_STYLE')}
                            >×</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_CONTROL_MAIN_BUTTON_STYLE')}
                            activeOpacity={0.5}
                            onPress={() => { }}
                        >
                            <Image
                                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_CONTROL_MAIN_IMAGE_STYLE')}
                                source={this.coreInstances.CustomStyle.getImage('IMAGE_VOICE')}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_CONTROL_CONFIRM_BUTTON_STYLE')}
                            activeOpacity={0.5}
                            onPress={() => { }}
                        >
                            <Text
                                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_RECORDING_CONTROL_CONFIRM_TEXT_STYLE')}
                            >✓</Text>
                        </TouchableOpacity>
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