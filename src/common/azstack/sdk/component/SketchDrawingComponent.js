import React from 'react';
import {
    Alert,
    BackHandler,
    View,
    TouchableOpacity,
    Text,
    Image
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import SketchDrawingHeaderBlockComponent from './part/drawing/SketchDrawingHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';

class SketchDrawingComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);
        this.clearAndClose = this.clearAndClose.bind(this);
    };

    onHardBackButtonPressed() {
        this.clearAndClose();
        return true;
    };
    clearAndClose() {
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
                    onDoneButtonPressed={() => { }}
                    title={this.coreInstances.Language.getText('SKETCH_DRAWING_HEADER_TITLE_TEXT')}
                />
                <ScreenBodyBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    style={this.props.contentContainerStyle}
                >
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    };
};

export default SketchDrawingComponent;