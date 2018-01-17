import React from 'react';
import {
    View,
    FlatList,
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';
import ChatHeaderComponent from './part/chat/ChatHeaderComponent';
import ChatInputDisabledComponent from './part/chat/ChatInputDisabledComponent';

class ChatComponent extends React.Component {
    constructor(props) {
        super(props);

        this.subscriptions = {};
        this.pagination = {
            unread: {
                page: 1
            },
            modified: {
                page: 1,
                lastCreated: new Date().getTime(),
                loading: false,
                done: false
            }
        };

        this.state = {
            chatTarget: null,
            unreads: [],
            messages: []
        };
    };

    addSubscriptions() {
        this.subscriptions.onAuthenticated = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_AUTHENTICATED_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.getChatTarget();
        });

    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

    getChatTarget() {
        if (!this.props.AZStackCore.slaveSocketConnected) {
            return;
        }

        if (this.props.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_USER) {
            this.props.AZStackCore.getUsersInformation({
                userIds: [this.props.chatId]
            }).then((result) => {
                this.setState({ chatTarget: result.list[0] });
                this.getUnreadMessages();
            }).catch((error) => { })
        } else if (this.props.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_GROUP) {
            this.props.AZStackCore.getDetailsGroup({
                groupId: this.props.chatId
            }).then((result) => {
                this.setState({ chatTarget: result });
                this.getUnreadMessages();
            }).catch((error) => { });
        }
    };
    getUnreadMessages() {
        if (!this.props.AZStackCore.slaveSocketConnected) {
            return;
        }

        if (!this.state.chatTarget) {
            return;
        }

        this.props.AZStackCore.getUnreadMessages({
            page: this.pagination.unread.page,
            chatType: this.props.chatType,
            chatId: this.props.chatId
        }).then((result) => {
            this.setState({ unreads: this.state.unreads.concat(result.list) }, () => {
                if (result.done === this.props.AZStackCore.listConstants.GET_LIST_DONE) {
                    this.getModifiedMessages();
                } else {
                    this.pagination.unread.page += 1;
                    this.getUnreadMessages();
                }
            });
        }).catch((error) => { });

    };
    getModifiedMessages() {
        if (!this.props.AZStackCore.slaveSocketConnected) {
            return;
        }

        if (!this.state.chatTarget) {
            return;
        }

        if (this.pagination.modified.done) {
            return;
        }

        if (this.pagination.modified.loading) {
            return;
        }

        this.pagination.modified.loading = true;

        let rawMessages = [];
        if (this.state.unreads.length > 0) {
            rawMessages = this.state.unreads;
            this.setState({ unreads: [] });
        }

        this.props.AZStackCore.getModifiedMessages({
            page: this.pagination.modified.page,
            lastCreated: this.pagination.modified.lastCreated,
            chatType: this.props.chatType,
            chatId: this.props.chatId
        }).then((result) => {

            rawMessages = rawMessages.concat(result.list);
            this.prepareMessages(rawMessages).then((preparedMessages) => {

                if (result.done === this.props.AZStackCore.listConstants.GET_LIST_DONE) {
                    this.pagination.modified.done = true;
                } else {
                    this.pagination.modified.page += 1;
                }

                this.pagination.modified.loading = false;

                let unorderedMessages = this.state.messages.concat(preparedMessages);
                this.setState({
                    messages: unorderedMessages.sort((a, b) => {
                        return a.created < b.created ? -1 : 1
                    })
                }, () => {
                    console.log(this.state.messages);
                });
            }).catch((error) => { });

        }).catch((error) => { });
    };
    prepareMessages(messages) {

        return Promise.all(
            messages.map((message) => {
                return new Promise((resolve, reject) => {

                    if (message.prepared) {
                        return resolve(message);
                    }

                    if (message.senderId !== this.props.AZStackCore.authenticatedUser.userId && message.status !== this.props.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN && message.status !== this.props.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED) {
                        this.props.AZStackCore.changeMessageStatus({
                            chatType: message.chatType,
                            chatId: message.chatId,
                            messageSenderId: message.senderId,
                            messageStatus: this.props.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN,
                            msgId: message.msgId
                        }).then((result) => {
                            message.status = this.props.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN;
                            resolve(message);
                        }).catch((error) => {
                            resolve(message);
                        });
                        return;
                    }

                    resolve(message);
                });
            })
        ).then((messages) => {
            return Promise.all(
                messages.map((message) => {
                    return new Promise((resolve, reject) => {

                        if (message.prepared) {
                            return resolve(message);
                        }

                        if (message.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_USER) {
                            if (message.senderId === message.chatId) {
                                message.sender = this.state.chatTarget;
                                message.receiver = this.props.AZStackCore.authenticatedUser;
                            } else if (message.receiverId === message.chatId) {
                                message.sender = this.props.AZStackCore.authenticatedUser;
                                message.receiver = this.state.chatTarget;
                            }
                            resolve(message);
                        } else if (message.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_GROUP) {
                            message.receiver = this.state.chatTarget;
                            let foundSender = false;
                            if (message.senderId === this.props.AZStackCore.authenticatedUser.userId) {
                                foundSender = true;
                                message.sender = this.props.AZStackCore.authenticatedUser
                            } else {
                                for (let i = 0; i < this.state.chatTarget.members.length; i++) {
                                    let member = this.state.chatTarget.members[i];
                                    if (message.senderId === member.userId) {
                                        foundSender = true;
                                        message.sender = member;
                                        break;
                                    }
                                }
                            }
                            if (foundSender) {
                                return resolve(message);
                            }

                            this.props.AZStackCore.getUsersInformation({
                                userIds: [message.senderId]
                            }).then((result) => {
                                message.sender = result.list[0];
                                resolve(message);
                            }).catch((error) => {
                                message.sender = { userId: message.senderId };
                                resolve(message);
                            })
                        }
                    });
                })
            );
        }).then((messages) => {
            return Promise.all(
                messages.map((message) => {
                    return new Promise((resolve, reject) => {

                        if (message.prepared) {
                            return resolve(message);
                        }

                        message.prepared = true;

                        switch (message.type) {
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT:
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER:
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_FILE:
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_CREATED:
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_RENAMED:
                                resolve(message);
                                break;
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_INVITED:
                                message.invited.invites = [];
                                Promise.all(
                                    message.invited.inviteIds.map((inviteId) => {
                                        return new Promise((resolve, reject) => {
                                            this.props.AZStackCore.getUsersInformation({
                                                userIds: [inviteId]
                                            }).then((result) => {
                                                message.invited.invites.push(result.list[0]);
                                                resolve(message);
                                            }).catch((error) => {
                                                message.invited.invites.push({ userId: inviteId });
                                                resolve(message);
                                            });
                                        });
                                    })
                                ).then(() => {
                                    resolve(message);
                                }).catch(() => {
                                    resolve(message);
                                });
                                break;
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_LEFT:
                                let PromiseTasks = [];
                                PromiseTasks.push(
                                    new Promise((resolve, reject) => {
                                        this.props.AZStackCore.getUsersInformation({
                                            userIds: [message.left.leaveId]
                                        }).then((result) => {
                                            message.left.leave = result.list[0];
                                            resolve(message);
                                        }).catch((error) => {
                                            message.left.leave = { userId: message.left.leaveId }
                                            resolve(message);
                                        });
                                    })
                                );
                                if (message.left.newAdminId) {
                                    PromiseTasks.push(
                                        new Promise((resolve, reject) => {
                                            this.props.AZStackCore.getUsersInformation({
                                                userIds: [message.left.newAdminId]
                                            }).then((result) => {
                                                message.left.newAdmin = result.list[0];
                                                resolve(message);
                                            }).catch((error) => {
                                                message.left.newAdmin = { userId: message.left.newAdminId }
                                                resolve(message);
                                            });
                                        })
                                    );
                                }
                                Promise.all(
                                    PromiseTasks
                                ).then(() => {
                                    resolve(message);
                                }).catch(() => {
                                    resolve(message);
                                });
                                break;
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_ADMIN_CHANGED:
                                this.props.AZStackCore.getUsersInformation({
                                    userIds: [message.adminChanged.newAdminId]
                                }).then((result) => {
                                    message.adminChanged.newAdmin = result.list[0];
                                    resolve(message);
                                }).catch((error) => {
                                    message.adminChanged.newAdmin = { userId: message.adminChanged.newAdminId }
                                    resolve(message);
                                });
                                break;
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_PUBLIC_JOINED:
                                this.props.AZStackCore.getUsersInformation({
                                    userIds: [message.joined.joinId]
                                }).then((result) => {
                                    message.joined.join = result.list[0];
                                    resolve(message);
                                }).catch((error) => {
                                    message.joined.join = { userId: message.joined.joinId }
                                    resolve(message);
                                });
                                break;
                            default:
                                resolve(message);
                                break;
                        }
                    });
                })
            );
        });
    };

    componentDidMount() {
        this.addSubscriptions();
        this.getChatTarget();
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
                {
                    !this.state.chatTarget && <ScreenHeaderBlockComponent
                        CustomStyle={this.props.CustomStyle}
                        onBackButtonPressed={this.props.onBackButtonPressed}
                        title={this.props.Language.getText('CHAT_HEADER_TITLE_TEXT')}
                    />
                }
                {
                    !!this.state.chatTarget && <ChatHeaderComponent
                        CustomStyle={this.props.CustomStyle}
                        Language={this.props.Language}
                        AZStackCore={this.props.AZStackCore}
                        onBackButtonPressed={this.props.onBackButtonPressed}
                        chatType={this.props.chatType}
                        chatTarget={this.state.chatTarget}
                    />
                }
                <ScreenBodyBlockComponent
                    CustomStyle={this.props.CustomStyle}
                >
                    {
                        this.state.messages.length === 0 && <EmptyBlockComponent
                            CustomStyle={this.props.CustomStyle}
                            emptyText={this.props.Language.getText('MESSAGES_LIST_EMPTY_TEXT')}
                        />
                    }
                </ScreenBodyBlockComponent>
                <ChatInputDisabledComponent
                    CustomStyle={this.props.CustomStyle}
                    Language={this.props.Language}
                />
            </ScreenBlockComponent>
        );
    };
};

export default ChatComponent;