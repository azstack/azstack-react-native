import React from 'react';
import {
    View,
    TouchableOpacity,
    Slider
} from 'react-native';

class SketchDrawingSettingBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.colors = ['#000', '#4C87B9', '#1BA39C', '#E35B5A', '#5E738B', '#C49F47', '#F3C200', '#95A5A6', '#C8D046', '#8775A7'];

        this.state = {
            color: props.initialColor,
            size: props.initialSize
        };

        this.onColorPressed = this.onColorPressed.bind(this);
    };

    onColorPressed(color) {
        this.setState({ color: color });
        this.props.onColorSelected(color);
    };

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('SKETCH_DRAWING_SETTING_BLOCK_STYLE')}
            >
                <View
                    style={this.coreInstances.CustomStyle.getStyle('SKETCH_DRAWING_SETTING_COLORS_BLOCK_STYLE')}
                >
                    {
                        this.colors.map((color) => {
                            return (
                                <TouchableOpacity
                                    key={`sketch_setting_color_${color}`}
                                    activeOpacity={0.5}
                                    onPress={() => this.onColorPressed(color)}
                                >
                                    <View
                                        style={[
                                            this.coreInstances.CustomStyle.getStyle('SKETCH_DRAWING_SETTING_COLOR_BLOCK_STYLE'),
                                            {
                                                backgroundColor: color
                                            },
                                            (color == this.state.color ? this.coreInstances.CustomStyle.getStyle('SKETCH_DRAWING_SETTING_COLOR_SELECTED_STYLE') : {})
                                        ]}
                                    />
                                </TouchableOpacity>
                            );
                        })
                    }
                </View>
                <Slider
                    style={this.coreInstances.CustomStyle.getStyle('SKETCH_DRAWING_SETTING_SIZE_BLOCK_STYLE')}
                    minimumValue={1}
                    maximumValue={5}
                    step={1}
                    value={this.state.size}
                    onSlidingComplete={this.props.onSizeSelected}
                />
            </View>
        );
    };
};

export default SketchDrawingSettingBlockComponent;