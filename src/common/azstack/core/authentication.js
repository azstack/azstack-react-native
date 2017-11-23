import io from 'socket.io-client';
import { JSEncrypt } from 'jsencrypt';

class Authentication {
    constructor(options) {
        this.logLevelConstants = options.logLevelConstants;
        this.serviceTypes = options.serviceTypes;
        this.errorCodes = options.errorCodes;
        this.Logger = options.Logger;
        this.masterSocket = null;
    };

    getSlaveSocket(options) {
        return new Promise((resolve, reject) => {
            this.sendGetServerAddress(options).then((address) => {
                resolve({
                    slaveAddress: address,
                    slaveSocket: io.connect(options.masterSocketUri, {
                        transports: ['websocket'],
                        reconnection: false,
                        autoConnect: false,
                        forceNew: true
                    })
                });
            }).catch((error) => {
                reject(error);
            });
        });
    };

    sendGetServerAddress(options) {
        return new Promise((resolve, reject) => {
            this.masterSocket = io.connect(options.masterSocketUri, {
                transports: ['websocket'],
                reconnection: false,
                autoConnect: false,
                forceNew: true
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Start connect to master server'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Master socket uri',
                payload: options.masterSocketUri
            });
            this.masterSocket.open();

            this.masterSocket.on('connect', () => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Connected to master server'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send packet to get server address'
                });
                const getServerAddressPacket = {
                    service: this.serviceTypes.AUTHENTICATION_GET_SERVER_ADDR,
                    body: JSON.stringify({
                        azStackUserId: options.azStackUserId
                    })
                }
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Get server address packet',
                    payload: getServerAddressPacket
                });
                this.masterSocket.emit('WebPacket', getServerAddressPacket);
            });
            this.masterSocket.on('connect_error', (error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot connect to master socket'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Master socket connection error',
                    payload: error
                });
                reject({
                    code: this.errorCodes.ERR_SOCKET_CONNECT,
                    message: 'Cannot connect to master socket'
                });
            });
            this.masterSocket.on('disconnect', () => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Disconnected to master socket'
                });
            });
            this.masterSocket.on('WebPacket', (packet) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Got web packet from master socket'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Master socket web packet',
                    payload: packet
                });

                let body = null;
                let parseError = null;
                try {
                    body = JSON.parse(packet.body);
                } catch (e) {
                    parseError = e;
                }

                if (!body) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: 'Parse master socket packet\'s body error'
                    });
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                        message: 'Parse error',
                        payload: parseError
                    });
                }

                switch (packet.service) {
                    case this.serviceTypes.AUTHENTICATION_GET_SERVER_ADDR:
                        this.receiveGetServerAddress(body).then((address) => {
                            resolve(address);
                        }).catch((error) => {
                            reject(error);
                        });
                        break;
                    default:
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                            message: 'Got unknown packet from master socket'
                        });
                        reject({
                            code: this.errorCodes.ERR_SOCKET_UNKNOWN_SERVICE,
                            message: 'Got unknown packet from master socket, connect fail'
                        });
                        break;
                }

                this.masterSocket.disconnect();
                this.masterSocket = null;
            });
        });
    };
    receiveGetServerAddress(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot get server address, connect fail'
                });
                reject({
                    code: this.errorCodes.ERR_SOCKET_PARSE_BODY,
                    message: 'Cannot get server address, connect fail'
                });
                return;
            }
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got server address'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Server address',
                payload: body
            });
            resolve(body);
        });
    };

    sendAuthenticate(options) {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Generate token for authenticating'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Authenticating data',
                payload: {
                    authenticatingData: options.authenticatingData,
                    sdkVersion: options.sdkVersion
                }
            });
            const authenticationString = JSON.stringify({
                sdkVersion: options.sdkVersion,
                namespace: options.authenticatingData.namespace,
                azStackUserID: options.authenticatingData.azStackUserId,
                userCredentials: options.authenticatingData.userCredentials
            });
            const jsencrypt = new JSEncrypt();
            jsencrypt.setPublicKey(options.authenticatingData.publicKey);
            const excryptedAuthenticationString = jsencrypt.encrypt(authenticationString);
            if (!excryptedAuthenticationString) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot encrypt authenticating data'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Encrypting data',
                    payload: {
                        authenticationString: authenticationString,
                        publicKey: options.authenticatingData.publicKey
                    }
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot encrypt authenticating data'
                });
                return;
            }
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Generate token success'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Encrypted token',
                payload: excryptedAuthenticationString
            });
            const authenticationPacket = {
                service: this.serviceTypes.AUTHENTICATION_SEND_AUTHENTICATE,
                body: JSON.stringify({
                    slaveIp: options.slaveAddress.ip,
                    slavePort: options.slaveAddress.port,
                    token: excryptedAuthenticationString,
                    fullname: options.authenticatingData.fullname,
                    namespace: options.authenticatingData.namespace,
                    appId: options.authenticatingData.appId,
                    platform: 3,
                    sdkVersion: options.sdkVersion,
                    screenSize: '0x0'
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send authentication packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Authentication packet',
                payload: authenticationPacket
            });
            options.sendFunction(authenticationPacket).then(() => {
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send authentication data, conect fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send authentication data, conect fail'
                });
            });
        });
    };
    receiveAuthenticate(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot get authenticated data, conect fail'
                });
                reject({
                    code: this.errorCodes.ERR_SOCKET_PARSE_BODY,
                    message: 'Cannot get authenticated data, connect fail'
                });
                return;
            }
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got authenticated data'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Authenticated data',
                payload: body
            });
            resolve(body);
        });
    };
};

export default Authentication;