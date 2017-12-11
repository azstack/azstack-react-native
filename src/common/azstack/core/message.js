import { CHAT_TYPE_USER } from "../constant/chatConstants";

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
                if (message.serviceType === this.serviceTypes.MESSAGE_SERVER_WITH_USER_TYPE_TEXT || message.serviceType === this.serviceTypes.MESSAGE_WITH_USER_TYPE_STICKER || message.serviceType === this.serviceTypes.MESSAGE_WITH_USER_TYPE_FILE) {
                    unreadMessage.chatType = this.chatConstants.CHAT_TYPE_USER;
                }
                if (message.msg) {
                    unreadMessage.messageType = this.chatConstants.MESSAGE_TYPE_TEXT;
                    unreadMessage.text = message.msg;
                }
                if (message.imgName) {
                    unreadMessage.messageType = this.chatConstants.MESSAGE_TYPE_STICKER;
                    unreadMessage.sticker = {
                        name: message.imgName,
                        catId: message.catId,
                        url: message.url
                    };
                }
                if (message.fileName) {
                    unreadMessage.messageType = this.chatConstants.MESSAGE_TYPE_FILE;
                    unreadMessage.file = {
                        name: message.fileName,
                        length: message.fileLength,
                        type: message.type,
                        url: message.url
                    };
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
                if (message.serviceType === this.serviceTypes.MESSAGE_SERVER_WITH_USER_TYPE_TEXT || message.serviceType === this.serviceTypes.MESSAGE_WITH_USER_TYPE_STICKER || message.serviceType === this.serviceTypes.MESSAGE_WITH_USER_TYPE_FILE) {
                    modifiedMessage.chatType = this.chatConstants.CHAT_TYPE_USER;
                }
                if (message.msg) {
                    modifiedMessage.messageType = this.chatConstants.MESSAGE_TYPE_TEXT;
                    modifiedMessage.text = message.msg;
                }
                if (message.imgName) {
                    modifiedMessage.messageType = this.chatConstants.MESSAGE_TYPE_STICKER;
                    modifiedMessage.sticker = {
                        name: message.imgName,
                        catId: message.catId,
                        url: message.url
                    };
                }
                if (message.fileName) {
                    modifiedMessage.messageType = this.chatConstants.MESSAGE_TYPE_FILE;
                    modifiedMessage.file = {
                        name: message.fileName,
                        length: message.fileLength,
                        type: message.type,
                        url: message.url
                    };
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
                if (options.sticker) {
                    newMessagePacketService = this.serviceTypes.MESSAGE_WITH_USER_TYPE_STICKER;
                    newMessagePacketBody = {
                        id: options.msgId,
                        to: options.chatId,
                        imgName: options.sticker.name,
                        catId: options.sticker.catId,
                        url: options.sticker.url
                    };
                    let currentTimeStamp = new Date().getTime();
                    newMessageObj = {
                        chatType: options.chatType,
                        chatId: options.chatId,
                        senderId: 0,
                        receiverId: options.chatId,
                        msgId: options.msgId,
                        messageType: this.chatConstants.MESSAGE_TYPE_STICKER,
                        messageStatus: this.chatConstants.MESSAGE_STATUS_SENDING,
                        created: currentTimeStamp,
                        modified: currentTimeStamp,
                        sticker: {
                            name: options.sticker.name,
                            catId: options.sticker.catId,
                            url: options.sticker.url
                        }
                    };
                }
                if (options.file) {
                    newMessagePacketService = this.serviceTypes.MESSAGE_WITH_USER_TYPE_FILE;
                    newMessagePacketBody = {
                        id: options.msgId,
                        to: options.chatId,
                        fileName: options.file.name,
                        fileLength: options.file.length,
                        type: options.file.type,
                        url: options.file.url
                    };
                    let currentTimeStamp = new Date().getTime();
                    newMessageObj = {
                        chatType: options.chatType,
                        chatId: options.chatId,
                        senderId: 0,
                        receiverId: options.chatId,
                        msgId: options.msgId,
                        messageType: this.chatConstants.MESSAGE_TYPE_FILE,
                        messageStatus: this.chatConstants.MESSAGE_STATUS_SENDING,
                        created: currentTimeStamp,
                        modified: currentTimeStamp,
                        file: {
                            name: options.file.name,
                            length: options.file.length,
                            type: options.file.type,
                            url: options.file.url
                        }
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
    receiveHasNewMessage(options) {
        return new Promise((resolve, reject) => {
            if (!options.body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect new message, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect new message'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got new message'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'New message data',
                payload: options.body
            });

            let newMessage = {};

            if (options.chatType === this.chatConstants.CHAT_TYPE_USER) {
                if (options.messageType === this.chatConstants.MESSAGE_TYPE_TEXT) {
                    newMessage = {
                        chatType: this.chatConstants.CHAT_TYPE_USER,
                        chatId: options.body.from,
                        senderId: options.body.from,
                        receiverId: 0,
                        msgId: options.body.msgId,
                        messageType: this.chatConstants.MESSAGE_TYPE_TEXT,
                        messageStatus: this.chatConstants.MESSAGE_STATUS_SENT,
                        created: options.body.time,
                        modified: options.body.time,
                        text: options.body.msg
                    };
                }
                if (options.messageType === this.chatConstants.MESSAGE_TYPE_STICKER) {
                    newMessage = {
                        chatType: this.chatConstants.CHAT_TYPE_USER,
                        chatId: options.body.from,
                        senderId: options.body.from,
                        receiverId: options.body.to,
                        msgId: options.body.id,
                        messageType: this.chatConstants.MESSAGE_TYPE_STICKER,
                        messageStatus: this.chatConstants.MESSAGE_STATUS_SENT,
                        created: options.body.created,
                        modified: options.body.created,
                        sticker: {
                            name: options.body.imgName,
                            catId: options.body.catId,
                            url: options.body.url
                        }
                    };
                }
                if (options.messageType === this.chatConstants.MESSAGE_TYPE_FILE) {
                    newMessage = {
                        chatType: this.chatConstants.CHAT_TYPE_USER,
                        chatId: options.body.from,
                        senderId: options.body.from,
                        receiverId: options.body.to,
                        msgId: options.body.id,
                        messageType: this.chatConstants.MESSAGE_TYPE_FILE,
                        messageStatus: this.chatConstants.MESSAGE_STATUS_SENT,
                        created: options.body.created,
                        modified: options.body.created,
                        file: {
                            name: options.body.fileName,
                            length: options.body.fileLength,
                            type: options.body.type,
                            url: options.body.url
                        }
                    };
                }
            }

            resolve(newMessage);
        });
    };

    receiveMessageFromMe(options) {
        return new Promise((resolve, reject) => {
            if (!options.body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect message from me, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect message from me'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got message from me'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Message from me',
                payload: options.body
            });

            let messageFromMe = {};

            if (options.chatType === this.chatConstants.CHAT_TYPE_USER) {
                if (options.body.msg) {
                    messageFromMe = {
                        chatType: this.chatConstants.CHAT_TYPE_USER,
                        chatId: options.body.to,
                        senderId: 0,
                        receiverId: options.body.to,
                        msgId: options.body.msgId,
                        messageType: this.chatConstants.MESSAGE_TYPE_TEXT,
                        messageStatus: this.chatConstants.MESSAGE_STATUS_SENDING,
                        created: options.body.time,
                        modified: options.body.time,
                        text: options.body.msg
                    };
                }
                if (options.body.imgName) {
                    messageFromMe = {
                        chatType: this.chatConstants.CHAT_TYPE_USER,
                        chatId: options.body.to,
                        senderId: options.body.from,
                        receiverId: options.body.to,
                        msgId: options.body.id,
                        messageType: this.chatConstants.MESSAGE_TYPE_STICKER,
                        messageStatus: this.chatConstants.MESSAGE_STATUS_SENDING,
                        created: options.body.created,
                        modified: options.body.created,
                        sticker: {
                            name: options.body.imgName,
                            catId: options.body.catId,
                            url: options.body.url
                        }
                    };
                }
                if (options.body.fileName) {
                    messageFromMe = {
                        chatType: this.chatConstants.CHAT_TYPE_USER,
                        chatId: options.body.to,
                        senderId: options.body.from,
                        receiverId: options.body.to,
                        msgId: options.body.id,
                        messageType: this.chatConstants.MESSAGE_TYPE_FILE,
                        messageStatus: this.chatConstants.MESSAGE_STATUS_SENDING,
                        created: options.body.created,
                        modified: options.body.created,
                        file: {
                            name: options.body.fileName,
                            length: options.body.fileLength,
                            type: options.body.type,
                            url: options.body.url
                        }
                    };
                }
            }

            resolve(messageFromMe);
        });
    };

    sendReport(options) {
        return new Promise((resolve, reject) => {

            let messageReportPacketService = null;
            let messageReportPacketBody = {};

            if (options.chatType === this.chatConstants.CHAT_TYPE_USER) {
                if (options.messageStatus === this.chatConstants.MESSAGE_STATUS_DELIVERED) {
                    messageReportPacketService = this.serviceTypes.MESSAGE_REPORT_DELIVERED_WITH_USER;
                    messageReportPacketBody = {
                        to: options.chatId,
                        msgId: options.msgId
                    };
                }
            } else if (options.chatType === this.chatConstants.CHAT_TYPE_GROUP) {

            }

            const newMessagePacket = {
                service: messageReportPacketService,
                body: JSON.stringify(messageReportPacketBody)
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send message report packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Message report packet',
                payload: newMessagePacket
            });
            this.sendPacketFunction(newMessagePacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send message report packet successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send message report data, send message report fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send message report data, send message report fail'
                });
            });
        });
    };
    receiveMessageReport(options) {
        return new Promise((resolve, reject) => {
            if (!options.body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect message report, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect message report'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got message report'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Message report',
                payload: options.body
            });

            let onSentMessage = {};

            if (options.chatType === this.chatConstants.CHAT_TYPE_USER) {
                if (options.messageStatus === this.chatConstants.MESSAGE_STATUS_SENT) {
                    onSentMessage = {
                        reportStatus: (options.body.r === this.errorCodes.REPORT_MESSAGE_SUCCESS_FROM_SERVER || options.body.r === this.errorCodes.REQUEST_SUCCESS_FROM_SERVER) ? this.chatConstants.MESSAGE_STATUS_REPORT_SUCCESS : this.chatConstants.MESSAGE_STATUS_REPORT_FAIL,
                        chatType: this.chatConstants.CHAT_TYPE_USER,
                        chatId: options.body.from,
                        senderId: options.body.from,
                        receiverId: 0,
                        msgId: options.body.msgId,
                        messageStatus: this.chatConstants.MESSAGE_STATUS_SENT
                    };
                }
                if (options.messageStatus === this.chatConstants.MESSAGE_STATUS_DELIVERED) {
                    onSentMessage = {
                        reportStatus: this.chatConstants.MESSAGE_STATUS_REPORT_SUCCESS,
                        chatType: this.chatConstants.CHAT_TYPE_USER,
                        chatId: options.body.from,
                        senderId: options.body.from,
                        receiverId: 0,
                        msgId: options.body.msgId,
                        messageStatus: this.chatConstants.MESSAGE_STATUS_DELIVERED
                    };
                }
            }

            resolve(onSentMessage);
        });
    };

    sendTyping(options) {
        return new Promise((resolve, reject) => {

            let typingPacketService = null;
            let typingPacketBody = {};

            if (options.chatType === this.chatConstants.CHAT_TYPE_USER) {
                typingPacketService = this.serviceTypes.MESSAGE_TYPING_WITH_USER;
                typingPacketBody = {
                    to: options.chatId
                };
            } else if (options.chatType === this.chatConstants.CHAT_TYPE_GROUP) {

            }

            const newMessagePacket = {
                service: typingPacketService,
                body: JSON.stringify(typingPacketBody)
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send typing packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Typing packet',
                payload: newMessagePacket
            });
            this.sendPacketFunction(newMessagePacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send typing packet successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send typing data, send typing fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send typing data, send typing fail'
                });
            });
        });
    };
    receiveTyping(options) {
        return new Promise((resolve, reject) => {
            if (!options.body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect typing, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect typing'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got typing'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Typing data',
                payload: options.body
            });

            let typing = {};

            if (options.chatType === this.chatConstants.CHAT_TYPE_USER) {
                typing = {
                    chatType: this.chatConstants.CHAT_TYPE_USER,
                    chatId: options.body.from,
                    senderId: options.body.from,
                    receiverId: 0
                };
            }

            resolve(typing);
        });
    };
};

export default Message;