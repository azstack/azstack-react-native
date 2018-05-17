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
    };

    onHardBackButtonPressed() {
        this.props.onBackButtonPressed();
        return true;
    };

    onPhoneNumberPressed(phoneNumber) {
        this.props.onSelectDone({
            phoneNumber: phoneNumber
        });
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
                <View
                    style={this.coreInstances.CustomStyle.getStyle('SELECT_PHONE_NUMBER_BLOCK_STYLE')}
                >
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('SELECT_PHONE_NUMBER_CONTENT_BLOCK_STYLE')}
                        onPress={() => this.props.onBackButtonPressed()}
                    >
                        {
                            this.props.phoneNumbers.map((phoneNumber) => {
                                return (
                                    <TouchableOpacity
                                        key={`phone_number_${phoneNumber}`}
                                        style={this.coreInstances.CustomStyle.getStyle('SELECT_PHONE_NUMBER_ITEM_BLOCK_STYLE')}
                                        activeOpacity={0.5}
                                        onPress={() => this.onPhoneNumberPressed(phoneNumber)}
                                    >
                                        <Text
                                            style={this.coreInstances.CustomStyle.getStyle('SELECT_PHONE_NUMBER_ITEM_TEXT_STYLE')}
                                        >
                                            {phoneNumber}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })
                        }
                        <TouchableOpacity
                            style={this.coreInstances.CustomStyle.getStyle('SELECT_PHONE_NUMBER_CANCEL_BUTTON_BLOCK_STYLE')}
                            activeOpacity={0.5}
                            onPress={() => this.props.onBackButtonPressed()}
                        >
                            <Text
                                style={this.coreInstances.CustomStyle.getStyle('SELECT_PHONE_NUMBER_CANCEL_BUTTON_TITLE_STYLE')}
                            >
                                {this.coreInstances.Language.getText('SELECT_PHONE_NUMBER_CANCEL_BUTTON_TITLE_TEXT')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScreenBlockComponent>
        );
    };
};

export default SelectPhoneNumberComponent;