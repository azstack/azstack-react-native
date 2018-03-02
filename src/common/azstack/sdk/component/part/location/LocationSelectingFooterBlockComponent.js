import React from 'react';
import {
    View,
    TouchableOpacity,
    Text
} from 'react-native';

class LocationSelectingFooterBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();
    };

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('LOCATION_SELECTING_FOOTER_BLOCK_STYLE')}
            >
                <TouchableOpacity
                    style={this.coreInstances.CustomStyle.getStyle('LOCATION_SELECTING_FOOTER_SELECT_BUTTON_BLOCK_STYLE')}
                    activeOpacity={0.5}
                    onPress={this.props.selectLocationButtonPressed}
                >
                    <Text
                        style={this.coreInstances.CustomStyle.getStyle('LOCATION_SELECTING_FOOTER_SELECT_BUTTON_TEXT_BLOCK_STYLE')}
                    >
                        {this.coreInstances.Language.getText('LOCATION_SELECTING_SELECT_BUTTON_TITLE_TEXT')}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };
};

export default LocationSelectingFooterBlockComponent;