class Message {
    constructor(options) {
        this.logLevelConstants = options.logLevelConstants;
        this.serviceTypes = options.serviceTypes;
        this.errorCodes = options.errorCodes;
        this.listConstants = options.listConstants;
        this.chatConstants = options.chatConstants;
        this.Logger = options.Logger;
        this.sendPacketFunction = options.sendPacketFunction;
    };

    sendGetUnreadMessages(options) {
        return new Promise((resolve, reject) => {

            const getUnreadMessagesPacket = {
                service: this.serviceTypes.MESSAGE_GET_LIST_UNREAD,
                body: JSON.stringify({
                    page: options.page,
                    type: options.chatType,
                    chatId: options.chatId
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send get unread messages packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Get unread messages packet',
                payload: getUnreadMessagesPacket
            });
            this.sendPacketFunction(getUnreadMessagesPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send get unread messages packet successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send get unread messages data, get unread messages fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send get unread messages data, get unread messages fail'
                });
            });
        });
    };
    receiveUnreadMessages(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect unread messages list, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect unread messages list, get unread messages fail'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got unread messages list'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Unread messages list data',
                payload: body
            });

            let unreadMessages = {
                chatType: body.type,
                chatId: body.chatId,
                done: body.done,
                page: body.page,
                list: []
            };
            body.list.map((message) => {
                let unreadMessage = {
                    chatType: 0,
                    chatId: message.receiverId,
                    senderId: message.senderId,
                    receiverId: message.receiverId,
                    msgId: message.msgId,
                    messageType: 0,
                    messageStatus: message.status,
                    created: message.created,
                    modified: message.modified
                };
                if (message.serviceType === 5) {
                    unreadMessage.chatType = this.chatConstants.CHAT_TYPE_USER;
                }
                if (message.msg) {
                    unreadMessage.messageType = this.chatConstants.MESSAGE_TYPE_TEXT;
                    unreadMessage.text = message.msg;
                }
                unreadMessages.list.push(unreadMessage);
            });

            resolve(unreadMessages);
        });
    };
    sendGetModifiedMessages(options) {
        return new Promise((resolve, reject) => {

            const getModifiedMessagesPacket = {
                service: this.serviceTypes.MESSAGE_GET_LIST_MODIFIED,
                body: JSON.stringify({
                    page: options.page,
                    lastCreated: options.lastCreated,
                    type: options.chatType,
                    chatId: options.chatId
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send get modified messages packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Get modified messages packet',
                payload: getModifiedMessagesPacket
            });
            this.sendPacketFunction(getModifiedMessagesPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send get modified messages packet successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send get modified messages data, get modified messages fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send get modified messages data, get modified messages fail'
                });
            });
        });
    };
    receiveModifiedMessages(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect modified messages list, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect modified messages list, get modified messages fail'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got modified messages list'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Modified messages list data',
                payload: body
            });

            let modifiedMessages = {
                chatType: body.type,
                chatId: body.chatId,
                done: body.done,
                page: body.page,
                list: []
            };
            body.list.map((message) => {
                let modifiedMessage = {
                    chatType: 0,
                    chatId: message.receiverId,
                    senderId: message.senderId,
                    receiverId: message.receiverId,
                    msgId: message.msgId,
                    messageType: 0,
                    messageStatus: message.status,
                    created: message.created,
                    modified: message.modified
                };
                if (message.serviceType === 5) {
                    modifiedMessage.chatType = this.chatConstants.CHAT_TYPE_USER;
                }
                if (message.msg) {
                    modifiedMessage.messageType = this.chatConstants.MESSAGE_TYPE_TEXT;
                    modifiedMessage.text = message.msg;
                }
                modifiedMessages.list.push(modifiedMessage);
            });

            resolve(modifiedMessages);
        });
    };

    sendNewMessage(options) {
        return new Promise((resolve, reject) => {

            let newMessagePacketService = null;
            let newMessagePacketBody = {};
            let newMessageObj = {};

            if (options.chatType === this.chatConstants.CHAT_TYPE_USER) {
                if (options.text) {
                    newMessagePacketService = this.serviceTypes.MESSAGE_NEW_WITH_USER_TYPE_TEXT;
                    newMessagePacketBody = {
                        msgId: options.msgId,
                        to: options.chatId,
                        msg: options.text
                    };
                    let currentTimeStamp = new Date().getTime();
                    newMessageObj = {
                        chatType: options.chatType,
                        chatId: options.chatId,
                        senderId: 0,
                        receiverId: options.chatId,
                        msgId: options.msgId,
                        messageType: this.chatConstants.MESSAGE_TYPE_TEXT,
                        messageStatus: this.chatConstants.MESSAGE_STATUS_SENDING,
                        created: currentTimeStamp,
                        modified: currentTimeStamp,
                        text: options.text
                    };
                }
            } else if (options.chatType === this.chatConstants.CHAT_TYPE_GROUP) {

            }

            const newMessagePacket = {
                service: newMessagePacketService,
                body: JSON.stringify(newMessagePacketBody)
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send new message packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'New message packet',
                payload: newMessagePacket
            });
            this.sendPacketFunction(newMessagePacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send new message packet successfully'
                });
                resolve(newMessageObj);
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send new message data, new message fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send new message data, new message fail'
                });
            });
        });
    };
};

export default Message;