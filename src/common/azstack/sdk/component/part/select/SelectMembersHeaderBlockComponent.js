import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image
} from 'react-native';

class SelectMembersHeaderBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();
    };

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBERS_HEADER_BLOCK_STYLE')}
            >
                <TouchableOpacity
                    style={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBERS_HEADER_BACK_BUTTON_STYLE')}
                    activeOpacity={0.5}
                    onPress={this.props.onBackButtonPressed}
                >
                    <Image
                        style={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBERS_HEADER_BACK_BUTTON_IMAGE_STYLE')}
                        source={this.coreInstances.CustomStyle.getImage('IMAGE_BACK')}
                    />
                </TouchableOpacity>
                <Text
                    style={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBERS_HEADER_TITLE_TEXT_STYLE')}
                >
                    {this.props.title}
                </Text>
                <TouchableOpacity
                    style={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBERS_HEADER_DONE_BUTTON_STYLE')}
                    activeOpacity={0.5}
                    onPress={this.props.onDoneButtonPressed}
                >
                    <Image
                        style={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBERS_HEADER_DONE_BUTTON_IMAGE_STYLE')}
                        source={this.coreInstances.CustomStyle.getImage('IMAGE_DONE')}
                    />
                </TouchableOpacity>
            </View>
        );
    };
};

export default SelectMembersHeaderBlockComponent;