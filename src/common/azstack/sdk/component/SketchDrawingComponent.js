import React from 'react';
import {
    BackHandler,
    View,
    TouchableOpacity,
    Text,
    Image
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
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
        this.props.onBackButtonPressed();
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
                {this.props.header !== 'hidden' && <ScreenHeaderBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    onBackButtonPressed={() => this.clearAndClose()}
                    title={this.coreInstances.Language.getText('SKETCH_DRAWING_HEADER_TITLE_TEXT')}
                />}
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