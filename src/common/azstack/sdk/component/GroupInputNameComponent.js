import React from 'react';
import {
    BackHandler,
    Alert,
    View,
    Text,
    TextInput,
    Picker
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import GroupInputNameHeaderBlockComponent from './part/group/GroupInputNameHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import ConnectionBlockComponent from './part/common/ConnectionBlockComponent';

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
                this.coreInstances.Language.getText('GROUP_INPUT_NAME_NAME_EMPTY_ERROR'),
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
                fullScreen={false}
                getCoreInstances={this.props.getCoreInstances}
                statusbar={this.props.statusbar}
                style={this.props.style}
            >
                <GroupInputNameHeaderBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    onBackButtonPressed={this.props.onBackButtonPressed}
                    onDoneButtonPressed={this.onDoneButtonPressed}
                    title={this.props.headerTitle}
                />
                <ScreenBodyBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    style={this.props.contentContainerStyle}
                >
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('GROUP_INPUT_NAME_BLOCK_STYLE')}
                    >
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
                    </View>
                    <ConnectionBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                    />
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    };
};

export default GroupInputNameComponent;