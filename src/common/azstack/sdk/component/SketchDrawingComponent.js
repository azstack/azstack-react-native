import React from 'react';
import {
    Alert,
    BackHandler,
    View,
    TouchableOpacity,
    Image
} from 'react-native';
import { SketchCanvas } from '@terrylinla/react-native-sketch-canvas';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import SketchDrawingHeaderBlockComponent from './part/drawing/SketchDrawingHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import SketchDrawingSettingBlockComponent from './part/drawing/SketchDrawingSettingBlockComponent';
import SketchDrawingFooterBlockComponent from './part/drawing/SketchDrawingFooterBlockComponent';


class SketchDrawingComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.state = {
            setting: {
                show: false
            },
            draw: {
                drawed: false,
                color: '#000',
                size: 3
            }
        };

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);
        this.clearAndClose = this.clearAndClose.bind(this);

        this.onSettingButtonPressed = this.onSettingButtonPressed.bind(this);
        this.onUndoButtonPressed = this.onUndoButtonPressed.bind(this);
        this.onClearButtonPressed = this.onClearButtonPressed.bind(this);
        this.onDoneButtonPressed = this.onDoneButtonPressed.bind(this);

        this.onColorSelected = this.onColorSelected.bind(this);
        this.onSizeSelected = this.onSizeSelected.bind(this);

        this.onSketchCanvasStrokeStart = this.onSketchCanvasStrokeStart.bind(this);
        this.onSketchCanvasPathsChange = this.onSketchCanvasPathsChange.bind(this);
    };

    onHardBackButtonPressed() {
        if (this.state.setting.show) {
            this.setState({ setting: Object.assign({}, this.state.setting, { show: false }) });
            return true;
        }
        this.clearAndClose();
        return true;
    };
    clearAndClose() {
        if (this.state.draw.drawed) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_CONFIRM_TEXT'),
                this.coreInstances.Language.getText('DISCARD_SKETCH_DRAWING_CONFIRMATION_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_CANCEL_TEXT'), onPress: () => { } },
                    {
                        text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => {
                            this.props.onBackButtonPressed();
                        }
                    }
                ],
                { cancelable: true }
            );
            return;
        }
        this.props.onBackButtonPressed();
    };

    onSettingButtonPressed() {
        this.setState({ setting: Object.assign({}, this.state.setting, { show: !this.state.setting.show }) });
    };
    onUndoButtonPressed() {
        this.refs.SketchCanvas.undo();
    };
    onClearButtonPressed() {
        this.refs.SketchCanvas.clear();
    };
    onDoneButtonPressed() {

        if (!this.state.draw.drawed) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('SKETCH_DRAWING_EMPTY_ERROR_TEXT'),
                [
                    {text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => {}}
                ],
                { cancelable: true }
            );
            return;
        }

        this.refs.SketchCanvas.getBase64('png', true, (error, result) => {
            if (error) {
                Alert.alert(
                    this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                    this.coreInstances.Language.getText('ALERT_GENERAL_ERROR_TEXT'),
                    [
                        { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                    ],
                    { cancelable: true }
                );
                return;
            }

            this.props.onImageBase64StringGenerated(result);
            this.props.onDoneClose();
        });
    };

    onColorSelected(color) {
        this.setState({ draw: Object.assign({}, this.state.draw, { color: color }) });
    };
    onSizeSelected(size) {
        this.setState({ draw: Object.assign({}, this.state.draw, { size: size }) });
    };

    onSketchCanvasStrokeStart() {
        if (this.state.setting.show) {
            this.setState({ setting: Object.assign({}, this.state.setting, { show: false }) });
        }
    };
    onSketchCanvasPathsChange(pathsCount) {
        if (pathsCount) {
            this.setState({ draw: Object.assign({}, this.state.draw, { drawed: true }) });
        } else {
            this.setState({ draw: Object.assign({}, this.state.draw, { drawed: false }) });
        }
    };

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
    };
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
    };

    render() {
        return (
            <ScreenBlockComponent
                fullScreen={false}
                getCoreInstances={this.props.getCoreInstances}
                statusbar={this.props.statusbar}
                style={this.props.style}
            >
                <SketchDrawingHeaderBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    onBackButtonPressed={this.clearAndClose}
                    onDoneButtonPressed={this.onDoneButtonPressed}
                    title={this.coreInstances.Language.getText('SKETCH_DRAWING_HEADER_TITLE_TEXT')}
                />
                <ScreenBodyBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    style={this.props.contentContainerStyle}
                >
                    <SketchCanvas
                        ref={'SketchCanvas'}
                        style={this.coreInstances.CustomStyle.getStyle('SKETCH_DRAWING_BLOCK_STYLE')}
                        strokeColor={this.state.draw.color}
                        strokeWidth={this.state.draw.size}
                        onStrokeStart={this.onSketchCanvasStrokeStart}
                        onPathsChange={this.onSketchCanvasPathsChange}
                    />
                    {
                        this.state.setting.show && (
                            <SketchDrawingSettingBlockComponent
                                initialColor={this.state.draw.color}
                                initialSize={this.state.draw.size}
                                getCoreInstances={this.props.getCoreInstances}
                                onColorSelected={this.onColorSelected}
                                onSizeSelected={this.onSizeSelected}
                            />
                        )
                    }
                </ScreenBodyBlockComponent>
                <SketchDrawingFooterBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    onSettingButtonPressed={this.onSettingButtonPressed}
                    onUndoButtonPressed={this.onUndoButtonPressed}
                    onClearButtonPressed={this.onClearButtonPressed}
                />
            </ScreenBlockComponent>
        );
    };
};

export default SketchDrawingComponent;