class Group {
    constructor(options) {
        this.logLevelConstants = options.logLevelConstants;
        this.serviceTypes = options.serviceTypes;
        this.errorCodes = options.errorCodes;
        this.listConstants = options.listConstants;
        this.chatConstants = options.chatConstants;
        this.groupConstants = options.groupConstants;
        this.Logger = options.Logger;
        this.sendPacketFunction = options.sendPacketFunction;
    };

    sendCreateGroup(options) {
        return new Promise((resolve, reject) => {

            const createGroupPacket = {
                service: this.serviceTypes.GROUP_CREATE,
                body: JSON.stringify({
                    msgId: options.msgId,
                    type: options.type,
                    name: options.name,
                    members: options.memberIds
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send create group packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Create group packet',
                payload: createGroupPacket
            });
            this.sendPacketFunction(createGroupPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send create group packet successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send create group data, send create group fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send create group data, send create group fail'
                });
            });
        });
    };
    receiveCreateGroupResult(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect create group result, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect create group result'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got create group result'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Create group result data',
                payload: body
            });

            if (body.r !== this.errorCodes.REQUEST_SUCCESS_FROM_SERVER) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Server response with error, create group fail'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Server response with error, create group fail'
                });
                return;
            }

            resolve({
                type: body.type,
                chatId: body.group,
                msgId: body.msgId,
                adminId: body.admin,
                name: body.name,
                memberIds: body.members,
                created: body.created
            });
        });
    };
    receiveGroupCreated(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect created group, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect created group'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got created group'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Created group data',
                payload: body
            });

            resolve({
                chatType: this.chatConstants.CHAT_TYPE_GROUP,
                chatId: body.group,
                senderId: body.admin,
                receiverId: body.group,
                msgId: body.msgId,
                type: this.chatConstants.MESSAGE_TYPE_GROUP_CREATED,
                status: this.chatConstants.MESSAGE_STATUS_SENT,
                deleted: this.chatConstants.MESSAGE_DELETED_FALSE,
                created: body.created,
                modified: body.created,
                createdGroup: {
                    type: body.type,
                    chatId: body.group,
                    adminId: body.admin,
                    name: body.name,
                    memberIds: body.members,
                    created: body.created
                }
            });
        });
    };
};

export default Group;