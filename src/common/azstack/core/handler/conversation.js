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
                        receiverId: conversation.chatId,
                        msgId: conversation.lastMsg.msgId,
                        type: 0,
                        status: conversation.lastMsg.status,
                        deleted: this.chatConstants.MESSAGE_DELETED_FALSE,
                        created: conversation.lastMsg.created,
                        modified: conversation.modified
                    }
                };
                switch (conversation.lastMsg.serviceType) {
                    case this.serviceTypes.MESSAGE_SERVER_WITH_USER_TYPE_TEXT:
                        modifiedConversation.lastMessage.type = this.chatConstants.MESSAGE_TYPE_TEXT;
                        modifiedConversation.lastMessage.text = conversation.lastMsg.msg;
                        break;
                    case this.serviceTypes.MESSAGE_WITH_USER_TYPE_STICKER:
                        modifiedConversation.lastMessage.type = this.chatConstants.MESSAGE_TYPE_STICKER;
                        modifiedConversation.lastMessage.sticker = {};
                        break;
                    case this.serviceTypes.MESSAGE_WITH_USER_TYPE_FILE:
                        modifiedConversation.lastMessage.type = this.chatConstants.MESSAGE_TYPE_FILE;
                        modifiedConversation.lastMessage.file = {
                            type: conversation.lastMsg.msgType
                        };
                    case this.serviceTypes.MESSAGE_HAS_NEW_WITH_GROUP:
                        if (conversation.lastMsg.msg) {
                            modifiedConversation.lastMessage.type = this.chatConstants.MESSAGE_TYPE_TEXT;
                            modifiedConversation.lastMessage.text = conversation.lastMsg.msg;
                        } else if (conversation.lastMsg.msgType === 3) {
                            modifiedConversation.lastMessage.type = this.chatConstants.MESSAGE_TYPE_STICKER;
                            modifiedConversation.lastMessage.sticker = {};
                        } else {
                            modifiedConversation.lastMessage.type = this.chatConstants.MESSAGE_TYPE_FILE;
                            modifiedConversation.lastMessage.file = {
                                type: conversation.lastMsg.msgType
                            };
                        }
                        break;
                    case this.serviceTypes.ON_GROUP_CREATED:
                        modifiedConversation.lastMessage.type = this.chatConstants.MESSAGE_TYPE_GROUP_CREATED;
                        modifiedConversation.lastMessage.createdGroup = {
                            groupId: conversation.chatId,
                            adminId: conversation.lastMsg.admin,
                            name: conversation.lastMsg.name,
                            created: conversation.lastMsg.created
                        };
                    case this.serviceTypes.ON_GROUP_INVITED:
                        modifiedConversation.lastMessage.type = this.chatConstants.MESSAGE_TYPE_GROUP_INVITED;
                        modifiedConversation.lastMessage.invited = {
                            groupId: conversation.chatId,
                            inviteIds: conversation.lastMsg.invitedMembers
                        };
                    case this.serviceTypes.ON_GROUP_LEFT:
                        modifiedConversation.lastMessage.type = this.chatConstants.MESSAGE_TYPE_GROUP_LEFT;
                        modifiedConversation.lastMessage.left = {
                            groupId: conversation.chatId,
                            leaveId: conversation.lastMsg.leaveUser,
                            newAdminId: conversation.lastMsg.newAdmin
                        };
                    case this.serviceTypes.ON_GROUP_RENAMED:
                        modifiedConversation.lastMessage.type = this.chatConstants.MESSAGE_TYPE_GROUP_RENAMED;
                        modifiedConversation.lastMessage.renamed = {
                            groupId: conversation.chatId,
                            newName: conversation.lastMsg.newGroupName
                        };
                    case this.serviceTypes.ON_GROUP_ADMIN_CHANGED:
                        modifiedConversation.lastMessage.type = this.chatConstants.MESSAGE_TYPE_GROUP_ADMIN_CHANGED;
                        modifiedConversation.lastMessage.adminChanged = {
                            groupId: conversation.chatId,
                            newAdminId: conversation.lastMsg.newAdmin
                        };
                    case this.serviceTypes.GROUP_JOIN_PUBLIC:
                        modifiedConversation.lastMessage.type = this.chatConstants.MESSAGE_TYPE_GROUP_PUBLIC_JOINED;
                        modifiedConversation.lastMessage.joined = {
                            groupId: conversation.chatId,
                            joinId: conversation.lastMsg.sender
                        };
                    default:
                        break;
                }

                modifiedConversations.list.push(modifiedConversation);
            });

            resolve(modifiedConversations);
        });
    };
};

export default Conversation;