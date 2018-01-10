class Event {
    constructor(options) {
        this.eventConstants = options.eventConstants;
        this.AZStackCore = options.AZStackCore;
        this.EventEmitter = options.EventEmitter;
    };

    delegatesToEvents() {
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_AUTHENTICATION_RETURN] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_AUTHENTICATED_RETURN, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_FREE_CALL_STAUTUS_CHANGED] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_FREE_CALL_STATUS_CHANGED_RETURN, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_FREE_CALL_STAUTUS_CHANGED_BY_ME] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_FREE_CALL_STATUS_CHANGED_BY_ME_RETURN, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_CALLIN_STATUS_CHANGED] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_CALLIN_STATUS_CHANGED_RETURN, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_CALLOUT_STAUTUS_CHANGED] = (error, result) => {
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_CALLOUT_STATUS_CHANGED_RETURN, { error, result });
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_HAS_NEW_MESSAGE] = (error, result) => {
            if (error) {
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_NEW_MESSAGE, { error, result: null });
                return;
            }
            let newMessage = result;
            Promise.all([
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
                this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_NEW_MESSAGE, { error: null, result: newMessage });
            }).catch((error) => { });
        };
    };
};

export default Event;