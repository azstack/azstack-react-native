import React from 'react';
import {
    BackHandler,
    Platform,
    Alert,
    View,
    Text,
    SectionList
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import SelectMembersHeaderBlockComponent from './part/select/SelectMembersHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import SearchBlockComponent from './part/common/SearchBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';
import SelectMemberBlockComponent from './part/select/SelectMemberBlockComponent';
import ConnectionBlockComponent from './part/common/ConnectionBlockComponent';
import member from '../handler/member';

class SelectMembersComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();
        this.subscriptions = {};

        let members = props.members ? [...props.members] : [...this.coreInstances.members];
        members.map((member) => {
            member.searchString = this.coreInstances.Diacritic.clear(member.fullname).toLowerCase();
        });
        this.state = {
            members: members,
            selectedMembers: [],
            searchText: ''
        };

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);

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

            if (this.props.members) {
                return;
            }

            let members = [...result];
            members.map((member) => {
                member.searchString = this.coreInstances.Diacritic.clear(member.fullname).toLowerCase();
            });
            this.setState({
                members: members
            });
        });
    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

    onHardBackButtonPressed() {
        this.props.onBackButtonPressed();
        return true;
    };

    onSearchTextChanged(newText) {
        this.setState({ searchText: newText });
    };
    onSearchTextCleared() {
        this.setState({ searchText: '' });
    };
    getGroupedMembers() {
        let availableMembers = this.state.members;

        if (this.props.ignoreMembers) {
            availableMembers = this.state.members.filter((member) => {
                return this.props.ignoreMembers.indexOf(member.userId) === -1;
            });
        }

        let filteredMembers = availableMembers;
        if (this.state.searchText) {
            let searchParts = this.coreInstances.Diacritic.clear(this.state.searchText).toLowerCase().split(' ');
            filteredMembers = availableMembers.filter((member) => {
                let matched = false;
                for (let i = 0; i < searchParts.length; i++) {
                    if (member.searchString.indexOf(searchParts[i]) > -1) {
                        matched = true;
                        break;
                    }
                }
                return matched;
            });
        }

        let groupedMembers = [];
        filteredMembers.map((member) => {
            let firstLetter = member.fullname[0].toUpperCase();
            let foundGroupedMember = false;
            for (let i = 0; i < groupedMembers.length; i++) {
                let groupedMember = groupedMembers[i];
                if (groupedMember.title === firstLetter) {
                    groupedMember.data.push(member);
                    foundGroupedMember = true;
                    break;
                }
            }
            if (!foundGroupedMember) {
                groupedMembers.push({
                    title: firstLetter,
                    data: [member]
                })
            }
        });

        groupedMembers.sort((a, b) => {
            return a.title > b.title ? 1 : -1;
        });
        groupedMembers.map((groupedMember) => {
            groupedMember.data.sort((a, b) => {
                return a.fullname > b.fullname ? 1 : -1;
            });
        });

        return groupedMembers;
    };

    onDoneButtonPressed() {
        if (this.state.selectedMembers.length === 0) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
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
        BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
    };
    componentWillUnmount() {
        this.clearSubscriptions();
        BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
    };

    render() {
        let groupedMembers = this.getGroupedMembers();
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
                    <SearchBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                        containerStyle={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBERS_SEARCH_BLOCK_STYLE')}
                        onSearchTextChanged={this.onSearchTextChanged}
                        onSearchTextCleared={this.onSearchTextCleared}
                        placeholder={this.coreInstances.Language.getText('SELECT_MEMBERS_SEARCH_PLACEHOLDER_TEXT')}
                    />
                    {
                        groupedMembers.length === 0 && <EmptyBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            emptyText={this.coreInstances.Language.getText('SELECT_MEMBERS_EMPTY_TEXT')}
                        />
                    }
                    {
                        groupedMembers.length > 0 && <SectionList
                            style={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBERS_LIST_STYLE')}
                            sections={groupedMembers}
                            keyExtractor={(item, index) => ('select_members_' + item.userId)}
                            renderSectionHeader={({ section }) => {
                                return (
                                    <Text
                                        style={this.coreInstances.CustomStyle.getStyle('SELECT_MEMBERS_SECTION_TITLE_TEXT_STYLE')}
                                    >
                                        {section.title}
                                    </Text>
                                );
                            }}
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