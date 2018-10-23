import React from 'react';
import {
    BackHandler,
    TouchableWithoutFeedback,
    View,
    TouchableOpacity,
    Text
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';

class ActionsSheetComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);
    };

    onHardBackButtonPressed() {
        this.props.onBackButtonPressed();
        return true;
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
                    ...this.coreInstances.CustomStyle.getStyle('ACTIONS_SHEET_SCREEN_BLOCK_STYLE'),
                    ...this.props.screenStyle
                }}
                statusbarStyle={this.props.statusbarStyle}
                getCoreInstances={this.props.getCoreInstances}
            >
                <TouchableWithoutFeedback
                    onPress={this.props.onBackButtonPressed}
                >
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('ACTIONS_SHEET_BLOCK_STYLE')}
                    >
                        <TouchableWithoutFeedback
                            onPress={() => { }}
                        >
                            <View
                                style={this.coreInstances.CustomStyle.getStyle('ACTIONS_SHEET_CONTENT_BLOCK_STYLE')}
                            >
                                <View
                                    style={this.coreInstances.CustomStyle.getStyle('ACTIONS_SHEET_CONTENT_HEADER_BLOCK_STYLE')}
                                >
                                    <Text
                                        style={this.coreInstances.CustomStyle.getStyle('ACTIONS_SHEET_CONTENT_HEADER_TEXT_STYLE')}
                                    >
                                        {this.props.title}
                                    </Text>
                                </View>
                                <View
                                    style={this.coreInstances.CustomStyle.getStyle('ACTIONS_SHEET_CONTENT_BODY_BLOCK_STYLE')}
                                >
                                    {
                                        this.props.options.map((option, index) => {
                                            return (
                                                <TouchableOpacity
                                                    key={`azstack_actions_sheet_option_${index}`}
                                                    style={this.coreInstances.CustomStyle.getStyle('ACTIONS_SHEET_CONTENT_OPTION_BLOCK_STYLE')}
                                                    activeOpacity={0.5}
                                                    onPress={() => {
                                                        this.props.onOptionSelected(index);
                                                        this.props.onBackButtonPressed();
                                                    }}
                                                >
                                                    <Text
                                                        style={this.coreInstances.CustomStyle.getStyle('ACTIONS_SHEET_CONTENT_OPTION_TEXT_STYLE')}
                                                    >
                                                        {option}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })
                                    }
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableOpacity
                    style={this.coreInstances.CustomStyle.getStyle('ACTIONS_SHEET_CLOSE_BUTTON_BLOCK_STYLE')}
                    activeOpacity={0.5}
                    onPress={this.props.onBackButtonPressed}
                >
                    <Text
                        style={this.coreInstances.CustomStyle.getStyle('ACTIONS_SHEET_CLOSE_BUTTON_TEXT_STYLE')}
                    >×</Text>
                </TouchableOpacity>
            </ScreenBlockComponent >
        );
    };
};

export default ActionsSheetComponent;