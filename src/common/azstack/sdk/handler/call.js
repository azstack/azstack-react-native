class Message {
    constructor(options) { };

    onBeforeCalloutStart = (options) => {
        return new Promise((resolve, reject) => {
            resolve(options);
        });
    };

    getPaidCallTags = (options) => {
        return new Promise((resolve, reject) => {
            resolve('');
        });
    };
};

export default Message;