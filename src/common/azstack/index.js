import * as Authentication from './core/authentication';

class AZStack {
    constructor() {

        this.logLevel = '';

        this.chatProxy = 'https://www.azhub.xyz:9199';
        this.authenticatedUser = {};

        this.masterSocket = null;
        this.masterSocketConnected = false;
    };

    config(options) {
        if (options.logLevel) {
            this.logLevel = options.logLevel;
        }
    };

    connect() {
        Authentication.getServerAddress({
            logLevel: this.logLevel,
            chatProxy: this.chatProxy
        }, (address) => {
            console.log(address);
        });
    };
};

export default AZStack;