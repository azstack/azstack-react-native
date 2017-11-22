import * as logLevelConstants from './constant/logLevel';
import * as serviceTypes from './constant/serviceTypes';
import * as errorCodes from './constant/errorCodes';

import Logger from './helper/logger';
import Delegates from './core/delegate';
import Authentication from './core/authentication';

class AZStack {
    constructor() {
        this.chatProxy = 'https://www.azhub.xyz:9199';
        this.logLevelConstants = logLevelConstants;
        this.serviceTypes = serviceTypes;
        this.errorCodes = errorCodes;
        this.logLevel = this.logLevelConstants.LOG_LEVEL_NONE;
        this.requestTimeout = 60000;

        this.Logger = new Logger();
        this.Delegates = new Delegates({ logLevelConstants: this.logLevelConstants, Logger: this.Logger });

        this.unCalls = {};
        this.slaveSocket = null;
        this.authenticatingData = {};
        this.authenticatedUser = {};
    };

    addUncalls(key, callbackFunction, resolveFunction, rejectFunction, delegateKey) {
        this.unCalls[key] = {};
        this.unCalls[key].callback = callbackFunction;
        this.unCalls[key].resolve = resolveFunction;
        this.unCalls[key].reject = rejectFunction;
        this.unCalls[key].delegate = delegateKey;
        this.unCalls[key].timeout = setTimeout(() => {
            const error = {
                code: this.errorCodes.ERR_REQUEST_TIMEOUT,
                message: `Request with key "${key}" has exceed timeout ${this.requestTimeout}s`
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                message: 'A request excced timeout'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'A request excced timeout',
                payload: {
                    key: key,
                    timeout: this.requestTimeout
                }
            });
            if (typeof callbackFunction === 'function') {
                callbackFunction(error, null);
            }
            rejectFunction(error);
            if (typeof this.Delegates[delegateKey] === 'function') {
                this.Delegates[delegateKey](error, null);
            }
            delete this.unCalls[key];
        }, this.requestTimeout);
    };

    callUncalls(key, error, data) {
        if (!this.unCalls[key]) {
            return;
        }
        clearTimeout(this.unCalls[key].timeout);
        if (typeof this.unCalls[key].callback === 'function') {
            this.unCalls[key].callback(error, data);
        }
        if (error) {
            this.unCalls[key].reject(error);
        } else {
            this.unCalls[key].resolve(data);
        }
        if (typeof this.Delegates[this.unCalls[key].delegate] === 'function') {
            this.Delegates[this.unCalls[key].delegate](error, data);
        }
        delete this.unCalls[key];
    };

    setupSocket(slaveSocket) {
        this.slaveSocket = slaveSocket;
    };

    config(options) {
        if (options.requestTimeout && typeof options.requestTimeout === 'number') {
            this.requestTimeout = options.requestTimeout;
        }
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
        this.Logger.setLogLevel(this.logLevel);
        this.Authentication = new Authentication({ logLevelConstants: this.logLevelConstants, serviceTypes: this.serviceTypes, errorCodes: this.errorCodes, Logger: this.Logger });
    };

    connect(callback) {
        return new Promise((resolve, reject) => {

            if (!this.authenticatingData.appId || !this.authenticatingData.publicKey || !this.authenticatingData.azStackUserId || !this.authenticatingData.fullname) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing authenticating data'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Authenticating data',
                    payload: this.authenticatingData
                });
                const error = {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'appId, publicKey, azStackUserId, fullname are required for authenticating data'
                };
                reject(error);
                if (typeof callback === 'function') {
                    callback(error, null);
                }
                return;
            }

            this.init();

            this.addUncalls('authentication', callback, resolve, reject, 'onAuthencationComplete');
            this.Authentication.getSlaveSocket({
                chatProxy: this.chatProxy,
                azStackUserId: this.authenticatingData.azStackUserId
            }).then((slaveSocket) => {
                this.setupSocket(slaveSocket);
                this.callUncalls('authentication', null, this.authenticatedUser);
                return;
            }).catch((error) => {
                this.callUncalls('authentication', error, null);
                return;
            });
        });
    };
};

export default AZStack;