import {
    Platform,
    Dimensions
} from 'react-native';

import * as platformConstants from './constant/platformConstants';
import * as applicationStateConstants from './constant/applicationStateConstants';
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
import * as groupConstants from './constant/groupConstants';
import * as notificationConstants from './constant/notificationConstants';
import * as stickerConstants from './constant/stickerConstants';

import Tool from './helper/tool';
import Validator from './helper/validator';
import Logger from './helper/logger';
import Delegates from './handler/delegate';
import Authentication from './handler/authentication';
import Call from './handler/call';
import Conversation from './handler/conversation';
import Message from './handler/message';
import User from './handler/user';
import Group from './handler/group';
import Notification from './handler/notification';
import Sticker from './handler/sticker';

class AZStackCore {
    constructor(options) {
        this.sdkVersion = '2.2.4';
        this.masterSocketUri = 'https://www.azhub.xyz:9199';

        this.platformConstants = platformConstants;
        this.applicationStateConstants = applicationStateConstants;
        this.uncallConstants = uncallConstants;
        this.delegateConstants = delegateConstants;
        this.dataTypes = dataTypes;
        this.logLevelConstants = logLevelConstants;
        this.serviceTypes = serviceTypes;
        this.errorCodes = errorCodes;
        this.callConstants = callConstants;
        this.listConstants = listConstants;
        this.chatConstants = chatConstants;
        this.userConstants = userConstants;
        this.groupConstants = groupConstants;
        this.notificationConstants = notificationConstants;
        this.stickerConstants = stickerConstants;

        this.logLevel = this.logLevelConstants.LOG_LEVEL_NONE;
        this.requestTimeout = 60000;
        this.intervalPingTime = 60000;
        this.autoReconnect = false;
        this.autoReconnectLimitTries = 0;
        this.autoReconnectIntervalTime = 5000;

        this.Tool = new Tool();
        this.Validator = new Validator({ dataTypes: this.dataTypes });
        this.Logger = new Logger();
        this.Delegates = new Delegates({ logLevelConstants: this.logLevelConstants, delegateConstants: this.delegateConstants, Logger: this.Logger });

        this.unCalls = {};
        this.stateControls = {
            coreInited: false,
            connecting: false,
            reconnecting: false,
            autoReconnecting: false,
            disconnecting: false
        };
        this.slaveAddress = null;
        this.slaveSocket = null;
        this.slaveSocketConnected = false;
        this.authenticatingData = {};
        this.authenticatedUser = null;

        this.devicePlatformOS = Platform.OS === 'android' ? this.platformConstants.PLATFORM_ANDROID : (Platform.OS === 'ios' ? this.platformConstants.PLATFORM_IOS : this.platformConstants.PLATFORM_WEB);
        this.deviceScreenSizes = `${Math.round(Dimensions.get('window').width)}x${Math.round(Dimensions.get('window').height)}`;

        this.intervalSendPing = null;
        this.autoReconnectTrieds = 0;

        this.uniqueId = Math.round(new Date().getTime() / 1000);

        if (!this.Validator.isObject(options)) {
            return;
        }
        this.setConfigData(options);
        this.setAuthenticatingData(options.authenticatingData);
    };

