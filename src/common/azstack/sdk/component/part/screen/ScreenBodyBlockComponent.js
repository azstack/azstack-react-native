import React from 'react';
import {
    View
} from 'react-native';

class ScreenHeaderBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();
    };

    render() {
        return (
            <View
                style={{
                    ...this.coreInstances.CustomStyle.getStyle('SCREEN_BODY_BLOCK_STYLE'),
                    ...this.props.style,
                }}
            >
                {this.props.children}
            </View>
        );
    };
};

export default ScreenHeaderBlockComponent;