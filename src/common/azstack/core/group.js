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
                groupId: body.group,
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
                    groupId: body.group,
                    adminId: body.admin,
                    name: body.name,
                    memberIds: body.members,
                    created: body.created
                }
            });
        });
    };

    sendInviteGroup(options) {
        return new Promise((resolve, reject) => {

            const inviteGroupPacket = {
                service: this.serviceTypes.GROUP_INVITE,
                body: JSON.stringify({
                    msgId: options.msgId,
                    group: options.groupId,
                    members: options.inviteIds
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send invite group packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Invite group packet',
                payload: inviteGroupPacket
            });
            this.sendPacketFunction(inviteGroupPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send invite group packet successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send invite group data, send invite group fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send invite group data, send invite group fail'
                });
            });
        });
    };
    receiveInviteGroupResult(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect invite group result, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect invite group result'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got invite group result'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Invite group result data',
                payload: body
            });

            if (body.r !== this.errorCodes.GROUP_INVITE_SUCCESS_FROM_SERVER) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Server response with error, invite group fail'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Server response with error, invite group fail'
                });
                return;
            }

            resolve({
                groupId: body.group,
                msgId: body.msgId,
                inviteIds: body.inviteResult.filter((invite) => {
                    return invite.r === this.errorCodes.GROUP_INVITE_SUCCESS_FROM_SERVER
                }).map((invite) => {
                    return invite.user;
                }),
                created: body.created
            });
        });
    };
    receiveGroupInvited(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect invited group, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect invited group'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got invited group'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Invited group data',
                payload: body
            });

            resolve({
                chatType: this.chatConstants.CHAT_TYPE_GROUP,
                chatId: body.group,
                senderId: body.from,
                receiverId: body.group,
                msgId: body.msgId,
                type: this.chatConstants.MESSAGE_TYPE_GROUP_INVITED,
                status: this.chatConstants.MESSAGE_STATUS_SENT,
                deleted: this.chatConstants.MESSAGE_DELETED_FALSE,
                created: body.created,
                modified: body.created,
                invited: {
                    groupId: body.group,
                    inviteIds: body.invited
                } 
            });
        });
    };
};

export default Group;