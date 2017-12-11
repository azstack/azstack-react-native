class Conversation {
    constructor(options) {
        this.logLevelConstants = options.logLevelConstants;
        this.serviceTypes = options.serviceTypes;
        this.errorCodes = options.errorCodes;
        this.listConstants = options.listConstants;
        this.chatConstants = options.chatConstants;
        this.Logger = options.Logger;
        this.sendPacketFunction = options.sendPacketFunction;
    };

    sendGetModifiedConversations(options) {
        return new Promise((resolve, reject) => {

            const getModifiedConversationsPacket = {
                service: this.serviceTypes.CONVERSATION_GET_LIST_MODIFIED,
                body: JSON.stringify({
                    page: options.page,
                    lastCreated: options.lastCreated
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send get modified conversations packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Get modified conversations packet',
                payload: getModifiedConversationsPacket
            });
            this.sendPacketFunction(getModifiedConversationsPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send get modified conversations packet successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send get modified conversations data, get modified conversations fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send get modified conversations data, get modified conversations fail'
                });
            });
        });
    };
    receiveModifiedConversations(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect modified conversations list, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect modified conversations list, get modified conversations fail'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got modified conversations list'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Modified conversations list data',
                payload: body
            });

            let modifiedConversations = {
                done: body.done,
                page: body.page,
                list: []
            };
            body.list.map((conversation) => {
                let modifiedConversation = {
                    chatType: conversation.type,
                    chatId: conversation.chatId,
                    modified: conversation.modified,
                    unread: conversation.unread,
                    lastMessage: {
                        chatType: conversation.type,
                        chatId: conversation.chatId,
                        senderId: conversation.lastMsg.sender,
                        msgId: conversation.lastMsg.msgId,
                        messageType: 0,
                        messageStatus: conversation.lastMsg.status,
                        created: conversation.lastMsg.created,
                        modified: conversation.modified
                    }
                };
                if (conversation.lastMsg.serviceType === this.serviceTypes.MESSAGE_SERVER_WITH_USER_TYPE_TEXT) {
                    modifiedConversation.lastMessage.messageType = this.chatConstants.MESSAGE_TYPE_TEXT;
                    modifiedConversation.lastMessage.text = conversation.lastMsg.msg;
                }
                if (conversation.lastMsg.serviceType === this.serviceTypes.MESSAGE_WITH_USER_TYPE_STICKER) {
                    modifiedConversation.lastMessage.messageType = this.chatConstants.MESSAGE_TYPE_STICKER;
                    modifiedConversation.lastMessage.sticker = {};
                }
                if (conversation.lastMsg.serviceType === this.serviceTypes.MESSAGE_WITH_USER_TYPE_FILE) {
                    modifiedConversation.lastMessage.messageType = this.chatConstants.MESSAGE_TYPE_FILE;
                    modifiedConversation.lastMessage.file = {
                        type: conversation.lastMsg.msgType
                    };
                }
                modifiedConversations.list.push(modifiedConversation);
            });

            resolve(modifiedConversations);
        });
    };
};

export default Conversation;