import React from 'react';
import {
    View
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import SearchBlockComponent from './part/common/SearchBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';
import ConnectionBlockComponent from './part/common/ConnectionBlockComponent';

class SelectMembersComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();
        this.subscriptions = {};
        this.state = {
            members: this.coreInstances.members,
            searchText: ''
        };

        this.onSearchTextChanged = this.onSearchTextChanged.bind(this);
        this.onSearchTextCleared = this.onSearchTextCleared.bind(this);
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
        return [];
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
                <ScreenHeaderBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    onBackButtonPressed={this.props.onBackButtonPressed}
                    title={this.coreInstances.Language.getText('SELECT_MEMBERS_HEADER_TITLE_TEXT')}
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
                    <ConnectionBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                    />
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    };
};

export default SelectMembersComponent;