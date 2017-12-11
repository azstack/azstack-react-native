import * as uncallConstants from './constant/uncallConstants';
import * as delegateConstants from './constant/delegateConstants';
import * as dataTypes from './constant/dataTypes';
import * as logLevelConstants from './constant/logLevel';
import * as serviceTypes from './constant/serviceTypes';
import * as errorCodes from './constant/errorCodes';
import * as callConstants from './constant/callConstants';
import * as listConstants from './constant/listConstants';
import * as chatConstants from './constant/chatConstants';
import * as userConstants from './constant/userConstants';

import Tool from './helper/tool';
import Validator from './helper/validator';
import Logger from './helper/logger';
import Delegates from './core/delegate';
import Authentication from './core/authentication';
import Call from './core/call';
import Conversation from './core/conversation';
import Message from './core/message';
import User from './core/user';

class AZStack {
    constructor() {
        this.sdkVersion = '0.0.1';
        this.masterSocketUri = 'https://www.azhub.xyz:9199';
        this.uncallConstants = uncallConstants;
        this.delegateConstants = delegateConstants;
        this.dataTypes = dataTypes;
        this.logLevelConstants = logLevelConstants;
        this.serviceTypes = serviceTypes;
        this.errorCodes = errorCodes;
        this.callConstants = callConstants;
        this.listConstants = listConstants;
        this.chatConstants = chatConstants;
        this.logLevel = this.logLevelConstants.LOG_LEVEL_NONE;
        this.requestTimeout = 60000;
        this.intervalPingTime = 60000;

        this.Tool = new Tool();
        this.Validator = new Validator({ dataTypes: this.dataTypes });
        this.Logger = new Logger();
        this.Delegates = new Delegates({ logLevelConstants: this.logLevelConstants, delegateConstants: this.delegateConstants, Logger: this.Logger });

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

    addUncall(uncallKey, requestKey, callbackFunction, resolveFunction, rejectFunction, delegateKey) {
        if (!this.unCalls[uncallKey]) {
            this.unCalls[uncallKey] = {};
        }
        this.unCalls[uncallKey][requestKey] = {};
        this.unCalls[uncallKey][requestKey].callback = callbackFunction;
        this.unCalls[uncallKey][requestKey].resolve = resolveFunction;
        this.unCalls[uncallKey][requestKey].reject = rejectFunction;
        this.unCalls[uncallKey][requestKey].delegate = delegateKey;
        this.unCalls[uncallKey][requestKey].timeout = setTimeout(() => {
            const error = {
                code: this.errorCodes.ERR_REQUEST_TIMEOUT,
                message: `Request with uncallKey "${uncallKey}" and requestKey "${requestKey}" has exceed timeout ${this.requestTimeout}s`
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                message: 'A request exceed timeout'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'A request exceed timeout',
                payload: {
                    uncallKey: uncallKey,
                    requestKey: requestKey,
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
            delete this.unCalls[uncallKey][requestKey];
        }, this.requestTimeout);
    };
    callUncall(uncallKey, requestKey, error, data) {
        if (!this.unCalls[uncallKey] || !this.unCalls[uncallKey][requestKey]) {
            return;
        }
        clearTimeout(this.unCalls[uncallKey][requestKey].timeout);

        if (data && this.unCalls[uncallKey][requestKey].temporary) {
            for (let temporaryKey in this.unCalls[uncallKey][requestKey].temporary) {
                switch (this.unCalls[uncallKey][requestKey].temporary[temporaryKey].type) {
                    case this.uncallConstants.UNCALL_TEMPORARY_TYPE_ARRAY:
                        data[temporaryKey] = data[temporaryKey].concat(this.unCalls[uncallKey][requestKey].temporary[temporaryKey].data)
                        break;
                    default:
                        data[temporaryKey] = this.unCalls[uncallKey][requestKey].temporary[temporaryKey].data;
                        break;
                }
            }
        }

        if (typeof this.unCalls[uncallKey][requestKey].callback === 'function') {
            this.unCalls[uncallKey][requestKey].callback(error, data);
        }
        if (error) {
            this.unCalls[uncallKey][requestKey].reject(error);
        } else {
            this.unCalls[uncallKey][requestKey].resolve(data);
        }
        if (typeof this.Delegates[this.unCalls[uncallKey][requestKey].delegate] === 'function') {
            this.Delegates[this.unCalls[uncallKey][requestKey].delegate](error, data);
        }
        delete this.unCalls[uncallKey][requestKey];
    };
    addUncallTemporary(uncallKey, requestKey, temporaryKey, dataObj, type) {
        if (!this.unCalls[uncallKey][requestKey].temporary) {
            this.unCalls[uncallKey][requestKey].temporary = {};
        }
        if (!this.unCalls[uncallKey][requestKey].temporary[temporaryKey]) {
            this.unCalls[uncallKey][requestKey].temporary[temporaryKey] = {
                type: type,
                data: null
            };
            switch (type) {
                case this.uncallConstants.UNCALL_TEMPORARY_TYPE_ARRAY:
                    this.unCalls[uncallKey][requestKey].temporary[temporaryKey].data = [];
                    break;
                default:
                    this.unCalls[uncallKey][requestKey].temporary[temporaryKey].data = null;
                    break;
            }
        }
        switch (type) {
            case this.uncallConstants.UNCALL_TEMPORARY_TYPE_ARRAY:
                this.unCalls[uncallKey][requestKey].temporary[temporaryKey].data = this.unCalls[uncallKey][requestKey].temporary[temporaryKey].data.concat(dataObj[temporaryKey]);
                break;
            default:
                this.unCalls[uncallKey][requestKey].temporary[temporaryKey].data = dataObj[temporaryKey];
                break;
        }
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
                    this.callUncall(this.uncallConstants.UNCALL_KEY_AUTHENTICATION, 'default', null, this.authenticatedUser);
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_AUTHENTICATION, 'default', error, null);
                });
                break;

            case this.serviceTypes.CALLOUT_START_INITIAL:
                this.Call.receiveStartCalloutInitial(body).then(() => { }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_START_CALLOUT, 'default', error, null);
                });
                break;
            case this.serviceTypes.CALLOUT_START_DONE:
                this.Call.receiveStartCalloutDone(body, this.sendSlavePacket.bind(this)).then((result) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_START_CALLOUT, 'default', null, null);
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_START_CALLOUT, 'default', error, null);
                });
                break;
            case this.serviceTypes.CALLOUT_DATA_STATUS_CHANGED:
                this.Call.receiveCalloutStatusChanged(body).then((result) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_CALLOUT_STAUTUS_CHANGED] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_CALLOUT_STAUTUS_CHANGED](null, result);
                    }
                }).catch();
                break;

            case this.serviceTypes.CALLIN_START:
                this.Call.receiveCallinStart(body).then((result) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_CALLIN_START] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_CALLIN_START](null, result);
                    }
                }).catch();
                break;
            case this.serviceTypes.CALLIN_STATUS_CHANGED:
                this.Call.receiveCallinStatusChanged(body).then((result) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_CALLIN_STATUS_CHANGED] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_CALLIN_STATUS_CHANGED](null, result);
                    }
                }).catch();
                break;
            case this.serviceTypes.CALLIN_STATUS_CHANGED_BY_ME:
                this.Call.receiveCallinStatusChangedByMe(body).then((result) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_CALLIN_STATUS_CHANGED_BY_ME] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_CALLIN_STATUS_CHANGED_BY_ME](null, result);
                    }
                }).catch();
                break;

            case this.serviceTypes.PAID_CALL_LOG_RETURN:
                this.Call.receivePaidCallLog(body).then((result) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_PAID_CALL_LOG_RETURN] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_PAID_CALL_LOG_RETURN](null, result);
                    }
                }).catch();
                break;
            case this.serviceTypes.PAID_CALL_LOGS_GET:
                this.Call.receivePaidCallLogs(body).then((result) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GET_PAID_CALL_LOGS, 'default', null, result);
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GET_PAID_CALL_LOGS, 'default', error, null);
                });
                break;

            case this.serviceTypes.CONVERSATION_GET_LIST_MODIFIED:
                this.Conversation.receiveModifiedConversations(body).then((result) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_CONVERSATIONS, 'default', null, result);
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_CONVERSATIONS, 'default', error, null);
                });
                break;

            case this.serviceTypes.MESSAGE_GET_LIST_UNREAD:
                this.Message.receiveUnreadMessages(body).then((result) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GET_UNREAD_MESSAGES, 'default', null, result);
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GET_UNREAD_MESSAGES, 'default', error, null);
                });
                break;
            case this.serviceTypes.MESSAGE_GET_LIST_MODIFIED:
                this.Message.receiveModifiedMessages(body).then((result) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_MESSAGES, 'default', null, result);
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_MESSAGES, 'default', error, null);
                });
                break;

            case this.serviceTypes.MESSAGE_HAS_NEW_WITH_USER_TYPE_TEXT:
                this.Message.receiveHasNewMessage({
                    chatType: this.chatConstants.CHAT_TYPE_USER,
                    messageType: this.chatConstants.MESSAGE_TYPE_TEXT,
                    body: body
                }).then((result) => {
                    result.receiverId = this.authenticatedUser.userId;
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_HAS_NEW_MESSAGE] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_HAS_NEW_MESSAGE](null, result);
                    }
                }).catch();
                break;
            case this.serviceTypes.MESSAGE_WITH_USER_TYPE_STICKER:
                this.Message.receiveHasNewMessage({
                    chatType: this.chatConstants.CHAT_TYPE_USER,
                    messageType: this.chatConstants.MESSAGE_TYPE_STICKER,
                    body: body
                }).then((result) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_HAS_NEW_MESSAGE] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_HAS_NEW_MESSAGE](null, result);
                    }
                }).catch();
                break;
            case this.serviceTypes.MESSAGE_WITH_USER_TYPE_FILE:
                this.Message.receiveHasNewMessage({
                    chatType: this.chatConstants.CHAT_TYPE_USER,
                    messageType: this.chatConstants.MESSAGE_TYPE_FILE,
                    body: body
                }).then((result) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_HAS_NEW_MESSAGE] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_HAS_NEW_MESSAGE](null, result);
                    }
                }).catch();
                break;

            case this.serviceTypes.MESSAGE_FROM_ME_WITH_USER:
                this.Message.receiveMessageFromMe({
                    chatType: this.chatConstants.CHAT_TYPE_USER,
                    body: body
                }).then((result) => {
                    result.senderId = this.authenticatedUser.userId;
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_FROM_ME] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_FROM_ME](null, result);
                    }
                }).catch();
                break;
            case this.serviceTypes.MESSAGE_FROM_ME_WITH_USER_JSON:
                this.Message.receiveMessageFromMe({
                    chatType: this.chatConstants.CHAT_TYPE_USER,
                    body: body
                }).then((result) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_FROM_ME] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_FROM_ME](null, result);
                    }
                }).catch();
                break;

            case this.serviceTypes.MESSAGE_NEW_WITH_USER_TYPE_TEXT:
                this.Message.receiveMessageSentReport({
                    chatType: this.chatConstants.CHAT_TYPE_USER,
                    body: body
                }).then((result) => {
                    result.receiverId = this.authenticatedUser.userId;
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_SENT_REPORT] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_SENT_REPORT](null, result);
                    }
                }).catch();
                break;

            case this.serviceTypes.MESSAGE_TYPING_WITH_USER:
                this.Message.receiveTyping({
                    chatType: this.chatConstants.CHAT_TYPE_USER,
                    body: body
                }).then((result) => {
                    result.receiverId = this.authenticatedUser.userId;
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_TYPING] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_TYPING](null, result);
                    }
                }).catch();
                break;

            case this.serviceTypes.USER_GET_INFO_BY_IDS:
            case this.serviceTypes.USER_GET_INFO_BY_USERNAMES:
                this.User.receiveUsersInfomation(body).then((result) => {
                    if (result.done === 1) {
                        let requestKey = result.purpose;
                        delete result.purpose;
                        this.callUncall(this.uncallConstants.UNCALL_KEY_GET_USERS_INFORMATION, requestKey, null, result);
                    } else {
                        this.addUncallTemporary(this.uncallConstants.UNCALL_KEY_GET_USERS_INFORMATION, result.purpose, 'list', result, this.uncallConstants.UNCALL_TEMPORARY_TYPE_ARRAY);
                    }
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GET_USERS_INFORMATION, 'default', error, null);
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
                this.callUncall(this.uncallConstants.UNCALL_KEY_AUTHENTICATION, 'default', error, null);
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
            this.callUncall(this.uncallConstants.UNCALL_KEY_AUTHENTICATION, 'default', {
                code: this.errorCodes.ERR_SOCKET_CONNECT,
                message: 'Cannot connect to slave socket'
            }, null);
        });
        this.slaveSocket.on(this.uncallConstants.UNCALL_KEY_DISCONNECT, () => {
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
                this.callUncall(this.uncallConstants.UNCALL_KEY_DISCONNECT, 'default', null, null);
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
        if (!this.Validator.isObject(options)) {
            return;
        }
        if (options.requestTimeout && this.Validator.isNumber(options.requestTimeout)) {
            this.requestTimeout = options.requestTimeout;
        }
        if (options.intervalPingTime && this.Validator.isNumber(options.intervalPingTime)) {
            this.intervalPingTime = options.intervalPingTime;
        }
        if (options.logLevel && this.Validator.isString(options.logLevel)) {
            this.logLevel = options.logLevel;
        }
        if (options.authenticatingData && this.Validator.isObject(options.authenticatingData)) {
            this.authenticatingData.appId = this.Validator.isString(options.authenticatingData.appId) ? options.authenticatingData.appId : '';
            this.authenticatingData.publicKey = this.Validator.isString(options.authenticatingData.publicKey) ? options.authenticatingData.publicKey : '';
            this.authenticatingData.azStackUserId = this.Validator.isString(options.authenticatingData.azStackUserId) ? options.authenticatingData.azStackUserId : '';
            this.authenticatingData.userCredentials = this.Validator.isString(options.authenticatingData.userCredentials) ? options.authenticatingData.userCredentials : '';
            this.authenticatingData.fullname = this.Validator.isString(options.authenticatingData.fullname) ? options.authenticatingData.fullname : '';
            this.authenticatingData.namespace = this.Validator.isString(options.authenticatingData.namespace) ? options.authenticatingData.namespace : '';
        }
    };
    init() {
        this.Logger.setLogLevel(this.logLevel);
        this.Authentication = new Authentication({ logLevelConstants: this.logLevelConstants, serviceTypes: this.serviceTypes, errorCodes: this.errorCodes, Logger: this.Logger, sendPacketFunction: this.sendSlavePacket.bind(this) });
        this.Call = new Call({ logLevelConstants: this.logLevelConstants, serviceTypes: this.serviceTypes, errorCodes: this.errorCodes, callConstants: this.callConstants, listConstants: this.listConstants, Logger: this.Logger, sendPacketFunction: this.sendSlavePacket.bind(this) });
        this.Conversation = new Conversation({ logLevelConstants: this.logLevelConstants, serviceTypes: this.serviceTypes, errorCodes: this.errorCodes, listConstants: this.listConstants, chatConstants: this.chatConstants, Logger: this.Logger, sendPacketFunction: this.sendSlavePacket.bind(this) });
        this.Message = new Message({ logLevelConstants: this.logLevelConstants, serviceTypes: this.serviceTypes, errorCodes: this.errorCodes, listConstants: this.listConstants, chatConstants: this.chatConstants, Logger: this.Logger, sendPacketFunction: this.sendSlavePacket.bind(this) });
        this.User = new User({ logLevelConstants: this.logLevelConstants, serviceTypes: this.serviceTypes, errorCodes: this.errorCodes, listConstants: this.listConstants, userConstants: this.userConstants, Logger: this.Logger, sendPacketFunction: this.sendSlavePacket.bind(this) });
    };

    connect(options, callback) {
        return new Promise((resolve, reject) => {
            this.addUncall(this.uncallConstants.UNCALL_KEY_AUTHENTICATION, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_AUTHENTICATION_RETURN);

            if (!this.authenticatingData.appId || !this.authenticatingData.publicKey || !this.authenticatingData.azStackUserId || !this.authenticatingData.fullname) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing authenticating data'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Authenticating data',
                    payload: this.authenticatingData
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_AUTHENTICATION, 'default', {
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
                this.callUncall(this.uncallConstants.UNCALL_KEY_AUTHENTICATION, 'default', error, null);
            });
        });
    };
    disconnect(options, callback) {
        return new Promise((resolve, reject) => {

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Start disconnect to slave server'
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_DISCONNECT, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_DISCONNECT_RETURN);

            if (!this.slaveSocketConnected) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot disconnect to slave server, slave socket not connected'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_DISCONNECT, 'default', {
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
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Toggle audio state data',
                payload: options
            });
            this.addUncall(this.uncallConstants.UNCALL_KEY_TOGGLE_AUDIO_STATE, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_TOGGLE_AUDIO_STATE_RETURN);

            if (options && typeof options === 'object') {
                let dataErrorMessage = this.Validator.check([{
                    name: 'state',
                    dataType: this.dataTypes.DATA_TYPE_BOOLEAN,
                    data: options.state
                }]);
                if (dataErrorMessage) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: dataErrorMessage
                    });
                    this.callUncall(this.uncallConstants.UNCALL_KEY_TOGGLE_AUDIO_STATE, 'default', {
                        code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                        message: dataErrorMessage
                    }, null);
                    return;
                }
            }

            this.Call.toggleAudioState({
                state: options.state
            }).then((result) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_TOGGLE_AUDIO_STATE, 'default', null, null);
            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_TOGGLE_AUDIO_STATE, 'default', error, null);
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
            this.addUncall(this.uncallConstants.UNCALL_KEY_START_CALLOUT, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_START_CALLOUT_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing callout data'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_START_CALLOUT, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing callout data'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'toPhoneNumber',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_PHONE_NUMBER,
                data: options.toPhoneNumber
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_START_CALLOUT, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            this.newUniqueId();
            this.Call.sendStartCallout({
                callId: this.uniqueId,
                toPhoneNumber: options.toPhoneNumber
            }).then(() => { }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_START_CALLOUT, 'default', error, null);
            });
        });
    };
    stopCallout(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Stop callout'
            });
            this.addUncall(this.uncallConstants.UNCALL_KEY_STOP_CALLOUT, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_STOP_CALLOUT_RETURN);

            this.Call.sendStopCallout({}).then((result) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_STOP_CALLOUT, 'default', null, null);
            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_STOP_CALLOUT, 'default', error, null);
            });
        });
    };

    answerCallin(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Answer callin'
            });
            this.addUncall(this.uncallConstants.UNCALL_KEY_ANSWER_CALLIN, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_ANSWER_CALLIN_RETURN);

            this.Call.sendAnswerCallin({}).then((result) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_ANSWER_CALLIN, 'default', null, null);
            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_ANSWER_CALLIN, 'default', error, null);
            });
        });
    };
    rejectCallin(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Reject callin'
            });
            this.addUncall(this.uncallConstants.UNCALL_KEY_REJECT_CALLIN, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_REJECT_CALLIN_RETURN);

            this.Call.sendRejectCallin({}).then((result) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_REJECT_CALLIN, 'default', null, null);
            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_REJECT_CALLIN, 'default', error, null);
            });
        });
    };
    notAnsweredCallin(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Not Answered callin'
            });
            this.addUncall(this.uncallConstants.UNCALL_KEY_NOT_ANSWERED_CALLIN, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_NOT_ANSWERED_CALLIN_RETURN);

            this.Call.sendNotAnsweredCallin({}).then((result) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_NOT_ANSWERED_CALLIN, 'default', null, null);
            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_NOT_ANSWERED_CALLIN, 'default', error, null);
            });
        });
    };
    stopCallin(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Stop callin'
            });
            this.addUncall(this.uncallConstants.UNCALL_KEY_STOP_CALLIN, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_STOP_CALLIN_RETURN);

            this.Call.sendStopCallin({}).then((result) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_STOP_CALLIN, 'default', null, null);
            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_STOP_CALLIN, 'default', error, null);
            });
        });
    };

    getPaidCallLogs(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Get paid call logs'
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_GET_PAID_CALL_LOGS, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_GET_PAID_CALL_LOGS_RETURN);

            this.Call.sendGetPaidCallLogs({}).then().catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_PAID_CALL_LOGS, 'default', error, null);
            });
        });
    };

    getModifiedConversations(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Get modified conversations'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Get modified conversations params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_CONVERSATIONS, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_GET_MODIFIED_CONVERSATIONS_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing modified conversations params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_CONVERSATIONS, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing modified conversations params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'page',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.page,
                notEqual: 0
            }, {
                name: 'lastCreated',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.lastCreated,
                notEqual: 0
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_CONVERSATIONS, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            this.Conversation.sendGetModifiedConversations({
                page: options.page,
                lastCreated: options.lastCreated
            }).then().catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_CONVERSATIONS, 'default', error, null);
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

            this.addUncall(this.uncallConstants.UNCALL_KEY_GET_UNREAD_MESSAGES, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_GET_UNREAD_MESSAGES_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing unread messages params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_UNREAD_MESSAGES, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing unread messages params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'page',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.page,
                notEqual: 0
            }, {
                name: 'chatType',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.chatType,
                in: [this.chatConstants.CHAT_TYPE_USER, this.chatConstants.CHAT_TYPE_GROUP]
            }, {
                name: 'chatId',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.chatId,
                notEqual: 0
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_UNREAD_MESSAGES, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            this.Message.sendGetUnreadMessages({
                page: options.page,
                chatType: options.chatType,
                chatId: options.chatId
            }).then().catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_UNREAD_MESSAGES, 'default', error, null);
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

            this.addUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_MESSAGES, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_GET_MODIFIED_MESSAGES_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing modified messages params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_MESSAGES, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing modified messages params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'page',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.page,
                notEqual: 0
            }, {
                name: 'lastCreated',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.lastCreated,
                notEqual: 0
            }, {
                name: 'chatType',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.chatType,
                in: [this.chatConstants.CHAT_TYPE_USER, this.chatConstants.CHAT_TYPE_GROUP]
            }, {
                name: 'chatId',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.chatId,
                notEqual: 0
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_MESSAGES, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            this.Message.sendGetModifiedMessages({
                page: options.page,
                lastCreated: options.lastCreated,
                chatType: options.chatType,
                chatId: options.chatId
            }).then().catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_MESSAGES, 'default', error, null);
            });
        });
    };

    newMessage(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'New message'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'New message params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_NEW_MESSAGE, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_NEW_MESSAGE_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing new message params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_NEW_MESSAGE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing new message params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'chatType',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.chatType,
                in: [this.chatConstants.CHAT_TYPE_USER, this.chatConstants.CHAT_TYPE_GROUP]
            }, {
                name: 'chatId',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.chatId,
                notEqual: 0
            }, {
                name: 'text',
                dataType: this.dataTypes.DATA_TYPE_STRING,
                data: options.text
            }, {
                name: 'sticker',
                dataType: this.dataTypes.DATA_TYPE_OBJECT,
                data: options.sticker
            }, {
                name: 'file',
                dataType: this.dataTypes.DATA_TYPE_OBJECT,
                data: options.file
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_NEW_MESSAGE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            if (!options.text && !options.sticker && !options.file) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'text or sticker or file is required'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_NEW_MESSAGE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'text or sticker or file is required'
                }, null);
                return;
            }

            if (options.sticker) {
                dataErrorMessage = this.Validator.check([{
                    name: 'sticker name',
                    required: true,
                    dataType: this.dataTypes.DATA_TYPE_STRING,
                    data: options.sticker.name
                }, {
                    name: 'sticker catId',
                    required: true,
                    dataType: this.dataTypes.DATA_TYPE_NUMBER,
                    data: options.sticker.catId
                }, {
                    name: 'sticker url',
                    required: true,
                    dataType: this.dataTypes.DATA_TYPE_URL,
                    data: options.sticker.url
                }]);
                if (dataErrorMessage) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: dataErrorMessage
                    });
                    this.callUncall(this.uncallConstants.UNCALL_KEY_NEW_MESSAGE, 'default', {
                        code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                        message: dataErrorMessage
                    }, null);
                    return;
                }
            }

            if (options.file) {
                dataErrorMessage = this.Validator.check([{
                    name: 'file name',
                    required: true,
                    dataType: this.dataTypes.DATA_TYPE_STRING,
                    data: options.file.name
                }, {
                    name: 'file length',
                    required: true,
                    dataType: this.dataTypes.DATA_TYPE_NUMBER,
                    data: options.file.length
                }, {
                    name: 'file type',
                    required: true,
                    dataType: this.dataTypes.DATA_TYPE_NUMBER,
                    data: options.file.type,
                    in: [
                        this.chatConstants.MESSAGE_FILE_TYPE_UNKNOWN,
                        this.chatConstants.MESSAGE_FILE_TYPE_IMAGE,
                        this.chatConstants.MESSAGE_FILE_TYPE_AUDIO,
                        this.chatConstants.MESSAGE_FILE_TYPE_VIDEO,
                        this.chatConstants.MESSAGE_FILE_TYPE_EXCEL,
                        this.chatConstants.MESSAGE_FILE_TYPE_WORD,
                        this.chatConstants.MESSAGE_FILE_TYPE_POWERPOINT,
                        this.chatConstants.MESSAGE_FILE_TYPE_PDF,
                        this.chatConstants.MESSAGE_FILE_TYPE_TEXT,
                        this.chatConstants.MESSAGE_FILE_TYPE_CODE,
                        this.chatConstants.MESSAGE_FILE_TYPE_ARCHIVE
                    ]
                }, {
                    name: 'file url',
                    required: true,
                    dataType: this.dataTypes.DATA_TYPE_URL,
                    data: options.file.url
                }]);
                if (dataErrorMessage) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: dataErrorMessage
                    });
                    this.callUncall(this.uncallConstants.UNCALL_KEY_NEW_MESSAGE, 'default', {
                        code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                        message: dataErrorMessage
                    }, null);
                    return;
                }
            }

            this.newUniqueId();
            this.Message.sendNewMessage({
                chatType: options.chatType,
                chatId: options.chatId,
                msgId: this.uniqueId,
                text: options.text,
                sticker: options.sticker,
                file: options.file
            }).then((result) => {
                result.senderId = this.authenticatedUser.userId;
                this.callUncall(this.uncallConstants.UNCALL_KEY_NEW_MESSAGE, 'default', null, result);
            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_NEW_MESSAGE, 'default', error, null);
            });
        });
    };

    sendTyping(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send typing'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Send typing params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_SEND_TYPING, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_SEND_TYPING_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing send typing params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_SEND_TYPING, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing send typing params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'chatType',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.chatType,
                in: [this.chatConstants.CHAT_TYPE_USER, this.chatConstants.CHAT_TYPE_GROUP]
            }, {
                name: 'chatId',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.chatId,
                notEqual: 0
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_SEND_TYPING, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            this.Message.sendTyping({
                chatType: options.chatType,
                chatId: options.chatId
            }).then((result) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_SEND_TYPING, 'default', null, null);
            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_SEND_TYPING, 'default', error, null);
            });
        });
    };

    getUsersInformation(options, callback) {
        return new Promise((resolve, reject) => {

            const requestKey = this.Tool.generateRequestPurpost();

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Get users information'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Get users information params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_GET_USERS_INFORMATION, requestKey, callback, resolve, reject, this.delegateConstants.DELEGATE_ON_GET_USERS_INFORMATION_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing users information params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_USERS_INFORMATION, requestKey, {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing users information params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'userIds',
                dataType: this.dataTypes.DATA_TYPE_ARRAY,
                notEmpty: true,
                data: options.userIds
            }, {
                name: 'azStackUserIds',
                dataType: this.dataTypes.DATA_TYPE_ARRAY,
                notEmpty: true,
                data: options.azStackUserIds
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_USERS_INFORMATION, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            if (!options.userIds && !options.azStackUserIds) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'userIds or azStackUserIds is required'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_USERS_INFORMATION, requestKey, {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'userIds or azStackUserIds is required'
                }, null);
                return;
            }

            if (options.userIds) {

                let allNumber = true;
                for (let i = 0; i < options.userIds.length; i++) {
                    if (!this.Validator.isNumber(options.userIds[i])) {
                        allNumber = false;
                        break;
                    }
                }

                if (!allNumber) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: 'userIds must contain all numbers'
                    });
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GET_USERS_INFORMATION, requestKey, {
                        code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                        message: 'userIds must contain all numbers'
                    }, null);
                    return;
                }
            }

            if (options.azStackUserIds) {

                let allString = true;
                for (let i = 0; i < options.azStackUserIds.length; i++) {
                    if (!this.Validator.isString(options.azStackUserIds[i])) {
                        allString = false;
                        break;
                    }
                }

                if (!allString) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: 'azStackUserIds must contain all strings'
                    });
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GET_USERS_INFORMATION, requestKey, {
                        code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                        message: 'azStackUserIds must contain all strings'
                    }, null);
                    return;
                }
            }

            this.User.sendGetUsersInfomation({
                purpose: requestKey,
                userIds: options.userIds,
                azStackUserIds: options.azStackUserIds
            }).then().catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_USERS_INFORMATION, requestKey, error, null);
            });
        });
    };
};

export default AZStack;