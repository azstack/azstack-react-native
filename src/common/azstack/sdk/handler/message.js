class Message {
    constructor(options) { };

    onBeforeMessageSend = (options) => {
        return new Promise((resolve, reject) => {
            resolve(options);
        });
    };
};

export default Message;