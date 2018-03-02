import React from 'react';
import {
    View,
    TouchableOpacity,
    Text
} from 'react-native';

class LocationMapFooterBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();
    };

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('LOCATION_MAP_FOOTER_BLOCK_STYLE')}
            >
                <TouchableOpacity
                    style={this.coreInstances.CustomStyle.getStyle('LOCATION_MAP_FOOTER_OPEN_MAP_BUTTON_BLOCK_STYLE')}
                    activeOpacity={0.5}
                    onPress={this.props.openMapButtonPressed}
                >
                    <Text
                        style={this.coreInstances.CustomStyle.getStyle('LOCATION_MAP_FOOTER_OPEN_MAP_BUTTON_TEXT_BLOCK_STYLE')}
                    >
                        {this.coreInstances.Language.getText('LOCATION_MAP_OPEN_MAP_BUTTON_TITLE_TEXT')}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };
};

export default LocationMapFooterBlockComponent;