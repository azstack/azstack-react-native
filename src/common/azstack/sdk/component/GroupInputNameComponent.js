import React from 'react';
import {
    BackHandler,
    Alert,
    View,
    Text,
    TextInput,
    TouchableOpacity
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';

class GroupInputNameComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.state = {
            groupName: ''
        };

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);

        this.onDoneButtonPressed = this.onDoneButtonPressed.bind(this);

        this.onGroupNameInputTextChanged = this.onGroupNameInputTextChanged.bind(this);
    };

    onHardBackButtonPressed() {
        this.props.onBackButtonPressed();
        return true;
    };

    onDoneButtonPressed() {
        if (!this.state.groupName) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('GROUP_INPUT_NAME_NAME_EMPTY_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
            return;
        }

        this.props.onInputDone({
            groupName: this.state.groupName
        });
        this.props.onDoneClose();
    };

    onGroupNameInputTextChanged(newText) {
        this.setState({
            groupName: newText
        });
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
                fullScreen={true}
                withStatusbar={this.props.withStatusbar}
                getCoreInstances={this.props.getCoreInstances}
                style={this.coreInstances.CustomStyle.getStyle('GROUP_INPUT_NAME_SCREEN_BLOCK_STYLE')}
            >
                <View
                    style={this.coreInstances.CustomStyle.getStyle('GROUP_INPUT_NAME_BLOCK_STYLE')}
                >
                    <Text
                        style={this.coreInstances.CustomStyle.getStyle('GROUP_INPUT_NAME_GROUP_NAME_TITLE_STYLE')}
                    >
                        {this.coreInstances.Language.getText('GROUP_INPUT_NAME_INPUT_TITLE_TEXT')}
                    </Text>
                    <TextInput
                        style={this.coreInstances.CustomStyle.getStyle('GROUP_INPUT_NAME_GROUP_NAME_INPUT_STYLE')}
                        onChangeText={this.onGroupNameInputTextChanged}
                        value={this.state.groupName}
                        placeholder={this.coreInstances.Language.getText('GROUP_INPUT_NAME_NAME_INPUT_PLACEHOLDER_TEXT')}
                        returnKeyType='done'
                        {
                        ...this.coreInstances.CustomStyle.getStyle('GROUP_INPUT_NAME_GROUP_NAME_INPUT_PROPS_STYLE')
                        }
                    />
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('GROUP_INPUT_NAME_BUTTON_BLOCK_STYLE')}
                    >
                        <TouchableOpacity
                            style={this.coreInstances.CustomStyle.getStyle('GROUP_INPUT_NAME_DONE_BUTTON_STYLE')}
                            activeOpacity={0.5}
                            onPress={this.onDoneButtonPressed}
                        >
                            <Text
                                style={this.coreInstances.CustomStyle.getStyle('GROUP_INPUT_NAME_DONE_BUTTON_TEXT_STYLE')}
                            >
                                {this.coreInstances.Language.getText('GROUP_INPUT_NAME_DONE_BUTTON_TITLE_TEXT')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={this.coreInstances.CustomStyle.getStyle('GROUP_INPUT_NAME_CANCEL_BUTTON_STYLE')}
                            activeOpacity={0.5}
                            onPress={this.props.onBackButtonPressed}
                        >
                            <Text
                                style={this.coreInstances.CustomStyle.getStyle('GROUP_INPUT_NAME_CANCEL_BUTTON_TEXT_STYLE')}
                            >
                                {this.coreInstances.Language.getText('GROUP_INPUT_NAME_CANCEL_BUTTON_TITLE_TEXT')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScreenBlockComponent>
        );
    };
};

export default GroupInputNameComponent;