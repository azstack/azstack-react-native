import React from 'react';
import {
    View,
    FlatList
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';
import SearchBlockComponent from './part/common/SearchBlockComponent';

import ConversationBlockComponent from './part/conversation/ConversationBlockComponent';

class ConversationsListComponent extends React.Component {
    constructor(props) {
        super(props);

        this.subscriptions = {};
        this.pagination = {
            page: 1,
            lastCreated: new Date().getTime(),
            loading: false,
            done: false
        };

        this.state = {
            conversations: []
        };

        this.onSearchTextChange = this.onSearchTextChange.bind(this);
        this.onSearchTextClear = this.onSearchTextClear.bind(this);
    };

    addSubscriptions() {
        this.subscriptions.onAuthenticated = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_AUTHENTICATED_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.getConversations();
        });
    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

    getConversations() {
        if (!this.props.AZStackCore.slaveSocketConnected) {
            return;
        }
        if (this.pagination.loading) {
            return;
        }
        if (this.pagination.done) {
            return;
        }

        this.pagination.loading = true;
        this.props.AZStackCore.getModifiedConversations({
            page: this.pagination.page,
            lastCreated: this.pagination.lastCreated
        }).then((result) => {
            this.prepareConversations(result.list).then((preparedConversations) => {
                this.pagination.loading = false;
                if (result.done === this.props.AZStackCore.listConstants.GET_LIST_DONE) {
                    this.pagination.done = true;
                }
                this.pagination.page += 1;
                this.setState({ conversations: this.state.conversations.concat(preparedConversations) });
            }).catch((error) => { });
        }).catch((error) => {
            this.pagination.loading = false;
        });
    };
    prepareConversations(conversations) {
        return Promise.all(
            conversations.map((conversation) => {
                return new Promise((resolve, reject) => {
                    if (conversation.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_USER) {
                        this.props.AZStackCore.getUsersInformation({
                            userIds: [conversation.chatId]
                        }).then((result) => {
                            conversation.user = result.list[0];
                            resolve(conversation);
                        }).catch((error) => {
                            conversation.user = {};
                            resolve(conversation);
                        });
                    } else if (conversation.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_GROUP) {
                        this.props.AZStackCore.getDetailsGroup({
                            groupId: conversation.chatId
                        }).then((result) => {
                            conversation.group = result;
                            resolve(conversation);
                        }).catch((error) => {
                            conversation.group = {};
                            resolve(conversation);
                        });
                    } else {
                        resolve(conversation);
                    }
                });
            })
        );
    };

    onSearchTextChange(newText) { };
    onSearchTextClear() { };

    componentDidMount() {
        this.addSubscriptions();
        this.getConversations();
    };

    componentWillUnmount() {
        this.clearSubscriptions();
    };

    render() {
        return (
            <ScreenBlockComponent
                Sizes={this.props.Sizes}
                CustomStyle={this.props.CustomStyle}
            >
                <ScreenHeaderBlockComponent
                    CustomStyle={this.props.CustomStyle}
                    onBackButtonPressed={this.props.onBackButtonPressed}
                    title={this.props.Language.getText('CONVERSATIONS_LIST_HEADER_TITLE_TEXT')}
                />
                <ScreenBodyBlockComponent
                    CustomStyle={this.props.CustomStyle}
                >
                    <View
                        style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_SEARCH_BLOCK_STYLE')}
                    >
                        <SearchBlockComponent
                            CustomStyle={this.props.CustomStyle}
                            onSearchTextChange={this.onSearchTextChange}
                            onSearchTextClear={this.onSearchTextClear}
                            placeholder={this.props.Language.getText('CONVERSATIONS_LIST_SEARCH_PLACEHOLDER_TEXT')}
                        />
                    </View>
                    {
                        this.state.conversations.length === 0 && <EmptyBlockComponent
                            CustomStyle={this.props.CustomStyle}
                            emptyText={this.props.Language.getText('CONVERSATIONS_LIST_EMPTY_TEXT')}
                        />
                    }
                    {
                        this.state.conversations.length > 0 && <FlatList
                            style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_ITEMS_STYLE')}
                            data={this.state.conversations}
                            keyExtractor={(item, index) => (item.chatType + '_' + item.chatId)}
                            renderItem={({ item }) => {
                                return (
                                    <ConversationBlockComponent
                                        CustomStyle={this.props.CustomStyle}
                                        AZStackCore={this.props.AZStackCore}
                                        conversation={item}
                                    />
                                );
                            }}
                        />
                    }
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    };
};

export default ConversationsListComponent;