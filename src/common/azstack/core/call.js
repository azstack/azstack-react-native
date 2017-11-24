import {
    RTCPeerConnection,
    RTCSessionDescription,
    getUserMedia
} from 'react-native-webrtc';

class Call {
    constructor(options) {
        this.logLevelConstants = options.logLevelConstants;
        this.serviceTypes = options.serviceTypes;
        this.errorCodes = options.errorCodes;
        this.callStatuses = options.callStatuses;
        this.Logger = options.Logger;
        this.sendPacketFunction = options.sendPacketFunction;

        this.callData = {
            callType: null,
            callId: null,
            toPhoneNumber: null,
            webRTC: {
                iceServers: null,
                peerConnection: null,
                localIceCandidates: [],
                localSessionDescription: null,
                localStream: null,
                remoteIceCandidates: [],
                remoteSessionDescription: null,
                remoteStream: null
            }
        };
    }

    setCallData(options) {
        for (let field in options) {
            this.callData[field] = options[field];
        }
    };
    clearCallData() {
        this.callData.callType = null;
        this.callData.callId = null;
        this.callData.toPhoneNumber = null;
        this.callData.webRTC.iceServers = null;
        this.callData.webRTC.peerConnection = null;
        this.callData.webRTC.localIceCandidates = [];
        this.callData.webRTC.localSessionDescription = null;
        this.callData.webRTC.localStream = null;
        this.callData.webRTC.remoteIceCandidates = [];
        this.callData.webRTC.remoteSessionDescription = null;
        this.callData.webRTC.remoteStream = null;
    };
    initWebRTC() {
        return new Promise((resolve, reject) => {
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Start peer connection'
            });
            this.callData.webRTC.peerConnection = new RTCPeerConnection({ iceServers: this.callData.webRTC.iceServers });
            this.callData.webRTC.peerConnection.onicecandidate = (event) => {
                if (!event.candidate) {
                    let sdpCandidate = '' + this.callData.webRTC.localSessionDescription.sdp;
                    this.callData.webRTC.localIceCandidates.map(function (iceCandidate) {
                        sdpCandidate += 'a=' + iceCandidate.candidate + '\r\n';
                    });
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Gathering ice candidate done'
                    });
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                        message: 'Spd and ice candidate',
                        payload: sdpCandidate
                    });
                    if (this.callData.callType === this.callStatuses.CALL_TYPE_CALLOUT) {
                        const calloutDataPacket = {
                            service: this.serviceTypes.CALLOUT_DATA_SEND,
                            body: JSON.stringify({
                                callId: this.callData.callId,
                                to: this.callData.toPhoneNumber,
                                sdp_candidate: sdpCandidate
                            })
                        };
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                            message: 'Send sdp and ice candidate packet'
                        });
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                            message: 'Sdp and ice candidate packet',
                            payload: calloutDataPacket
                        });
                        this.sendPacketFunction(calloutDataPacket).then(() => { }).catch(() => { });
                    }
                    return;
                }
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Got local ice candidate'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'ice candidate',
                    payload: event.candidate
                });
                this.callData.webRTC.localIceCandidates.push(event.candidate);
            };
            this.callData.webRTC.peerConnection.onaddstream = (event) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Got remote strem'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Remote stream',
                    payload: event.stream
                });
                this.callData.webRTC.remoteStream = event.stream;
            };

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Get user media, audio only'
            });
            getUserMedia({
                audio: true,
                video: false
            }).then(stream => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Got local stream'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Local stream',
                    payload: stream
                });
                this.callData.webRTC.localStream = stream;
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Add local stream to peer connection'
                });
                this.callData.webRTC.peerConnection.addStream(stream);

                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Peer connection create offer'
                });
                this.callData.webRTC.peerConnection.createOffer({
                    mandatory: {
                        OfferToReceiveAudio: true,
                        OfferToReceiveVideo: false,
                    }
                }).then(this.callData.webRTC.peerConnection.setLocalDescription).then(() => {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Got local session description'
                    });
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                        message: 'Local session description',
                        payload: this.callData.webRTC.peerConnection.localDescription
                    });
                    this.callData.webRTC.localSessionDescription = this.callData.webRTC.peerConnection.localDescription;
                    resolve();
                }).catch((error) => {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Cannot create offer'
                    });
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                        message: 'Create offer error',
                        payload: error
                    });
                    this.clearCallData();
                    reject({
                        error: this.errorCodes.ERR_WEBRTC,
                        message: 'Cannot create offer'
                    });
                });
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Cannot get local stream'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Get local stream error',
                    payload: error
                });
                this.clearCallData();
                reject({
                    error: this.errorCodes.ERR_WEBRTC,
                    message: 'Cannot get user media'
                });
            });
        });
    };

    sendStartCallout(options) {
        return new Promise((resolve, reject) => {
            if (this.callData.callId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot start callout when currently on call'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot start callout when currently on call'
                });
                return;
            }

            this.setCallData({
                callType: this.callStatuses.CALL_TYPE_CALLOUT,
                callId: options.callData.callId,
                toPhoneNumber: options.callData.toPhoneNumber
            });
            this.callData.webRTC.iceServers = options.iceServers;

            const startCalloutPacket = {
                service: this.serviceTypes.CALLOUT_START_SEND,
                body: JSON.stringify({
                    callId: this.callData.callId,
                    to: this.callData.toPhoneNumber
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send start callout packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Start callout packet',
                payload: startCalloutPacket
            });
            this.sendPacketFunction(startCalloutPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send start callout packet successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send start callout data, start callout fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send start callout data, start callout fail'
                });
            });
        });
    };
    receiveStartCalloutInitial(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot get start callout initial data, start callout fail'
                });
                this.clearCallData();
                reject({
                    code: this.errorCodes.ERR_SOCKET_PARSE_BODY,
                    message: 'Cannot get start callout initial data, start callout fail'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got start callout initial data'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Start callout initial data',
                payload: body
            });

            if (this.callData.callId && this.callData.callId !== body.callId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Ignore start callout initial packet when callId not matched'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                return;
            }

            if (!body.chargingError) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Ignore start callout initial because of no error'
                });
                return;
            }

            const error = {
                code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                status: this.callStatuses.CALL_STATUS_CALLOUT_ERROR,
                message: 'Unknown error'
            };
            switch (body.chargingError) {
                case this.callStatuses.CALL_STATUS_CALLOUT_INITIAL_BUSY:
                    error.status = this.callStatuses.CALL_STATUS_CALLOUT_BUSY;
                    error.message = 'The toPhoneNumber currently busy'
                    break;
                case this.callStatuses.CALL_STATUS_CALLOUT_INITIAL_NOT_ENOUGH_BALANCE:
                    error.status = this.callStatuses.CALL_STATUS_CALLOUT_ERROR_NOT_ENOUGH_BALANCE;
                    error.message = 'Your account has not enough balance'
                    break;
                case this.callStatuses.CALL_STATUS_CALLOUT_INITIAL_INVALID_NUMBER:
                    error.status = this.callStatuses.CALL_STATUS_CALLOUT_ERROR_INVALID_NUMBER;
                    error.message = 'The toPhoneNumber is not valid'
                    break;
                default:
                    break;
            }
            this.clearCallData();
            reject(error);
        });
    };
    receiveStartCalloutDone(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot get start callout done data, start callout fail'
                });
                this.clearCallData();
                reject({
                    code: this.errorCodes.ERR_SOCKET_PARSE_BODY,
                    message: 'Cannot get start callout done data, start callout fail'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got start callout done data'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Start callout done data',
                payload: body
            });

            if (this.callData.callId && this.callData.callId !== body.callId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Ignore start callout done packet when callId not matched'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                return;
            }

            return this.initWebRTC().then(() => {
                resolve()
            }).catch((error) => {
                reject(error);
            });
        });
    };
    receiveCalloutStatusChanged(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect callout status, ignored'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got callout status changed data'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Callout status changed data',
                payload: body
            });

            if (this.callData.callId && this.callData.callId !== body.callId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Ignore callout status changed packet when callId not matched'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                return;
            }

            switch (body.code) {
                case this.callStatuses.CALL_STATUS_CALLOUT_STATUS_RECEIVED_CONNECTING:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to connecting'
                    });
                    resolve({
                        status: this.callStatuses.CALL_STATUS_CALLOUT_CONNECTING
                    });
                    break;
                case this.callStatuses.CALL_STATUS_CALLOUT_STATUS_RECEIVED_RINGING:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to ringing'
                    });
                    resolve({
                        status: this.callStatuses.CALL_STATUS_CALLOUT_RINGING
                    });
                    break;
                case this.callStatuses.CALL_STATUS_CALLOUT_STATUS_RECEIVED_ANSWERED:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to answered'
                    });
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Got remote session description and ice candidates'
                    });
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                        message: 'Remote session description and ice candidates',
                        payload: body.sdp_candidate
                    });
                    this.callData.remoteSessionDescription = new RTCSessionDescription({
                        sdp: body.sdp_candidate,
                        type: 'answer'
                    });
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Set remote session description and ice candidates to peer connection'
                    });
                    this.callData.webRTC.peerConnection.setRemoteDescription(this.callData.remoteSessionDescription).then(() => {
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                            message: 'Set remote session description and ice candidates success'
                        });
                    }).catch((error) => {
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                            message: 'Set remote session description and ice candidates fail'
                        });
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                            message: 'Set remote session description and ice candidates error',
                            payload: error
                        });
                    });
                    resolve({
                        status: this.callStatuses.CALL_STATUS_CALLOUT_ANSWERED
                    });
                    break;
                case this.callStatuses.CALL_STATUS_CALLOUT_STATUS_RECEIVED_BUSY:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to busy, callout end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callStatuses.CALL_STATUS_CALLOUT_BUSY
                    });
                    break;
                case this.callStatuses.CALL_STATUS_CALLOUT_STATUS_RECEIVED_NOT_ANSWERED:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to not answered, callout end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callStatuses.CALL_STATUS_CALLOUT_NOT_ANSWERED
                    });
                    break;
                case this.callStatuses.CALL_STATUS_CALLOUT_STATUS_RECEIVED_STOP:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to stop, callout end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callStatuses.CALL_STATUS_CALLOUT_STOP
                    });
                    break;
                case this.callStatuses.CALL_STATUS_CALLOUT_STATUS_RECEIVED_NOT_ENOUGH_BALANCE:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to not enough balance, callout end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callStatuses.CALL_STATUS_CALLOUT_ERROR_NOT_ENOUGH_BALANCE
                    });
                    break;
                default:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to unknown'
                    });
                    resolve({
                        status: this.callStatuses.CALL_STATUS_CALLOUT_UNKNOWN
                    });
                    break;
            }
        });
    };
    sendStopCallout(options) {
        return new Promise((resolve, reject) => {
            if (!this.callData.callId || this.callData.callType !== this.callStatuses.CALL_TYPE_CALLOUT) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot stop callout when not currently on callout'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot stop callout when not currently on callout'
                });
                return;
            }

            const stopCalloutPacket = {
                service: this.serviceTypes.CALLOUT_STOP_SEND,
                body: JSON.stringify({
                    callId: this.callData.callId,
                    to: this.callData.toPhoneNumber
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send stop callout packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Stop callout packet',
                payload: stopCalloutPacket
            });
            this.sendPacketFunction(stopCalloutPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send stop callout packet successfully'
                });
                this.clearCallData();
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send stop callout data, stop callout fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send stop callout data, stop callout fail'
                });
            });
        });
    };
};

export default Call;