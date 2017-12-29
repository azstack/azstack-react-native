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
    };
};

export default Event;