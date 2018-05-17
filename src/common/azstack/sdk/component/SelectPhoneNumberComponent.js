import React from 'react';
import {
    BackHandler,
    View,
    Text,
    TouchableOpacity
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';

class SelectPhoneNumberComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);
        this.onPhoneNumberPressed = this.onPhoneNumberPressed.bind(this);
    };

    onHardBackButtonPressed() {
        this.props.onBackButtonPressed();
        return true;
    };

    onPhoneNumberPressed() {
        this.props.onSelectDone({});
        this.props.onDoneClose();
    };

    componentDidMount() {
        if (this.props.withBackButtonHandler) {
            BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
        }
    };
    componentWillUnmount() {
        if (this.props.withBackButtonHandler) {
            BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
        }
    };

    render() {
        return (
            <ScreenBlockComponent
                fullScreen={true}
                withStatusbar={this.props.withStatusbar}
                screenStyle={{
                    ...this.coreInstances.CustomStyle.getStyle('SELECT_PHONE_NUMBER_SCREEN_BLOCK_STYLE'),
                    ...this.props.screenStyle
                }}
                statusbarStyle={this.props.statusbarStyle}
                getCoreInstances={this.props.getCoreInstances}
            >
                
            </ScreenBlockComponent>
        );
    };
};

export default SelectPhoneNumberComponent;