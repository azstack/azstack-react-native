import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image
} from 'react-native';

class SketchDrawingFooterBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();
    };

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('SKETCH_DRAWING_FOOTER_BLOCK_STYLE')}
            >
                <TouchableOpacity
                    style={this.coreInstances.CustomStyle.getStyle('SKETCH_DRAWING_FOOTER_BUTTON_BLOCK_STYLE')}
                    activeOpacity={0.5}
                    onPress={this.props.onSettingButtonPressed}
                >
                    <Image
                        style={this.coreInstances.CustomStyle.getStyle('SKETCH_DRAWING_FOOTER_BUTTON_IMAGE_STYLE')}
                        source={this.coreInstances.CustomStyle.getImage('IMAGE_SETTING')}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={this.coreInstances.CustomStyle.getStyle('SKETCH_DRAWING_FOOTER_BUTTON_BLOCK_STYLE')}
                    activeOpacity={0.5}
                    onPress={this.props.onUndoButtonPressed}
                >
                    <Image
                        style={this.coreInstances.CustomStyle.getStyle('SKETCH_DRAWING_FOOTER_BUTTON_IMAGE_STYLE')}
                        source={this.coreInstances.CustomStyle.getImage('IMAGE_UNDO')}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={this.coreInstances.CustomStyle.getStyle('SKETCH_DRAWING_FOOTER_BUTTON_BLOCK_STYLE')}
                    activeOpacity={0.5}
                    onPress={this.props.onClearButtonPressed}
                >
                    <Image
                        style={this.coreInstances.CustomStyle.getStyle('SKETCH_DRAWING_FOOTER_BUTTON_IMAGE_STYLE')}
                        source={this.coreInstances.CustomStyle.getImage('IMAGE_ERASER')}
                    />
                </TouchableOpacity>
            </View>
        );
    };
};

export default SketchDrawingFooterBlockComponent;