import React from 'react';
import {
    View,
    FlatList,
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';
import SearchBlockComponent from './part/common/SearchBlockComponent';

import ConversationBlockComponent from './part/conversation/ConversationBlockComponent';
import conversation from '../../core/handler/conversation';

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
            conversations: [],
            searchText: ''
        };

        this.onSearchTextChanged = this.onSearchTextChanged.bind(this);
        this.onSearchTextCleared = this.onSearchTextCleared.bind(this);
        this.getFilteredConversations = this.getFilteredConversations.bind(this);

        this.onConversationClicked = this.onConversationClicked.bind(this);
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
        if (this.pagination.done) {
            return;
        }
        if (this.pagination.loading) {
            return;
        }

        this.pagination.loading = true;
        this.props.AZStackCore.getModifiedConversations({
            page: this.pagination.page,
            lastCreated: this.pagination.lastCreated
        }).then((result) => {
            this.prepareConversations(result.list).then((preparedConversations) => {
                this.pagination.page += 1;
                let unorderConversations = this.state.conversations.concat(preparedConversations);
                this.setState({
                    conversations: unorderConversations.sort((a, b) => {
                        return a.lastMessage.created > b.lastMessage.created ? -1 : 1
                    })
                });
                if (result.done === this.props.AZStackCore.listConstants.GET_LIST_DONE) {
                    this.pagination.done = true;
                }
                this.pagination.loading = false;
            }).catch((error) => { });
        }).catch((error) => {
            this.pagination.loading = false;
        });
    };
    prepareConversations(conversations) {
        return Promise.all(
            conversations.map((conversation) => {
                return new Promise((resolve, reject) => {
                    if (conversation.prepared) {
                        return resolve(conversation);
                    }
                    if (conversation.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_USER) {
                        this.props.AZStackCore.getUsersInformation({
                            userIds: [conversation.chatId]
                        }).then((result) => {
                            conversation.chatTarget = result.list[0];
                            conversation.searchString = result.list[0].fullname.toLocaleLowerCase();
                            resolve(conversation);
                        }).catch((error) => {
                            conversation.chatTarget = { userId: conversation.chatId };
                            resolve(conversation);
                        });
                    } else if (conversation.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_GROUP) {
                        this.props.AZStackCore.getDetailsGroup({
                            groupId: conversation.chatId
                        }).then((result) => {
                            conversation.chatTarget = result;
                            conversation.searchString = result.name.toLocaleLowerCase();
                            result.members.map((member) => {
                                conversation.searchString += ` ${member.fullname.toLocaleLowerCase()}`;
                            });
                            resolve(conversation);
                        }).catch((error) => {
                            conversation.chatTarget = { groupId: conversation.chatId };
                            resolve(conversation);
                        });
                    } else {
                        conversation.chatTarget = {};
                        resolve(conversation);
                    }
                });
            })
        ).then((conversations) => {
            return Promise.all(
                conversations.map((conversation) => {
                    return new Promise((resolve, reject) => {
                        if (conversation.prepared) {
                            return resolve(conversation);
                        }
                        conversation.lastMessage.receiver = conversation.chatTarget;
                        this.props.AZStackCore.getUsersInformation({
                            userIds: [conversation.lastMessage.senderId]
                        }).then((result) => {
                            conversation.lastMessage.sender = result.list[0];
                            resolve(conversation);
                        }).catch((error) => {
                            conversation.lastMessage.sender = { userId: conversation.lastMessage.senderId };
                            resolve(conversation);
                        });
                    });
                })
            );
        }).then((conversations) => {
            return Promise.all(
                conversations.map((conversation) => {
                    return new Promise((resolve, reject) => {
                        if (conversation.prepared) {
                            return resolve(conversation);
                        }
                        conversation.prepared = true;
                        switch (conversation.lastMessage.type) {
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT:
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER:
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_FILE:
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_CREATED:
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_RENAMED:
                                resolve(conversation);
                                break;
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_INVITED:
                                conversation.lastMessage.invited.invites = [];
                                Promise.all(
                                    conversation.lastMessage.invited.inviteIds.map((inviteId) => {
                                        return new Promise((resolve, reject) => {
                                            this.props.AZStackCore.getUsersInformation({
                                                userIds: [inviteId]
                                            }).then((result) => {
                                                conversation.lastMessage.invited.invites.push(result.list[0]);
                                                resolve(conversation);
                                            }).catch((error) => {
                                                conversation.lastMessage.invited.invites.push({ userId: inviteId });
                                                resolve(conversation);
                                            });
                                        });
                                    })
                                ).then(() => {
                                    resolve(conversation);
                                }).catch(() => {
                                    resolve(conversation);
                                });
                                break;
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_LEFT:
                                let PromiseTasks = [];
                                PromiseTasks.push(
                                    new Promise((resolve, reject) => {
                                        this.props.AZStackCore.getUsersInformation({
                                            userIds: [conversation.lastMessage.left.leaveId]
                                        }).then((result) => {
                                            conversation.lastMessage.left.leave = result.list[0];
                                            resolve(conversation);
                                        }).catch((error) => {
                                            conversation.lastMessage.left.leave = { userId: conversation.lastMessage.adminChanged.leaveId }
                                            resolve(conversation);
                                        });
                                    })
                                );
                                if (conversation.lastMessage.left.newAdminId) {
                                    PromiseTasks.push(
                                        new Promise((resolve, reject) => {
                                            this.props.AZStackCore.getUsersInformation({
                                                userIds: [conversation.lastMessage.left.newAdminId]
                                            }).then((result) => {
                                                conversation.lastMessage.left.newAdmin = result.list[0];
                                                resolve(conversation);
                                            }).catch((error) => {
                                                conversation.lastMessage.left.newAdmin = { userId: conversation.lastMessage.adminChanged.newAdminId }
                                                resolve(conversation);
                                            });
                                        })
                                    );
                                }
                                Promise.all(
                                    PromiseTasks
                                ).then(() => {
                                    resolve(conversation);
                                }).catch(() => {
                                    resolve(conversation);
                                });
                                break;
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_ADMIN_CHANGED:
                                this.props.AZStackCore.getUsersInformation({
                                    userIds: [conversation.lastMessage.adminChanged.newAdminId]
                                }).then((result) => {
                                    conversation.lastMessage.adminChanged.newAdmin = result.list[0];
                                    resolve(conversation);
                                }).catch((error) => {
                                    conversation.lastMessage.adminChanged.newAdmin = { userId: conversation.lastMessage.adminChanged.newAdminId }
                                    resolve(conversation);
                                });
                                break;
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_PUBLIC_JOINED:
                                this.props.AZStackCore.getUsersInformation({
                                    userIds: [conversation.lastMessage.joined.joinId]
                                }).then((result) => {
                                    conversation.lastMessage.joined.join = result.list[0];
                                    resolve(conversation);
                                }).catch((error) => {
                                    conversation.lastMessage.joined.join = { userId: conversation.lastMessage.adminChanged.joinId }
                                    resolve(conversation);
                                });
                                break;
                            default:
                                resolve(conversation);
                                break;
                        }
                    });
                })
            );
        });
    };

    onSearchTextChanged(newText) {
        this.setState({ searchText: newText });
    };
    onSearchTextCleared() {
        this.setState({ searchText: '' });
    };
    getFilteredConversations() {
        if (!this.state.searchText) {
            return this.state.conversations;
        }
        let searchParts = this.state.searchText.toLocaleLowerCase().split(' ');
        return this.state.conversations.filter((conversation) => {
            let matched = false;
            for (let i = 0; i < searchParts.length; i++) {
                if (conversation.searchString.indexOf(searchParts[i]) > -1) {
                    matched = true;
                    break;
                }
            }
            return matched;
        });
    };

    onConversationClicked(conversation) { };

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
                            onSearchTextChanged={this.onSearchTextChanged}
                            onSearchTextCleared={this.onSearchTextCleared}
                            placeholder={this.props.Language.getText('CONVERSATIONS_LIST_SEARCH_PLACEHOLDER_TEXT')}
                        />
                    </View>
                    {
                        this.getFilteredConversations().length === 0 && <EmptyBlockComponent
                            CustomStyle={this.props.CustomStyle}
                            emptyText={this.props.Language.getText('CONVERSATIONS_LIST_EMPTY_TEXT')}
                        />
                    }
                    {
                        this.getFilteredConversations().length > 0 && <FlatList
                            style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_ITEMS_STYLE')}
                            data={this.getFilteredConversations()}
                            keyExtractor={(item, index) => (item.chatType + '_' + item.chatId)}
                            renderItem={({ item }) => {
                                return (
                                    <ConversationBlockComponent
                                        Language={this.props.Language}
                                        CustomStyle={this.props.CustomStyle}
                                        AZStackCore={this.props.AZStackCore}
                                        conversation={item}
                                        onConversationClicked={this.onConversationClicked}
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