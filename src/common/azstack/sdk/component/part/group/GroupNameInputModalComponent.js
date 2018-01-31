import React from 'react';
import {
    Alert,
    Modal,
    TouchableWithoutFeedback,
    View,
    Text,
    TextInput,
    TouchableOpacity
} from 'react-native';

class GroupNameInputModalComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.state = {
            newGroupName: props.groupName
        };

        this.onGroupNameInputModalClose = this.onGroupNameInputModalClose.bind(this);
        this.onGroupNameInputModalDone = this.onGroupNameInputModalDone.bind(this);

        this.onNewNameTextChanged = this.onNewNameTextChanged.bind(this);
        this.clearNewNameText = this.clearNewNameText.bind(this);
    };

    onGroupNameInputModalClose() {
        this.props.onGroupNameInputModalClose();
    };
    onGroupNameInputModalDone() {

        if (!this.state.newGroupName) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('GROUP_NAME_INPUT_ERROR_EMPTY_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_CANCEL_TEXT'), onPress: () => { } },
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
            return;
        }

        this.props.onGroupNameInputModalDone({ newGroupName: this.state.newGroupName });
        this.props.onGroupNameInputModalClose();
    };

    onNewNameTextChanged(newText) {
        this.setState({ newGroupName: newText });
    };
    clearNewNameText() {
        this.setState({ newGroupName: '' });
    };

    componentDidMount() {
        setTimeout(() => {
            this.refs.TextInput.focus();
        }, 0);
    };

    render() {
        return (
            <Modal
                visible={true}
                animationType={'fade'}
                transparent={true}
                onRequestClose={this.onGroupNameInputModalClose}
            >
                <TouchableWithoutFeedback
                    onPress={this.onGroupNameInputModalClose}
                >
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('GROUP_NAME_INPUT_BACK_GROUD_BLOCK_STYLE')}
                    >
                        <TouchableWithoutFeedback
                            onPress={() => { }}
                        >
                            <View
                                style={this.coreInstances.CustomStyle.getStyle('GROUP_NAME_INPUT_CONTENT_BLOCK_STYLE')}
                            >
                                <Text
                                    style={this.coreInstances.CustomStyle.getStyle('GROUP_NAME_INPUT_TITLE_STYLE')}
                                >
                                    {this.props.title}
                                </Text>
                                <View
                                    style={this.coreInstances.CustomStyle.getStyle('GROUP_NAME_INPUT_INPUT_BLOCKS_STYLE')}
                                >
                                    <TextInput
                                        ref={'TextInput'}
                                        style={this.coreInstances.CustomStyle.getStyle('GROUP_NAME_INPUT_INPUT_STYLE')}
                                        onChangeText={this.onNewNameTextChanged}
                                        value={this.state.newGroupName}
                                        placeholder={this.props.placeholder}
                                        returnKeyType='done'
                                        {
                                        ...this.coreInstances.CustomStyle.getStyle('GROUP_NAME_INPUT_INPUT_PROPS_STYLE')
                                        }
                                    />
                                    {
                                        !!this.state.newGroupName && <TouchableOpacity
                                            style={this.coreInstances.CustomStyle.getStyle('GROUP_NAME_INPUT_CLEAR_BUTTON_BLOCK_STYLE')}
                                            activeOpacity={0.5}
                                            onPress={this.clearNewNameText}
                                        >
                                            <Text
                                                style={this.coreInstances.CustomStyle.getStyle('GROUP_NAME_INPUT_CLEAR_BUTTON_TEXT_STYLE')}
                                            >×</Text>
                                        </TouchableOpacity>
                                    }
                                </View>
                                <View
                                    style={this.coreInstances.CustomStyle.getStyle('GROUP_NAME_INPUT_BUTTON_BLOCKS_STYLE')}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.5}
                                        onPress={this.onGroupNameInputModalClose}
                                    >
                                        <Text
                                            style={this.coreInstances.CustomStyle.getStyle('GROUP_NAME_INPUT_BUTTON_TEXT_STYLE')}
                                        >
                                            {this.coreInstances.Language.getText('GROUP_NAME_INPUT_BUTTON_CANCEL_TEXT')}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        activeOpacity={0.5}
                                        onPress={this.onGroupNameInputModalDone}
                                    >
                                        <Text
                                            style={this.coreInstances.CustomStyle.getStyle('GROUP_NAME_INPUT_BUTTON_TEXT_STYLE')}
                                        >
                                            {this.coreInstances.Language.getText('GROUP_NAME_INPUT_BUTTON_DONE_TEXT')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    };
};

export default GroupNameInputModalComponent;