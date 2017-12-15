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

    sendLeaveGroup(options) {
        return new Promise((resolve, reject) => {

            const leaveGroupPacket = {
                service: this.serviceTypes.GROUP_LEAVE,
                body: JSON.stringify({
                    msgId: options.msgId,
                    group: options.groupId,
                    leaveUser: options.leaveId,
                    newAdmin: options.newAdminId
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send leave group packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Leave group packet',
                payload: leaveGroupPacket
            });
            this.sendPacketFunction(leaveGroupPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send leave group packet successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send leave group data, send leave group fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send leave group data, send leave group fail'
                });
            });
        });
    };
    receiveLeaveGroupResult(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect leave group result, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect leave group result'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got leave group result'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Leave group result data',
                payload: body
            });

            if (body.r !== this.errorCodes.GROUP_LEAVE_SUCCESS_FROM_SERVER) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Server response with error, leave group fail'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Server response with error, leave group fail'
                });
                return;
            }

            resolve({
                groupId: body.group,
                msgId: body.msgId,
                leaveId: body.leaveUserId,
                created: body.created
            });
        });
    };
    receiveGroupLeft(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect left group, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect left group'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got left group'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Left group data',
                payload: body
            });

            resolve({
                chatType: this.chatConstants.CHAT_TYPE_GROUP,
                chatId: body.group,
                senderId: body.from,
                receiverId: body.group,
                msgId: body.msgId,
                type: this.chatConstants.MESSAGE_TYPE_GROUP_LEFT,
                status: this.chatConstants.MESSAGE_STATUS_SENT,
                deleted: this.chatConstants.MESSAGE_DELETED_FALSE,
                created: body.created,
                modified: body.created,
                left: {
                    groupId: body.group,
                    leaveId: body.leaveUser,
                    newAdminId: body.newAdmin
                }
            });
        });
    };

    sendRenameGroup(options) {
        return new Promise((resolve, reject) => {

            const renameGroupPacket = {
                service: this.serviceTypes.GROUP_RENAME,
                body: JSON.stringify({
                    msgId: options.msgId,
                    group: options.groupId,
                    name: options.newName
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send rename group packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Rename group packet',
                payload: renameGroupPacket
            });
            this.sendPacketFunction(renameGroupPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send rename group packet successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send rename group data, send rename group fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send rename group data, send rename group fail'
                });
            });
        });
    };
    receiveRenameGroupResult(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect rename group result, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect rename group result'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got rename group result'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Rename group result data',
                payload: body
            });

            if (body.r !== this.errorCodes.GROUP_RENAME_SUCCESS_FROM_SERVER) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Server response with error, rename group fail'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Server response with error, rename group fail'
                });
                return;
            }

            resolve({
                groupId: body.group,
                msgId: body.msgId,
                newName: body.newName,
                created: body.created
            });
        });
    };
    receiveGroupRenamed(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect renamed group, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect renamed group'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got renamed group'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Renamed group data',
                payload: body
            });

            resolve({
                chatType: this.chatConstants.CHAT_TYPE_GROUP,
                chatId: body.group,
                senderId: body.from,
                receiverId: body.group,
                msgId: body.msgId,
                type: this.chatConstants.MESSAGE_TYPE_GROUP_RENAMED,
                status: this.chatConstants.MESSAGE_STATUS_SENT,
                deleted: this.chatConstants.MESSAGE_DELETED_FALSE,
                created: body.created,
                modified: body.created,
                renamed: {
                    groupId: body.group,
                    newName: body.name
                }
            });
        });
    };
};

export default Group;