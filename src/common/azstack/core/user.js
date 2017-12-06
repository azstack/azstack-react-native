class User {
    constructor(options) {
        this.logLevelConstants = options.logLevelConstants;
        this.serviceTypes = options.serviceTypes;
        this.errorCodes = options.errorCodes;
        this.listConstants = options.listConstants;
        this.userConstants = options.userConstants;
        this.Logger = options.Logger;
        this.sendPacketFunction = options.sendPacketFunction;
    };

    sendGetUsersInfomation(options, callback) {

        return new Promise((resolve, reject) => {

            const getUsersInfomationPacket = {
                service: options.userIds ? this.serviceTypes.USER_GET_INFO_BY_IDS : this.serviceTypes.USER_GET_INFO_BY_USERNAMES,
                body: JSON.stringify({
                    [options.userIds ? 'userIdList' : 'usernameList']: options.userIds ? options.userIds : options.azStackUserIds
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send get users information packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Get users information packet',
                payload: getUsersInfomationPacket
            });
            this.sendPacketFunction(getUsersInfomationPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send get users information packet successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send get users information data, get users information fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send get users information data, get users information fail'
                });
            });
        });
    };
    receiveUsersInfomation(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect users information list, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect users information list, get users information fail'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got users information list'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Users information list data',
                payload: body
            });

            if (body.r !== this.errorCodes.REQUEST_SUCCESS_FROM_SERVER) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Server response with error, get users information fail'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Server response with error, get users information fail'
                });
                return;
            }

            resolve({
                done: body.done,
                list: body.userInfoList.map((userInfo) => {
                    return {
                        userId: userInfo.userId,
                        azStackUserId: userInfo.username,
                        fullname: userInfo.fullname,
                        status: userInfo.status,
                        lastVisitDate: userInfo.lastVisitDate,
                    };
                })
            });
        });
    };
};

export default User;