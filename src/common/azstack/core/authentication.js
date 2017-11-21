import io from 'socket.io-client';

class Authentication {
    constructor(options) {
        this.logLevelConstants = options.logLevelConstants;
        this.serviceTypes = options.serviceTypes;
        this.errorCodes = options.errorCodes;
        this.Logger = options.Logger;
        this.masterSocket = null;
    };

    getSlaveSocket(options, callback) {
        return new Promise((resolve, reject) => {
            this.getServerAddress(options).then((address) => {
                resolve(address);
                if (typeof callback === 'function') {
                    callback(null, address);
                }
                return;
            }).catch((error) => {
                reject(error);
                if (typeof callback === 'function') {
                    callback(error, null);
                }
                return;
            });
        });
    };

    getServerAddress(options) {
        return new Promise((resolve, reject) => {
            this.masterSocket = io.connect(options.chatProxy, {
                transports: ['websocket'],
                reconnection: false,
                autoConnect: false,
                forceNew: true
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Start connect to master server'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Chat Proxy',
                payload: options.chatProxy
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
                        azStackUserId: '123'
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
                    message: 'Cannot connect to master socket',
                    error: error
                });
                reject({
                    code: this.errorCodes.ERR_SOCKET_CONNECT,
                    message: 'Cannot connect to master socket'
                });
                return;
            });
            this.masterSocket.on('disconnect', () => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Disconnected to master socket'
                });
            });
            this.masterSocket.on('WebPacket', (packet) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Got web packet from master socket',
                    payload: packet
                });

                let body = null;
                try {
                    body = JSON.parse(packet.body);
                } catch (e) { }

                if (!body) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: 'Parse master packet\'s body error'
                    });
                }

                switch (packet.service) {
                    case this.serviceTypes.GET_SERVER_ADDR:
                        this.getServerAddressProcessor(body).then((address) => {
                            resolve(address);
                            return;
                        }).catch((error) => {
                            reject(error);
                            return;
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
            return;
        });
    };
};

export default Authentication;