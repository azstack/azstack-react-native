import React from 'react';
import {
    Platform,
    Alert,
    View,
    FlatList
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import SelectMembersHeaderBlockComponent from './part/select/SelectMembersHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import SearchBlockComponent from './part/common/SearchBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';
import SelectMemberBlockComponent from './part/select/SelectMemberBlockComponent';
import ConnectionBlockComponent from './part/common/ConnectionBlockComponent';

class SelectMembersComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();
        this.subscriptions = {};
        this.state = {
            members: this.coreInstances.members,
            selectedMembers: [],
            searchText: ''
        };

        this.onSearchTextChanged = this.onSearchTextChanged.bind(this);
        this.onSearchTextCleared = this.onSearchTextCleared.bind(this);

        this.onDoneButtonPressed = this.onDoneButtonPressed.bind(this);
        this.onMemberPressed = this.onMemberPressed.bind(this);
    };

    addSubscriptions() {
        this.subscriptions.onMembersChanged = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_MEMBERS_CHANGED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.setState({
                members: result
            });
        });
    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

    onSearchTextChanged(newText) {
        this.setState({ searchText: newText });
    };
    onSearchTextCleared() {
        this.setState({ searchText: '' });
    };
    getAvailableMembers() {
        let availableMembers = this.state.members.filter((member) => {
            return this.props.ignoreMembers.indexOf(member.userId) === -1;
        });
        if (!this.state.searchText) {
            return availableMembers;
        }
        let searchParts = this.state.searchText.toLowerCase().split(' ');
        return availableMembers.filter((member) => {
            let matched = false;
            for (let i = 0; i < searchParts.length; i++) {
                if (member.fullname.toLowerCase().indexOf(searchParts[i]) > -1) {
                    matched = true;
                    break;
                }
            }
            return matched;
        });
    };

    onDoneButtonPressed() {
        if (this.state.selectedMembers.length === 0) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_WARNING_TEXT'),
                this.coreInstances.Language.getText('SELECT_MEMBERS_UNSELECTED_WARNING_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
            return;
        }

        this.props.onSelectDone({
            selected: this.state.selectedMembers
        });
        this.props.onDoneClose();
    };
    onMemberPressed(event) {
        let selectedMembers = [...this.state.selectedMembers];
        let isSelected = false;
        for (let i = 0; i < selectedMembers.length; i++) {
            if (selectedMembers[i].userId === event.member.userId) {
                selectedMembers.splice(i, 1);
                isSelected = true;
            }
        }
        if (!isSelected) {
            selectedMembers.push(event.member);
        }
        this.setState({ selectedMembers: selectedMembers });
    };

    isMemberSelected(checkingMember) {
        let isSelected = false;
        for (let i = 0; i < this.state.selectedMembers.length; i++) {
            if (this.state.selectedMembers[i].userId === checkingMember.userId) {
                isSelected = true;
            }
        }
        if (isSelected) {
            return true;
        }
        return false;
    };

    componentDidMount() {
        this.addSubscriptions();
    };
    componentWillUnmount() {
        this.clearSubscriptions();
    };

    render() {
        return (
            <ScreenBlockComponent
                fullScreen={false}
                getCoreInstances={this.props.getCoreInstances}
                statusbar={this.props.statusbar}
                style={this.props.style}
            >
                <SelectMembersHeaderBlockComponent
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
                        style={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBERS_SEARCH_BLOCK_STYLE')}
                    >
                        <SearchBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            onSearchTextChanged={this.onSearchTextChanged}
                            onSearchTextCleared={this.onSearchTextCleared}
                            placeholder={this.coreInstances.Language.getText('SELECT_MEMBERS_SEARCH_PLACEHOLDER_TEXT')}
                        />
                    </View>
                    {
                        this.getAvailableMembers().length === 0 && <EmptyBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            emptyText={this.coreInstances.Language.getText('SELECT_MEMBERS_EMPTY_TEXT')}
                        />
                    }
                    {
                        this.getAvailableMembers().length > 0 && <FlatList
                            style={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBERS_LIST_STYLE')}
                            data={this.getAvailableMembers()}
                            keyExtractor={(item, index) => ('select_members_' + item.userId)}
                            renderItem={({ item }) => {
                                return (
                                    <SelectMemberBlockComponent
                                        getCoreInstances={this.props.getCoreInstances}
                                        member={item}
                                        isSelected={this.isMemberSelected(item)}
                                        onMemberPressed={this.onMemberPressed}
                                    />
                                );
                            }}
                            contentContainerStyle={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBERS_LIST_CONTENT_CONTAINER_STYLE')}
                            keyboardDismissMode={Platform.select({ ios: 'interactive', android: 'on-drag' })}
                        />
                    }
                    <ConnectionBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                    />
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    };
};

export default SelectMembersComponent;