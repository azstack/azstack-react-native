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
                <Text
                    style={this.props.CustomStyle.getStyle('SCREEN_HEADER_TITLE_TEXT_STYLE')}
                >
                    {this.props.title}
                </Text>
                <View style={this.props.CustomStyle.getStyle('SCREEN_HEADER_BACK_BUTTON_STYLE')}>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={this.props.onBackButtonPressed}
                    >
                        <View style={this.props.CustomStyle.getStyle('SCREEN_HEADER_BACK_BUTTON_CONTAINER_STYLE')}>
                            <Image
                                style={this.props.CustomStyle.getStyle('SCREEN_HEADER_BACK_BUTTON_IMAGE_STYLE')}
                                source={this.props.CustomStyle.getImage('IMAGE_BACK')}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };
};

export default ScreenHeaderBlockComponent;