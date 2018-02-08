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
import NewGroupHeaderBlockComponent from './part/group/NewGroupHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import ConnectionBlockComponent from './part/common/ConnectionBlockComponent';

class NewGroupComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.state = {
            groupName: '',
            groupType: ''
        };

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);

        this.onDoneButtonPressed = this.onDoneButtonPressed.bind(this);

        this.onGroupNameInputTextChanged = this.onGroupNameInputTextChanged.bind(this);
        this.onGroupTypeSelectChanged = this.onGroupTypeSelectChanged.bind(this);
    };

    onHardBackButtonPressed() {
        this.props.onBackButtonPressed();
        return true;
    };

    onDoneButtonPressed() {
        if (!this.state.groupName) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('NEW_GROUP_NAME_EMPTY_ERROR'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
            return;
        }

        if (this.state.groupType === '') {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('NEW_GROUP_TYPE_EMPTY_ERROR'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
            return;
        }

        this.props.onInputDone({
            groupName: this.state.groupName,
            groupType: this.state.groupType
        });
        this.props.onDoneClose();
    };

    onGroupNameInputTextChanged(newText) {
        this.setState({
            groupName: newText
        });
    };
    onGroupTypeSelectChanged(newValue, newIndex) {
        this.setState({
            groupType: newValue
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
                <NewGroupHeaderBlockComponent
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
                        style={this.coreInstances.CustomStyle.getStyle('NEW_GROUP_BLOCK_STYLE')}
                    >
                        <Text
                            style={this.coreInstances.CustomStyle.getStyle('NEW_GROUP_LABEL_TEXT_STYLE')}
                        >
                            {this.coreInstances.Language.getText('NEW_GROUP_NAME_LABEL_TEXT')}
                        </Text>
                        <TextInput
                            style={this.coreInstances.CustomStyle.getStyle('NEW_GROUP_GROUP_NAME_INPUT_STYLE')}
                            onChangeText={this.onGroupNameInputTextChanged}
                            value={this.state.groupName}
                            placeholder={this.coreInstances.Language.getText('NEW_GROUP_NAME_INPUT_PLACEHOLDER_TEXT')}
                            returnKeyType='done'
                            {
                            ...this.coreInstances.CustomStyle.getStyle('NEW_GROUP_GROUP_NAME_INPUT_PROPS_STYLE')
                            }
                        />
                        <Text
                            style={this.coreInstances.CustomStyle.getStyle('NEW_GROUP_LABEL_TEXT_STYLE')}
                        >
                            {this.coreInstances.Language.getText('NEW_GROUP_TYPE_LABEL_TEXT')}
                        </Text>
                        <Picker
                            style={this.coreInstances.CustomStyle.getStyle('NEW_GROUP_GROUP_TYPE_SELECT_STYLE')}
                            itemStyle={this.coreInstances.CustomStyle.getStyle('NEW_GROUP_GROUP_TYPE_ITEM_STYLE')}
                            selectedValue={this.state.groupType}
                            onValueChange={this.onGroupTypeSelectChanged}>
                            <Picker.Item label={this.coreInstances.Language.getText('NEW_GROUP_TYPE_SELECT_DEFAULT_TEXT')} value={''} />
                            <Picker.Item label={this.coreInstances.Language.getText('GROUP_TYPE_PRIVATE')} value={this.coreInstances.AZStackCore.groupConstants.GROUP_TYPE_PRIVATE} />
                            <Picker.Item label={this.coreInstances.Language.getText('GROUP_TYPE_PUBLIC')} value={this.coreInstances.AZStackCore.groupConstants.GROUP_TYPE_PUBLIC} />
                        </Picker>
                    </View>
                    <ConnectionBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                    />
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    };
};

export default NewGroupComponent;