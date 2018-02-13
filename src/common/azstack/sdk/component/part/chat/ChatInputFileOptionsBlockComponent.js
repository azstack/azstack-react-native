import React from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text
} from 'react-native';

class ChatInputFileOptionsBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();
    };

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_CONTENT_BLOCK_STYLE')}
            >
                <View
                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTIONS_BLOCK_STYLE')}
                >
                    <TouchableOpacity
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_OPTION_BUTTON_BLOCK_STYLE')}
                        activeOpacity={0.5}
                        onPress={this.props.onFileBoxOptionGalleryButtonPressed}
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
                        onPress={this.props.onFileBoxOptionCameraButtonPressed}
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
                        onPress={this.props.onFileBoxOptionFileButtonPressed}
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
                        onPress={this.props.onFileBoxOptionLocationButtonPressed}
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
                        onPress={this.props.onFileBoxOptionVoiceButtonPressed}
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
                        onPress={this.props.onFileBoxOptionDrawingButtonPressed}
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
                    onPress={this.props.onCloseButtonPressed}
                >
                    <Text
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_FILE_BOX_CLOSE_BUTTON_TEXT_STYLE')}
                    >×</Text>
                </TouchableOpacity>
            </View>
        );
    };
};

export default ChatInputFileOptionsBlockComponent;