    setConfigData(options) {
        if (options.requestTimeout && this.Validator.isNumber(options.requestTimeout)) {
            this.requestTimeout = options.requestTimeout;
        }
        if (options.intervalPingTime && this.Validator.isNumber(options.intervalPingTime)) {
            this.intervalPingTime = options.intervalPingTime;
        }
        if (options.autoReconnect !== undefined && this.Validator.isBoolean(options.autoReconnect)) {
            this.autoReconnect = options.autoReconnect;
        }
        if (options.autoReconnectLimitTries && this.Validator.isNumber(options.autoReconnectLimitTries)) {
            this.autoReconnectLimitTries = options.autoReconnectLimitTries;
        }
        if (options.autoReconnectIntervalTime && this.Validator.isNumber(options.autoReconnectIntervalTime)) {
            this.autoReconnectIntervalTime = options.autoReconnectIntervalTime;
        }
        if (options.logLevel && this.Validator.isString(options.logLevel)) {
            this.logLevel = options.logLevel;
        }
    };
    setAuthenticatingData(authenticatingData) {
        if (authenticatingData && this.Validator.isObject(authenticatingData)) {
            this.authenticatingData.appId = this.Validator.isString(authenticatingData.appId) ? authenticatingData.appId : '';
            this.authenticatingData.publicKey = this.Validator.isString(authenticatingData.publicKey) ? authenticatingData.publicKey : '';
            this.authenticatingData.azStackUserId = this.Validator.isString(authenticatingData.azStackUserId) ? authenticatingData.azStackUserId : '';
            this.authenticatingData.userCredentials = this.Validator.isString(authenticatingData.userCredentials) ? authenticatingData.userCredentials : '';
            this.authenticatingData.fullname = this.Validator.isString(authenticatingData.fullname) ? authenticatingData.fullname : '';
            this.authenticatingData.namespace = this.Validator.isString(authenticatingData.namespace) ? authenticatingData.namespace : '';
        }
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
        if (this.unCalls[uncallKey][requestKey]) {
            clearTimeout(this.unCalls[uncallKey][requestKey].timeout);
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
            switch (uncallKey) {
                case this.uncallConstants.UNCALL_KEY_START_CALLOUT:
                    this.Call.clearCallData();
                    break;
                default:
                    break;
            }
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
    clearUncall(uncallKey, requestKey) {
        if (!this.unCalls[uncallKey] || !this.unCalls[uncallKey][requestKey]) {
            return;
        }

        clearTimeout(this.unCalls[uncallKey][requestKey].timeout);
        delete this.unCalls[uncallKey][requestKey];
    };

    init() {
        this.Logger.setLogLevel(this.logLevel);
        this.Authentication = new Authentication({
            logLevelConstants: this.logLevelConstants,
            serviceTypes: this.serviceTypes,
            errorCodes: this.errorCodes,
            Logger: this.Logger,
            sendPacketFunction: this.sendSlavePacket.bind(this)
        });
        this.Call = new Call({
            logLevelConstants: this.logLevelConstants,
            serviceTypes: this.serviceTypes,
            errorCodes: this.errorCodes,
            callConstants: this.callConstants,
            listConstants: this.listConstants,
            Logger: this.Logger,
            sendPacketFunction: this.sendSlavePacket.bind(this),
            onLocalStreamArrived: ((result) => {
                if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_LOCAL_STREAM_ARRIVED] === 'function') {
                    this.Delegates[this.delegateConstants.DELEGATE_ON_LOCAL_STREAM_ARRIVED](null, result);
                }
            }).bind(this),
            onRemoteStreamArrived: ((result) => {
                if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_REMOTE_STREAM_ARRIVED] === 'function') {
                    this.Delegates[this.delegateConstants.DELEGATE_ON_REMOTE_STREAM_ARRIVED](null, result);
                }
            }).bind(this)
        });
        this.Conversation = new Conversation({
            logLevelConstants: this.logLevelConstants,
            serviceTypes: this.serviceTypes,
            errorCodes: this.errorCodes,
            listConstants: this.listConstants,
            chatConstants: this.chatConstants,
            Logger: this.Logger,
            sendPacketFunction: this.sendSlavePacket.bind(this)
        });
        this.Message = new Message({
            logLevelConstants: this.logLevelConstants,
            serviceTypes: this.serviceTypes,
            errorCodes: this.errorCodes,
            listConstants: this.listConstants,
            chatConstants: this.chatConstants,
            Logger: this.Logger,
            sendPacketFunction: this.sendSlavePacket.bind(this)
        });
        this.User = new User({
            logLevelConstants: this.logLevelConstants,
            serviceTypes: this.serviceTypes,
            errorCodes: this.errorCodes,
            listConstants: this.listConstants,
            userConstants: this.userConstants,
            Logger: this.Logger,
            sendPacketFunction: this.sendSlavePacket.bind(this)
        });
        this.Group = new Group({
            logLevelConstants: this.logLevelConstants,
            serviceTypes: this.serviceTypes,
            errorCodes: this.errorCodes,
            listConstants: this.listConstants,
            chatConstants: this.chatConstants,
            groupConstants: this.groupConstants,
            Logger: this.Logger,
            sendPacketFunction: this.sendSlavePacket.bind(this)
        });
        this.Notification = new Notification({
            logLevelConstants: this.logLevelConstants,
            serviceTypes: this.serviceTypes,
            errorCodes: this.errorCodes,
            notificationConstants: this.notificationConstants,
            Logger: this.Logger,
            sendPacketFunction: this.sendSlavePacket.bind(this)
        });
        this.Sticker = new Sticker({
            logLevelConstants: this.logLevelConstants,
            serviceTypes: this.serviceTypes,
            errorCodes: this.errorCodes,
            listConstants: this.listConstants,
            stickerConstants: this.stickerConstants,
            Logger: this.Logger,
            sendPacketFunction: this.sendSlavePacket.bind(this)
        });
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
                devicePlatformOS: this.devicePlatformOS,
                deviceScreenSizes: this.deviceScreenSizes,
                slaveAddress: this.slaveAddress,
                authenticatingData: this.authenticatingData
            }).then(() => { }).catch((error) => {
                if (this.stateControls.connecting) {
                    this.stateControls.connecting = false;
                    this.callUncall(this.uncallConstants.UNCALL_KEY_CONNECT, 'default', error, null);
                } else if (this.stateControls.reconnecting) {
                    this.stateControls.reconnecting = false;
                    this.callUncall(this.uncallConstants.UNCALL_KEY_RECONNECT, 'default', error, null);
                } else if (this.stateControls.autoReconnecting) {
                    this.stateControls.autoReconnecting = false;
                    this.autoReconnectTrieds = 0;
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_AUTO_RECONNECTED] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_AUTO_RECONNECTED](error, null);
                    }
                }
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
            this.slaveSocket = null;
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                message: 'Cannot connect to slave socket'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Slave socket connection error',
                payload: error
            });
            if (this.stateControls.connecting) {
                this.stateControls.connecting = false;
                this.callUncall(this.uncallConstants.UNCALL_KEY_CONNECT, 'default', {
                    code: this.errorCodes.ERR_SOCKET_CONNECT,
                    message: 'Cannot connect to slave socket'
                }, null);
                if (this.autoReconnect) {
                    this.tryAutoReconnect();
                }
            } else if (this.stateControls.reconnecting) {
                this.stateControls.reconnecting = false;
                this.callUncall(this.uncallConstants.UNCALL_KEY_RECONNECT, 'default', {
                    code: this.errorCodes.ERR_SOCKET_CONNECT,
                    message: 'Cannot reconnect to slave socket'
                }, null);
                if (this.autoReconnect) {
                    this.tryAutoReconnect();
                }
            } else if (this.stateControls.autoReconnecting) {
                if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_AUTO_RECONNECTED] === 'function') {
                    this.Delegates[this.delegateConstants.DELEGATE_ON_AUTO_RECONNECTED]({
                        code: this.errorCodes.ERR_SOCKET_CONNECT,
                        message: 'Cannot auto reconnect to slave socket'
                    }, null);
                }
                this.tryAutoReconnect();
            }
        });
        this.slaveSocket.on('disconnect', () => {
            this.slaveSocketConnected = false;
            clearInterval(this.intervalSendPing);
            this.intervalSendPing = null;
            this.slaveSocket = null;
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Disconnected to slave socket'
            });
            if (this.stateControls.disconnecting) {
                this.stateControls.disconnecting = false;
                this.authenticatedUser = null;
                this.callUncall(this.uncallConstants.UNCALL_KEY_DISCONNECT, 'default', null, null);
            } else {
                if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_DISCONNECTED] === 'function') {
                    this.Delegates[this.delegateConstants.DELEGATE_ON_DISCONNECTED](null, null);
                }
                if (this.autoReconnect) {
                    this.tryAutoReconnect();
                }
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

        if (packet.body) {
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
                    if (this.stateControls.connecting) {
                        this.stateControls.connecting = false;
                        this.callUncall(this.uncallConstants.UNCALL_KEY_CONNECT, 'default', null, this.authenticatedUser);
                    } else if (this.stateControls.reconnecting) {
                        this.stateControls.reconnecting = false;
                        this.callUncall(this.uncallConstants.UNCALL_KEY_RECONNECT, 'default', null, this.authenticatedUser);
                    } else if (this.stateControls.autoReconnecting) {
                        this.stateControls.autoReconnecting = false;
                        this.autoReconnectTrieds = 0;
                        if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_AUTO_RECONNECTED] === 'function') {
                            this.Delegates[this.delegateConstants.DELEGATE_ON_AUTO_RECONNECTED](null, this.authenticatedUser);
                        }
                    }
                }).catch((error) => {
                    if (this.stateControls.connecting) {
                        this.stateControls.connecting = false;
                        this.callUncall(this.uncallConstants.UNCALL_KEY_CONNECT, 'default', error, null);
                    } else if (this.stateControls.reconnecting) {
                        this.stateControls.reconnecting = false;
                        this.callUncall(this.uncallConstants.UNCALL_KEY_RECONNECT, 'default', error, null);
                    } else if (this.stateControls.autoReconnecting) {
                        this.stateControls.autoReconnecting = false;
                        this.autoReconnectTrieds = 0;
                        if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_AUTO_RECONNECTED] === 'function') {
                            this.Delegates[this.delegateConstants.DELEGATE_ON_AUTO_RECONNECTED](error, null);
                        }
                    }
                });
                break;

            case this.serviceTypes.FREE_CALL_START:
                this.Call.receiveFreeCallStart(body).then((result) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_FREE_CALL_START] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_FREE_CALL_START](null, result);
                    }
                }).catch();
                break;
            case this.serviceTypes.FREE_CALL_DATA:
                this.Call.receiveFreeCallData(body).then(() => { }).catch();
                break;
            case this.serviceTypes.FREE_CALL_STATUS_CHANGED:
                this.Call.receiveFreeCallStatusChanged(body).then((result) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_FREE_CALL_STAUTUS_CHANGED] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_FREE_CALL_STAUTUS_CHANGED](null, result);
                    }
                }).catch();
                break;
            case this.serviceTypes.FREE_CALL_STATUS_CHANGED_BY_ME:
                this.Call.receiveFreeCallStatusChangedByMe(body).then((result) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_FREE_CALL_STAUTUS_CHANGED_BY_ME] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_FREE_CALL_STAUTUS_CHANGED_BY_ME](null, result);
                    }
                }).catch();
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
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_CALLOUT_STAUTUS_CHANGED] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_CALLOUT_STAUTUS_CHANGED](null, result);
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
            case this.serviceTypes.CONVERSATION_DELETE:
                this.Conversation.receiveDeletedConversation(body).then((result) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_DELETE_CONVERSATION, 'default', null, result);
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_DELETE_CONVERSATION, 'default', error, null);
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
            case this.serviceTypes.MESSAGE_GET_LIST_MODIFIED_FILES:
                this.Message.receiveModifiedFiles({
                    userId: this.authenticatedUser.userId,
                    body: body
                }).then((result) => {
                    if (result.done === 1) {
                        this.callUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_FILES, 'default', null, result);
                    } else {
                        this.addUncallTemporary(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_FILES, 'default', 'list', result, this.uncallConstants.UNCALL_TEMPORARY_TYPE_ARRAY);
                    }
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_FILES, 'default', error, null);
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
            case this.serviceTypes.MESSAGE_WITH_USER_TYPE_LOCATION:
                this.Message.receiveHasNewMessage({
                    chatType: this.chatConstants.CHAT_TYPE_USER,
                    messageType: this.chatConstants.MESSAGE_TYPE_LOCATION,
                    body: body
                }).then((result) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_HAS_NEW_MESSAGE] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_HAS_NEW_MESSAGE](null, result);
                    }
                }).catch();
                break;
            case this.serviceTypes.MESSAGE_HAS_NEW_WITH_GROUP:
                this.Message.receiveHasNewMessage({
                    chatType: this.chatConstants.CHAT_TYPE_GROUP,
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
            case this.serviceTypes.MESSAGE_FROM_ME_WITH_GROUP:
                this.Message.receiveMessageFromMe({
                    chatType: this.chatConstants.CHAT_TYPE_GROUP,
                    body: body
                }).then((result) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_FROM_ME] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_FROM_ME](null, result);
                    }
                }).catch();
                break;

            case this.serviceTypes.MESSAGE_NEW_WITH_USER_TYPE_TEXT:
                this.Message.receiveMessageStatusChanged({
                    chatType: this.chatConstants.CHAT_TYPE_USER,
                    messageStatus: this.chatConstants.MESSAGE_STATUS_SENT,
                    body: body
                }).then((result) => {
                    result.senderId = this.authenticatedUser.userId;
                    result.receiverId = this.authenticatedUser.userId;
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_STATUS_CHANGED] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_STATUS_CHANGED](null, result);
                    }
                }).catch((error) => { });
                break;
            case this.serviceTypes.MESSAGE_STATUS_CHANGE_DELIVERED_WITH_USER:
                this.Message.receiveMessageStatusChanged({
                    chatType: this.chatConstants.CHAT_TYPE_USER,
                    messageStatus: this.chatConstants.MESSAGE_STATUS_DELIVERED,
                    body: body
                }).then((result) => {
                    result.receiverId = this.authenticatedUser.userId;
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_STATUS_CHANGED] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_STATUS_CHANGED](null, result);
                    }
                }).catch();
                break;
            case this.serviceTypes.MESSAGE_STATUS_CHANGE_SEEN:
                this.Message.receiveMessageStatusChanged({
                    chatType: body.type,
                    messageStatus: this.chatConstants.MESSAGE_STATUS_SEEN,
                    body: body
                }).then((result) => {
                    let isReturn = result.isReturn;
                    delete result.isReturn;
                    if (!isReturn) {
                        if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_STATUS_CHANGED] === 'function') {
                            this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_STATUS_CHANGED](null, result);
                        }
                    } else {
                        this.callUncall(this.uncallConstants.UNCALL_KEY_CHANGE_MESSAGE_STATUS, this.chatConstants.MESSAGE_STATUS_SEEN + '_' + result.msgId, null, null);
                    }
                }).catch((error) => {
                    let msgId = error.msgId;
                    delete error.msgId;
                    this.callUncall(this.uncallConstants.UNCALL_KEY_CHANGE_MESSAGE_STATUS, this.chatConstants.MESSAGE_STATUS_SEEN + '_' + msgId, error, null);
                });
                break;
            case this.serviceTypes.MESSAGE_STATUS_CHANGE_CANCELLED_WITH_USER:
                this.Message.receiveMessageStatusChanged({
                    chatType: this.chatConstants.CHAT_TYPE_USER,
                    messageStatus: this.chatConstants.MESSAGE_STATUS_CANCELLED,
                    body: body
                }).then((result) => {
                    let isReturn = result.isReturn;
                    delete result.isReturn;
                    if (!isReturn) {
                        if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_STATUS_CHANGED] === 'function') {
                            this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_STATUS_CHANGED](null, result);
                        }
                    } else {
                        this.callUncall(this.uncallConstants.UNCALL_KEY_CHANGE_MESSAGE_STATUS, this.chatConstants.MESSAGE_STATUS_CANCELLED + '_' + result.msgId, null, null);
                    }
                }).catch((error) => {
                    let msgId = error.msgId;
                    delete error.msgId;
                    this.callUncall(this.uncallConstants.UNCALL_KEY_CHANGE_MESSAGE_STATUS, this.chatConstants.MESSAGE_STATUS_CANCELLED + '_' + msgId, error, null);
                });
                break;
            case this.serviceTypes.MESSAGE_NEW_WITH_GROUP:
                this.Message.receiveMessageStatusChanged({
                    chatType: this.chatConstants.CHAT_TYPE_GROUP,
                    messageStatus: this.chatConstants.MESSAGE_STATUS_SENT,
                    body: body
                }).then((result) => {
                    result.senderId = this.authenticatedUser.userId;
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_STATUS_CHANGED] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_STATUS_CHANGED](null, result);
                    }
                }).catch((error) => { });
                break;
            case this.serviceTypes.MESSAGE_STATUS_CHANGE_DELIVERED_WITH_GROUP:
                this.Message.receiveMessageStatusChanged({
                    chatType: this.chatConstants.CHAT_TYPE_GROUP,
                    messageStatus: this.chatConstants.MESSAGE_STATUS_DELIVERED,
                    body: body
                }).then((result) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_STATUS_CHANGED] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_STATUS_CHANGED](null, result);
                    }
                }).catch();
                break;
            case this.serviceTypes.MESSAGE_STATUS_CHANGE_CANCELLED_WITH_GROUP:
                this.Message.receiveMessageStatusChanged({
                    chatType: this.chatConstants.CHAT_TYPE_GROUP,
                    messageStatus: this.chatConstants.MESSAGE_STATUS_CANCELLED,
                    body: body
                }).then((result) => {
                    let isReturn = result.isReturn;
                    delete result.isReturn;
                    if (!isReturn) {
                        if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_STATUS_CHANGED] === 'function') {
                            this.Delegates[this.delegateConstants.DELEGATE_ON_MESSAGE_STATUS_CHANGED](null, result);
                        }
                    } else {
                        this.callUncall(this.uncallConstants.UNCALL_KEY_CHANGE_MESSAGE_STATUS, this.chatConstants.MESSAGE_STATUS_CANCELLED + '_' + result.msgId, null, null);
                    }
                }).catch((error) => {
                    let msgId = error.msgId;
                    delete error.msgId;
                    this.callUncall(this.uncallConstants.UNCALL_KEY_CHANGE_MESSAGE_STATUS, this.chatConstants.MESSAGE_STATUS_CANCELLED + '_' + msgId, error, null);
                });
                break;

            case this.serviceTypes.MESSAGE_DELETE:
                this.Message.receiveMessageDeleted(body).then((result) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_DELETE_MESSAGE, 'default', null, null);
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_DELETE_MESSAGE, 'default', error, null);
                });
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
            case this.serviceTypes.MESSAGE_TYPING_WITH_GROUP:
                this.Message.receiveTyping({
                    chatType: this.chatConstants.CHAT_TYPE_GROUP,
                    body: body
                }).then((result) => {
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
                    let requestKey = error.purpose;
                    delete error.purpose;
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GET_USERS_INFORMATION, requestKey, error, null);
                });
                break;

            case this.serviceTypes.GROUP_CREATE:
                this.Group.receiveGroupCreateResult(body).then((result) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_CREATE, 'default', null, result);
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_CREATE, 'default', error, null);
                });
                break;
            case this.serviceTypes.ON_GROUP_CREATED:
                this.Group.receiveGroupCreated(body).then((result) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_GROUP_CREATED] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_GROUP_CREATED](null, result);
                    }
                }).catch((error) => { });
                break;
            case this.serviceTypes.GROUP_INVITE:
                this.Group.receiveGroupInviteResult(body).then((result) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_INVITE, 'default', null, result);
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_INVITE, 'default', error, null);
                });
                break;
            case this.serviceTypes.ON_GROUP_INVITED:
                this.Group.receiveGroupInvited(body).then((result) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_GROUP_INVITED] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_GROUP_INVITED](null, result);
                    }
                }).catch((error) => { });
                break;
            case this.serviceTypes.GROUP_LEAVE:
                this.Group.receiveGroupLeaveResult(body).then((result) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_LEAVE, 'default', null, result);
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_LEAVE, 'default', error, null);
                });
                break;
            case this.serviceTypes.ON_GROUP_LEFT:
                this.Group.receiveGroupLeft(body).then((result) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_GROUP_LEFT] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_GROUP_LEFT](null, result);
                    }
                }).catch((error) => { });
                break;
            case this.serviceTypes.GROUP_RENAME:
                this.Group.receiveGroupRenameResult(body).then((result) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_RENAME, 'default', null, result);
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_RENAME, 'default', error, null);
                });
                break;
            case this.serviceTypes.ON_GROUP_RENAMED:
                this.Group.receiveGroupRenamed(body).then((result) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_GROUP_RENAMED] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_GROUP_RENAMED](null, result);
                    }
                }).catch((error) => { });
                break;
            case this.serviceTypes.GROUP_CHANGE_ADMIN:
                this.Group.receiveGroupAdminChangeResult(body).then((result) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_CHANGE_ADMIN, 'default', null, result);
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_CHANGE_ADMIN, 'default', error, null);
                });
                break;
            case this.serviceTypes.ON_GROUP_ADMIN_CHANGED:
                this.Group.receiveGroupAdminChanged(body).then((result) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_GROUP_ADMIN_CHANGED] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_GROUP_ADMIN_CHANGED](null, result);
                    }
                }).catch((error) => { });
                break;
            case this.serviceTypes.GROUP_JOIN_PUBLIC:
                this.Group.receiveGroupPublicJoined(body).then((result) => {
                    let isReturn = result.isReturn;
                    if (!isReturn) {
                        if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_GROUP_PUBLIC_JOINED] === 'function') {
                            this.Delegates[this.delegateConstants.DELEGATE_ON_GROUP_PUBLIC_JOINED](null, result);
                        }
                    } else {
                        result.return.joinId = this.authenticatedUser.userId;
                        result.event.senderId = this.authenticatedUser.userId;
                        result.event.joined.joinId = this.authenticatedUser.userId;
                        if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_GROUP_PUBLIC_JOINED] === 'function') {
                            this.Delegates[this.delegateConstants.DELEGATE_ON_GROUP_PUBLIC_JOINED](null, result.event);
                        }
                        this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_JOIN_PUBLIC, 'default', null, result.return);
                    }
                }).catch((error) => {
                    let msgId = error.msgId;
                    delete error.msgId;
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_JOIN_PUBLIC, 'default', error, null);
                });
                break;

            case this.serviceTypes.GROUP_GET_DETAILS:
                this.Group.receiveGroupDetailsGetResult(body).then((result) => {
                    let requestKey = result.requestId;
                    delete result.requestId;
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_GET_DETAILS, requestKey, null, result);
                }).catch((error) => {
                    let requestKey = error.requestId;
                    delete error.requestId;
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_GET_DETAILS, requestKey, error, null);
                });
                break;
            case this.serviceTypes.GROUP_GET_LIST_PRIVATE:
                this.Group.receiveListGroups({
                    groupType: this.groupConstants.GROUP_TYPE_PRIVATE,
                    body: body
                }).then((result) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_GET_LIST, 'default', null, result);
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_GET_LIST, 'default', error, null);
                });
                break;
            case this.serviceTypes.GROUP_GET_LIST_PUBLIC:
                this.Group.receiveListGroups({
                    groupType: this.groupConstants.GROUP_TYPE_PUBLIC,
                    body: body
                }).then((result) => {
                    if (result.done === 1) {
                        this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_GET_LIST, 'default', null, result);
                    } else {
                        this.addUncallTemporary(this.uncallConstants.UNCALL_KEY_GROUP_GET_LIST, 'default', 'list', result, this.uncallConstants.UNCALL_TEMPORARY_TYPE_ARRAY);
                    }
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_GET_LIST, 'default', error, null);
                });
                break;

            case this.serviceTypes.APPLICATION_CHANGE_STATE:
                this.Notification.receiveChangeApplicationState(body).then((result) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_APPLICATION_CHANGE_STATE, 'default', null, result);
                }).catch((error) => { });
                break;

            case this.serviceTypes.PUSH_NOTIFICATION_REGISTER_DEVICE_RECEIVE:
                this.Notification.receiveNotificationRegisterDevice(body).then((result) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_NOTIFICATION_REGISTER_DEVICE, 'default', null, result);
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_NOTIFICATION_REGISTER_DEVICE, 'default', error, null);
                });
                break;
            case this.serviceTypes.PUSH_NOTIFICATION_UNREGISTER_DEVICE_RECEIVE:
                this.Notification.receiveNotificationUnregisterDevice(body).then((result) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_NOTIFICATION_UNREGISTER_DEVICE, 'default', null, result);
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_NOTIFICATION_UNREGISTER_DEVICE, 'default', error, null);
                });
                break;

            case this.serviceTypes.STICKER_GET_LIST:
                this.Sticker.receiveStickersList(body).then((result) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GET_STICKERS_LIST, 'default', null, result);
                }).catch((error) => {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_GET_STICKERS_LIST, 'default', error, null);
                });
                break;

            default:
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Got unknown packet from slave socket'
                });
                break;
        }
    };

    connect(options, callback) {
        if (typeof options === 'object' && options.authenticatingData) {
            this.setAuthenticatingData(options.authenticatingData);
        }
        return new Promise((resolve, reject) => {

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Start init core'
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_CONNECT, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_CONNECT_RETURN);

            if (this.stateControls.coreInited) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot init core, already inited'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_RECONNECT, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot init core, already inited'
                }, null);
                return;
            }

            if (!this.authenticatingData.appId || !this.authenticatingData.publicKey || !this.authenticatingData.azStackUserId || !this.authenticatingData.fullname) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing authenticating data'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Authenticating data',
                    payload: this.authenticatingData
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_CONNECT, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'appId, publicKey, azStackUserId, fullname are required for authenticating data, connect fail'
                }, null);
                return;
            }

            this.stateControls.coreInited = true;
            this.stateControls.connecting = true;
            this.init();

            this.Authentication.getSlaveSocket({
                masterSocketUri: this.masterSocketUri,
                azStackUserId: this.authenticatingData.azStackUserId
            }).then((result) => {
                this.slaveAddress = result.slaveAddress;
                this.setupSocket(result.slaveSocket);
            }).catch((error) => {
                this.stateControls.connecting = false;
                this.callUncall(this.uncallConstants.UNCALL_KEY_CONNECT, 'default', error, null);
                if (this.autoReconnect) {
                    this.tryAutoReconnect();
                }
            });
        });
    };
    reconnect(options, callback) {
        if (typeof options === 'object' && options.authenticatingData) {
            this.setAuthenticatingData(options.authenticatingData);
        }
        return new Promise((resolve, reject) => {

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Start reconnect'
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_RECONNECT, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_RECONNECT_RETURN);

            if (this.slaveSocketConnected) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot reconnect, slave socket already connected'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_RECONNECT, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot reconnect, slave socket already connected'
                }, null);
                return;
            }

            if (!this.stateControls.coreInited) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot reconnect, core not inited'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_RECONNECT, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot reconnect, core not inited'
                }, null);
                return;
            }

            if (this.stateControls.connecting) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot reconnect, already try connecting'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_RECONNECT, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot reconnect, already try connecting'
                }, null);
                return;
            }

            if (this.stateControls.reconnecting || this.stateControls.autoReconnecting) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot reconnect, already try reconnecting'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_RECONNECT, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot reconnect, already try reconnecting'
                }, null);
                return;
            }

            this.stateControls.reconnecting = true;
            if (this.slaveSocket) {
                this.slaveSocket.open();
            } else {

                if (!this.authenticatingData.appId || !this.authenticatingData.publicKey || !this.authenticatingData.azStackUserId || !this.authenticatingData.fullname) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: 'Missing authenticating data'
                    });
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                        message: 'Authenticating data',
                        payload: this.authenticatingData
                    });
                    this.callUncall(this.uncallConstants.UNCALL_KEY_RECONNECT, 'default', {
                        code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                        message: 'appId, publicKey, azStackUserId, fullname are required for authenticating data, connect fail'
                    }, null);
                    this.stateControls.reconnecting = false;
                    return;
                }

                this.Authentication.getSlaveSocket({
                    masterSocketUri: this.masterSocketUri,
                    azStackUserId: this.authenticatingData.azStackUserId
                }).then((result) => {
                    this.slaveAddress = result.slaveAddress;
                    this.setupSocket(result.slaveSocket);
                }).catch((error) => {
                    this.stateControls.reconnecting = false;
                    this.callUncall(this.uncallConstants.UNCALL_KEY_RECONNECT, 'default', error, null);
                    if (this.autoReconnect) {
                        this.tryAutoReconnect();
                    }
                });
            }
        });
    };
    tryAutoReconnect() {

        if (this.autoReconnectLimitTries && this.autoReconnectTrieds >= this.autoReconnectLimitTries) {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                message: 'Stop auto reconnect, trieds exceed limit'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Auto reconnect data',
                payload: {
                    limit: this.autoReconnectLimitTries,
                    try: this.autoReconnectTrieds,
                    intervalTime: this.autoReconnectIntervalTime
                }
            });

            this.autoReconnectTrieds = 0;
            this.stateControls.autoReconnecting = false;
            if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_AUTO_RECONNECT_STOP] === 'function') {
                this.Delegates[this.delegateConstants.DELEGATE_ON_AUTO_RECONNECT_STOP]({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Stop auto reconnect, trieds exceed limit'
                }, null);
            }

            return;
        }

        if (this.autoReconnectTrieds === 0) {
            if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_AUTO_RECONNECT_START] === 'function') {
                this.Delegates[this.delegateConstants.DELEGATE_ON_AUTO_RECONNECT_START](null, null);
            }
        }

        this.stateControls.autoReconnecting = true;

        setTimeout(() => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Start auto reconnect'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Auto reconnect data',
                payload: {
                    limit: this.autoReconnectLimitTries,
                    try: this.autoReconnectTrieds + 1,
                    intervalTime: this.autoReconnectIntervalTime
                }
            });

            this.autoReconnectTrieds += 1;
            if (this.slaveSocket) {
                this.slaveSocket.open();
            } else {
                this.Authentication.getSlaveSocket({
                    masterSocketUri: this.masterSocketUri,
                    azStackUserId: this.authenticatingData.azStackUserId
                }).then((result) => {
                    this.slaveAddress = result.slaveAddress;
                    this.setupSocket(result.slaveSocket);
                }).catch((error) => {
                    if (typeof this.Delegates[this.delegateConstants.DELEGATE_ON_AUTO_RECONNECTED] === 'function') {
                        this.Delegates[this.delegateConstants.DELEGATE_ON_AUTO_RECONNECTED](error, null);
                    }
                    this.tryAutoReconnect();
                });
            }
        }, this.autoReconnectIntervalTime);
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

            if (this.stateControls.disconnecting) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot disconnect to slave server, already try disconnecting'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_DISCONNECT, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot disconnect to slave server, already try disconnecting'
                }, null);
                return;
            }

            if (!this.slaveSocket) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot disconnect to slave server, slave socket is null'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_DISCONNECT, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot disconnect to slave server, slave socket is null'
                }, null);
                return;
            }

            this.stateControls.disconnecting = true;
            this.slaveSocket.disconnect();
        });
    };

    toggleAudioState(options, callback) {
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
                    dataType: this.dataTypes.DATA_TYPE_NUMBER,
                    data: options.state,
                    in: [this.callConstants.CALL_WEBRTC_AUDIO_STATE_OFF, this.callConstants.CALL_WEBRTC_AUDIO_STATE_ON]
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
                this.callUncall(this.uncallConstants.UNCALL_KEY_TOGGLE_AUDIO_STATE, 'default', null, result);
            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_TOGGLE_AUDIO_STATE, 'default', error, null);
            });
        });
    };
    toggleVideoState(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Toggle video state'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Toggle video state data',
                payload: options
            });
            this.addUncall(this.uncallConstants.UNCALL_KEY_TOGGLE_VIDEO_STATE, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_TOGGLE_VIDEO_STATE_RETURN);

            if (options && typeof options === 'object') {
                let dataErrorMessage = this.Validator.check([{
                    name: 'state',
                    dataType: this.dataTypes.DATA_TYPE_NUMBER,
                    data: options.state,
                    in: [this.callConstants.CALL_WEBRTC_VIDEO_STATE_OFF, this.callConstants.CALL_WEBRTC_VIDEO_STATE_ON]
                }]);
                if (dataErrorMessage) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: dataErrorMessage
                    });
                    this.callUncall(this.uncallConstants.UNCALL_KEY_TOGGLE_VIDEO_STATE, 'default', {
                        code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                        message: dataErrorMessage
                    }, null);
                    return;
                }
            }

            this.Call.toggleVideoState({
                state: options.state
            }).then((result) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_TOGGLE_VIDEO_STATE, 'default', null, result);
            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_TOGGLE_VIDEO_STATE, 'default', error, null);
            });
        });
    };
    switchCameraType(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Switch camera type'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Switch camera type data',
                payload: options
            });
            this.addUncall(this.uncallConstants.UNCALL_KEY_SWITCH_CAMERA_TYPE, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_SWITCH_CAMERA_TYPE_RETURN);

            this.Call.switchCameraType({}).then((result) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_SWITCH_CAMERA_TYPE, 'default', null, result);
            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_SWITCH_CAMERA_TYPE, 'default', error, null);
            });
        });
    };

    startFreeCall(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Start free call'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Free call data',
                payload: options
            });
            this.addUncall(this.uncallConstants.UNCALL_KEY_START_FREE_CALL, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_START_FREE_CALL_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing free call data'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_START_FREE_CALL, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing free call data'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'mediaType',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.mediaType,
                in: [this.callConstants.CALL_MEDIA_TYPE_AUDIO, this.callConstants.CALL_MEDIA_TYPE_VIDEO]
            }, {
                name: 'toUserId',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.toUserId,
                notEqual: 0
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_START_FREE_CALL, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            this.newUniqueId();
            this.Call.sendStartFreeCall({
                mediaType: options.mediaType,
                callId: this.uniqueId,
                fromUserId: this.authenticatedUser.userId,
                toUserId: options.toUserId
            }).then(() => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_START_FREE_CALL, 'default', null, null);
            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_START_FREE_CALL, 'default', error, null);
            });
        });
    };
    stopFreeCall(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Stop free call'
            });
            this.addUncall(this.uncallConstants.UNCALL_KEY_STOP_FREE_CALL, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_STOP_FREE_CALL_RETURN);

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Clear start free call request if exist'
            });
            this.clearUncall(this.uncallConstants.UNCALL_KEY_START_FREE_CALL, 'default');

            this.Call.sendStopFreeCall({}).then((result) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_STOP_FREE_CALL, 'default', null, null);
            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_STOP_FREE_CALL, 'default', error, null);
            });
        });
    };
    answerFreeCall(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Answer free call'
            });
            this.addUncall(this.uncallConstants.UNCALL_KEY_ANSWER_FREE_CALL, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_ANSWER_FREE_CALL_RETURN);

            this.Call.sendAnswerFreeCall({}).then((result) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_ANSWER_FREE_CALL, 'default', null, null);
            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_ANSWER_FREE_CALL, 'default', error, null);
            });
        });
    };
    rejectFreeCall(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Reject free call'
            });
            this.addUncall(this.uncallConstants.UNCALL_KEY_REJECT_FREE_CALL, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_REJECT_FREE_CALL_RETURN);

            this.Call.sendRejectFreeCall({}).then((result) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_REJECT_FREE_CALL, 'default', null, null);
            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_REJECT_FREE_CALL, 'default', error, null);
            });
        });
    };
    notAnswerFreeCall(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Not answer free call'
            });
            this.addUncall(this.uncallConstants.UNCALL_KEY_NOT_ANSWER_FREE_CALL, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_NOT_ANSWER_FREE_CALL_RETURN);

            this.Call.sendNotAnswerFreeCall({}).then((result) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_NOT_ANSWER_FREE_CALL, 'default', null, null);
            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_NOT_ANSWER_FREE_CALL, 'default', error, null);
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
            }, {
                name: 'fromPhoneNumber',
                required: false,
                dataType: this.dataTypes.DATA_TYPE_PHONE_NUMBER,
                data: options.fromPhoneNumber
            }, {
                name: 'tags',
                required: false,
                dataType: this.dataTypes.DATA_TYPE_STRING,
                data: options.tags
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
                toPhoneNumber: options.toPhoneNumber,
                fromPhoneNumber: options.fromPhoneNumber,
                tags: options.tags
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

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Clear start calout request if exist'
            });
            this.clearUncall(this.uncallConstants.UNCALL_KEY_START_CALLOUT, 'default');

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
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Answer callin data',
                payload: options
            });
            this.addUncall(this.uncallConstants.UNCALL_KEY_ANSWER_CALLIN, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_ANSWER_CALLIN_RETURN);

            let answerCallinOptions = {};

            if (options && typeof options === 'object') {
                let dataErrorMessage = this.Validator.check([{
                    name: 'tags',
                    required: false,
                    dataType: this.dataTypes.DATA_TYPE_STRING,
                    data: options.tags
                }]);
                if (dataErrorMessage) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: dataErrorMessage
                    });
                    this.callUncall(this.uncallConstants.UNCALL_KEY_ANSWER_CALLIN, 'default', {
                        code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                        message: dataErrorMessage
                    }, null);
                    return;
                }

                if (options.tags) {
                    answerCallinOptions.tags = options.tags;
                }
            }

            this.Call.sendAnswerCallin(answerCallinOptions).then((result) => {
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
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Reject callin data',
                payload: options
            });
            this.addUncall(this.uncallConstants.UNCALL_KEY_REJECT_CALLIN, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_REJECT_CALLIN_RETURN);

            let rejectCallinOptions = {};

            if (options && typeof options === 'object') {
                let dataErrorMessage = this.Validator.check([{
                    name: 'tags',
                    required: false,
                    dataType: this.dataTypes.DATA_TYPE_STRING,
                    data: options.tags
                }]);
                if (dataErrorMessage) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: dataErrorMessage
                    });
                    this.callUncall(this.uncallConstants.UNCALL_KEY_REJECT_CALLIN, 'default', {
                        code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                        message: dataErrorMessage
                    }, null);
                    return;
                }

                if (options.tags) {
                    rejectCallinOptions.tags = options.tags;
                }
            }

            this.Call.sendRejectCallin(rejectCallinOptions).then((result) => {
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
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Not answered callin data',
                payload: options
            });
            this.addUncall(this.uncallConstants.UNCALL_KEY_NOT_ANSWERED_CALLIN, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_NOT_ANSWERED_CALLIN_RETURN);

            let notAnwserCallinOptions = {};

            if (options && typeof options === 'object') {
                let dataErrorMessage = this.Validator.check([{
                    name: 'tags',
                    required: false,
                    dataType: this.dataTypes.DATA_TYPE_STRING,
                    data: options.tags
                }]);
                if (dataErrorMessage) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: dataErrorMessage
                    });
                    this.callUncall(this.uncallConstants.UNCALL_KEY_NOT_ANSWERED_CALLIN, 'default', {
                        code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                        message: dataErrorMessage
                    }, null);
                    return;
                }

                if (options.tags) {
                    notAnwserCallinOptions.tags = options.tags;
                }
            }

            this.Call.sendNotAnsweredCallin(notAnwserCallinOptions).then((result) => {
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

    deleteConversation(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Delete conversation'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Delete conversation params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_DELETE_CONVERSATION, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_DELETE_CONVERSATION_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing delete conversation params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_DELETE_CONVERSATION, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing delete conversation params'
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
                this.callUncall(this.uncallConstants.UNCALL_KEY_DELETE_CONVERSATION, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            this.Conversation.sendDeleteConversation({
                chatType: options.chatType,
                chatId: options.chatId,
                lastCreated: new Date().getTime()
            }).then().catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_DELETE_CONVERSATION, 'default', error, null);
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
    getModifiedFiles(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Get modified files'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Get modified files params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_FILES, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_GET_MODIFIED_FILES_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing modified files params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_FILES, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing modified files params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'lastCreated',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.lastCreated,
                notEqual: 0
            }, {
                name: 'chatType',
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.chatType,
                in: [this.chatConstants.CHAT_TYPE_USER, this.chatConstants.CHAT_TYPE_GROUP]
            }, {
                name: 'chatId',
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.chatId,
                notEqual: 0
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_FILES, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }
            if (options.chatType && !options.chatId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'chatId is required'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_FILES, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'chatId is required'
                }, null);
                return;
            }
            if (options.chatId && !options.chatType) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'chatType is required'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_FILES, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'chatType is required'
                }, null);
                return;
            }

            this.Message.sendGetModifiedFiles({
                lastCreated: options.lastCreated,
                chatType: options.chatType,
                chatId: options.chatId
            }).then().catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_MODIFIED_FILES, 'default', error, null);
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

            this.newUniqueId();
            let newMsgId = options && typeof options === 'object' && options.msgId && this.Validator.isNumber(options.msgId) ? options.msgId : this.uniqueId;

            this.addUncall(this.uncallConstants.UNCALL_KEY_NEW_MESSAGE, newMsgId, callback, resolve, reject, this.delegateConstants.DELEGATE_ON_NEW_MESSAGE_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing new message params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_NEW_MESSAGE, newMsgId, {
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
            }, {
                name: 'location',
                dataType: this.dataTypes.DATA_TYPE_OBJECT,
                data: options.location
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_NEW_MESSAGE, newMsgId, {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            if (!options.text && !options.sticker && !options.file && !options.location) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'text or sticker or file or location is required'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_NEW_MESSAGE, newMsgId, {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'text or sticker or file or location is required'
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
                    this.callUncall(this.uncallConstants.UNCALL_KEY_NEW_MESSAGE, newMsgId, {
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
                }, {
                    name: 'width',
                    required: false,
                    dataType: this.dataTypes.DATA_TYPE_NUMBER,
                    data: options.chatId,
                    notEqual: 0
                }, {
                    name: 'height',
                    required: false,
                    dataType: this.dataTypes.DATA_TYPE_NUMBER,
                    data: options.chatId,
                    notEqual: 0
                }, {
                    name: 'duration',
                    required: false,
                    dataType: this.dataTypes.DATA_TYPE_NUMBER,
                    data: options.chatId,
                    notEqual: 0
                }]);
                if (dataErrorMessage) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: dataErrorMessage
                    });
                    this.callUncall(this.uncallConstants.UNCALL_KEY_NEW_MESSAGE, newMsgId, {
                        code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                        message: dataErrorMessage
                    }, null);
                    return;
                }
            }

            if (options.location) {
                dataErrorMessage = this.Validator.check([{
                    name: 'location address',
                    required: true,
                    dataType: this.dataTypes.DATA_TYPE_STRING,
                    data: options.location.address
                }, {
                    name: 'location longitude',
                    required: true,
                    dataType: this.dataTypes.DATA_TYPE_NUMBER,
                    data: options.location.longitude
                }, {
                    name: 'location latitude',
                    required: true,
                    dataType: this.dataTypes.DATA_TYPE_NUMBER,
                    data: options.location.latitude
                }]);
                if (dataErrorMessage) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: dataErrorMessage
                    });
                    this.callUncall(this.uncallConstants.UNCALL_KEY_NEW_MESSAGE, newMsgId, {
                        code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                        message: dataErrorMessage
                    }, null);
                    return;
                }
            }

            this.Message.sendNewMessage({
                chatType: options.chatType,
                chatId: options.chatId,
                msgId: newMsgId,
                text: options.text,
                sticker: options.sticker,
                file: options.file,
                location: options.location
            }).then((result) => {
                result.senderId = this.authenticatedUser.userId;
                this.callUncall(this.uncallConstants.UNCALL_KEY_NEW_MESSAGE, newMsgId, null, result);
            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_NEW_MESSAGE, newMsgId, error, null);
            });
        });
    };

    changeMessageStatus(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send change message status'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Send change message status params',
                payload: options
            });

            let requestKey = this.Validator.isObject(options) ? (options.messageStatus + '_' + options.msgId) : this.Tool.generateRequestPurpose();

            this.addUncall(this.uncallConstants.UNCALL_KEY_CHANGE_MESSAGE_STATUS, requestKey, callback, resolve, reject, this.delegateConstants.DELEGATE_ON_CHANGE_MESSAGE_STATUS_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing send change message status params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_CHANGE_MESSAGE_STATUS, requestKey, {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing send change message status params'
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
                name: 'messageSenderId',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.messageSenderId,
                notEqual: 0
            }, {
                name: 'messageStatus',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.messageStatus,
                in: [this.chatConstants.MESSAGE_STATUS_DELIVERED, this.chatConstants.MESSAGE_STATUS_SEEN, this.chatConstants.MESSAGE_STATUS_CANCELLED]
            }, {
                name: 'msgId',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.msgId,
                notEqual: 0
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_CHANGE_MESSAGE_STATUS, requestKey, {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            this.Message.sendChangeStatus({
                chatType: options.chatType,
                chatId: options.chatId,
                messageSenderId: options.messageSenderId,
                messageStatus: options.messageStatus,
                msgId: options.msgId
            }).then((result) => {
                if (options.messageStatus === this.chatConstants.MESSAGE_STATUS_DELIVERED) {
                    this.callUncall(this.uncallConstants.UNCALL_KEY_CHANGE_MESSAGE_STATUS, requestKey, null, null);
                }
            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_CHANGE_MESSAGE_STATUS, requestKey, error, null);
            });
        });
    };

    deleteMessage(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send delete message'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Send delete message params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_DELETE_MESSAGE, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_MESSAGE_DELETED);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing send delete message params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_DELETE_MESSAGE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing send delete message params'
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
                name: 'messageSenderId',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.messageSenderId,
                notEqual: 0
            }, {
                name: 'msgId',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.msgId,
                notEqual: 0
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_DELETE_MESSAGE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            this.Message.sendDelete({
                chatType: options.chatType,
                chatId: options.chatId,
                messageSenderId: options.messageSenderId,
                msgId: options.msgId
            }).then((result) => {

            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_DELETE_MESSAGE, 'default', error, null);
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

            const requestKey = this.Tool.generateRequestPurpose();

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

    createGroup(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Create group'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Create group params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_GROUP_CREATE, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_GROUP_CREATE_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing create group params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_CREATE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing create group params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'type',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.type,
                in: [this.groupConstants.GROUP_TYPE_PRIVATE, this.groupConstants.GROUP_TYPE_PUBLIC]
            }, {
                name: 'name',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_STRING,
                data: options.name,
                notEqual: ''
            }, {
                name: 'memberIds',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_ARRAY,
                notEmpty: true,
                data: options.memberIds
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_CREATE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            let allNumber = true;
            for (let i = 0; i < options.memberIds.length; i++) {
                if (!this.Validator.isNumber(options.memberIds[i])) {
                    allNumber = false;
                    break;
                }
            }

            if (!allNumber) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'memberIds must contain all numbers'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_CREATE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'memberIds must contain all numbers'
                }, null);
                return;
            }

            this.newUniqueId();
            this.Group.sendGroupCreate({
                msgId: this.uniqueId,
                type: options.type,
                name: options.name,
                memberIds: options.memberIds
            }).then((result) => {

            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_CREATE, 'default', error, null);
            });
        });
    };
    inviteGroup(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Invite group'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Invite group params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_GROUP_INVITE, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_GROUP_INVITE_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing invite group params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_INVITE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing invite group params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'groupId',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.groupId,
                notEqual: 0
            }, {
                name: 'inviteIds',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_ARRAY,
                notEmpty: true,
                data: options.inviteIds
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_INVITE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            let allNumber = true;
            for (let i = 0; i < options.inviteIds.length; i++) {
                if (!this.Validator.isNumber(options.inviteIds[i])) {
                    allNumber = false;
                    break;
                }
            }

            if (!allNumber) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'inviteIds must contain all numbers'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_INVITE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'inviteIds must contain all numbers'
                }, null);
                return;
            }

            this.newUniqueId();
            this.Group.sendGroupInvite({
                msgId: this.uniqueId,
                groupId: options.groupId,
                inviteIds: options.inviteIds
            }).then((result) => {

            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_INVITE, 'default', error, null);
            });
        });
    };
    leaveGroup(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Leave group'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Leave group params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_GROUP_LEAVE, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_GROUP_LEAVE_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing leave group params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_LEAVE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing leave group params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'groupId',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.groupId,
                notEqual: 0
            }, {
                name: 'leaveId',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.leaveId,
                notEqual: 0
            }, {
                name: 'newAdminId',
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.newAdminId,
                notEqual: 0
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_LEAVE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            this.newUniqueId();
            this.Group.sendGroupLeave({
                msgId: this.uniqueId,
                groupId: options.groupId,
                leaveId: options.leaveId,
                newAdminId: options.newAdminId
            }).then((result) => {

            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_LEAVE, 'default', error, null);
            });
        });
    };
    renameGroup(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Rename group'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Rename group params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_GROUP_RENAME, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_GROUP_RENAME_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing rename group params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_RENAME, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing rename group params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'groupId',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.groupId,
                notEqual: 0
            }, {
                name: 'newName',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_STRING,
                data: options.newName,
                notEqual: '0'
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_RENAME, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            this.newUniqueId();
            this.Group.sendGroupRename({
                msgId: this.uniqueId,
                groupId: options.groupId,
                newName: options.newName
            }).then((result) => {

            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_RENAME, 'default', error, null);
            });
        });
    };
    changeAdminGroup(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Change admin group'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Change admin group params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_GROUP_CHANGE_ADMIN, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_GROUP_ADMIN_CHANGE_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing change admin group params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_CHANGE_ADMIN, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing change admin group params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'groupId',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.groupId,
                notEqual: 0
            }, {
                name: 'newAdminId',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.newAdminId,
                notEqual: 0
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_CHANGE_ADMIN, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            this.newUniqueId();
            this.Group.sendGroupAdminChange({
                msgId: this.uniqueId,
                groupId: options.groupId,
                newAdminId: options.newAdminId,
                fromId: this.authenticatedUser.userId
            }).then((result) => {

            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_CHANGE_ADMIN, 'default', error, null);
            });
        });
    };
    joinPublicGroup(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Join public group'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Join public group params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_GROUP_JOIN_PUBLIC, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_GROUP_JOIN_PUBLIC_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing join public group params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_JOIN_PUBLIC, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing join public group params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'groupId',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.groupId,
                notEqual: 0
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_JOIN_PUBLIC, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            this.newUniqueId();
            this.Group.sendGroupJoinPublic({
                msgId: this.uniqueId,
                groupId: options.groupId
            }).then((result) => {

            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_JOIN_PUBLIC, 'default', error, null);
            });
        });
    };

    getDetailsGroup(options, callback) {
        return new Promise((resolve, reject) => {

            const requestKey = this.Tool.generateRequestPurpose();

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Get details group'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Get details group params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_GROUP_GET_DETAILS, requestKey, callback, resolve, reject, this.delegateConstants.DELEGATE_ON_GROUP_GET_DETAILS_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing get details group params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_GET_DETAILS, requestKey, {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing get details group params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'groupId',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.groupId,
                notEqual: 0
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_GET_DETAILS, requestKey, {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            this.Group.sendGroupGetDetails({
                groupId: options.groupId,
                requestId: requestKey
            }).then((result) => {

            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_GET_DETAILS, requestKey, error, null);
            });
        });
    };
    getListGroups(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Get groups'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Get groups params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_GROUP_GET_LIST, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_GROUP_GET_LIST_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing groups params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_GET_LIST, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing groups params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'groupType',
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.groupType,
                in: [this.groupConstants.GROUP_TYPE_PRIVATE, this.groupConstants.GROUP_TYPE_PUBLIC]
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_GET_LIST, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            this.Group.sendGetListGroups({
                groupType: options.groupType
            }).then().catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_GROUP_GET_LIST, 'default', error, null);
            });
        });
    };

    changeApplicationState(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Change application state'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Change application state params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_APPLICATION_CHANGE_STATE, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_APPLICATION_CHANGE_STATE_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing change application state params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_APPLICATION_CHANGE_STATE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing change application state params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'state',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.state,
                in: [this.applicationStateConstants.APPLICATION_STATE_BACKGROUND, this.applicationStateConstants.APPLICATION_STATE_FOREGROUND]
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_APPLICATION_CHANGE_STATE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            this.Notification.sendChangeApplicationState({
                state: options.state
            }).then((result) => {

            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_APPLICATION_CHANGE_STATE, 'default', error, null);
            });
        });
    };

    notificationRegisterDevice(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Notification register device'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Notification register device params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_NOTIFICATION_REGISTER_DEVICE, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_NOTIFICATION_REGISTER_DEVICE_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing notification register device params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_NOTIFICATION_REGISTER_DEVICE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing notification register device params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'deviceToken',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_STRING,
                data: options.deviceToken
            }, {
                name: 'devicePlatformOS',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_NUMBER,
                data: options.devicePlatformOS,
                in: [this.platformConstants.PLATFORM_ANDROID, this.platformConstants.PLATFORM_IOS]
            }, {
                name: 'applicationBundleId',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_STRING,
                data: options.applicationBundleId
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_NOTIFICATION_REGISTER_DEVICE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            this.Notification.sendNotificationRegisterDevice({
                deviceToken: options.deviceToken,
                devicePlatformOS: options.devicePlatformOS,
                applicationBundleId: options.applicationBundleId
            }).then((result) => {

            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_NOTIFICATION_REGISTER_DEVICE, 'default', error, null);
            });
        });
    };
    notificationUnregisterDevice(options, callback) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Notification unregister device'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Notification unregister device params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_NOTIFICATION_UNREGISTER_DEVICE, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_NOTIFICATION_UNREGISTER_DEVICE_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing notification unregister device params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_NOTIFICATION_UNREGISTER_DEVICE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing notification unregister device params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'deviceToken',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_STRING,
                data: options.deviceToken
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_NOTIFICATION_UNREGISTER_DEVICE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            this.Notification.sendNotificationUnregisterDevice({
                deviceToken: options.deviceToken
            }).then((result) => {

            }).catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_NOTIFICATION_UNREGISTER_DEVICE, 'default', error, null);
            });
        });
    };
    parseNotification(options, callback) {

        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Parse notification'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Parse notification params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_NOTIFICATION_PARSE, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_NOTIFICATION_PARSE_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing notification register device params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_NOTIFICATION_PARSE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Missing notification register device params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'notification',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_OBJECT,
                data: options.notification
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_NOTIFICATION_PARSE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            dataErrorMessage = this.Validator.check([{
                name: 'notification pushPacketType',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_STRING,
                notEqual: '0',
                data: options.notification.pushPacketType
            }, {
                name: 'notification appId',
                required: true,
                dataType: this.dataTypes.DATA_TYPE_STRING,
                data: options.notification.appId
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_NOTIFICATION_PARSE, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            let parsedNotification = this.Notification.parseNotification(options.notification);

            this.callUncall(this.uncallConstants.UNCALL_KEY_NOTIFICATION_PARSE, 'default', parsedNotification.error, parsedNotification.result);
        });
    };

    getStickersList(options, callback) {
        return new Promise((resolve, reject) => {

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Get stickers list'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Get stickers list params',
                payload: options
            });

            this.addUncall(this.uncallConstants.UNCALL_KEY_GET_STICKERS_LIST, 'default', callback, resolve, reject, this.delegateConstants.DELEGATE_ON_GET_STICKERS_LIST_RETURN);

            if (!options || typeof options !== 'object') {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Missing stickers list params'
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_STICKERS_LIST, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: 'Missing stickers list params'
                }, null);
                return;
            }

            let dataErrorMessage = this.Validator.check([{
                name: 'isDefault',
                dataType: this.dataTypes.DATA_TYPE_BOOLEAN,
                required: true,
                data: options.isDefault
            }]);
            if (dataErrorMessage) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: dataErrorMessage
                });
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_STICKERS_LIST, 'default', {
                    code: this.errorCodes.ERR_UNEXPECTED_SEND_DATA,
                    message: dataErrorMessage
                }, null);
                return;
            }

            this.Sticker.sendGetStickersList({
                isDefault: options.isDefault
            }).then().catch((error) => {
                this.callUncall(this.uncallConstants.UNCALL_KEY_GET_STICKERS_LIST, 'default', error, null);
            });
        });
    };
};

export default AZStackCore;