import React from 'react';
import {
    BackHandler,
    View,
    TouchableOpacity,
    Text,
    Image
} from 'react-native';

class ChatInputDrawingBlockComponent extends React.Component {
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

export default ChatInputDrawingBlockComponent;