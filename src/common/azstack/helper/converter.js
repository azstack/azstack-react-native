class Converter {
    constructor(options) {
        this.listConstants = options.listConstants;
        this.chatConstants = options.chatConstants;
    };

    listDoneServerToClient(serverDone) {
        switch (serverDone) {
            case this.listConstants.GET_LIST_DONE_FROM_SERVER:
                return this.listConstants.GET_LIST_DONE;
            case this.listConstants.GET_LIST_UNDONE_FROM_SERVER:
                return this.listConstants.GET_LIST_UNDONE;
            default:
                return this.listConstants.GET_LIST_UNKNOWN_DONE;
        }
    };
    chatTypeServerToClient(serverChatType) {
        switch (serverChatType) {
            case this.chatConstants.CHAT_TYPE_FROM_SERVER_USER:
                return this.chatConstants.CHAT_TYPE_USER;
            case this.chatConstants.CHAT_TYPE_FROM_SERVER_GROUP:
                return this.chatConstants.CHAT_TYPE_GROUP;
            default:
                return this.chatConstants.CHAT_TYPE_UNKNOWN;
        }
    };
    chatTypeClientToServer(clientChatType) {
        switch (clientChatType) {
            case this.chatConstants.CHAT_TYPE_USER:
                return this.chatConstants.CHAT_TYPE_FROM_SERVER_USER;
            case this.chatConstants.CHAT_TYPE_GROUP:
                return this.chatConstants.CHAT_TYPE_FROM_SERVER_GROUP;
            default:
                return this.chatConstants.CHAT_TYPE_FROM_SERVER_UNKNOWN;
        }
    };
};

export default Converter;