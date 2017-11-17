import io from 'socket.io-client';

import * as logLevelConstants from '../constant/logLevel';
import * as serviceTypes from '../constant/serviceTypes';

import Logger from '../helper/logger';

export const getServerAddress = (options, callback) => {
    const _logger = new Logger();
    _logger.setLogLevel(options.logLevel);
    const socket = io.connect(options.chatProxy, {
        transports: ['websocket'],
        reconnection: false,
        autoConnect: false,
        forceNew: true
    });
    _logger.log(logLevelConstants.LOG_LEVEL_INFO, {
        message: 'Start connect to master server'
    });
    _logger.log(logLevelConstants.LOG_LEVEL_DEBUG, {
        message: 'Chat Proxy',
        payload: options.chatProxy
    });
    socket.open();

    socket.on('connect', () => {
        _logger.log(logLevelConstants.LOG_LEVEL_INFO, {
            message: 'Connected to master server'
        });
        _logger.log(logLevelConstants.LOG_LEVEL_INFO, {
            message: 'Send packet to get server address'
        });
        const getServerAddressPacket = {
            service: serviceTypes.GET_SERVER_ADDR,
            body: JSON.stringify({
                azStackUserId: '123'
            })
        }
        _logger.log(logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'Get server address packet',
            payload: getServerAddressPacket
        });
        socket.emit('WebPacket', getServerAddressPacket);
    });
    socket.on('connect_error', (error) => {
        _logger.log(logLevelConstants.LOG_LEVEL_ERROR, {
            message: 'Cannot connect to master socket',
            error: error
        });
    });
    socket.on('disconnect', () => {
        _logger.log(logLevelConstants.LOG_LEVEL_INFO, {
            message: 'Disconnected to master socket'
        });
    });
    socket.on('WebPacket', function (packet) {
        _logger.log(logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'Got web packet from master server',
            payload: {
                packet: packet
            }
        });

        let serverAddress = null;
        try {
            serverAddress = JSON.parse(packet.body);
        } catch (e) { }
        if (!serverAddress) {
            _logger.log(logLevelConstants.LOG_LEVEL_ERROR, {
                message: 'Get server address error, connect fail'
            });
            return;
        }

        _logger.log(logLevelConstants.LOG_LEVEL_INFO, {
            message: 'Got server address'
        });
        _logger.log(logLevelConstants.LOG_LEVEL_DEBUG, {
            message: 'Server address',
            payload: serverAddress
        });
        callback(serverAddress);
        socket.disconnect();
    });
};