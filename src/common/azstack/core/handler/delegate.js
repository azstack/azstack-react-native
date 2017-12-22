class Delegates {
    constructor(options) {
        this.logLevelConstants = options.logLevelConstants;
        this.delegateConstants = options.delegateConstants;
        this.Logger = options.Logger;
        for (let delegateField in this.delegateConstants) {
            this[this.delegateConstants[delegateField]] = (error, result) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: `Please implement method ${this.delegateConstants[delegateField]}`
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: `${this.delegateConstants[delegateField]} delegate data`,
                    payload: {
                        error: error,
                        result: result
                    }
                });
            }
        }
    };
}

export default Delegates; 