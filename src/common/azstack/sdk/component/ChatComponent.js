import React from 'react';
import {
    FlatList,
    Image,
    View,
    Text
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';
import ChatHeaderComponent from './part/chat/ChatHeaderComponent';
import MessageBlockComponent from './part/chat/MessageBlockComponent';
import TypingBlockComponent from './part/common/TypingBlockComponent';
import ChatInputDisabledComponent from './part/chat/ChatInputDisabledComponent';
import ChatInputComponentBlock from './part/chat/ChatInputComponentBlock';

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
            typing: {
                senders: [],
                clears: {}
            },
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
        this.subscriptions.onTyping = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_TYPING, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onTyping(result);
        });
        this.subscriptions.onMessageStatusChanged = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_MESSAGE_STATUS_CHANGED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onMessageStatusChanged(result);
        });
        this.subscriptions.onHasNewMessage = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_NEW_MESSAGE, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onHasNewMessage(result);
        });
        this.subscriptions.onMessageFromMe = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_MESSAGE_FROM_ME, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onMessageFromMe(result);
        });
        this.subscriptions.onGroupInvited = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_GROUP_INVITED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onGroupInvited(result);
        });
        this.subscriptions.onGroupLeft = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_GROUP_LEFT, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onGroupLeft(result);
        });
        this.subscriptions.onGroupRenamed = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_GROUP_RENAMED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onGroupRenamed(result);
        });
        this.subscriptions.onGroupAdminChanged = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_GROUP_ADMIN_CHANGED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.onGroupAdminChanged(result);
        });
        this.subscriptions.onGroupPublicJoined = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_GROUP_PUBLIC_JOINED, ({ error, result }) => {
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

    shouldRenderTimeMark(index) {
        if (index === 0) {
            return true;
        }
        let currentMessage = this.state.messages[index];
        let prevMessage = this.state.messages[index - 1];

        if (!currentMessage.created) {
            return false;
        }
        if (new Date(currentMessage.created) === 'Invalid Date' || isNaN(new Date(currentMessage.created))) {
            return false;
        }
        if (!prevMessage.created) {
            return false;
        }
        if (new Date(prevMessage.created) === 'Invalid Date' || isNaN(new Date(prevMessage.created))) {
            return false;
        }

        let currentMessageDate = new Date(currentMessage.created);
        let currentMesssageYear = currentMessageDate.getFullYear();
        let currentMesssageMonth = currentMessageDate.getMonth();
        let currentMesssageDay = currentMessageDate.getDate();
        let prevMessageDate = new Date(prevMessage.created);
        let prevMesssageYear = prevMessageDate.getFullYear();
        let prevMesssageMonth = prevMessageDate.getMonth();
        let prevMesssageDay = prevMessageDate.getDate();

        if (currentMesssageYear !== prevMesssageYear || currentMesssageMonth !== prevMesssageMonth || currentMesssageDay !== prevMesssageDay) {
            return true;
        }
        return false;
    };
    shouldRenderSender(index) {
        if (index === 0) {
            return true;
        }

        let currentMessage = this.state.messages[index];
        let prevMessage = this.state.messages[index - 1];

        let groupActionMessageTypes = [
            this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_CREATED,
            this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_INVITED,
            this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_LEFT,
            this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_RENAMED,
            this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_ADMIN_CHANGED,
            this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_PUBLIC_JOINED
        ];

        if (groupActionMessageTypes.indexOf(prevMessage.type) > -1) {
            return true;
        }

        if (currentMessage.senderId !== this.props.AZStackCore.authenticatedUser.userId && currentMessage.senderId !== prevMessage.senderId) {
            return true;
        }

        return false;
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
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_CREATED:
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_RENAMED:
                                resolve(message);
                                break;
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER:
                                Image.getSize(message.sticker.url, (width, height) => {
                                    message.sticker.width = width;
                                    message.sticker.height = height;
                                    resolve(message);
                                }, (error) => {
                                    resolve(message);
                                });
                                break;
                            case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_FILE:
                                switch (message.file.type) {
                                    case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_IMAGE:
                                        Image.getSize(message.file.url, (width, height) => {
                                            message.file.width = width;
                                            message.file.height = height;
                                            resolve(message);
                                        }, (error) => {
                                            resolve(message);
                                        });
                                        break;
                                    case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_AUDIO:
                                    case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_VIDEO:
                                    case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_EXCEL:
                                    case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_WORD:
                                    case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_POWERPOINT:
                                    case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_PDF:
                                    case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_TEXT:
                                    case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_CODE:
                                    case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_ARCHIVE:
                                    case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_UNKNOWN:
                                    default:
                                        resolve(message);
                                        break;
                                }
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

    onTyping(typingDetails) {

        if (typingDetails.chatType !== this.props.chatType || typingDetails.chatId !== this.props.chatId) {
            return;
        }

        let typing = { ...this.state.typing };

        if (typing.clears[typingDetails.sender.userId]) {
            clearTimeout(typing.clears[typingDetails.sender.userId]);
        } else {
            typing.senders.push(typingDetails.sender);
        }
        typing.clears[typingDetails.sender.userId] = setTimeout(() => {
            let foundIndex = -1;
            for (let j = 0; j < typing.senders.length; j++) {
                let sender = typing.senders[j];
                if (sender.userId === typingDetails.sender.userId) {
                    foundIndex = j;
                    break;
                }
            }
            if (foundIndex > -1) {
                typing.senders.splice(foundIndex, 1);
                delete typing.clears[typingDetails.sender.userId];
            }
            this.setState({ typing: typing });
        }, 5000);
        this.setState({ typing: typing });
    };
    onMessageStatusChanged(newStatus) {

        if (newStatus.chatType !== this.props.chatType || newStatus.chatId !== this.props.chatId) {
            return;
        }

        let messages = [].concat(this.state.messages);
        for (let i = 0; i < messages.length; i++) {
            let message = messages[i];
            if (message.msgId === newStatus.msgId) {
                message.status = newStatus.messageStatus;
                break;
            }
        }
        this.setState({ messages: messages });
    };
    onHasNewMessage(newMessage) {

        if (newMessage.chatType !== this.props.chatType || newMessage.chatId !== this.props.chatId) {
            return;
        }

        Promise.all([
            new Promise((resolve, reject) => {
                this.props.AZStackCore.changeMessageStatus({
                    chatType: newMessage.chatType,
                    chatId: newMessage.chatId,
                    messageSenderId: newMessage.senderId,
                    messageStatus: this.props.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN,
                    msgId: newMessage.msgId
                }).then((result) => {
                    newMessage.status = this.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN;
                    resolve(null);
                }).catch((error) => {
                    resolve(null);
                });
            }),
            new Promise((resolve, reject) => {
                switch (newMessage.type) {
                    case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT:
                        resolve(null);
                        break;
                    case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER:
                        Image.getSize(newMessage.sticker.url, (width, height) => {
                            newMessage.sticker.width = width;
                            newMessage.sticker.height = height;
                            resolve(null);
                        }, (error) => {
                            resolve(null);
                        });
                        break;
                    case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_FILE:
                        switch (newMessage.file.type) {
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_IMAGE:
                                Image.getSize(newMessage.file.url, (width, height) => {
                                    newMessage.file.width = width;
                                    newMessage.file.height = height;
                                    resolve(null);
                                }, (error) => {
                                    resolve(null);
                                });
                                break;
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_AUDIO:
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_VIDEO:
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_EXCEL:
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_WORD:
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_POWERPOINT:
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_PDF:
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_TEXT:
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_CODE:
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_ARCHIVE:
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_UNKNOWN:
                            default:
                                resolve(null);
                                break;
                        }
                        break;
                    default:
                        resolve(null);
                        break;
                }
            })
        ]).then(() => {
            newMessage.prepared = true;
            let messages = [].concat(this.state.messages);
            messages.push(newMessage);
            this.setState({
                messages: messages.sort((a, b) => {
                    return a.created < b.created ? -1 : 1
                })
            });
        }).catch((error) => { });
    };
    onMessageFromMe(myMessage) {
        if (myMessage.chatType !== this.props.chatType || myMessage.chatId !== this.props.chatId) {
            return;
        }

        Promise.all([
            new Promise((resolve, reject) => {
                switch (myMessage.type) {
                    case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT:
                        resolve(null);
                        break;
                    case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER:
                        Image.getSize(myMessage.sticker.url, (width, height) => {
                            myMessage.sticker.width = width;
                            myMessage.sticker.height = height;
                            resolve(null);
                        }, (error) => {
                            resolve(null);
                        });
                        break;
                    case this.props.AZStackCore.chatConstants.MESSAGE_TYPE_FILE:
                        switch (myMessage.file.type) {
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_IMAGE:
                                Image.getSize(myMessage.file.url, (width, height) => {
                                    myMessage.file.width = width;
                                    myMessage.file.height = height;
                                    resolve(null);
                                }, (error) => {
                                    resolve(null);
                                });
                                break;
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_AUDIO:
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_VIDEO:
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_EXCEL:
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_WORD:
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_POWERPOINT:
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_PDF:
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_TEXT:
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_CODE:
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_ARCHIVE:
                            case this.props.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_UNKNOWN:
                            default:
                                resolve(null);
                                break;
                        }
                        break;
                    default:
                        resolve(null);
                        break;
                }
            })
        ]).then(() => {
            myMessage.prepared = true;
            let messages = [].concat(this.state.messages);
            messages.push(myMessage);
            this.setState({
                messages: messages.sort((a, b) => {
                    return a.created < b.created ? -1 : 1
                })
            });
        }).catch((error) => { });
    };
    onGroupInvited(newMessage) {
        if (newMessage.chatType !== this.props.chatType || newMessage.chatId !== this.props.chatId) {
            return;
        }

        Promise.all([
            new Promise((resolve, reject) => {

                if (newMessage.senderId === this.props.AZStackCore.authenticatedUser.userId) {
                    return resolve(null);
                }

                this.props.AZStackCore.changeMessageStatus({
                    chatType: newMessage.chatType,
                    chatId: newMessage.chatId,
                    messageSenderId: newMessage.senderId,
                    messageStatus: this.props.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN,
                    msgId: newMessage.msgId
                }).then((result) => {
                    newMessage.status = this.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN;
                    resolve(null);
                }).catch((error) => {
                    resolve(null);
                });
            })
        ]).then(() => {
            newMessage.prepared = true;
            let messages = [].concat(this.state.messages);
            messages.push(newMessage);
            this.setState({
                messages: messages.sort((a, b) => {
                    return a.created < b.created ? -1 : 1
                }),
                chatTarget: newMessage.receiver
            });
        }).catch((error) => { });
    };
    onGroupLeft(newMessage) {
        if (newMessage.chatType !== this.props.chatType || newMessage.chatId !== this.props.chatId) {
            return;
        }

        Promise.all([
            new Promise((resolve, reject) => {

                if (newMessage.senderId === this.props.AZStackCore.authenticatedUser.userId) {
                    return resolve(null);
                }

                this.props.AZStackCore.changeMessageStatus({
                    chatType: newMessage.chatType,
                    chatId: newMessage.chatId,
                    messageSenderId: newMessage.senderId,
                    messageStatus: this.props.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN,
                    msgId: newMessage.msgId
                }).then((result) => {
                    newMessage.status = this.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN;
                    resolve(null);
                }).catch((error) => {
                    resolve(null);
                });
            })
        ]).then(() => {
            newMessage.prepared = true;
            let messages = [].concat(this.state.messages);
            messages.push(newMessage);
            this.setState({
                messages: messages.sort((a, b) => {
                    return a.created < b.created ? -1 : 1
                }),
                chatTarget: newMessage.receiver
            });
        }).catch((error) => { });
    };
    onGroupRenamed(newMessage) {
        if (newMessage.chatType !== this.props.chatType || newMessage.chatId !== this.props.chatId) {
            return;
        }

        Promise.all([
            new Promise((resolve, reject) => {

                if (newMessage.senderId === this.props.AZStackCore.authenticatedUser.userId) {
                    return resolve(null);
                }

                this.props.AZStackCore.changeMessageStatus({
                    chatType: newMessage.chatType,
                    chatId: newMessage.chatId,
                    messageSenderId: newMessage.senderId,
                    messageStatus: this.props.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN,
                    msgId: newMessage.msgId
                }).then((result) => {
                    newMessage.status = this.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN;
                    resolve(null);
                }).catch((error) => {
                    resolve(null);
                });
            })
        ]).then(() => {
            newMessage.prepared = true;
            let messages = [].concat(this.state.messages);
            messages.push(newMessage);
            this.setState({
                messages: messages.sort((a, b) => {
                    return a.created < b.created ? -1 : 1
                }),
                chatTarget: newMessage.receiver
            });
        }).catch((error) => { });
    };
    onGroupAdminChanged(newMessage) {
        if (newMessage.chatType !== this.props.chatType || newMessage.chatId !== this.props.chatId) {
            return;
        }

        Promise.all([
            new Promise((resolve, reject) => {

                if (newMessage.senderId === this.props.AZStackCore.authenticatedUser.userId) {
                    return resolve(null);
                }

                this.props.AZStackCore.changeMessageStatus({
                    chatType: newMessage.chatType,
                    chatId: newMessage.chatId,
                    messageSenderId: newMessage.senderId,
                    messageStatus: this.props.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN,
                    msgId: newMessage.msgId
                }).then((result) => {
                    newMessage.status = this.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN;
                    resolve(null);
                }).catch((error) => {
                    resolve(null);
                });
            })
        ]).then(() => {
            newMessage.prepared = true;
            let messages = [].concat(this.state.messages);
            messages.push(newMessage);
            this.setState({
                messages: messages.sort((a, b) => {
                    return a.created < b.created ? -1 : 1
                }),
                chatTarget: newMessage.receiver
            });
        }).catch((error) => { });
    };
    onGroupPublicJoined(newMessage) {
        if (newMessage.chatType !== this.props.chatType || newMessage.chatId !== this.props.chatId) {
            return;
        }

        Promise.all([
            new Promise((resolve, reject) => {

                if (newMessage.senderId === this.props.AZStackCore.authenticatedUser.userId) {
                    return resolve(null);
                }

                this.props.AZStackCore.changeMessageStatus({
                    chatType: newMessage.chatType,
                    chatId: newMessage.chatId,
                    messageSenderId: newMessage.senderId,
                    messageStatus: this.props.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN,
                    msgId: newMessage.msgId
                }).then((result) => {
                    newMessage.status = this.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN;
                    resolve(null);
                }).catch((error) => {
                    resolve(null);
                });
            })
        ]).then(() => {
            newMessage.prepared = true;
            let messages = [].concat(this.state.messages);
            messages.push(newMessage);
            this.setState({
                messages: messages.sort((a, b) => {
                    return a.created < b.created ? -1 : 1
                }),
                chatTarget: newMessage.receiver
            });
        }).catch((error) => { });
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
                fullScreen={false}
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
                    {
                        this.state.messages.length > 0 && <FlatList
                            style={this.props.CustomStyle.getStyle('MESSAGES_LIST_STYLE')}
                            data={this.state.messages}
                            keyExtractor={(item, index) => (item.msgId)}
                            renderItem={({ item, index }) => {
                                return (
                                    <MessageBlockComponent
                                        Language={this.props.Language}
                                        CustomStyle={this.props.CustomStyle}
                                        AZStackCore={this.props.AZStackCore}
                                        message={item}
                                        shouldRenderTimeMark={this.shouldRenderTimeMark(index)}
                                        shouldRenderSender={this.shouldRenderSender(index)}
                                    />
                                );
                            }}
                        />
                    }
                </ScreenBodyBlockComponent>
                <View
                    style={this.props.CustomStyle.getStyle('CHAT_TYPING_BLOCK_STYLE')}
                >
                    {
                        this.state.typing.senders.length > 0 && (
                            <TypingBlockComponent
                                Language={this.props.Language}
                                CustomStyle={this.props.CustomStyle}
                                textStyle={this.props.CustomStyle.getStyle('CHAT_TYPING_TEXT_STYLE')}
                                typing={this.state.typing}
                            />
                        )
                    }
                </View>
                {
                    !this.state.chatTarget && (
                        <ChatInputDisabledComponent
                            CustomStyle={this.props.CustomStyle}
                            Language={this.props.Language}
                        />
                    )
                }
                {
                    !!this.state.chatTarget && (
                        <ChatInputComponentBlock
                            CustomStyle={this.props.CustomStyle}
                            Language={this.props.Language}
                            AZStackCore={this.props.AZStackCore}
                            chatType={this.props.chatType}
                            chatId={this.props.chatId}
                        />
                    )
                }
            </ScreenBlockComponent>
        );
    };
};

export default ChatComponent;