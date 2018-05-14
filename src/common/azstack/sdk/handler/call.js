class Message {
    constructor(options) { };

    onBeforeCalloutStart = (options) => {
        return new Promise((resolve, reject) => {
            resolve(options);
        });
    };
};

export default Message;