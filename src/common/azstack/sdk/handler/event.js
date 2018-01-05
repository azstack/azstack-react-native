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
    };
};

export default Event;