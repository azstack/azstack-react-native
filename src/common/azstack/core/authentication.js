import io from 'socket.io-client';
import JSEncrypt from 'jsencrypt';

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
            this.getServerAddress(options).then((address) => {
                resolve(io.connect(options.masterSocketUri, {
                    transports: ['websocket'],
                    reconnection: false,
                    autoConnect: false,
                    forceNew: true
                }));
            }).catch((error) => {
                reject(error);
            });
        });
    };

    getServerAddress(options) {
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
                    service: this.serviceTypes.GET_SERVER_ADDR,
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
                    case this.serviceTypes.GET_SERVER_ADDR:
                        this.getServerAddressProcessor(body).then((address) => {
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
    getServerAddressProcessor(body) {
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

    authenticate(options) {
        return new Promise((resolve, reject) => {
            console.log(JSEncrypt);
            resolve();
        });
    };
};

export default Authentication;