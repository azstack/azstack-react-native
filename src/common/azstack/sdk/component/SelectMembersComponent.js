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

        this.state = {
            members: [],
            selectedMembers: [],
            searchText: ''
        };
        this.shouldCallGetInitialMembers = false;
        this.callingGetInitialMembers = false;
        this.callingGetMoreMembers = false;

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);

        this.onSearchTextChanged = this.onSearchTextChanged.bind(this);
        this.onSearchTextCleared = this.onSearchTextCleared.bind(this);

        this.onDoneButtonPressed = this.onDoneButtonPressed.bind(this);
        this.onMemberPressed = this.onMemberPressed.bind(this);
    };

    onHardBackButtonPressed() {
        this.props.onBackButtonPressed();
        return true;
    };

    initRun() {
        this.getInitialMembers();
    };
    getInitialMembers() {

        if (!this.coreInstances.AZStackCore.slaveSocketConnected) {
            return;
        }

        if (this.callingGetInitialMembers || this.callingGetMoreMembers) {
            this.shouldCallGetInitialMembers = true;
            return;
        }

        this.callingGetInitialMembers = true;

        this.coreInstances.Member.getInitialMembers({ searchText: this.state.searchText }).then((initialMembers) => {
            if (!initialMembers || !Array.isArray(initialMembers) || initialMembers.length === 0) {
                return new Promise((resolve, reject) => {
                    reject();
                });
            }

            let validatedMembers = initialMembers.filter((member) => {
                return typeof member === 'string';
            });
            if (validatedMembers.length === 0) {
                return new Promise((resolve, reject) => {
                    reject();
                });
            }

            return this.coreInstances.AZStackCore.getUsersInformation({
                azStackUserIds: validatedMembers
            });

        }).then((result) => {
            this.setState({ members: result.list });

            this.callingGetInitialMembers = false;
            if (this.shouldCallGetInitialMembers) {
                this.shouldCallGetInitialMembers = false;
                this.getInitialMembers();
            }
        }).catch((error) => {
            this.setState({ members: [] });

            this.callingGetInitialMembers = false;
            if (this.shouldCallGetInitialMembers) {
                this.shouldCallGetInitialMembers = false;
                this.getInitialMembers();
            }
        });

    };
    getMoreMembers() {
        console.log('get more member');
        return;

        if (!this.coreInstances.AZStackCore.slaveSocketConnected) {
            return;
        }

        if (this.callingGetInitialMembers || this.callingGetMoreMembers) {
            return;
        }

        this.callingGetMoreMembers = true;

        this.coreInstances.Member.getMoreMembers({ searchText: this.state.searchText }).then((moreMembers) => {
            if (!moreMembers || !Array.isArray(moreMembers) || moreMembers.length === 0) {
                return new Promise((resolve, reject) => {
                    reject();
                });
            }

            let validatedMembers = moreMembers.filter((member) => {
                return typeof member === 'string';
            });
            if (validatedMembers.length === 0) {
                return new Promise((resolve, reject) => {
                    reject();
                });
            }

            return this.coreInstances.AZStackCore.getUsersInformation({
                azStackUserIds: validatedMembers
            });

        }).then((result) => {
            let members = [...this.state.members, ...result.list];
            this.setState({ members: members });

            this.callingGetMoreMembers = false;
            if (this.shouldCallGetInitialMembers) {
                this.shouldCallGetInitialMembers = false;
                this.getInitialMembers();
            }
        }).catch((error) => {
            this.callingGetMoreMembers = false;
            if (this.shouldCallGetInitialMembers) {
                this.shouldCallGetInitialMembers = false;
                this.getInitialMembers();
            }
        });
    };

    addSubscriptions() {
        this.subscriptions.onConnected = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_CONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
        this.subscriptions.onAutoReconnected = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_AUTO_RECONNECTED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
        this.subscriptions.onReconnected = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_RECONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

    onSearchTextChanged(newText) {
        this.setState({ searchText: newText }, () => {
            if (this.callingGetInitialMembers || this.callingGetMoreMembers) {
                this.shouldCallGetInitialMembers = true;
                return;
            }
            this.getInitialMembers();
        });
    };
    onSearchTextCleared() {
        this.setState({ searchText: '' }, () => {
            if (this.callingGetInitialMembers || this.callingGetMoreMembers) {
                this.shouldCallGetInitialMembers = true;
                return;
            }
            this.getInitialMembers();
        });
    };
    getGroupedMembers() {
        let availableMembers = this.state.members;

        if (this.props.ignoreMembers) {
            availableMembers = this.state.members.filter((member) => {
                return this.props.ignoreMembers.indexOf(member.userId) === -1;
            });
        }

        let groupedMembers = [];
        availableMembers.map((member) => {
            if (this.isMemberSelected(member)) {
                return;
            }

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
                });
            }
        });

        if (this.state.selectedMembers.length > 0) {
            groupedMembers.push({
                title: this.coreInstances.Language.getText('SELECT_MEMBERS_SELECTED_TITLE_TEXT'),
                data: [...this.state.selectedMembers]
            });
        }

        groupedMembers.sort((a, b) => {
            if(a.title === this.coreInstances.Language.getText('SELECT_MEMBERS_SELECTED_TITLE_TEXT')) {
                return -1;
            }
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
        this.initRun();
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
                            keyExtractor={(item, index) => (`select_members_${item.userId}`)}
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
                            onEndReached={this.getMoreMembers()}
                            onEndReachedThreshold={0.1}
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