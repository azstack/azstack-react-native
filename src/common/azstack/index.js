import * as logLevelConstants from './constant/logLevel';
import * as serviceTypes from './constant/serviceTypes';
import * as errorCodes from './constant/errorCodes';
import * as callStatuses from './constant/callStatuses';

import Logger from './helper/logger';
import Delegates from './core/delegate';
import Authentication from './core/authentication';
import Call from './core/call';

class AZStack {
    constructor() {
        this.sdkVersion = '0.0.1';
        this.masterSocketUri = 'https://www.azhub.xyz:9199';
        this.logLevelConstants = logLevelConstants;
        this.serviceTypes = serviceTypes;
        this.errorCodes = errorCodes;
        this.callStatuses = callStatuses;
        this.logLevel = this.logLevelConstants.LOG_LEVEL_NONE;
        this.requestTimeout = 60000;

        this.Logger = new Logger();
        this.Delegates = new Delegates({ logLevelConstants: this.logLevelConstants, Logger: this.Logger });

        this.unCalls = {};
        this.slaveAddress = null;
        this.slaveSocket = null;
        this.slaveSocketConnected = false;
        this.iceServers = null;
        this.authenticatingData = {};
        this.authenticatedUser = null;
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
                message: 'A request exceed timeout'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'A request exceed timeout',
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

    sendSlavePacket(packet) {
        return new Promise((resolve, reject) => {
            if (!this.slaveSocketConnected) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send packet to slave server, slave socket not connected'
                });
                reject({
                    code: this.errorCodes.ERR_SOCKET_NOT_CONNECTED,
                    message: 'Cannot send packet to slave server, slave socket not connected'
                });
                return;
            }
            this.slaveSocket.emit('WebPacket', packet);
            resolve();
        });
    };
    receiveSlavePacket(packet) {
        let body = null;
        let parseError = null;
        try {
            body = JSON.parse(packet.body);
        } catch (e) {
            parseError = e;
        }

        if (!body) {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                message: 'Parse slave socket packet\'s body error'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Parse error',
                payload: parseError
            });
        }

        switch (packet.service) {
            case this.serviceTypes.AUTHENTICATION_RECEIVE_AUTHENTICATE:
                this.Authentication.receiveAuthenticate(body).then((result) => {
                    this.iceServers = result.ice_server;
                    this.authenticatedUser = {
                        userId: result.userId,
                        azStackUserId: result.username,
                        fullname: result.fullname
                    };
                    this.callUncalls('authentication', null, this.authenticatedUser);
                }).catch((error) => {
                    this.callUncalls('authentication', error, null);
                });
                break;
            case this.serviceTypes.CALLOUT_START_ERROR:
                this.Call.receiveStartCalloutError(body).then(() => { }).catch((error) => {
                    this.callUncalls('startCallout', error, null);
                });
                break;
            default:
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Got unknown packet from slave socket'
                });
                break;
        }
    };

    setupSocket(slaveSocket) {
        this.slaveSocket = slaveSocket;
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
            message: 'Start connect to slave server'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'Slave socket uri',
            payload: this.slaveSocket.io.uri
        });
        this.slaveSocket.open();

        this.slaveSocket.on('connect', () => {
            this.slaveSocketConnected = true;
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Connected to slave server'
            });
            this.Authentication.sendAuthenticate({
                sdkVersion: this.sdkVersion,
                slaveAddress: this.slaveAddress,
                authenticatingData: this.authenticatingData,
                sendFunction: this.sendSlavePacket.bind(this)
            }).then(() => { }).catch((error) => {
                this.callUncalls('authentication', error, null);
            });
        });
        this.slaveSocket.on('connect_error', (error) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                message: 'Cannot connect to slave socket'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Slave socket connection error',
                payload: error
            });
            this.callUncalls('authentication', {
                code: this.errorCodes.ERR_SOCKET_CONNECT,
                message: 'Cannot connect to slave socket'
            }, null);
        });
        this.slaveSocket.on('disconnect', () => {
            this.slaveSocketConnected = false;
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Disconnected to slave socket'
            });
        });
        this.slaveSocket.on('WebPacket', (packet) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got web packet from slave socket',
                payload: packet
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Slave socket web packet',
                payload: packet
            });
            this.receiveSlavePacket(packet);
        });
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
        this.Call = new Call({ logLevelConstants: this.logLevelConstants, serviceTypes: this.serviceTypes, errorCodes: this.errorCodes, callStatuses: this.callStatuses, Logger: this.Logger });
    };

    connect(callback) {
        return new Promise((resolve, reject) => {
            this.addUncalls('authentication', callback, resolve, reject, 'onAuthencationReturn');

            if (!this.authenticatingData.appId || !this.authenticatingData.publicKey || !this.authenticatingData.azStackUserId || !this.authenticatingData.fullname) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing authenticating data'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Authenticating data',
                    payload: this.authenticatingData
                });
                this.callUncalls('authentication', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'appId, publicKey, azStackUserId, fullname are required for authenticating data, connect fail'
                }, null);
                return;
            }

            this.init();

            this.Authentication.getSlaveSocket({
                masterSocketUri: this.masterSocketUri,
                azStackUserId: this.authenticatingData.azStackUserId
            }).then((result) => {
                this.slaveAddress = result.slaveAddress;
                this.setupSocket(result.slaveSocket);
            }).catch((error) => {
                this.callUncalls('authentication', error, null);
            });
        });
    };

    startCallout(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Start callout'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Callout data',
                payload: options
            });
            this.addUncalls('startCallout', callback, resolve, reject, 'onStartCalloutReturn');

            if (!options.callData || !options.callData.callId || !options.callData.toPhoneNumber) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing callout data'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Callout data',
                    payload: options.callData
                });
                this.callUncalls('startCallout', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'callId and toPhoneNumber are required for start callout'
                }, null);
                return;
            }

            this.Call.sendStartCallout({
                callData: {
                    callId: options.callData.callId,
                    toPhoneNumber: options.callData.toPhoneNumber
                },
                sendFunction: this.sendSlavePacket.bind(this)
            }).then(() => { }).catch((error) => {
                this.callUncalls('startCallout', error, null);
            });
        });
    };
};

export default AZStack;