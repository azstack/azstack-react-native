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

        this.coreInstances = props.getCoreInstances();
    }

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('SCREEN_HEADER_BLOCK_STYLE')}
            >
                <TouchableOpacity
                    style={this.coreInstances.CustomStyle.getStyle('SCREEN_HEADER_BACK_BUTTON_STYLE')}
                    activeOpacity={0.5}
                    onPress={this.props.onBackButtonPressed}
                >
                    <Image
                        style={this.coreInstances.CustomStyle.getStyle('SCREEN_HEADER_BACK_BUTTON_IMAGE_STYLE')}
                        source={this.coreInstances.CustomStyle.getImage('IMAGE_BACK')}
                    />
                </TouchableOpacity>
                <Text
                    style={this.coreInstances.CustomStyle.getStyle('SCREEN_HEADER_TITLE_TEXT_STYLE')}
                >
                    {this.props.title}
                </Text>
            </View>
        );
    };
};

export default ScreenHeaderBlockComponent;