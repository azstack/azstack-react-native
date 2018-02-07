import React from 'react';
import {
    Alert,
    View,
    FlatList,
    Platform,
    TouchableOpacity,
    Image,
    BackHandler
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';
import SearchBlockComponent from './part/common/SearchBlockComponent';
import ConversationBlockComponent from './part/conversation/ConversationBlockComponent';
import ConnectionBlockComponent from './part/common/ConnectionBlockComponent';

class ConversationsComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.subscriptions = {};
        this.pagination = {
            page: 1,
            lastCreated: new Date().getTime(),
            loading: false,
            done: false
        };

        this.conversationsListOffset = 0;

        this.state = {
            conversations: [],
            searchText: '',
            shouldNewConversationButtonShow: true
        };

        this.onConversationPressed = this.onConversationPressed.bind(this);
        this.onConversationsListEndReach = this.onConversationsListEndReach.bind(this);
        this.onConversationsListScroll = this.onConversationsListScroll.bind(this);
        this.onNewConversationButtonPress = this.onNewConversationButtonPress.bind(this);

        this.onSearchTextChanged = this.onSearchTextChanged.bind(this);
        this.onSearchTextCleared = this.onSearchTextCleared.bind(this);
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
        this.subscriptions.onTyping = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_TYPING, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onTyping(result);
        });
        this.subscriptions.onMessageStatusChanged = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_MESSAGE_STATUS_CHANGED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onMessageStatusChanged(result);
        });
        this.subscriptions.onHasNewMessage = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onHasNewMessage(result);
        });
        this.subscriptions.onMessageFromMe = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_MESSAGE_FROM_ME, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onMessageFromMe(result);
        });
        this.subscriptions.onNewMessageReturn = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onNewMessageReturn(result);
        });
        this.subscriptions.onGroupCreated = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_GROUP_CREATED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onGroupCreated(result);
        });
        this.subscriptions.onGroupInvited = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_GROUP_INVITED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onGroupInvited(result);
        });
        this.subscriptions.onGroupLeft = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_GROUP_LEFT, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onGroupLeft(result);
        });
        this.subscriptions.onGroupRenamed = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_GROUP_RENAMED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onGroupRenamed(result);
        });
        this.subscriptions.onGroupAdminChanged = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_GROUP_ADMIN_CHANGED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onGroupAdminChanged(result);
        });
        this.subscriptions.onGroupPublicJoined = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_GROUP_PUBLIC_JOINED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onGroupPublicJoined(result);
        });
    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

    initRun() {
        this.state.conversations = [];
        this.pagination.page = 1;
        this.pagination.lastCreated = new Date().getTime();
        this.pagination.loading = false;
        this.pagination.done = false;
        this.getConversations();
    };

    getConversations() {
        if (!this.coreInstances.AZStackCore.slaveSocketConnected) {
            return;
        }

        if (this.pagination.done) {
            return;
        }

        if (this.pagination.loading) {
            return;
        }

        this.pagination.loading = true;
        this.coreInstances.AZStackCore.getModifiedConversations({
            page: this.pagination.page,
            lastCreated: this.pagination.lastCreated
        }).then((result) => {
            this.prepareConversations(result.list).then((preparedConversations) => {
                let unorderConversations = this.state.conversations.concat(preparedConversations);
                this.setState({
                    conversations: unorderConversations.sort((a, b) => {
                        return a.lastMessage.created > b.lastMessage.created ? -1 : 1
                    })
                });
                if (result.done === this.coreInstances.AZStackCore.listConstants.GET_LIST_DONE) {
                    this.pagination.done = true;
                } else {
                    this.pagination.page += 1;
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
                    if (conversation.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_USER) {
                        this.coreInstances.AZStackCore.getUsersInformation({
                            userIds: [conversation.chatId]
                        }).then((result) => {
                            conversation.chatTarget = result.list[0];
                            conversation.searchString = this.coreInstances.Diacritic.clear(result.list[0].fullname).toLowerCase();
                            resolve(conversation);
                        }).catch((error) => {
                            conversation.chatTarget = { userId: conversation.chatId };
                            resolve(conversation);
                        });
                    } else if (conversation.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_GROUP) {
                        this.coreInstances.AZStackCore.getDetailsGroup({
                            groupId: conversation.chatId
                        }).then((result) => {
                            conversation.chatTarget = result;
                            conversation.searchString = this.coreInstances.Diacritic.clear(result.name).toLowerCase();
                            result.members.map((member) => {
                                conversation.searchString += ` ${this.coreInstances.Diacritic.clear(member.fullname).toLowerCase()}`;
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
                        this.coreInstances.AZStackCore.getUsersInformation({
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
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_FILE:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_CREATED:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_RENAMED:
                                resolve(conversation);
                                break;
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_INVITED:
                                conversation.lastMessage.invited.invites = [];
                                Promise.all(
                                    conversation.lastMessage.invited.inviteIds.map((inviteId) => {
                                        return new Promise((resolve, reject) => {
                                            this.coreInstances.AZStackCore.getUsersInformation({
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
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_LEFT:
                                let PromiseTasks = [];
                                PromiseTasks.push(
                                    new Promise((resolve, reject) => {
                                        this.coreInstances.AZStackCore.getUsersInformation({
                                            userIds: [conversation.lastMessage.left.leaveId]
                                        }).then((result) => {
                                            conversation.lastMessage.left.leave = result.list[0];
                                            resolve(conversation);
                                        }).catch((error) => {
                                            conversation.lastMessage.left.leave = { userId: conversation.lastMessage.left.leaveId }
                                            resolve(conversation);
                                        });
                                    })
                                );
                                if (conversation.lastMessage.left.newAdminId) {
                                    PromiseTasks.push(
                                        new Promise((resolve, reject) => {
                                            this.coreInstances.AZStackCore.getUsersInformation({
                                                userIds: [conversation.lastMessage.left.newAdminId]
                                            }).then((result) => {
                                                conversation.lastMessage.left.newAdmin = result.list[0];
                                                resolve(conversation);
                                            }).catch((error) => {
                                                conversation.lastMessage.left.newAdmin = { userId: conversation.lastMessage.left.newAdminId }
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
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_ADMIN_CHANGED:
                                this.coreInstances.AZStackCore.getUsersInformation({
                                    userIds: [conversation.lastMessage.adminChanged.newAdminId]
                                }).then((result) => {
                                    conversation.lastMessage.adminChanged.newAdmin = result.list[0];
                                    resolve(conversation);
                                }).catch((error) => {
                                    conversation.lastMessage.adminChanged.newAdmin = { userId: conversation.lastMessage.adminChanged.newAdminId }
                                    resolve(conversation);
                                });
                                break;
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_PUBLIC_JOINED:
                                this.coreInstances.AZStackCore.getUsersInformation({
                                    userIds: [conversation.lastMessage.joined.joinId]
                                }).then((result) => {
                                    conversation.lastMessage.joined.join = result.list[0];
                                    resolve(conversation);
                                }).catch((error) => {
                                    conversation.lastMessage.joined.join = { userId: conversation.lastMessage.joined.joinId }
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

    onConversationPressed(event) {
        let conversations = [...this.state.conversations];
        for (let i = 0; i < conversations.length; i++) {
            let conversation = conversations[i];
            if (conversation.chatType === event.conversation.chatType && conversation.chatId === event.conversation.chatId) {
                conversation.unread = 0;
                break;
            }
        }
        this.setState({ conversations: conversations });
        this.props.onConversationPressed(event);
    };
    onConversationsListEndReach() {
        this.getConversations();
    };
    onConversationsListScroll(event) {
        var currentOffset = event.nativeEvent.contentOffset.y;
        var direction = currentOffset > this.conversationsListOffset ? 'down' : 'up';
        this.conversationsListOffset = currentOffset;
        if (direction === 'down') {
            this.setState({
                shouldNewConversationButtonShow: false
            });
        } else {
            this.setState({
                shouldNewConversationButtonShow: true
            });
        }
    };
    onNewConversationButtonPress() {
        this.props.showSelectMembers({
            headerTitle: this.coreInstances.Language.getText('CONVERSATIONS_LIST_SELECT_MEMBERS_TO_CHAT_TEXT'),
            ignoreMembers: [this.coreInstances.AZStackCore.authenticatedUser.userId],
            onSelectDone: (event) => {
                let selectedMembers = event.selected;
                if (selectedMembers.length === 1) {
                    setTimeout(() => {
                        this.props.onNewChat({
                            chatType: this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_USER,
                            chatId: selectedMembers[0].userId
                        });
                    }, 0);
                    return;
                }

                setTimeout(() => {
                    this.props.showNewGroup({
                        headerTitle: this.coreInstances.Language.getText('CONVERSATIONS_LIST_NEW_GROUP_TO_CHAT_TEXT'),
                        onInputDone: (event) => {
                            this.coreInstances.AZStackCore.createGroup({
                                type: event.groupType,
                                name: event.groupName,
                                memberIds: selectedMembers.map((member) => { return member.userId })
                            }).then((result) => {
                                this.props.onNewChat({
                                    chatType: this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_GROUP,
                                    chatId: result.groupId
                                });
                            }).catch((error) => {
                                Alert.alert(
                                    this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                                    this.coreInstances.Language.getText('CONVERSATIONS_LIST_NEW_GROUP_TO_CHAT_ERROR_TEXT'),
                                    [
                                        { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                                    ],
                                    { cancelable: true }
                                );
                            });
                        }
                    });
                }, 0);
            }
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
        let searchParts = this.coreInstances.Diacritic.clear(this.state.searchText).toLowerCase().split(' ');
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

    onTyping(typingDetails) {
        let conversations = [].concat(this.state.conversations);
        for (let i = 0; i < conversations.length; i++) {
            let conversation = conversations[i];
            if (conversation.chatType === typingDetails.chatType && conversation.chatId === typingDetails.chatId) {
                if (!conversation.typing) {
                    conversation.typing = {
                        senders: [],
                        clears: {}
                    };
                }
                if (conversation.typing.clears[typingDetails.sender.userId]) {
                    clearTimeout(conversation.typing.clears[typingDetails.sender.userId]);
                } else {
                    conversation.typing.senders.push(typingDetails.sender);
                }
                conversation.typing.clears[typingDetails.sender.userId] = setTimeout(() => {
                    let conversations = [].concat(this.state.conversations);
                    for (let i = 0; i < conversations.length; i++) {
                        let conversation = conversations[i];
                        if (conversation.chatType === typingDetails.chatType && conversation.chatId === typingDetails.chatId) {
                            let foundIndex = -1;
                            for (let j = 0; j < conversation.typing.senders.length; j++) {
                                let sender = conversation.typing.senders[j];
                                if (sender.userId === typingDetails.sender.userId) {
                                    foundIndex = j;
                                    break;
                                }
                            }
                            if (foundIndex > -1) {
                                conversation.typing.senders.splice(foundIndex, 1);
                                delete conversation.typing.clears[typingDetails.sender.userId];
                            }
                            break;
                        }
                    }
                    this.setState({ conversations: conversations });
                }, 5000)
                break;
            }
        }
        this.setState({ conversations: conversations });
    };
    onMessageStatusChanged(newStatus) {
        let conversations = [].concat(this.state.conversations);
        for (let i = 0; i < conversations.length; i++) {
            let conversation = conversations[i];
            if (conversation.chatType === newStatus.chatType && conversation.chatId === newStatus.chatId && conversation.lastMessage.msgId === newStatus.msgId) {
                conversation.lastMessage.status = newStatus.messageStatus;
                break;
            }
        }
        this.setState({ conversations: conversations });
    };
    onHasNewMessage(newMessage) {
        let foundConversation = false;
        for (let i = 0; i < this.state.conversations.length; i++) {
            let conversation = this.state.conversations[i];
            if (conversation.chatType === newMessage.chatType && conversation.chatId === newMessage.chatId) {
                foundConversation = true;
                conversation.lastMessage = newMessage;
                conversation.unread += 1;
                break;
            }
        }
        let unorderConversations = [].concat(this.state.conversations);
        if (!foundConversation) {
            let newConversation = {
                chatType: newMessage.chatType,
                chatId: newMessage.chatId,
                chatTarget: newMessage.receiver,
                lastMessage: newMessage,
                unread: 1,
                deleted: this.coreInstances.AZStackCore.chatConstants.CONVERSATION_DELETED_FALSE,
                modified: newMessage.modified,
                prepared: true
            };
            if (newConversation.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_USER) {
                newConversation.searchString = this.coreInstances.Diacritic.clear(newConversation.chatTarget.fullname).toLowerCase();
            } else if (newConversation.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_GROUP) {
                newConversation.searchString = this.coreInstances.Diacritic.clear(newConversation.chatTarget.name).toLowerCase();
                newConversation.chatTarget.members.map((member) => {
                    newConversation.searchString += ` ${this.coreInstances.Diacritic.clear(member.fullname).toLowerCase()}`;
                });
            }
            unorderConversations.push(newConversation);
        }
        this.setState({
            conversations: unorderConversations.sort((a, b) => {
                return a.lastMessage.created > b.lastMessage.created ? -1 : 1
            })
        });
    };
    onMessageFromMe(myMessage) {
        let foundConversation = false;
        for (let i = 0; i < this.state.conversations.length; i++) {
            let conversation = this.state.conversations[i];
            if (conversation.chatType === myMessage.chatType && conversation.chatId === myMessage.chatId) {
                foundConversation = true;
                conversation.lastMessage = myMessage;
                conversation.unread = 0;
                break;
            }
        }
        let unorderConversations = [].concat(this.state.conversations);
        if (!foundConversation) {
            let newConversation = {
                chatType: myMessage.chatType,
                chatId: myMessage.chatId,
                chatTarget: myMessage.receiver,
                lastMessage: myMessage,
                unread: 0,
                deleted: this.coreInstances.AZStackCore.chatConstants.CONVERSATION_DELETED_FALSE,
                modified: myMessage.modified,
                prepared: true
            };
            if (newConversation.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_USER) {
                newConversation.searchString = this.coreInstances.Diacritic.clear(newConversation.chatTarget.fullname).toLowerCase();
            } else if (newConversation.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_GROUP) {
                newConversation.searchString = this.coreInstances.Diacritic.clear(newConversation.chatTarget.name).toLowerCase();
                newConversation.chatTarget.members.map((member) => {
                    newConversation.searchString += ` ${this.coreInstances.Diacritic.clear(member.fullname).toLowerCase()}`;
                });
            }
            unorderConversations.push(newConversation);
        }
        this.setState({
            conversations: unorderConversations.sort((a, b) => {
                return a.lastMessage.created > b.lastMessage.created ? -1 : 1
            })
        });
    };
    onNewMessageReturn(myMessage) {
        let foundConversation = false;
        for (let i = 0; i < this.state.conversations.length; i++) {
            let conversation = this.state.conversations[i];
            if (conversation.chatType === myMessage.chatType && conversation.chatId === myMessage.chatId) {
                foundConversation = true;
                if (conversation.lastMessage.created <= myMessage.created) {
                    conversation.lastMessage = myMessage;
                    conversation.unread = 0;
                }
                break;
            }
        }
        let unorderConversations = [].concat(this.state.conversations);
        if (!foundConversation) {
            let newConversation = {
                chatType: myMessage.chatType,
                chatId: myMessage.chatId,
                chatTarget: myMessage.receiver,
                lastMessage: myMessage,
                unread: 0,
                deleted: this.coreInstances.AZStackCore.chatConstants.CONVERSATION_DELETED_FALSE,
                modified: myMessage.modified,
                prepared: true
            };
            if (newConversation.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_USER) {
                newConversation.searchString = this.coreInstances.Diacritic.clear(newConversation.chatTarget.fullname).toLowerCase();
            } else if (newConversation.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_GROUP) {
                newConversation.searchString = this.coreInstances.Diacritic.clear(newConversation.chatTarget.name).toLowerCase();
                newConversation.chatTarget.members.map((member) => {
                    newConversation.searchString += ` ${this.coreInstances.Diacritic.clear(member.fullname).toLowerCase()}`;
                });
            }
            unorderConversations.push(newConversation);
        }
        this.setState({
            conversations: unorderConversations.sort((a, b) => {
                return a.lastMessage.created > b.lastMessage.created ? -1 : 1
            })
        });
    };
    onGroupCreated(newMessage) {
        let unorderConversations = [].concat(this.state.conversations);
        let newConversation = {
            chatType: newMessage.chatType,
            chatId: newMessage.chatId,
            chatTarget: newMessage.receiver,
            lastMessage: newMessage,
            unread: newMessage.sender.userId === this.coreInstances.AZStackCore.authenticatedUser.userId ? 0 : 1,
            deleted: this.coreInstances.AZStackCore.chatConstants.CONVERSATION_DELETED_FALSE,
            modified: newMessage.modified,
            prepared: true
        };
        newConversation.searchString = this.coreInstances.Diacritic.clear(newConversation.chatTarget.name).toLowerCase();
        newConversation.chatTarget.members.map((member) => {
            newConversation.searchString += ` ${this.coreInstances.Diacritic.clear(member.fullname).toLowerCase()}`;
        });
        unorderConversations.push(newConversation);
        this.setState({
            conversations: unorderConversations.sort((a, b) => {
                return a.lastMessage.created > b.lastMessage.created ? -1 : 1
            })
        });
    };
    onGroupInvited(newMessage) {
        let foundConversation = false;
        for (let i = 0; i < this.state.conversations.length; i++) {
            let conversation = this.state.conversations[i];
            if (conversation.chatType === newMessage.chatType && conversation.chatId === newMessage.chatId) {
                foundConversation = true;
                conversation.chatTarget = newMessage.receiver;
                conversation.searchString = this.coreInstances.Diacritic.clear(conversation.chatTarget.name).toLowerCase();
                conversation.chatTarget.members.map((member) => {
                    conversation.searchString += ` ${this.coreInstances.Diacritic.clear(member.fullname).toLowerCase()}`;
                });
                conversation.lastMessage = newMessage;
                if (newMessage.sender.userId !== this.coreInstances.AZStackCore.authenticatedUser.userId) {
                    conversation.unread += 1;
                }
                break;
            }
        }
        let unorderConversations = [].concat(this.state.conversations);
        if (!foundConversation) {
            let newConversation = {
                chatType: newMessage.chatType,
                chatId: newMessage.chatId,
                chatTarget: newMessage.receiver,
                lastMessage: newMessage,
                unread: newMessage.sender.userId === this.coreInstances.AZStackCore.authenticatedUser.userId ? 0 : 1,
                deleted: this.coreInstances.AZStackCore.chatConstants.CONVERSATION_DELETED_FALSE,
                modified: newMessage.modified,
                prepared: true
            };
            newConversation.searchString = this.coreInstances.Diacritic.clear(newConversation.chatTarget.name).toLowerCase();
            newConversation.chatTarget.members.map((member) => {
                newConversation.searchString += ` ${this.coreInstances.Diacritic.clear(member.fullname).toLowerCase()}`;
            });
            unorderConversations.push(newConversation);
        }
        this.setState({
            conversations: unorderConversations.sort((a, b) => {
                return a.lastMessage.created > b.lastMessage.created ? -1 : 1
            })
        });
    };
    onGroupLeft(newMessage) {
        let foundConversation = false;
        for (let i = 0; i < this.state.conversations.length; i++) {
            let conversation = this.state.conversations[i];
            if (conversation.chatType === newMessage.chatType && conversation.chatId === newMessage.chatId) {
                foundConversation = true;
                conversation.chatTarget = newMessage.receiver;
                conversation.searchString = this.coreInstances.Diacritic.clear(conversation.chatTarget.name).toLowerCase();
                conversation.chatTarget.members.map((member) => {
                    conversation.searchString += ` ${this.coreInstances.Diacritic.clear(member.fullname).toLowerCase()}`;
                });
                conversation.lastMessage = newMessage;
                if (newMessage.sender.userId !== this.coreInstances.AZStackCore.authenticatedUser.userId) {
                    conversation.unread += 1;
                }
                break;
            }
        }
        let unorderConversations = [].concat(this.state.conversations);
        if (!foundConversation) {
            let newConversation = {
                chatType: newMessage.chatType,
                chatId: newMessage.chatId,
                chatTarget: newMessage.receiver,
                lastMessage: newMessage,
                unread: newMessage.sender.userId === this.coreInstances.AZStackCore.authenticatedUser.userId ? 0 : 1,
                deleted: this.coreInstances.AZStackCore.chatConstants.CONVERSATION_DELETED_FALSE,
                modified: newMessage.modified,
                prepared: true
            };
            newConversation.searchString = this.coreInstances.Diacritic.clear(newConversation.chatTarget.name).toLowerCase();
            newConversation.chatTarget.members.map((member) => {
                newConversation.searchString += ` ${this.coreInstances.Diacritic.clear(member.fullname).toLowerCase()}`;
            });
            unorderConversations.push(newConversation);
        }
        this.setState({
            conversations: unorderConversations.sort((a, b) => {
                return a.lastMessage.created > b.lastMessage.created ? -1 : 1
            })
        });
    };
    onGroupRenamed(newMessage) {
        let foundConversation = false;
        for (let i = 0; i < this.state.conversations.length; i++) {
            let conversation = this.state.conversations[i];
            if (conversation.chatType === newMessage.chatType && conversation.chatId === newMessage.chatId) {
                foundConversation = true;
                conversation.chatTarget = newMessage.receiver;
                conversation.searchString = this.coreInstances.Diacritic.clear(conversation.chatTarget.name).toLowerCase();
                conversation.chatTarget.members.map((member) => {
                    conversation.searchString += ` ${this.coreInstances.Diacritic.clear(member.fullname).toLowerCase()}`;
                });
                conversation.lastMessage = newMessage;
                if (newMessage.sender.userId !== this.coreInstances.AZStackCore.authenticatedUser.userId) {
                    conversation.unread += 1;
                }
                break;
            }
        }
        let unorderConversations = [].concat(this.state.conversations);
        if (!foundConversation) {
            let newConversation = {
                chatType: newMessage.chatType,
                chatId: newMessage.chatId,
                chatTarget: newMessage.receiver,
                lastMessage: newMessage,
                unread: newMessage.sender.userId === this.coreInstances.AZStackCore.authenticatedUser.userId ? 0 : 1,
                deleted: this.coreInstances.AZStackCore.chatConstants.CONVERSATION_DELETED_FALSE,
                modified: newMessage.modified,
                prepared: true
            };
            newConversation.searchString = this.coreInstances.Diacritic.clear(newConversation.chatTarget.name).toLowerCase();
            newConversation.chatTarget.members.map((member) => {
                newConversation.searchString += ` ${this.coreInstances.Diacritic.clear(member.fullname).toLowerCase()}`;
            });
            unorderConversations.push(newConversation);
        }
        this.setState({
            conversations: unorderConversations.sort((a, b) => {
                return a.lastMessage.created > b.lastMessage.created ? -1 : 1
            })
        });
    };
    onGroupAdminChanged(newMessage) {
        let foundConversation = false;
        for (let i = 0; i < this.state.conversations.length; i++) {
            let conversation = this.state.conversations[i];
            if (conversation.chatType === newMessage.chatType && conversation.chatId === newMessage.chatId) {
                foundConversation = true;
                conversation.chatTarget = newMessage.receiver;
                conversation.searchString = this.coreInstances.Diacritic.clear(conversation.chatTarget.name).toLowerCase();
                conversation.chatTarget.members.map((member) => {
                    conversation.searchString += ` ${this.coreInstances.Diacritic.clear(member.fullname).toLowerCase()}`;
                });
                conversation.lastMessage = newMessage;
                if (newMessage.sender.userId !== this.coreInstances.AZStackCore.authenticatedUser.userId) {
                    conversation.unread += 1;
                }
                break;
            }
        }
        let unorderConversations = [].concat(this.state.conversations);
        if (!foundConversation) {
            let newConversation = {
                chatType: newMessage.chatType,
                chatId: newMessage.chatId,
                chatTarget: newMessage.receiver,
                lastMessage: newMessage,
                unread: newMessage.sender.userId === this.coreInstances.AZStackCore.authenticatedUser.userId ? 0 : 1,
                deleted: this.coreInstances.AZStackCore.chatConstants.CONVERSATION_DELETED_FALSE,
                modified: newMessage.modified,
                prepared: true
            };
            newConversation.searchString = this.coreInstances.Diacritic.clear(newConversation.chatTarget.name).toLowerCase();
            newConversation.chatTarget.members.map((member) => {
                newConversation.searchString += ` ${this.coreInstances.Diacritic.clear(member.fullname).toLowerCase()}`;
            });
            unorderConversations.push(newConversation);
        }
        this.setState({
            conversations: unorderConversations.sort((a, b) => {
                return a.lastMessage.created > b.lastMessage.created ? -1 : 1
            })
        });
    };
    onGroupPublicJoined(newMessage) {
        let foundConversation = false;
        for (let i = 0; i < this.state.conversations.length; i++) {
            let conversation = this.state.conversations[i];
            if (conversation.chatType === newMessage.chatType && conversation.chatId === newMessage.chatId) {
                foundConversation = true;
                conversation.chatTarget = newMessage.receiver;
                conversation.searchString = this.coreInstances.Diacritic.clear(conversation.chatTarget.name).toLowerCase();
                conversation.chatTarget.members.map((member) => {
                    conversation.searchString += ` ${this.coreInstances.Diacritic.clear(member.fullname).toLowerCase()}`;
                });
                conversation.lastMessage = newMessage;
                if (newMessage.sender.userId !== this.coreInstances.AZStackCore.authenticatedUser.userId) {
                    conversation.unread += 1;
                }
                break;
            }
        }
        let unorderConversations = [].concat(this.state.conversations);
        if (!foundConversation) {
            let newConversation = {
                chatType: newMessage.chatType,
                chatId: newMessage.chatId,
                chatTarget: newMessage.receiver,
                lastMessage: newMessage,
                unread: newMessage.sender.userId === this.coreInstances.AZStackCore.authenticatedUser.userId ? 0 : 1,
                deleted: this.coreInstances.AZStackCore.chatConstants.CONVERSATION_DELETED_FALSE,
                modified: newMessage.modified,
                prepared: true
            };
            newConversation.searchString = this.coreInstances.Diacritic.clear(newConversation.chatTarget.name).toLowerCase();
            newConversation.chatTarget.members.map((member) => {
                newConversation.searchString += ` ${this.coreInstances.Diacritic.clear(member.fullname).toLowerCase()}`;
            });
            unorderConversations.push(newConversation);
        }
        this.setState({
            conversations: unorderConversations.sort((a, b) => {
                return a.lastMessage.created > b.lastMessage.created ? -1 : 1
            })
        });
    };

    componentDidMount() {
        this.addSubscriptions();
        this.initRun();
    };
    componentWillUnmount() {
        this.clearSubscriptions();
    };

    render() {
        let filteredConversations = this.getFilteredConversations();
        return (
            <ScreenBlockComponent
                fullScreen={false}
                getCoreInstances={this.props.getCoreInstances}
                statusbar={this.props.statusbar}
                style={this.props.style}
            >
                {this.props.header !== 'hidden' && <ScreenHeaderBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    onBackButtonPressed={this.props.onBackButtonPressed}
                    title={this.coreInstances.Language.getText('CONVERSATIONS_HEADER_TITLE_TEXT')}
                />}
                <ScreenBodyBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    style={this.props.contentContainerStyle}
                >
                    <SearchBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                        containerStyle={this.coreInstances.CustomStyle.getStyle('CONVERSATIONS_SEARCH_BLOCK_STYLE')}
                        onSearchTextChanged={this.onSearchTextChanged}
                        onSearchTextCleared={this.onSearchTextCleared}
                        placeholder={this.coreInstances.Language.getText('CONVERSATIONS_SEARCH_PLACEHOLDER_TEXT')}
                    />
                    {
                        filteredConversations.length === 0 && <EmptyBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            emptyText={this.coreInstances.Language.getText('CONVERSATIONS_LIST_EMPTY_TEXT')}
                        />
                    }
                    {
                        filteredConversations.length > 0 && <FlatList
                            style={this.coreInstances.CustomStyle.getStyle('CONVERSATIONS_LIST_STYLE')}
                            data={filteredConversations}
                            keyExtractor={(item, index) => (item.chatType + '_' + item.chatId)}
                            renderItem={({ item }) => {
                                return (
                                    <ConversationBlockComponent
                                        getCoreInstances={this.props.getCoreInstances}
                                        conversation={item}
                                        onConversationPressed={this.onConversationPressed}
                                    />
                                );
                            }}
                            onEndReached={this.onConversationsListEndReach}
                            onEndReachedThreshold={0.1}
                            onScroll={this.onConversationsListScroll}
                            contentContainerStyle={this.coreInstances.CustomStyle.getStyle('CONVERSATIONS_LIST_CONTENT_CONTAINER_STYLE')}
                            keyboardDismissMode={Platform.select({ ios: 'interactive', android: 'on-drag' })}
                        />
                    }
                    {
                        this.state.shouldNewConversationButtonShow && (
                            <TouchableOpacity
                                style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_NEW_BUTTON_BLOCK_STYLE')}
                                activeOpacity={0.5}
                                onPress={this.onNewConversationButtonPress}
                            >
                                <Image
                                    style={this.coreInstances.CustomStyle.getStyle('CONVERSATION_NEW_BUTTON_IMAGE_STYLE')}
                                    source={this.coreInstances.CustomStyle.getImage('IMAGE_NEW_CHAT')}
                                />
                            </TouchableOpacity>
                        )
                    }
                    <ConnectionBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                    />
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    };
};

export default ConversationsComponent;