import * as logLevelConstants from './constant/logLevel';
import * as serviceTypes from './constant/serviceTypes';
import * as errorCodes from './constant/errorCodes';

import Logger from './helper/logger';
import Authentication from './core/authentication';

class AZStack {
    constructor() {
        this.chatProxy = 'https://www.azhub.xyz:9199';
        this.logLevelConstants = logLevelConstants;
        this.serviceTypes = serviceTypes;
        this.errorCodes = errorCodes;
        this.logLevel = this.logLevelConstants.LOG_LEVEL_NONE;

        this.slaveSocket = null;
        this.authenticatingData = {};
        this.authenticatedUser = {};
    };

    config(options) {
        if (options.logLevel) {
            this.logLevel = options.logLevel;
        }
        if (options.authenticatingData) {
            this.authenticatingData.appId = options.authenticatingData.appId ? options.authenticatingData.appId : '';
            this.authenticatingData.publicKey = options.authenticatingData.publicKey ? options.authenticatingData.publicKey : '';
            this.authenticatingData.azStackUserId = options.authenticatingData.azStackUserId ? options.authenticatingData.azStackUserId : '';
            this.authenticatingData.userCredentials = options.authenticatingData.userCredentials ? options.authenticatingData.userCredentials : '';
            this.authenticatingData.fullname = options.authenticatingData.fullname ? options.authenticatingData.fullname : '';
            this.authenticatingData.namespace = options.authenticatingData.namespace ? options.authenticatingData.namespace : '';
        }
    };

    init() {
        this.Logger = new Logger();
        this.Logger.setLogLevel(this.logLevel);
        this.Authentication = new Authentication({ logLevelConstants: this.logLevelConstants, serviceTypes: this.serviceTypes, errorCodes: this.errorCodes, Logger: this.Logger });
    };

    connect(callback) {
        return new Promise((resolve, reject) => {

            this.init();

            if (!this.authenticatingData.appId || !this.authenticatingData.publicKey || !this.authenticatingData.fullname) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing authenticating data'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Authenticating data',
                    payload: this.authenticatingData
                });
                const error = {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'appId, publicKey, fullname are required for authenticating data'
                };
                reject(error);
                if (typeof callback === 'function') {
                    callback(error, null);
                }
                return;
            }

            this.Authentication.getSlaveSocket({
                chatProxy: this.chatProxy,
                azStackUserId: this.authenticatingData.azStackUserId
            }).then((slaveSocket) => {
                resolve(slaveSocket);
                if (typeof callback === 'function') {
                    callback(null, slaveSocket);
                }
                retun;
            }).catch((error) => {
                reject(error);
                if (typeof callback === 'function') {
                    callback(error, null);
                }
                return;
            });
        });
    };
};

export default AZStack;