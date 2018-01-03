import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image
} from 'react-native';

class ScreenHeaderBlockComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View
                style={this.props.CustomStyle.getStyle('SCREEN_HEADER_BLOCK_STYLE')}
            >
                <TouchableOpacity
                    style={this.props.CustomStyle.getStyle('SCREEN_HEADER_BACK_BUTTON_STYLE')}
                    activeOpacity={0.5}
                    onPress={this.props.onBackButtonPressed}
                >
                    <Image
                        style={this.props.CustomStyle.getStyle('SCREEN_HEADER_BACK_BUTTON_IMAGE_STYLE')}
                        source={require('../../static/image/back.png')}
                    />
                </TouchableOpacity>
                <Text
                    style={this.props.CustomStyle.getStyle('SCREEN_HEADER_TITLE_TEXT_STYLE')}
                >
                    {this.props.title}
                </Text>
            </View>
        );
    };
};

export default ScreenHeaderBlockComponent;