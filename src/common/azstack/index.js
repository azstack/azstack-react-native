import * as uncallConstants from './constant/uncallConstants';
import * as logLevelConstants from './constant/logLevel';
import * as serviceTypes from './constant/serviceTypes';
import * as errorCodes from './constant/errorCodes';
import * as callConstants from './constant/callConstants';
import * as listConstants from './constant/listConstants';
import * as chatConstants from './constant/chatConstants';
import * as userConstants from './constant/userConstants';

import Logger from './helper/logger';
import Delegates from './core/delegate';
import Authentication from './core/authentication';
import Call from './core/call';
import Message from './core/message';
import User from './core/user';

class AZStack {
    constructor() {
        this.sdkVersion = '0.0.1';
        this.masterSocketUri = 'https://www.azhub.xyz:9199';
        this.uncallConstants = uncallConstants;
        this.logLevelConstants = logLevelConstants;
        this.serviceTypes = serviceTypes;
        this.errorCodes = errorCodes;
        this.callConstants = callConstants;
        this.listConstants = listConstants;
        this.chatConstants = chatConstants;
        this.logLevel = this.logLevelConstants.LOG_LEVEL_NONE;
        this.requestTimeout = 60000;
        this.intervalPingTime = 60000;

        this.Logger = new Logger();
        this.Delegates = new Delegates({ logLevelConstants: this.logLevelConstants, Logger: this.Logger });

        this.unCalls = {};
        this.slaveAddress = null;
        this.slaveSocket = null;
        this.slaveSocketConnected = false;
        this.slaveSocketDisconnecting = false;
        this.authenticatingData = {};
        this.authenticatedUser = null;
        this.intervalSendPing = null;

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

        if (data && this.unCalls[key].temporary) {
            for (let temporaryKey in this.unCalls[key].temporary) {
                switch (this.unCalls[key].temporary[temporaryKey].type) {
                    case this.uncallConstants.UNCALL_TEMPORARY_TYPE_ARRAY:
                        data[temporaryKey] = data[temporaryKey].concat(this.unCalls[key].temporary[temporaryKey].data)
                        break;
                    default:
                        data[temporaryKey] = this.unCalls[key].temporary[temporaryKey].data;
                        break;
                }
            }
        }

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
    addUncallTemporary(uncallKey, temporaryKey, dataObj, type) {
        if (!this.unCalls[uncallKey].temporary) {
            this.unCalls[uncallKey].temporary = {};
        }
        if (!this.unCalls[uncallKey].temporary[temporaryKey]) {
            this.unCalls[uncallKey].temporary[temporaryKey] = {
                type: type,
                data: null
            };
            switch (type) {
                case this.uncallConstants.UNCALL_TEMPORARY_TYPE_ARRAY:
                    this.unCalls[uncallKey].temporary[temporaryKey].data = [];
                    break;
                default:
                    this.unCalls[uncallKey].temporary[temporaryKey].data = null;
                    break;
            }
        }
        switch (type) {
            case this.uncallConstants.UNCALL_TEMPORARY_TYPE_ARRAY:
                this.unCalls[uncallKey].temporary[temporaryKey].data = this.unCalls[uncallKey].temporary[temporaryKey].data.concat(dataObj[temporaryKey]);
                break;
            default:
                this.unCalls[uncallKey].temporary[temporaryKey].data = dataObj[temporaryKey];
                break;
        }
    }

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
                this.Call.receivePaidCallLogs(body).then((result) => {
                    this.callUncall('getPaidCallLogs', null, result);
                }).catch((error) => {
                    this.callUncall('getPaidCallLogs', error, null);
                });
                break;

            case this.serviceTypes.MESSAGE_GET_LIST_UNREAD:
                this.Message.receiveUnreadMessages(body).then((result) => {
                    this.callUncall('getUnreadMessages', null, result);
                }).catch((error) => {
                    this.callUncall('getUnreadMessages', error, null);
                });
                break;
            case this.serviceTypes.MESSAGE_GET_LIST_MODIFIED:
                this.Message.receiveModifiedMessages(body).then((result) => {
                    this.callUncall('getModifiedMessages', null, result);
                }).catch((error) => {
                    this.callUncall('getModifiedMessages', error, null);
                });
                break;

            case this.serviceTypes.USER_GET_INFO_BY_IDS:
            case this.serviceTypes.USER_GET_INFO_BY_USERNAMES:
                this.User.receiveUsersInfomation(body).then((result) => {
                    if (result.done === 1) {
                        this.callUncall('getUsersInformation', null, result);
                    } else {
                        this.addUncallTemporary('getUsersInformation', 'list', result, this.uncallConstants.UNCALL_TEMPORARY_TYPE_ARRAY);
                    }
                }).catch((error) => {
                    this.callUncall('getUsersInformation', error, null);
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
            this.intervalSendPing = setInterval(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send ping packet to slave server'
                });
                this.sendSlavePacket({
                    service: this.serviceTypes.PING,
                    body: JSON.stringify({})
                }).then(() => {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Send ping packet to slave server successfully'
                    });
                }).catch(() => {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: 'Send ping packet to slave server fail'
                    });
                });
            }, this.intervalPingTime);
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
            this.slaveAddress = null;
            this.authenticatedUser = null;
            this.slaveSocket = null;
            clearInterval(this.intervalSendPing);
            this.intervalSendPing = null;
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Disconnected to slave socket'
            });
            if (this.slaveSocketDisconnecting) {
                this.slaveSocketDisconnecting = false;
                this.callUncall('disconnect', null, null);
            }
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
        if (options.intervalPingTime && typeof options.intervalPingTime === 'number') {
            this.intervalPingTime = options.intervalPingTime;
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
        this.Message = new Message({ logLevelConstants: this.logLevelConstants, serviceTypes: this.serviceTypes, errorCodes: this.errorCodes, listConstants: this.listConstants, chatConstants: this.chatConstants, Logger: this.Logger, sendPacketFunction: this.sendSlavePacket.bind(this) });
        this.User = new User({ logLevelConstants: this.logLevelConstants, serviceTypes: this.serviceTypes, errorCodes: this.errorCodes, listConstants: this.listConstants, userConstants: this.userConstants, Logger: this.Logger, sendPacketFunction: this.sendSlavePacket.bind(this) });
    };

    connect(options, callback) {
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
    disconnect(options, callback) {
        return new Promise((resolve, reject) => {

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Start disconnect to slave server'
            });

            this.addUncall('disconnect', callback, resolve, reject, 'onDisconnectReturn');

            if (!this.slaveSocketConnected) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot disconnect to slave server, slave socket not connected'
                });
                this.callUncall('disconnect', {
                    code: this.errorCodes.ERR_SOCKET_NOT_CONNECTED,
                    message: 'Cannot disconnect to slave server, slave socket not connected'
                }, null);
                return;
            }

            this.slaveSocketDisconnecting = true;
            this.slaveSocket.disconnect();
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

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing callout data'
                });
                this.callUncall('startCallout', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing callout data'
                }, null);
                return;
            }

            if (!options.toPhoneNumber) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'toPhoneNumber is required for start callout'
                });
                this.callUncall('startCallout', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'toPhoneNumber is required for start callout'
                }, null);
                return;
            }

            if (typeof options.toPhoneNumber !== 'string' || !/^\+?\d+$/.test(options.toPhoneNumber)) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'toPhoneNumber is invalid, not a string number'
                });
                this.callUncall('startCallout', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'toPhoneNumber is invalid, not a string number'
                }, null);
                return;
            }

            this.newUniqueId();
            this.Call.sendStartCallout({
                callId: this.uniqueId,
                toPhoneNumber: options.toPhoneNumber
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

    getUnreadMessages(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Get unread messages'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Get unread messages params',
                payload: options
            });

            this.addUncall('getUnreadMessages', callback, resolve, reject, 'onGetUnreadMessagesReturn');

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing unread messages params'
                });
                this.callUncall('getUnreadMessages', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing unread messages params'
                }, null);
                return;
            }

            if (!options.page) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'page is required'
                });
                this.callUncall('getUnreadMessages', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'page is required'
                }, null);
                return;
            }

            if (typeof options.page !== 'number') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'page must be number'
                });
                this.callUncall('getUnreadMessages', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'page must be number'
                }, null);
                return;
            }

            if (!options.chatType) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'chatType is required'
                });
                this.callUncall('getUnreadMessages', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'chatType is required'
                }, null);
                return;
            }

            if (options.chatType !== this.chatConstants.CHAT_TYPE_USER && options.chatType !== this.chatConstants.CHAT_TYPE_GROUP) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'unknown chatType'
                });
                this.callUncall('getUnreadMessages', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'unknown chatType'
                }, null);
                return;
            }

            if (!options.chatId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'chatId is required'
                });
                this.callUncall('getUnreadMessages', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'chatId is required'
                }, null);
                return;
            }

            if (typeof options.chatId !== 'number') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'chatId must be number'
                });
                this.callUncall('getUnreadMessages', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'chatId must be number'
                }, null);
                return;
            }

            this.Message.sendGetUnreadMessages({
                page: options.page,
                chatType: options.chatType,
                chatId: options.chatId
            }).then().catch((error) => {
                this.callUncall('getUnreadMessages', error, null);
            });
        });
    };
    getModifiedMessages(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Get modified messages'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Get modified messages params',
                payload: options
            });

            this.addUncall('getModifiedMessages', callback, resolve, reject, 'onGetModifiedMessagesReturn');

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing modified messages params'
                });
                this.callUncall('getModifiedMessages', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing modified messages params'
                }, null);
                return;
            }

            if (!options.page) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'page is required'
                });
                this.callUncall('getModifiedMessages', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'page is required'
                }, null);
                return;
            }

            if (typeof options.page !== 'number') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'page must be number'
                });
                this.callUncall('getModifiedMessages', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'page must be number'
                }, null);
                return;
            }

            if (!options.lastCreated) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'lastCreated is required'
                });
                this.callUncall('getModifiedMessages', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'lastCreated is required'
                }, null);
                return;
            }

            if (typeof options.lastCreated !== 'number') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'lastCreated must be number'
                });
                this.callUncall('getModifiedMessages', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'lastCreated must be number'
                }, null);
                return;
            }

            if (!options.chatType) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'chatType is required'
                });
                this.callUncall('getModifiedMessages', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'chatType is required'
                }, null);
                return;
            }

            if (options.chatType !== this.chatConstants.CHAT_TYPE_USER && options.chatType !== this.chatConstants.CHAT_TYPE_GROUP) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'unknown chatType'
                });
                this.callUncall('getModifiedMessages', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'unknown chatType'
                }, null);
                return;
            }

            if (!options.chatId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'chatId is required'
                });
                this.callUncall('getModifiedMessages', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'chatId is required'
                }, null);
                return;
            }

            if (typeof options.chatId !== 'number') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'chatId must be number'
                });
                this.callUncall('getModifiedMessages', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'chatId must be number'
                }, null);
                return;
            }

            this.Message.sendGetModifiedMessages({
                page: options.page,
                lastCreated: options.lastCreated,
                chatType: options.chatType,
                chatId: options.chatId
            }).then().catch((error) => {
                this.callUncall('getModifiedMessages', error, null);
            });
        });
    };

    getUsersInformation(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Get users information'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Get users information params',
                payload: options
            });

            this.addUncall('getUsersInformation', callback, resolve, reject, 'onGetUsersInformationReturn');

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing users information params'
                });
                this.callUncall('getUsersInformation', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing users information params'
                }, null);
                return;
            }

            if (!options.userIds && !options.azStackUserIds) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'userIds or azStackUserIds is required'
                });
                this.callUncall('getUsersInformation', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'userIds or azStackUserIds is required'
                }, null);
                return;
            }

            if (options.userIds) {
                if (!Array.isArray(options.userIds)) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: 'userIds must be an array'
                    });
                    this.callUncall('getUsersInformation', {
                        code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                        message: 'userIds must be an array'
                    }, null);
                    return;
                }

                if (!options.userIds.length) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: 'userIds cannot be empty'
                    });
                    this.callUncall('getUsersInformation', {
                        code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                        message: 'userIds cannot be empty'
                    }, null);
                    return;
                }

                let allNumber = true;
                for (let i = 0; i < options.userIds.length; i++) {
                    if (typeof options.userIds[i] !== 'number') {
                        allNumber = false;
                        break;
                    }
                }

                if (!allNumber) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: 'userIds must contain all numbers'
                    });
                    this.callUncall('getUsersInformation', {
                        code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                        message: 'userIds must contain all numbers'
                    }, null);
                    return;
                }
            }

            if (options.azStackUserIds) {
                if (!Array.isArray(options.azStackUserIds)) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: 'azStackUserIds must be an array'
                    });
                    this.callUncall('getUsersInformation', {
                        code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                        message: 'azStackUserIds must be an array'
                    }, null);
                    return;
                }

                if (!options.azStackUserIds.length) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: 'azStackUserIds cannot be empty'
                    });
                    this.callUncall('getUsersInformation', {
                        code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                        message: 'azStackUserIds cannot be empty'
                    }, null);
                    return;
                }

                let allString = true;
                for (let i = 0; i < options.azStackUserIds.length; i++) {
                    if (typeof options.azStackUserIds[i] !== 'string') {
                        allString = false;
                        break;
                    }
                }

                if (!allString) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: 'azStackUserIds must contain all strings'
                    });
                    this.callUncall('getUsersInformation', {
                        code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                        message: 'azStackUserIds must contain all strings'
                    }, null);
                    return;
                }
            }

            this.User.sendGetUsersInfomation({
                userIds: options.userIds,
                azStackUserIds: options.azStackUserIds
            }).then().catch((error) => {
                this.callUncall('getUsersInformation', error, null);
            });
        });
    };
};

export default AZStack;