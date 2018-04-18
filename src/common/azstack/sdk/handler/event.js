class Event {
    constructor(options) {
        this.eventConstants = options.eventConstants;
        this.AZStackCore = options.AZStackCore;
        this.EventEmitter = options.EventEmitter;

        this.preparingMessages = {};
    };

    delegatesToEvents() {
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_CONNECT_RETURN] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_CONNECT_RETURN, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_AUTO_RECONNECT_START] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_AUTO_RECONNECT_START, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_AUTO_RECONNECT_STOP] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_AUTO_RECONNECT_STOP, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_AUTO_RECONNECTED] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_AUTO_RECONNECTED, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_RECONNECT_RETURN] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_RECONNECT_RETURN, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_DISCONNECTED] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_DISCONNECTED, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_DISCONNECT_RETURN] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_DISCONNECT_RETURN, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_FREE_CALL_STAUTUS_CHANGED] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_FREE_CALL_STATUS_CHANGED, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_FREE_CALL_STAUTUS_CHANGED_BY_ME] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_FREE_CALL_STATUS_CHANGED_BY_ME, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_CALLIN_STATUS_CHANGED] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_CALLIN_STATUS_CHANGED, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_CALLIN_STATUS_CHANGED_BY_ME] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_CALLIN_STATUS_CHANGED_BY_ME, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_CALLOUT_STAUTUS_CHANGED] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_CALLOUT_STATUS_CHANGED, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_START_CALLOUT_RETURN] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_CALLOUT_START_RETURN, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_LOCAL_STREAM_ARRIVED] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_LOCAL_STREAM_ARRIVED, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_REMOTE_STREAM_ARRIVED] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_REMOTE_STREAM_ARRIVED, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_SWITCH_CAMERA_TYPE_RETURN] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_SWITCH_CAMERA_TYPE_RETURN, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_PAID_CALL_LOG_RETURN] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_PAID_CALL_LOG_RETURN, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_TYPING] = (error, result) => {
            if (error) {
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_TYPING, { error, result: null });
                return;
            }
            let typingDetails = result;
            new Promise.all([
                new Promise((resolve, reject) => {
                    this.AZStackCore.getUsersInformation({
                        userIds: [typingDetails.senderId]
                    }).then((result) => {
                        typingDetails.sender = result.list[0];
                        resolve(null);
                    }).catch((error) => {
                        typingDetails.sender = { userId: myMessage.senderId };
                        resolve(null);
                    });
                })
            ]).then(() => {
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_TYPING, { error: null, result: typingDetails });
            }).catch(() => { });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_MESSAGE_STATUS_CHANGED] = (error, result) => {
            if (this.preparingMessages[result.msgId]) {
                this.preparingMessages[result.msgId].status = result.messageStatus;
                return;
            }
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_MESSAGE_STATUS_CHANGED, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_HAS_NEW_MESSAGE] = (error, result) => {
            if (error) {
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_NEW_MESSAGE, { error, result: null });
                return;
            }
            let newMessage = result;
            this.preparingMessages[newMessage.msgId] = newMessage;
            Promise.all([
                new Promise((resolve, reject) => {
                    this.AZStackCore.changeMessageStatus({
                        chatType: newMessage.chatType,
                        chatId: newMessage.chatId,
                        messageSenderId: newMessage.senderId,
                        messageStatus: this.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED,
                        msgId: newMessage.msgId
                    }).then((result) => {
                        newMessage.status = this.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED;
                        resolve(null);
                    }).catch((error) => {
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    this.AZStackCore.getUsersInformation({
                        userIds: [newMessage.senderId]
                    }).then((result) => {
                        newMessage.sender = result.list[0];
                        resolve(null);
                    }).catch((error) => {
                        newMessage.sender = { userId: newMessage.senderId };
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    if (newMessage.chatType === this.AZStackCore.chatConstants.CHAT_TYPE_USER) {
                        this.AZStackCore.getUsersInformation({
                            userIds: [newMessage.receiverId]
                        }).then((result) => {
                            newMessage.receiver = result.list[0];
                            resolve(null);
                        }).catch((error) => {
                            newMessage.receiver = { userId: newMessage.receiverId };
                            resolve(null);
                        });
                    } else if (newMessage.chatType === this.AZStackCore.chatConstants.CHAT_TYPE_GROUP) {
                        this.AZStackCore.getDetailsGroup({
                            groupId: newMessage.receiverId
                        }).then((result) => {
                            newMessage.receiver = result;
                            resolve(null);
                        }).catch((error) => {
                            newMessage.receiver = { groupId: newMessage.receiverId };
                            resolve(null);
                        });
                    } else {
                        newMessage.receiver = {};
                        resolve(null);
                    }
                })
            ]).then(() => {
                delete this.preparingMessages[newMessage.msgId];
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_NEW_MESSAGE, { error: null, result: newMessage });
            }).catch((error) => { });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_MESSAGE_FROM_ME] = (error, result) => {
            if (error) {
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_MESSAGE_FROM_ME, { error, result: null });
                return;
            }
            let myMessage = result;
            this.preparingMessages[myMessage.msgId] = myMessage;
            Promise.all([
                new Promise((resolve, reject) => {
                    this.AZStackCore.getUsersInformation({
                        userIds: [myMessage.senderId]
                    }).then((result) => {
                        myMessage.sender = result.list[0];
                        resolve(null);
                    }).catch((error) => {
                        myMessage.sender = { userId: myMessage.senderId };
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    if (myMessage.chatType === this.AZStackCore.chatConstants.CHAT_TYPE_USER) {
                        this.AZStackCore.getUsersInformation({
                            userIds: [myMessage.receiverId]
                        }).then((result) => {
                            myMessage.receiver = result.list[0];
                            resolve(null);
                        }).catch((error) => {
                            myMessage.receiver = { userId: myMessage.receiverId };
                            resolve(null);
                        });
                    } else if (myMessage.chatType === this.AZStackCore.chatConstants.CHAT_TYPE_GROUP) {
                        this.AZStackCore.getDetailsGroup({
                            groupId: myMessage.receiverId
                        }).then((result) => {
                            myMessage.receiver = result;
                            resolve(null);
                        }).catch((error) => {
                            myMessage.receiver = { groupId: myMessage.receiverId };
                            resolve(null);
                        });
                    } else {
                        myMessage.receiver = {};
                        resolve(null);
                    }
                })
            ]).then(() => {
                delete this.preparingMessages[myMessage.msgId];
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_MESSAGE_FROM_ME, { error: null, result: myMessage });
            }).catch((error) => { });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_NEW_MESSAGE_RETURN] = (error, result) => {
            if (error) {
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error, result: null });
                return;
            }
            let myMessage = result;
            this.preparingMessages[myMessage.msgId] = myMessage;
            Promise.all([
                new Promise((resolve, reject) => {
                    this.AZStackCore.getUsersInformation({
                        userIds: [myMessage.senderId]
                    }).then((result) => {
                        myMessage.sender = result.list[0];
                        resolve(null);
                    }).catch((error) => {
                        myMessage.sender = { userId: myMessage.senderId };
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    if (myMessage.chatType === this.AZStackCore.chatConstants.CHAT_TYPE_USER) {
                        this.AZStackCore.getUsersInformation({
                            userIds: [myMessage.receiverId]
                        }).then((result) => {
                            myMessage.receiver = result.list[0];
                            resolve(null);
                        }).catch((error) => {
                            myMessage.receiver = { userId: myMessage.receiverId };
                            resolve(null);
                        });
                    } else if (myMessage.chatType === this.AZStackCore.chatConstants.CHAT_TYPE_GROUP) {
                        this.AZStackCore.getDetailsGroup({
                            groupId: myMessage.receiverId
                        }).then((result) => {
                            myMessage.receiver = result;
                            resolve(null);
                        }).catch((error) => {
                            myMessage.receiver = { groupId: myMessage.receiverId };
                            resolve(null);
                        });
                    } else {
                        myMessage.receiver = {};
                        resolve(null);
                    }
                })
            ]).then(() => {
                delete this.preparingMessages[myMessage.msgId];
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_NEW_MESSAGE_RETURN, { error: null, result: myMessage });
            }).catch((error) => { });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_GROUP_CREATED] = (error, result) => {
            if (error) {
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_GROUP_CREATED, { error, result: null });
                return;
            }
            let newMessage = result;
            this.preparingMessages[newMessage.msgId] = newMessage;
            Promise.all([
                new Promise((resolve, reject) => {

                    if(newMessage.senderId === this.AZStackCore.authenticatedUser.userId) {
                        return resolve(null);
                    }

                    this.AZStackCore.changeMessageStatus({
                        chatType: newMessage.chatType,
                        chatId: newMessage.chatId,
                        messageSenderId: newMessage.senderId,
                        messageStatus: this.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED,
                        msgId: newMessage.msgId
                    }).then((result) => {
                        newMessage.status = this.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED;
                        resolve(null);
                    }).catch((error) => {
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    this.AZStackCore.getUsersInformation({
                        userIds: [newMessage.senderId]
                    }).then((result) => {
                        newMessage.sender = result.list[0];
                        resolve(null);
                    }).catch((error) => {
                        newMessage.sender = { userId: newMessage.senderId };
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    this.AZStackCore.getDetailsGroup({
                        groupId: newMessage.receiverId
                    }).then((result) => {
                        newMessage.receiver = result;
                        resolve(null);
                    }).catch((error) => {
                        newMessage.receiver = { groupId: newMessage.receiverId };
                        resolve(null);
                    });
                })
            ]).then(() => {
                delete this.preparingMessages[newMessage.msgId];
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_GROUP_CREATED, { error: null, result: newMessage });
            }).catch((error) => { });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_GROUP_INVITED] = (error, result) => {
            if (error) {
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_GROUP_INVITED, { error, result: null });
                return;
            }
            let newMessage = result;
            this.preparingMessages[newMessage.msgId] = newMessage;
            newMessage.invited.invites = [];
            Promise.all([
                new Promise((resolve, reject) => {

                    if(newMessage.senderId === this.AZStackCore.authenticatedUser.userId) {
                        return resolve(null);
                    }

                    this.AZStackCore.changeMessageStatus({
                        chatType: newMessage.chatType,
                        chatId: newMessage.chatId,
                        messageSenderId: newMessage.senderId,
                        messageStatus: this.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED,
                        msgId: newMessage.msgId
                    }).then((result) => {
                        newMessage.status = this.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED;
                        resolve(null);
                    }).catch((error) => {
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    this.AZStackCore.getUsersInformation({
                        userIds: [newMessage.senderId]
                    }).then((result) => {
                        newMessage.sender = result.list[0];
                        resolve(null);
                    }).catch((error) => {
                        newMessage.sender = { userId: newMessage.senderId };
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    this.AZStackCore.getDetailsGroup({
                        groupId: newMessage.receiverId
                    }).then((result) => {
                        newMessage.receiver = result;
                        resolve(null);
                    }).catch((error) => {
                        newMessage.receiver = { groupId: newMessage.receiverId };
                        resolve(null);
                    });
                }),
                Promise.all(
                    newMessage.invited.inviteIds.map((inviteId) => {
                        return new Promise((resolve, reject) => {
                            this.AZStackCore.getUsersInformation({
                                userIds: [inviteId]
                            }).then((result) => {
                                newMessage.invited.invites.push(result.list[0]);
                                resolve(null);
                            }).catch((error) => {
                                newMessage.invited.invites.push({ userId: inviteId });
                                resolve(null);
                            });
                        })
                    })
                )
            ]).then(() => {
                delete this.preparingMessages[newMessage.msgId];
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_GROUP_INVITED, { error: null, result: newMessage });
            }).catch((error) => { });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_GROUP_LEFT] = (error, result) => {
            if (error) {
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_GROUP_LEFT, { error, result: null });
                return;
            }
            let newMessage = result;
            this.preparingMessages[newMessage.msgId] = newMessage;
            Promise.all([
                new Promise((resolve, reject) => {

                    if(newMessage.senderId === this.AZStackCore.authenticatedUser.userId) {
                        return resolve(null);
                    }

                    this.AZStackCore.changeMessageStatus({
                        chatType: newMessage.chatType,
                        chatId: newMessage.chatId,
                        messageSenderId: newMessage.senderId,
                        messageStatus: this.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED,
                        msgId: newMessage.msgId
                    }).then((result) => {
                        newMessage.status = this.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED;
                        resolve(null);
                    }).catch((error) => {
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    this.AZStackCore.getUsersInformation({
                        userIds: [newMessage.senderId]
                    }).then((result) => {
                        newMessage.sender = result.list[0];
                        resolve(null);
                    }).catch((error) => {
                        newMessage.sender = { userId: newMessage.senderId };
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    this.AZStackCore.getDetailsGroup({
                        groupId: newMessage.receiverId
                    }).then((result) => {
                        newMessage.receiver = result;
                        resolve(null);
                    }).catch((error) => {
                        newMessage.receiver = { groupId: newMessage.receiverId };
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    this.AZStackCore.getUsersInformation({
                        userIds: [newMessage.left.leaveId]
                    }).then((result) => {
                        newMessage.left.leave = result.list[0];
                        resolve(null);
                    }).catch((error) => {
                        newMessage.left.leave = { userId: newMessage.left.leaveId }
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    if (!newMessage.left.newAdminId) {
                        resolve(null);
                        return;
                    }
                    this.AZStackCore.getUsersInformation({
                        userIds: [newMessage.left.newAdminId]
                    }).then((result) => {
                        newMessage.left.newAdmin = result.list[0];
                        resolve(null);
                    }).catch((error) => {
                        newMessage.left.newAdmin = { userId: newMessage.left.newAdminId }
                        resolve(null);
                    });
                })
            ]).then(() => {
                delete this.preparingMessages[newMessage.msgId];
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_GROUP_LEFT, { error: null, result: newMessage });
            }).catch((error) => { });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_GROUP_RENAMED] = (error, result) => {
            if (error) {
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_GROUP_RENAMED, { error, result: null });
                return;
            }
            let newMessage = result;
            this.preparingMessages[newMessage.msgId] = newMessage;
            Promise.all([
                new Promise((resolve, reject) => {

                    if(newMessage.senderId === this.AZStackCore.authenticatedUser.userId) {
                        return resolve(null);
                    }

                    this.AZStackCore.changeMessageStatus({
                        chatType: newMessage.chatType,
                        chatId: newMessage.chatId,
                        messageSenderId: newMessage.senderId,
                        messageStatus: this.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED,
                        msgId: newMessage.msgId
                    }).then((result) => {
                        newMessage.status = this.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED;
                        resolve(null);
                    }).catch((error) => {
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    this.AZStackCore.getUsersInformation({
                        userIds: [newMessage.senderId]
                    }).then((result) => {
                        newMessage.sender = result.list[0];
                        resolve(null);
                    }).catch((error) => {
                        newMessage.sender = { userId: newMessage.senderId };
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    this.AZStackCore.getDetailsGroup({
                        groupId: newMessage.receiverId
                    }).then((result) => {
                        newMessage.receiver = result;
                        resolve(null);
                    }).catch((error) => {
                        newMessage.receiver = { groupId: newMessage.receiverId };
                        resolve(null);
                    });
                })
            ]).then(() => {
                delete this.preparingMessages[newMessage.msgId];
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_GROUP_RENAMED, { error: null, result: newMessage });
            }).catch((error) => { });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_GROUP_ADMIN_CHANGED] = (error, result) => {
            if (error) {
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_GROUP_ADMIN_CHANGED, { error, result: null });
                return;
            }
            let newMessage = result;
            this.preparingMessages[newMessage.msgId] = newMessage;
            Promise.all([
                new Promise((resolve, reject) => {

                    if(newMessage.senderId === this.AZStackCore.authenticatedUser.userId) {
                        return resolve(null);
                    }

                    this.AZStackCore.changeMessageStatus({
                        chatType: newMessage.chatType,
                        chatId: newMessage.chatId,
                        messageSenderId: newMessage.senderId,
                        messageStatus: this.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED,
                        msgId: newMessage.msgId
                    }).then((result) => {
                        newMessage.status = this.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED;
                        resolve(null);
                    }).catch((error) => {
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    this.AZStackCore.getUsersInformation({
                        userIds: [newMessage.senderId]
                    }).then((result) => {
                        newMessage.sender = result.list[0];
                        resolve(null);
                    }).catch((error) => {
                        newMessage.sender = { userId: newMessage.senderId };
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    this.AZStackCore.getDetailsGroup({
                        groupId: newMessage.receiverId
                    }).then((result) => {
                        newMessage.receiver = result;
                        resolve(null);
                    }).catch((error) => {
                        newMessage.receiver = { groupId: newMessage.receiverId };
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    this.AZStackCore.getUsersInformation({
                        userIds: [newMessage.adminChanged.newAdminId]
                    }).then((result) => {
                        newMessage.adminChanged.newAdmin = result.list[0];
                        resolve(null);
                    }).catch((error) => {
                        newMessage.adminChanged.newAdmin = { userId: newMessage.adminChanged.newAdminId }
                        resolve(null);
                    });
                })
            ]).then(() => {
                delete this.preparingMessages[newMessage.msgId];
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_GROUP_ADMIN_CHANGED, { error: null, result: newMessage });
            }).catch((error) => { });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_GROUP_PUBLIC_JOINED] = (error, result) => {
            if (error) {
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_GROUP_PUBLIC_JOINED, { error, result: null });
                return;
            }
            let newMessage = result;
            this.preparingMessages[newMessage.msgId] = newMessage;
            Promise.all([
                new Promise((resolve, reject) => {

                    if(newMessage.senderId === this.AZStackCore.authenticatedUser.userId) {
                        return resolve(null);
                    }

                    this.AZStackCore.changeMessageStatus({
                        chatType: newMessage.chatType,
                        chatId: newMessage.chatId,
                        messageSenderId: newMessage.senderId,
                        messageStatus: this.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED,
                        msgId: newMessage.msgId
                    }).then((result) => {
                        newMessage.status = this.AZStackCore.chatConstants.MESSAGE_STATUS_DELIVERED;
                        resolve(null);
                    }).catch((error) => {
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    this.AZStackCore.getUsersInformation({
                        userIds: [newMessage.senderId]
                    }).then((result) => {
                        newMessage.sender = result.list[0];
                        resolve(null);
                    }).catch((error) => {
                        newMessage.sender = { userId: newMessage.senderId };
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    this.AZStackCore.getDetailsGroup({
                        groupId: newMessage.receiverId
                    }).then((result) => {
                        newMessage.receiver = result;
                        resolve(null);
                    }).catch((error) => {
                        newMessage.receiver = { groupId: newMessage.receiverId };
                        resolve(null);
                    });
                }),
                new Promise((resolve, reject) => {
                    this.AZStackCore.getUsersInformation({
                        userIds: [newMessage.joined.joinId]
                    }).then((result) => {
                        newMessage.joined.join = result.list[0];
                        resolve(null);
                    }).catch((error) => {
                        newMessage.joined.join = { userId: newMessage.joined.joinId }
                        resolve(null);
                    });
                })
            ]).then(() => {
                delete this.preparingMessages[newMessage.msgId];
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_GROUP_PUBLIC_JOINED, { error: null, result: newMessage });
            }).catch((error) => { });
        };
    };
};

export default Event;