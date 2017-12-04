import * as logLevelConstants from './constant/logLevel';
import * as serviceTypes from './constant/serviceTypes';
import * as errorCodes from './constant/errorCodes';
import * as callConstants from './constant/callConstants';
import * as listConstants from './constant/listConstants';

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
        this.callConstants = callConstants;
        this.listConstants = listConstants;
        this.logLevel = this.logLevelConstants.LOG_LEVEL_NONE;
        this.requestTimeout = 60000;

        this.Logger = new Logger();
        this.Delegates = new Delegates({ logLevelConstants: this.logLevelConstants, Logger: this.Logger });

        this.unCalls = {};
        this.slaveAddress = null;
        this.slaveSocket = null;
        this.slaveSocketConnected = false;
        this.authenticatingData = {};
        this.authenticatedUser = null;

        this.uniqueId = Math.round(new Date().getTime() / 1000);
    };

    newUniqueId() {
        let currentTime = Math.round(new Date().getTime() / 1000);
        if (this.uniqueId >= currentTime) {
            this.uniqueId = this.uniqueId + 1;
        } else {
            this.uniqueId = currentTime;
        }
    };

    addUncall(key, callbackFunction, resolveFunction, rejectFunction, delegateKey) {
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
    callUncall(key, error, data) {
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
                    this.Call.setIceServers({
                        iceServers: result.ice_server.map((iceServer) => {
                            return {
                                url: iceServer.url,
                                username: iceServer.username,
                                credential: iceServer.password
                            };
                        })
                    });
                    this.authenticatedUser = {
                        userId: result.userId,
                        azStackUserId: result.username,
                        fullname: result.fullname
                    };
                    this.callUncall('authentication', null, this.authenticatedUser);
                }).catch((error) => {
                    this.callUncall('authentication', error, null);
                });
                break;

            case this.serviceTypes.CALLOUT_START_INITIAL:
                this.Call.receiveStartCalloutInitial(body).then(() => { }).catch((error) => {
                    this.callUncall('startCallout', error, null);
                });
                break;
            case this.serviceTypes.CALLOUT_START_DONE:
                this.Call.receiveStartCalloutDone(body, this.sendSlavePacket.bind(this)).then((result) => {
                    this.callUncall('startCallout', null, null);
                }).catch((error) => {
                    this.callUncall('startCallout', error, null);
                });
                break;
            case this.serviceTypes.CALLOUT_DATA_STATUS_CHANGED:
                this.Call.receiveCalloutStatusChanged(body).then((result) => {
                    if (typeof this.Delegates.onCalloutStatusChanged === 'function') {
                        this.Delegates.onCalloutStatusChanged(null, result);
                    }
                }).catch();
                break;

            case this.serviceTypes.CALLIN_START:
                this.Call.receiveCallinStart(body).then((result) => {
                    if (typeof this.Delegates.onCallinStart === 'function') {
                        this.Delegates.onCallinStart(null, result);
                    }
                }).catch();
                break;
            case this.serviceTypes.CALLIN_STATUS_CHANGED:
                this.Call.receiveCallinStatusChanged(body).then((result) => {
                    if (typeof this.Delegates.onCallinStatusChanged === 'function') {
                        this.Delegates.onCallinStatusChanged(null, result);
                    }
                }).catch();
                break;
            case this.serviceTypes.CALLIN_STATUS_CHANGED_BY_ME:
                this.Call.receiveCallinStatusChangedByMe(body).then((result) => {
                    if (typeof this.Delegates.onCallinStatusChangedByMe === 'function') {
                        this.Delegates.onCallinStatusChangedByMe(null, result);
                    }
                }).catch();
                break;

            case this.serviceTypes.PAID_CALL_LOG_RETURN:
                this.Call.receivePaidCallLog(body).then((result) => {
                    if (typeof this.Delegates.onPaidCallLogReturn === 'function') {
                        this.Delegates.onPaidCallLogReturn(null, result);
                    }
                }).catch();
                break;
            case this.serviceTypes.PAID_CALL_LOGS_GET:
                this.Call.receivePaidCallLogsList(body).then((result) => {
                    this.callUncall('getPaidCallLogs', null, result);
                }).catch((error) => {
                    this.callUncall('getPaidCallLogs', error, null);
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
                authenticatingData: this.authenticatingData
            }).then(() => { }).catch((error) => {
                this.callUncall('authentication', error, null);
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
            this.callUncall('authentication', {
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
                message: 'Got web packet from slave socket'
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
        this.Authentication = new Authentication({ logLevelConstants: this.logLevelConstants, serviceTypes: this.serviceTypes, errorCodes: this.errorCodes, Logger: this.Logger, sendPacketFunction: this.sendSlavePacket.bind(this) });
        this.Call = new Call({ logLevelConstants: this.logLevelConstants, serviceTypes: this.serviceTypes, errorCodes: this.errorCodes, callConstants: this.callConstants, listConstants: this.listConstants, Logger: this.Logger, sendPacketFunction: this.sendSlavePacket.bind(this) });
    };

    connect(callback) {
        return new Promise((resolve, reject) => {
            this.addUncall('authentication', callback, resolve, reject, 'onAuthencationReturn');

            if (!this.authenticatingData.appId || !this.authenticatingData.publicKey || !this.authenticatingData.azStackUserId || !this.authenticatingData.fullname) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing authenticating data'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Authenticating data',
                    payload: this.authenticatingData
                });
                this.callUncall('authentication', {
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
                this.callUncall('authentication', error, null);
            });
        });
    };

    toggleAutioState(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Toggle audio state'
            });
            this.addUncall('toggleAutioState', callback, resolve, reject, 'onToggleAudioStateReturn');

            this.Call.toggleAudioState({}).then((result) => {
                this.callUncall('toggleAutioState', null, null);
            }).catch((error) => {
                this.callUncall('toggleAutioState', error, null);
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
            this.addUncall('startCallout', callback, resolve, reject, 'onStartCalloutReturn');

            if (!options.callData || !options.callData.toPhoneNumber) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing callout data'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Callout data',
                    payload: options.callData
                });
                this.callUncall('startCallout', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'toPhoneNumber is required for start callout'
                }, null);
                return;
            }

            this.newUniqueId();
            this.Call.sendStartCallout({
                callData: {
                    callId: this.uniqueId,
                    toPhoneNumber: options.callData.toPhoneNumber
                }
            }).then(() => { }).catch((error) => {
                this.callUncall('startCallout', error, null);
            });
        });
    };
    stopCallout(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Stop callout'
            });
            this.addUncall('stopCallout', callback, resolve, reject, 'onStopCalloutReturn');

            this.Call.sendStopCallout({}).then((result) => {
                this.callUncall('stopCallout', null, null);
            }).catch((error) => {
                this.callUncall('stopCallout', error, null);
            });
        });
    };

    answerCallin(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Answer callin'
            });
            this.addUncall('answerCallin', callback, resolve, reject, 'onAnswerCallinReturn');

            this.Call.sendAnswerCallin({}).then((result) => {
                this.callUncall('answerCallin', null, null);
            }).catch((error) => {
                this.callUncall('answerCallin', error, null);
            });
        });
    };
    rejectCallin(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Reject callin'
            });
            this.addUncall('rejectCallin', callback, resolve, reject, 'onRejectCallinReturn');

            this.Call.sendRejectCallin({}).then((result) => {
                this.callUncall('rejectCallin', null, null);
            }).catch((error) => {
                this.callUncall('rejectCallin', error, null);
            });
        });
    };
    notAnsweredCallin(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Not Answered callin'
            });
            this.addUncall('notAnsweredCallin', callback, resolve, reject, 'onNotAnsweredCallinReturn');

            this.Call.sendNotAnsweredCallin({}).then((result) => {
                this.callUncall('notAnsweredCallin', null, null);
            }).catch((error) => {
                this.callUncall('notAnsweredCallin', error, null);
            });
        });
    };
    stopCallin(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Stop callin'
            });
            this.addUncall('stopCallin', callback, resolve, reject, 'onStopCallinReturn');

            this.Call.sendStopCallin({}).then((result) => {
                this.callUncall('stopCallin', null, null);
            }).catch((error) => {
                this.callUncall('stopCallin', error, null);
            });
        });
    };

    getPaidCallLogs(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Get paid call logs'
            });
            this.addUncall('getPaidCallLogs', callback, resolve, reject, 'onGetPaidCallLogsReturn');

            this.Call.sendGetPaidCallLogs({}).then().catch((error) => {
                this.callUncall('getPaidCallLogs', error, null);
            });
        });
    };
};

export default AZStack;