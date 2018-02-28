import React from 'react';
import {
    BackHandler,
    Platform,
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
import ConnectionBlockComponent from './part/common/ConnectionBlockComponent';

class ChatComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

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
            },
            file: {
                lastCreated: new Date().getTime()
            }
        };
        this.files = [];

        this.state = {
            chatTarget: null,
            typing: {
                senders: [],
                clears: {}
            },
            unreads: [],
            messages: [],
            hasDraftData: false
        };

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);

        this.onMessagesListEndReach = this.onMessagesListEndReach.bind(this);
        this.onMessageImagePressed = this.onMessageImagePressed.bind(this);
        this.onMessageLocationPressed = this.onMessageLocationPressed.bind(this);

        this.onChatInputDraftDataStatusChanged = this.onChatInputDraftDataStatusChanged.bind(this);
    };

    onHardBackButtonPressed() {
        this.props.onBackButtonPressed();
        return true;
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
        this.pagination.unread.page = 1;
        this.pagination.modified.page = 1;
        this.pagination.modified.lastCreated = new Date().getTime();
        this.pagination.modified.loading = false;
        this.pagination.modified.done = false;
        this.pagination.file.lastCreated = new Date().getTime();
        this.state.chatTarget = null;
        this.state.unreads = [];
        this.state.messages = [];
        this.files = [];

        this.getChatTarget();
        this.getModifiedFiles();
    };

    shouldRenderTimeMark(index) {
        if (index === this.state.messages.length - 1) {
            return true;
        }
        let currentMessage = this.state.messages[index];
        let nextMessage = this.state.messages[index + 1];

        if (!currentMessage.created) {
            return false;
        }
        if (new Date(currentMessage.created) === 'Invalid Date' || isNaN(new Date(currentMessage.created))) {
            return false;
        }
        if (!nextMessage.created) {
            return false;
        }
        if (new Date(nextMessage.created) === 'Invalid Date' || isNaN(new Date(nextMessage.created))) {
            return false;
        }

        let currentMessageDate = new Date(currentMessage.created);
        let currentMesssageYear = currentMessageDate.getFullYear();
        let currentMesssageMonth = currentMessageDate.getMonth();
        let currentMesssageDay = currentMessageDate.getDate();
        let nextMessageDate = new Date(nextMessage.created);
        let nextMesssageYear = nextMessageDate.getFullYear();
        let nextMesssageMonth = nextMessageDate.getMonth();
        let nextMesssageDay = nextMessageDate.getDate();

        if (currentMesssageYear !== nextMesssageYear || currentMesssageMonth !== nextMesssageMonth || currentMesssageDay !== nextMesssageDay) {
            return true;
        }
        return false;
    };
    shouldRenderSender(index) {

        let currentMessage = this.state.messages[index];

        let groupActionMessageTypes = [
            this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_CREATED,
            this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_INVITED,
            this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_LEFT,
            this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_RENAMED,
            this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_ADMIN_CHANGED,
            this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_PUBLIC_JOINED
        ];

        if (groupActionMessageTypes.indexOf(currentMessage.type) > -1) {
            return false;
        }

        if (index === this.state.messages.length - 1) {
            return true;
        }

        let nextMessage = this.state.messages[index + 1];

        if (groupActionMessageTypes.indexOf(nextMessage.type) > -1) {
            return true;
        }

        if (currentMessage.senderId !== this.coreInstances.AZStackCore.authenticatedUser.userId && currentMessage.senderId !== nextMessage.senderId) {
            return true;
        }

        return false;
    };

    getChatTarget() {
        if (!this.coreInstances.AZStackCore.slaveSocketConnected) {
            return;
        }

        if (this.props.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_USER) {
            this.coreInstances.AZStackCore.getUsersInformation({
                userIds: [this.props.chatId]
            }).then((result) => {
                this.setState({ chatTarget: result.list[0] });
                this.getUnreadMessages();
            }).catch((error) => { })
        } else if (this.props.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_GROUP) {
            this.coreInstances.AZStackCore.getDetailsGroup({
                groupId: this.props.chatId
            }).then((result) => {
                this.setState({ chatTarget: result });
                this.getUnreadMessages();
            }).catch((error) => { });
        }
    };
    getUnreadMessages() {
        if (!this.coreInstances.AZStackCore.slaveSocketConnected) {
            return;
        }

        if (!this.state.chatTarget) {
            return;
        }

        this.coreInstances.AZStackCore.getUnreadMessages({
            page: this.pagination.unread.page,
            chatType: this.props.chatType,
            chatId: this.props.chatId
        }).then((result) => {
            this.setState({ unreads: this.state.unreads.concat(result.list) }, () => {
                if (result.done === this.coreInstances.AZStackCore.listConstants.GET_LIST_DONE) {
                    this.getModifiedMessages();
                } else {
                    this.pagination.unread.page += 1;
                    this.getUnreadMessages();
                }
            });
        }).catch((error) => { });

    };
    getModifiedMessages() {
        if (!this.coreInstances.AZStackCore.slaveSocketConnected) {
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

        this.coreInstances.AZStackCore.getModifiedMessages({
            page: this.pagination.modified.page,
            lastCreated: this.pagination.modified.lastCreated,
            chatType: this.props.chatType,
            chatId: this.props.chatId
        }).then((result) => {

            rawMessages = rawMessages.concat(result.list);
            this.prepareMessages(rawMessages).then((preparedMessages) => {

                let unorderedMessages = this.state.messages.concat(preparedMessages);
                this.setState({
                    messages: unorderedMessages.sort((a, b) => {
                        return a.created > b.created ? -1 : 1
                    })
                });

                if (result.done === this.coreInstances.AZStackCore.listConstants.GET_LIST_DONE) {
                    this.pagination.modified.done = true;
                } else {
                    this.pagination.modified.page += 1;
                }

                this.pagination.modified.loading = false;
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

                    if (message.senderId !== this.coreInstances.AZStackCore.authenticatedUser.userId && message.status !== this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN && message.status !== this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_CANCELLED) {
                        this.coreInstances.AZStackCore.changeMessageStatus({
                            chatType: message.chatType,
                            chatId: message.chatId,
                            messageSenderId: message.senderId,
                            messageStatus: this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN,
                            msgId: message.msgId
                        }).then((result) => {
                            message.status = this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN;
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

                        if (message.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_USER) {
                            if (message.senderId === message.chatId) {
                                message.sender = this.state.chatTarget;
                                message.receiver = this.coreInstances.AZStackCore.authenticatedUser;
                            } else if (message.receiverId === message.chatId) {
                                message.sender = this.coreInstances.AZStackCore.authenticatedUser;
                                message.receiver = this.state.chatTarget;
                            }
                            resolve(message);
                        } else if (message.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_GROUP) {
                            message.receiver = this.state.chatTarget;
                            let foundSender = false;
                            if (message.senderId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
                                foundSender = true;
                                message.sender = this.coreInstances.AZStackCore.authenticatedUser
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

                            this.coreInstances.AZStackCore.getUsersInformation({
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
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_LOCATION:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_CREATED:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_RENAMED:
                                resolve(message);
                                break;
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER:
                                if (message.sticker.width && message.sticker.height) {
                                    return resolve(message);
                                }

                                Image.getSize(message.sticker.url, (width, height) => {
                                    message.sticker.width = width;
                                    message.sticker.height = height;
                                    resolve(message);
                                }, (error) => {
                                    resolve(message);
                                });
                                break;
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_FILE:
                                switch (message.file.type) {
                                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_IMAGE:
                                        if (message.file.width && message.file.height) {
                                            return resolve(message);
                                        }

                                        Image.getSize(message.file.url, (width, height) => {
                                            message.file.width = width;
                                            message.file.height = height;
                                            resolve(message);
                                        }, (error) => {
                                            resolve(message);
                                        });
                                        break;
                                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_AUDIO:
                                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_VIDEO:
                                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_EXCEL:
                                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_WORD:
                                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_POWERPOINT:
                                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_PDF:
                                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_TEXT:
                                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_CODE:
                                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_ARCHIVE:
                                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_UNKNOWN:
                                    default:
                                        resolve(message);
                                        break;
                                }
                                break;
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_INVITED:
                                message.invited.invites = [];
                                Promise.all(
                                    message.invited.inviteIds.map((inviteId) => {
                                        return new Promise((resolve, reject) => {
                                            this.coreInstances.AZStackCore.getUsersInformation({
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
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_LEFT:
                                let PromiseTasks = [];
                                PromiseTasks.push(
                                    new Promise((resolve, reject) => {
                                        this.coreInstances.AZStackCore.getUsersInformation({
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
                                            this.coreInstances.AZStackCore.getUsersInformation({
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
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_ADMIN_CHANGED:
                                this.coreInstances.AZStackCore.getUsersInformation({
                                    userIds: [message.adminChanged.newAdminId]
                                }).then((result) => {
                                    message.adminChanged.newAdmin = result.list[0];
                                    resolve(message);
                                }).catch((error) => {
                                    message.adminChanged.newAdmin = { userId: message.adminChanged.newAdminId }
                                    resolve(message);
                                });
                                break;
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_GROUP_PUBLIC_JOINED:
                                this.coreInstances.AZStackCore.getUsersInformation({
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
    getModifiedFiles() {
        this.coreInstances.AZStackCore.getModifiedFiles({
            lastCreated: this.pagination.file.lastCreated,
            chatType: this.props.chatType,
            chatId: this.props.chatId
        }).then((result) => {
            this.prepareFiles(result.list).then((preparedFiles) => {
                this.files = this.files.concat(preparedFiles).sort((a, b) => {
                    return a.created < b.created ? -1 : 1
                });
            }).catch((error) => { });
        }).catch((error) => { });
    };
    prepareFiles(files) {

        return Promise.all(
            files.map((file) => {
                return new Promise((resolve, reject) => {

                    if (file.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_USER) {
                        if (file.senderId === file.chatId) {
                            file.sender = this.state.chatTarget;
                            file.receiver = this.coreInstances.AZStackCore.authenticatedUser;
                        } else if (file.receiverId === file.chatId) {
                            file.sender = this.coreInstances.AZStackCore.authenticatedUser;
                            file.receiver = this.state.chatTarget;
                        }
                        resolve(file);
                    } else if (file.chatType === this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_GROUP) {
                        file.receiver = this.state.chatTarget;
                        let foundSender = false;
                        if (file.senderId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
                            foundSender = true;
                            file.sender = this.coreInstances.AZStackCore.authenticatedUser
                        } else {
                            for (let i = 0; i < this.state.chatTarget.members.length; i++) {
                                let member = this.state.chatTarget.members[i];
                                if (file.senderId === member.userId) {
                                    foundSender = true;
                                    file.sender = member;
                                    break;
                                }
                            }
                        }
                        if (foundSender) {
                            return resolve(file);
                        }

                        this.coreInstances.AZStackCore.getUsersInformation({
                            userIds: [file.senderId]
                        }).then((result) => {
                            file.sender = result.list[0];
                            resolve(file);
                        }).catch((error) => {
                            file.sender = { userId: file.senderId };
                            resolve(file);
                        })
                    }
                });
            })
        ).then((files) => {
            return Promise.all(
                files.map((file) => {
                    return new Promise((resolve, reject) => {
                        switch (file.file.type) {
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_IMAGE:
                                if (file.file.width && file.file.height) {
                                    return resolve(file);
                                }

                                Image.getSize(file.file.url, (width, height) => {
                                    file.file.width = width;
                                    file.file.height = height;
                                    resolve(file);
                                }, (error) => {
                                    resolve(file);
                                });
                                break;
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_AUDIO:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_VIDEO:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_EXCEL:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_WORD:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_POWERPOINT:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_PDF:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_TEXT:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_CODE:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_ARCHIVE:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_UNKNOWN:
                            default:
                                resolve(file);
                                break;
                        }
                    });
                })
            );
        });
    };

    onMessagesListEndReach() {
        this.getModifiedMessages();
    };
    onMessageImagePressed(event) {
        let imageFiles = this.files.filter((file) => {
            return file.file.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_IMAGE;
        });
        if (!imageFiles.length) {
            return;
        }
        let imageIndex = -1;
        for (let i = 0; i < imageFiles.length; i++) {
            if (imageFiles[i].msgId === event.msgId) {
                imageIndex = i;
                break;
            }
        }
        if (imageIndex === -1) {
            return;
        }
        this.props.showImageGallery({
            imageFiles: imageFiles,
            initialIndex: imageIndex
        });
    };
    onMessageLocationPressed(event) {
        console.log(event);
    };

    onChatInputDraftDataStatusChanged(status) {
        this.setState({ hasDraftData: status });
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
                this.coreInstances.AZStackCore.changeMessageStatus({
                    chatType: newMessage.chatType,
                    chatId: newMessage.chatId,
                    messageSenderId: newMessage.senderId,
                    messageStatus: this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN,
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
                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT:
                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_LOCATION:
                        resolve(null);
                        break;
                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER:
                        if (newMessage.sticker.width && newMessage.sticker.height) {
                            return resolve(null);
                        }

                        Image.getSize(newMessage.sticker.url, (width, height) => {
                            newMessage.sticker.width = width;
                            newMessage.sticker.height = height;
                            resolve(null);
                        }, (error) => {
                            resolve(null);
                        });
                        break;
                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_FILE:
                        switch (newMessage.file.type) {
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_IMAGE:
                                if (newMessage.file.width && newMessage.file.height) {
                                    return resolve(null);
                                }

                                Image.getSize(newMessage.file.url, (width, height) => {
                                    newMessage.file.width = width;
                                    newMessage.file.height = height;
                                    resolve(null);
                                }, (error) => {
                                    resolve(null);
                                });
                                break;
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_AUDIO:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_VIDEO:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_EXCEL:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_WORD:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_POWERPOINT:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_PDF:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_TEXT:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_CODE:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_ARCHIVE:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_UNKNOWN:
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
                    return a.created > b.created ? -1 : 1
                })
            }, () => {
                this.refs.MessagesList.scrollToOffset({
                    offset: 0,
                    animated: true
                });
            });
            if (newMessage.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_FILE) {
                this.files.push(newMessage);
                this.files = this.files.sort((a, b) => {
                    return a.created < b.created ? -1 : 1
                })
            }
        }).catch((error) => { });
    };
    onMessageFromMe(myMessage) {
        if (myMessage.chatType !== this.props.chatType || myMessage.chatId !== this.props.chatId) {
            return;
        }

        Promise.all([
            new Promise((resolve, reject) => {
                switch (myMessage.type) {
                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT:
                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_LOCATION:
                        resolve(null);
                        break;
                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER:
                        if (myMessage.sticker.width && myMessage.sticker.height) {
                            return resolve(null);
                        }

                        Image.getSize(myMessage.sticker.url, (width, height) => {
                            myMessage.sticker.width = width;
                            myMessage.sticker.height = height;
                            resolve(null);
                        }, (error) => {
                            resolve(null);
                        });
                        break;
                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_FILE:
                        switch (myMessage.file.type) {
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_IMAGE:
                                if (myMessage.file.width && myMessage.file.height) {
                                    return resolve(null);
                                }

                                Image.getSize(myMessage.file.url, (width, height) => {
                                    myMessage.file.width = width;
                                    myMessage.file.height = height;
                                    resolve(null);
                                }, (error) => {
                                    resolve(null);
                                });
                                break;
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_AUDIO:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_VIDEO:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_EXCEL:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_WORD:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_POWERPOINT:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_PDF:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_TEXT:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_CODE:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_ARCHIVE:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_UNKNOWN:
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
                    return a.created > b.created ? -1 : 1
                })
            }, () => {
                this.refs.MessagesList.scrollToOffset({
                    offset: 0,
                    animated: true
                });
            });
            if (myMessage.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_FILE) {
                this.files.push(myMessage);
                this.files = this.files.sort((a, b) => {
                    return a.created < b.created ? -1 : 1
                })
            }
        }).catch((error) => { });
    };
    onNewMessageReturn(myMessage) {
        if (myMessage.chatType !== this.props.chatType || myMessage.chatId !== this.props.chatId) {
            return;
        }

        Promise.all([
            new Promise((resolve, reject) => {
                switch (myMessage.type) {
                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_TEXT:
                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_LOCATION:
                        resolve(null);
                        break;
                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_STICKER:
                        if (myMessage.sticker.width && myMessage.sticker.height) {
                            return resolve(null);
                        }

                        Image.getSize(myMessage.sticker.url, (width, height) => {
                            myMessage.sticker.width = width;
                            myMessage.sticker.height = height;
                            resolve(null);
                        }, (error) => {
                            resolve(null);
                        });
                        break;
                    case this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_FILE:
                        switch (myMessage.file.type) {
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_IMAGE:
                                if (myMessage.file.width && myMessage.file.height) {
                                    return resolve(null);
                                }

                                Image.getSize(myMessage.file.url, (width, height) => {
                                    myMessage.file.width = width;
                                    myMessage.file.height = height;
                                    resolve(null);
                                }, (error) => {
                                    resolve(null);
                                });
                                break;
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_AUDIO:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_VIDEO:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_EXCEL:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_WORD:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_POWERPOINT:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_PDF:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_TEXT:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_CODE:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_ARCHIVE:
                            case this.coreInstances.AZStackCore.chatConstants.MESSAGE_FILE_TYPE_UNKNOWN:
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
            let messageExisted = false;
            for (let i = 0; i < messages.length; i++) {
                let message = messages[i];
                if (message.msgId === myMessage.msgId) {
                    messageExisted = true;
                    message.status = myMessage.status;
                    message.created = myMessage.created;
                    message.modified = myMessage.modified;
                    break;
                }
            }
            if (!messageExisted) {
                messages.push(myMessage);
                if (myMessage.type === this.coreInstances.AZStackCore.chatConstants.MESSAGE_TYPE_FILE) {
                    this.files.push(myMessage);
                    this.files = this.files.sort((a, b) => {
                        return a.created < b.created ? -1 : 1
                    })
                }
            }
            this.setState({
                messages: messages.sort((a, b) => {
                    return a.created > b.created ? -1 : 1
                })
            }, () => {
                if (!messageExisted) {
                    this.refs.MessagesList.scrollToOffset({
                        offset: 0,
                        animated: true
                    });
                }
            });
        }).catch((error) => { });
    };
    onGroupInvited(newMessage) {
        if (newMessage.chatType !== this.props.chatType || newMessage.chatId !== this.props.chatId) {
            return;
        }

        Promise.all([
            new Promise((resolve, reject) => {

                if (newMessage.senderId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
                    return resolve(null);
                }

                this.coreInstances.AZStackCore.changeMessageStatus({
                    chatType: newMessage.chatType,
                    chatId: newMessage.chatId,
                    messageSenderId: newMessage.senderId,
                    messageStatus: this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN,
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
                    return a.created > b.created ? -1 : 1
                }),
                chatTarget: newMessage.receiver
            }, () => {
                this.refs.MessagesList.scrollToOffset({
                    offset: 0,
                    animated: true
                });
            });
        }).catch((error) => { });
    };
    onGroupLeft(newMessage) {
        if (newMessage.chatType !== this.props.chatType || newMessage.chatId !== this.props.chatId) {
            return;
        }

        Promise.all([
            new Promise((resolve, reject) => {

                if (newMessage.senderId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
                    return resolve(null);
                }

                this.coreInstances.AZStackCore.changeMessageStatus({
                    chatType: newMessage.chatType,
                    chatId: newMessage.chatId,
                    messageSenderId: newMessage.senderId,
                    messageStatus: this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN,
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
                    return a.created > b.created ? -1 : 1
                }),
                chatTarget: newMessage.receiver
            }, () => {
                this.refs.MessagesList.scrollToOffset({
                    offset: 0,
                    animated: true
                });
            });
        }).catch((error) => { });
    };
    onGroupRenamed(newMessage) {
        if (newMessage.chatType !== this.props.chatType || newMessage.chatId !== this.props.chatId) {
            return;
        }

        Promise.all([
            new Promise((resolve, reject) => {

                if (newMessage.senderId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
                    return resolve(null);
                }

                this.coreInstances.AZStackCore.changeMessageStatus({
                    chatType: newMessage.chatType,
                    chatId: newMessage.chatId,
                    messageSenderId: newMessage.senderId,
                    messageStatus: this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN,
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
                    return a.created > b.created ? -1 : 1
                }),
                chatTarget: newMessage.receiver
            }, () => {
                this.refs.MessagesList.scrollToOffset({
                    offset: 0,
                    animated: true
                });
            });
        }).catch((error) => { });
    };
    onGroupAdminChanged(newMessage) {
        if (newMessage.chatType !== this.props.chatType || newMessage.chatId !== this.props.chatId) {
            return;
        }

        Promise.all([
            new Promise((resolve, reject) => {

                if (newMessage.senderId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
                    return resolve(null);
                }

                this.coreInstances.AZStackCore.changeMessageStatus({
                    chatType: newMessage.chatType,
                    chatId: newMessage.chatId,
                    messageSenderId: newMessage.senderId,
                    messageStatus: this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN,
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
                    return a.created > b.created ? -1 : 1
                }),
                chatTarget: newMessage.receiver
            }, () => {
                this.refs.MessagesList.scrollToOffset({
                    offset: 0,
                    animated: true
                });
            });
        }).catch((error) => { });
    };
    onGroupPublicJoined(newMessage) {
        if (newMessage.chatType !== this.props.chatType || newMessage.chatId !== this.props.chatId) {
            return;
        }

        Promise.all([
            new Promise((resolve, reject) => {

                if (newMessage.senderId === this.coreInstances.AZStackCore.authenticatedUser.userId) {
                    return resolve(null);
                }

                this.coreInstances.AZStackCore.changeMessageStatus({
                    chatType: newMessage.chatType,
                    chatId: newMessage.chatId,
                    messageSenderId: newMessage.senderId,
                    messageStatus: this.coreInstances.AZStackCore.chatConstants.MESSAGE_STATUS_SEEN,
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
                    return a.created > b.created ? -1 : 1
                }),
                chatTarget: newMessage.receiver
            }, () => {
                this.refs.MessagesList.scrollToOffset({
                    offset: 0,
                    animated: true
                });
            });
        }).catch((error) => { });
    };

    componentDidMount() {
        this.addSubscriptions();
        this.initRun();
        BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
    };
    componentWillUnmount() {
        this.clearSubscriptions();
        BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
    };

    render() {
        return (
            <ScreenBlockComponent
                fullScreen={false}
                getCoreInstances={this.props.getCoreInstances}
                statusbar={this.props.statusbar}
                style={this.props.style}
            >
                <View
                    style={this.coreInstances.CustomStyle.getStyle('CHAT_NOT_INPUT_BLOCK_STYLE')}
                >
                    {
                        !this.state.chatTarget && <ScreenHeaderBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            onBackButtonPressed={this.props.onBackButtonPressed}
                            title={this.coreInstances.Language.getText('CHAT_HEADER_TITLE_TEXT')}
                        />
                    }
                    {
                        !!this.state.chatTarget && <ChatHeaderComponent
                            getCoreInstances={this.props.getCoreInstances}
                            onBackButtonPressed={this.props.onBackButtonPressed}
                            onChatTargetPressed={this.props.onChatTargetPressed}
                            onVoiceCallButtonPressed={this.props.onVoiceCallButtonPressed}
                            onVideoCallButtonPressed={this.props.onVideoCallButtonPressed}
                            chatType={this.props.chatType}
                            chatTarget={this.state.chatTarget}
                        />
                    }
                    <ScreenBodyBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                        style={this.props.contentContainerStyle}
                    >
                        {
                            this.state.messages.length === 0 && <EmptyBlockComponent
                                getCoreInstances={this.props.getCoreInstances}
                                emptyText={this.coreInstances.Language.getText('MESSAGES_LIST_EMPTY_TEXT')}
                            />
                        }
                        {
                            this.state.messages.length > 0 && <FlatList
                                ref={'MessagesList'}
                                inverted={true}
                                style={this.coreInstances.CustomStyle.getStyle('MESSAGES_LIST_STYLE')}
                                data={this.state.messages}
                                keyExtractor={(item, index) => (item.msgId)}
                                renderItem={({ item, index }) => {
                                    return (
                                        <MessageBlockComponent
                                            getCoreInstances={this.props.getCoreInstances}
                                            message={item}
                                            shouldRenderTimeMark={this.shouldRenderTimeMark(index)}
                                            shouldRenderSender={this.shouldRenderSender(index)}
                                            onSenderPressed={this.props.onSenderPressed}
                                            onMessageImagePressed={this.onMessageImagePressed}
                                            onMessageLocationPressed={this.onMessageLocationPressed}
                                        />
                                    );
                                }}
                                onEndReached={this.onMessagesListEndReach}
                                onEndReachedThreshold={0.1}
                                keyboardDismissMode={Platform.select({ ios: 'interactive', android: 'on-drag' })}
                            />
                        }
                        <ConnectionBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                        />
                    </ScreenBodyBlockComponent>
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_TYPING_BLOCK_STYLE')}
                    >
                        {
                            this.state.typing.senders.length > 0 && (
                                <TypingBlockComponent
                                    getCoreInstances={this.props.getCoreInstances}
                                    textStyle={this.coreInstances.CustomStyle.getStyle('CHAT_TYPING_TEXT_STYLE')}
                                    typing={this.state.typing}
                                />
                            )
                        }
                    </View>
                    {
                        this.state.hasDraftData && (
                            <View
                                style={this.coreInstances.CustomStyle.getStyle('CHAT_NOT_INPUT_DISABLE_TOUCH_BLOCK_STYLE')}
                            />
                        )
                    }
                </View>
                {
                    !this.state.chatTarget && (
                        <ChatInputDisabledComponent
                            getCoreInstances={this.props.getCoreInstances}
                        />
                    )
                }
                {
                    !!this.state.chatTarget && (
                        <ChatInputComponentBlock
                            getCoreInstances={this.props.getCoreInstances}
                            chatType={this.props.chatType}
                            chatId={this.props.chatId}
                            chatTarget={this.state.chatTarget}
                            onChatInputDraftDataStatusChanged={this.onChatInputDraftDataStatusChanged}
                            showLocationSelecting={this.props.showLocationSelecting}
                            showSketchDrawing={this.props.showSketchDrawing}
                        />
                    )
                }
            </ScreenBlockComponent>
        );
    };
};

export default ChatComponent;