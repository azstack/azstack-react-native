import React from 'react';
import {
    View,
    Text
} from 'react-native';

class EmptyBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();
    }

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('EMPTY_BLOCK_STYLE')}
            >
                <Text
                    style={this.coreInstances.CustomStyle.getStyle('EMPTY_TEXT_STYLE')}
                >
                    {this.props.emptyText}
                </Text>
            </View>
        );
    };
};

export default EmptyBlockComponent;