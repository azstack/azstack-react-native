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

        this.callData = {
            callType: null,
            callId: null,
            toPhoneNumber: null,
            webRTC: {
                iceServers: null,
                peerConnection: null,
                localIceCandidates: [],
                localSessionDescription: null,
                localStream: null
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
            options.sendFunction(startCalloutPacket).then(() => {
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
                status: null,
                message: 'Unknown error'
            };
            switch (body.chargingError) {
                case this.callStatuses.CALL_STATUS_CALLOUT_BUSY:
                    error.status = this.callStatuses.CALL_STATUS_CALLOUT_BUSY;
                    error.message = 'The toPhoneNumber currently busy'
                    break;
                case this.callStatuses.CALL_STATUS_CALLOUT_NOT_ENOUGH_BALANCE:
                    error.status = this.callStatuses.CALL_STATUS_CALLOUT_NOT_ENOUGH_BALANCE;
                    error.message = 'Your account has not enough balance'
                    break;
                case this.callStatuses.CALL_STATUS_CALLOUT_INVALID_NUMBER:
                    error.status = this.callStatuses.CALL_STATUS_CALLOUT_INVALID_NUMBER;
                    error.message = 'The toPhoneNumber is not valid'
                    break;
                default:
                    break;
            }
            this.clearCallData();
            reject(error);
        });
    };
    receiveStartCalloutDone(body, sendFunction) {
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
                    sendFunction(calloutDataPacket).then(() => { }).catch(() => { });
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
                console.log(event);
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
};

export default Call;