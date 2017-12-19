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

    sendGetListGroups(options) {
        return new Promise((resolve, reject) => {

            let getGroupsPacketService = 0;
            if (options.groupType === this.groupConstants.GROUP_TYPE_PRIVATE) {
                getGroupsPacketService = this.serviceTypes.GROUP_GET_LIST_PRIVATE;
            } else if (options.groupType === this.groupConstants.GROUP_TYPE_PUBLIC) {
                getGroupsPacketService = this.serviceTypes.GROUP_GET_LIST_PUBLIC;
            }
            const getGroupsPacket = {
                service: getGroupsPacketService,
                body: JSON.stringify({})
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send get groups packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Get groups packet',
                payload: getGroupsPacket
            });
            this.sendPacketFunction(getGroupsPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send get groups packet successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send get groups data, get groups fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send get groups data, get groups fail'
                });
            });
        });
    };
    receiveListGroups(options) {
        return new Promise((resolve, reject) => {
            if (!options.body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect groups list, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect groups list, get groups fail'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got groups list'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Groups list data',
                payload: options.body
            });

            let listGroups = {
                list: []
            };

            if (options.groupType === this.groupConstants.GROUP_TYPE_PRIVATE) {
                listGroups.done = this.listConstants.GET_LIST_DONE;
                options.body.map((group) => {
                    let privateGroup = {
                        type: this.groupConstants.GROUP_TYPE_PRIVATE,
                        groupId: group.groupId,
                        name: group.name,
                        adminId: group.admin,
                        membersCount: group.members.length,
                        isIn: this.groupConstants.GROUP_IS_IN,
                        isAutojoin: this.groupConstants.GROUP_IS_AUTO_JOIN
                    };
                    listGroups.list.push(privateGroup);
                });
            } else if (options.groupType === this.groupConstants.GROUP_TYPE_PUBLIC) {
                listGroups.done = options.body.done;
                options.body.list.map((group) => {
                    let publicGroup = {
                        type: this.groupConstants.GROUP_TYPE_PUBLIC,
                        groupId: group.groupId,
                        name: group.name,
                        adminId: group.admin,
                        membersCount: group.count,
                        isIn: group.inGroup,
                        isAutojoin: group.autoJoin
                    };
                    listGroups.list.push(publicGroup);
                });
            }

            resolve(listGroups);
        });
    };

    sendGroupCreate(options) {
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
    receiveGroupCreateResult(body) {
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

    sendGroupInvite(options) {
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
    receiveGroupInviteResult(body) {
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

    sendGroupLeave(options) {
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
    receiveGroupLeaveResult(body) {
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

    sendGroupRename(options) {
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
    receiveGroupRenameResult(body) {
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

    sendGroupAdminChange(options) {
        return new Promise((resolve, reject) => {

            const changeAdminGroupPacket = {
                service: this.serviceTypes.GROUP_CHANGE_ADMIN,
                body: JSON.stringify({
                    msgId: options.msgId,
                    group: options.groupId,
                    newAdmin: options.newAdminId,
                    from: options.fromId
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send change admin group packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Change admin group packet',
                payload: changeAdminGroupPacket
            });
            this.sendPacketFunction(changeAdminGroupPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send change admin group packet successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send change admin group data, send change admin group fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send change admin group data, send change admin group fail'
                });
            });
        });
    };
    receiveGroupAdminChangeResult(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect change admin group result, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect change admin group result'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got change admin group result'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Change admin group result data',
                payload: body
            });

            if (body.r !== this.errorCodes.GROUP_CHANGE_ADMIN_SUCCESS_FROM_SERVER) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Server response with error, change admin group fail'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Server response with error, change admin group fail'
                });
                return;
            }

            resolve({
                groupId: body.group,
                msgId: body.msgId,
                newAdminId: body.newAdmin,
                created: body.created
            });
        });
    };
    receiveGroupAdminChanged(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect admin changed group, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect admin changed group'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got admin changed group'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Admin changed group data',
                payload: body
            });

            resolve({
                chatType: this.chatConstants.CHAT_TYPE_GROUP,
                chatId: body.group,
                senderId: body.from,
                receiverId: body.group,
                msgId: body.msgId,
                type: this.chatConstants.MESSAGE_TYPE_GROUP_ADMIN_CHANGED,
                status: this.chatConstants.MESSAGE_STATUS_SENT,
                deleted: this.chatConstants.MESSAGE_DELETED_FALSE,
                created: body.created,
                modified: body.created,
                adminChanged: {
                    groupId: body.group,
                    newAdminId: body.newAdmin
                }
            });
        });
    };

    sendGroupJoinPublic(options) {
        return new Promise((resolve, reject) => {

            const joinPublicGroupPacket = {
                service: this.serviceTypes.GROUP_JOIN_PUBLIC,
                body: JSON.stringify({
                    msgId: options.msgId,
                    group: options.groupId
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send join public group packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Join public group packet',
                payload: joinPublicGroupPacket
            });
            this.sendPacketFunction(joinPublicGroupPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send join public group packet successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send join public group data, send join public group fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send join public group data, send join public group fail'
                });
            });
        });
    };
    receiveGroupPublicJoined(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect public joined group, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect public joined group'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got public joined group'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Public joined group data',
                payload: body
            });

            if (body.r !== undefined && body.r !== this.errorCodes.GROUP_JOIN_PUBLIC_SUCCESS_FROM_SERVER) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Server response with error, join public group fail'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Server response with error, join public group fail'
                });
                return;
            }

            let onGroupPublicJoined = {};

            if (body.r !== undefined) {
                onGroupPublicJoined = {
                    isReturn: true,
                    return: {
                        groupId: body.group,
                        msgId: body.msgId,
                        joinId: 0,
                        created: body.created
                    },
                    event: {
                        chatType: this.chatConstants.CHAT_TYPE_GROUP,
                        chatId: body.group,
                        senderId: 0,
                        receiverId: body.group,
                        msgId: body.msgId,
                        type: this.chatConstants.MESSAGE_TYPE_GROUP_PUBLIC_JOINED,
                        status: this.chatConstants.MESSAGE_STATUS_SENT,
                        deleted: this.chatConstants.MESSAGE_DELETED_FALSE,
                        created: body.created,
                        modified: body.created,
                        joined: {
                            groupId: body.group,
                            joinId: 0
                        }
                    }
                };
            } else {
                onGroupPublicJoined = {
                    chatType: this.chatConstants.CHAT_TYPE_GROUP,
                    chatId: body.group,
                    senderId: body.from,
                    receiverId: body.group,
                    msgId: body.msgId,
                    type: this.chatConstants.MESSAGE_TYPE_GROUP_PUBLIC_JOINED,
                    status: this.chatConstants.MESSAGE_STATUS_SENT,
                    deleted: this.chatConstants.MESSAGE_DELETED_FALSE,
                    created: body.created,
                    modified: body.created,
                    joined: {
                        groupId: body.group,
                        joinId: body.from
                    }
                };
            }

            resolve(onGroupPublicJoined);
        });
    };

    sendGroupGetDetails(options) {
        return new Promise((resolve, reject) => {

            const getDetailsGroupPacket = {
                service: this.serviceTypes.GROUP_GET_DETAILS,
                body: JSON.stringify({
                    group: options.groupId
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send get details group packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Get details group packet',
                payload: getDetailsGroupPacket
            });
            this.sendPacketFunction(getDetailsGroupPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send get details group packet successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send get details group data, send get details group fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send get details group data, send get details group fail'
                });
            });
        });
    };
    receiveGroupDetailsGetResult(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect get details group result, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect get details group result'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got get details group result'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Get details group result data',
                payload: body
            });

            if (body.r !== this.errorCodes.GROUP_GET_DETAILS_SUCCESS_FROM_SERVER) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Server response with error, get details group fail'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Server response with error, get details group fail'
                });
                return;
            }

            resolve({
                type: body.type,
                groupId: body.group,
                name: body.name,
                adminId: body.admin,
                memberIds: body.members.map((member) => {
                    return member.userId;
                }),
                members: body.members.map((member) => {
                    return {
                        userId: member.userId,
                        azStackUserId: member.username,
                        fullname: member.fullname,
                        status: member.online
                    };
                })
            });
        });
    };
};

export default Group;