import io from 'socket.io-client';

class Authentication {
    constructor(options) {
        this.logLevelConstants = options.logLevelConstants;
        this.serviceTypes = options.serviceTypes;
        this.Logger = options.Logger;
        this.masterSocket = null;
    };

    getSlaveSocket(options, callback) {
        this.getServerAddress(options, (address) => {
            console.log(address);
        });
    };

    getServerAddress(options, callback) {
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
            try {
                body = JSON.parse(packet.body);
            } catch (e) { }
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Parse packet\'s body error'
                });
                return;
            }

            switch (packet.service) {
                case this.serviceTypes.GET_SERVER_ADDR:
                    this.getServerAddressProcessor(body, callback);
                    break;
                default:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: 'Got unknown packet from master socket'
                    });
                    break;
            }

            this.masterSocket.disconnect();
            this.masterSocket = null;
        });
    };
    getServerAddressProcessor(body, callback) {
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
            message: 'Got server address'
        });
        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'Server address',
            payload: body
        });
        if (typeof callback === 'function') {
            callback(body);
        }
    };
};

export default Authentication;