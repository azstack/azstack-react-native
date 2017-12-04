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
        this.callConstants = options.callConstants;
        this.Logger = options.Logger;
        this.sendPacketFunction = options.sendPacketFunction;

        this.iceServers = null;
        this.callData = {
            isCaller: null,
            callType: null,
            callId: null,
            fromPhoneNumber: null,
            toPhoneNumber: null,
            callinType: null,
            webRTC: {
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
    setIceServers(options) {
        this.iceServers = options.iceServers;
    };
    setCallData(options) {
        for (let field in options) {
            this.callData[field] = options[field];
        }
    };
    clearCallData() {
        this.callData.isCaller = null;
        this.callData.callType = null;
        this.callData.callId = null;
        this.callData.fromPhoneNumber = null;
        this.callData.toPhoneNumber = null;
        this.callData.callinType = null;
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
            this.callData.webRTC.peerConnection = new RTCPeerConnection({ iceServers: this.iceServers });
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
                    if (this.callData.callType === this.callConstants.CALL_TYPE_CALLOUT) {
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
                        this.sendPacketFunction(calloutDataPacket).then(() => {
                            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                                message: 'Send sdp and ice candidate packet successfully'
                            });
                        }).catch(() => {
                            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                                message: 'Send sdp and ice candidate packet fail'
                            });
                        });
                    }
                    if (this.callData.callType === this.callConstants.CALL_TYPE_CALLIN) {
                        const answerCallinPacket = {
                            service: this.serviceTypes.CALLIN_STATUS_CHANGED,
                            body: JSON.stringify({
                                callId: this.callData.callId,
                                callType: this.callData.callinType,
                                destination: this.callData.fromPhoneNumber,
                                phonenumber: this.callData.toPhoneNumber,
                                code: this.callConstants.CALL_STATUS_CALLIN_STATUS_FROM_SERVER_ANSWERED,
                                sdp_candidate: sdpCandidate
                            })
                        };
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                            message: 'Send answer callin packet'
                        });
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                            message: 'Answer callin packet',
                            payload: answerCallinPacket
                        });
                        this.sendPacketFunction(answerCallinPacket).then(() => {
                            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                                message: 'Send answer callin packet successfully'
                            });
                            resolve();
                        }).catch((error) => {
                            this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                                message: 'Cannot send answer callin data, answer callin fail'
                            });
                            this.clearCallData();
                            reject({
                                code: error.code,
                                message: 'Cannot send answer callin data, answer callin fail'
                            });
                        });
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

            const mediaConstraints = {
                audio: true,
                video: false
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Get user media'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Get user media constraints',
                payload: mediaConstraints
            });
            getUserMedia(mediaConstraints).then((stream) => {
                getUserMediaSuccess(stream);
            }).catch((error) => {
                getUserMediaError(error);
            });

            const getUserMediaSuccess = (stream) => {
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

                const peerConnectionMandatory = {
                    OfferToReceiveAudio: true,
                    OfferToReceiveVideo: false
                };
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Peer connection init'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Peer connection options mandatory',
                    payload: peerConnectionMandatory
                });
                if (this.callData.isCaller) {
                    this.callData.webRTC.peerConnection.createOffer({
                        mandatory: peerConnectionMandatory
                    }).then(this.callData.webRTC.peerConnection.setLocalDescription).then(() => {
                        peerConnectionInitConnectionSuccess();
                    }).catch((error) => {
                        peerConnectionInitConnectionError(error);
                    });
                } else {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Set remote session description and ice candidates to peer connection'
                    });
                    this.callData.webRTC.peerConnection.setRemoteDescription(this.callData.webRTC.remoteSessionDescription).then(() => {
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
                    this.callData.webRTC.peerConnection.createAnswer({
                        mandatory: peerConnectionMandatory
                    }).then(this.callData.webRTC.peerConnection.setLocalDescription).then(() => {
                        peerConnectionInitConnectionSuccess();
                    }).catch((error) => {
                        peerConnectionInitConnectionError(error);
                    });
                }
            };
            const getUserMediaError = (error) => {
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
            };
            const peerConnectionInitConnectionSuccess = () => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Got local session description'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Local session description',
                    payload: this.callData.webRTC.peerConnection.localDescription
                });
                this.callData.webRTC.localSessionDescription = this.callData.webRTC.peerConnection.localDescription;
                if (this.callData.callType === this.callConstants.CALL_TYPE_CALLOUT) {
                    resolve();
                }
            };
            const peerConnectionInitConnectionError = (error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Cannot init connection'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Init connection error',
                    payload: error
                });
                this.clearCallData();
                reject({
                    error: this.errorCodes.ERR_WEBRTC,
                    message: 'Cannot init connection'
                });
            };
        });
    };
    toggleAudioState(options) {
        return new Promise((resolve, reject) => {
            if (!this.callData.callId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot toggle audio state when not currently on call'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot toggle audio state when not currently on call'
                });
                return;
            }
            if (!this.callData.webRTC.localStream) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot toggle audio state, local stream not found'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot toggle audio state, local stream not found'
                });
                return;
            }

            const audioTracks = this.callData.webRTC.localStream.getAudioTracks();
            if (audioTracks.length === 0) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot toggle audio state, no audio stream found'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot toggle audio state, no audio stream found'
                });
                return;
            }

            if (options && typeof options.state === 'boolean') {
                audioTracks.map((audioTrack) => {
                    audioTrack.enabled = options.state
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Set audio state done'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Audio state',
                    payload: audioTracks[0].enabled ? 'on' : 'off'
                });
            } else {
                audioTracks.map((audioTrack) => {
                    audioTrack.enabled = !audioTrack.enabled
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Toggle audio state done'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Audio state',
                    payload: audioTracks[0].enabled ? 'on' : 'off'
                });
            }
            resolve();
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
                isCaller: true,
                callType: this.callConstants.CALL_TYPE_CALLOUT,
                callId: options.callData.callId,
                toPhoneNumber: options.callData.toPhoneNumber
            });

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
                status: this.callConstants.CALL_STATUS_CALLOUT_ERROR,
                message: 'Unknown error'
            };
            switch (body.chargingError) {
                case this.callConstants.CALL_STATUS_CALLOUT_INITIAL_BUSY:
                    error.status = this.callConstants.CALL_STATUS_CALLOUT_BUSY;
                    error.message = 'The toPhoneNumber currently busy'
                    break;
                case this.callConstants.CALL_STATUS_CALLOUT_INITIAL_NOT_ENOUGH_BALANCE:
                    error.status = this.callConstants.CALL_STATUS_CALLOUT_ERROR_NOT_ENOUGH_BALANCE;
                    error.message = 'Your account has not enough balance'
                    break;
                case this.callConstants.CALL_STATUS_CALLOUT_INITIAL_INVALID_NUMBER:
                    error.status = this.callConstants.CALL_STATUS_CALLOUT_ERROR_INVALID_NUMBER;
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
                case this.callConstants.CALL_STATUS_CALLOUT_STATUS_FROM_SERVER_CONNECTING:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to connecting'
                    });
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLOUT_CONNECTING
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLOUT_STATUS_FROM_SERVER_RINGING:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to ringing'
                    });
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLOUT_RINGING
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLOUT_STATUS_FROM_SERVER_ANSWERED:
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
                    this.callData.webRTC.remoteSessionDescription = new RTCSessionDescription({
                        sdp: body.sdp_candidate,
                        type: 'answer'
                    });
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Set remote session description and ice candidates to peer connection'
                    });
                    this.callData.webRTC.peerConnection.setRemoteDescription(this.callData.webRTC.remoteSessionDescription).then(() => {
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
                        status: this.callConstants.CALL_STATUS_CALLOUT_ANSWERED
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLOUT_STATUS_FROM_SERVER_BUSY:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to busy, callout end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLOUT_BUSY
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLOUT_STATUS_FROM_SERVER_NOT_ANSWERED:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to not answered, callout end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLOUT_NOT_ANSWERED
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLOUT_STATUS_FROM_SERVER_STOP:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to stop, callout end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLOUT_STOP
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLOUT_STATUS_FROM_SERVER_NOT_ENOUGH_BALANCE:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to not enough balance, callout end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLOUT_ERROR_NOT_ENOUGH_BALANCE
                    });
                    break;
                default:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to unknown'
                    });
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLOUT_UNKNOWN
                    });
                    break;
            }
        });
    };
    sendStopCallout(options) {
        return new Promise((resolve, reject) => {
            if (!this.callData.callId || this.callData.callType !== this.callConstants.CALL_TYPE_CALLOUT) {
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

    receiveCallinStart(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect callin start request, ignored'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got callin start request data'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Callin start request data',
                payload: body
            });

            if (this.callData.callId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot receive callin when currently on call'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });

                const responseBusyCallinPacket = {
                    service: this.serviceTypes.CALLIN_STATUS_CHANGED,
                    body: JSON.stringify({
                        callId: body.callId,
                        callType: body.callType,
                        destination: body.from,
                        phonenumber: body.to,
                        code: this.callConstants.CALL_STATUS_CALLIN_STATUS_FROM_SERVER_BUSY
                    })
                };
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send response busy callin packet'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Response busy callin packet',
                    payload: responseBusyCallinPacket
                });
                this.sendPacketFunction(responseBusyCallinPacket).then(() => {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Send response busy callin packet successfully'
                    });
                }).catch((error) => {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: 'Cannot send response busy callin data'
                    });
                });
                return;
            }

            const responseRingingCallinPacket = {
                service: this.serviceTypes.CALLIN_STATUS_CHANGED,
                body: JSON.stringify({
                    callId: body.callId,
                    callType: body.callType,
                    destination: body.from,
                    phonenumber: body.to,
                    code: this.callConstants.CALL_STATUS_CALLIN_STATUS_FROM_SERVER_RINGING
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send response ringing callin packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Response ringing callin packet',
                payload: responseRingingCallinPacket
            });
            this.sendPacketFunction(responseRingingCallinPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send response ringing callin packet successfully'
                });
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send response ringing callin data'
                });
            });

            this.setCallData({
                isCaller: false,
                callType: this.callConstants.CALL_TYPE_CALLIN,
                callId: body.callId,
                callinType: body.callType,
                fromPhoneNumber: body.from,
                toPhoneNumber: body.to
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got remote session description and ice candidates'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Remote session description and ice candidates',
                payload: body.sdp_candidate
            });
            this.callData.webRTC.remoteSessionDescription = new RTCSessionDescription({
                sdp: body.sdp_candidate,
                type: 'offer'
            });

            resolve({
                fromPhoneNumber: body.from,
                toPhoneNumber: body.to
            });
        });
    };
    receiveCallinStatusChanged(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect callin status, ignored'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got callin status changed data'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Callin status changed data',
                payload: body
            });

            if (this.callData.callId && this.callData.callId !== body.callId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Ignore callin status changed packet when callId not matched'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                return;
            }

            switch (body.code) {
                case this.callConstants.CALL_STATUS_CALLIN_STATUS_FROM_SERVER_RINGING_STOP:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to stop when ringing, callin end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_RINGING_STOP
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLIN_STATUS_FROM_SERVER_STOP:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to stop, callin end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_STOP
                    });
                    break;
                default:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to unknown'
                    });
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_UNKNOWN
                    });
                    break;
            }
        });
    };
    receiveCallinStatusChangedByMe(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect callin status by me, ignored'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got callin status changed by me data'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Callin status changed by me data',
                payload: body
            });

            if (this.callData.callId && this.callData.callId !== body.callId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Ignore callin status changed by me packet when callId not matched'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                return;
            }

            switch (body.code) {
                case this.callConstants.CALL_STATUS_CALLIN_STATUS_FROM_SERVER_RINGING:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to ringing by me'
                    });
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_BY_ME_RINGING
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLIN_STATUS_FROM_SERVER_ANSWERED:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to answered by me, callin end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_BY_ME_ANSWERED
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLIN_STATUS_FROM_SERVER_BUSY:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to busy by me, callin end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_BY_ME_BUSY
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLIN_STATUS_FROM_SERVER_RINGING_STOP:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to rejected by me, callin end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_BY_ME_REJECTED
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLIN_STATUS_FROM_SERVER_STOP:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to stop by me, callin end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_BY_ME_STOP
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLIN_STATUS_FROM_SERVER_NOT_ANSWERED:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to not answered by me, callin end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_BY_ME_NOT_ANSWERED
                    });
                    break;
                default:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to unknown by me'
                    });
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_BY_ME_UNKNOWN
                    });
                    break;
            }
        });
    };
    sendAnswerCallin(options) {
        return new Promise((resolve, reject) => {
            if (!this.callData.callId || this.callData.callType !== this.callConstants.CALL_TYPE_CALLIN) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot answer callin when not currently on callin'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot answer callin when not currently on callin'
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
    sendRejectCallin(options) {
        return new Promise((resolve, reject) => {
            if (!this.callData.callId || this.callData.callType !== this.callConstants.CALL_TYPE_CALLIN) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot reject callin when not currently on callin'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot reject callin when not currently on callin'
                });
                return;
            }

            const rejectCallinPacket = {
                service: this.serviceTypes.CALLIN_STATUS_CHANGED,
                body: JSON.stringify({
                    callId: this.callData.callId,
                    callType: this.callData.callinType,
                    destination: this.callData.fromPhoneNumber,
                    phonenumber: this.callData.toPhoneNumber,
                    code: this.callConstants.CALL_STATUS_CALLIN_STATUS_FROM_SERVER_RINGING_STOP
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send reject callin packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Reject callin packet',
                payload: rejectCallinPacket
            });
            this.sendPacketFunction(rejectCallinPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send reject callin packet successfully'
                });
                this.clearCallData();
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send reject callin data, reject callin fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send reject callin data, reject callin fail'
                });
            });
        });
    };
    sendNotAnsweredCallin(options) {
        return new Promise((resolve, reject) => {
            if (!this.callData.callId || this.callData.callType !== this.callConstants.CALL_TYPE_CALLIN) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send not answered callin when not currently on callin'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot send not answered callin when not currently on callin'
                });
                return;
            }

            const notAnswerdCallinPacket = {
                service: this.serviceTypes.CALLIN_STATUS_CHANGED,
                body: JSON.stringify({
                    callId: this.callData.callId,
                    callType: this.callData.callinType,
                    destination: this.callData.fromPhoneNumber,
                    phonenumber: this.callData.toPhoneNumber,
                    code: this.callConstants.CALL_STATUS_CALLIN_STATUS_FROM_SERVER_NOT_ANSWERED
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send not answered callin packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Send not answered callin packet',
                payload: notAnswerdCallinPacket
            });
            this.sendPacketFunction(notAnswerdCallinPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send not answered callin packet successfully'
                });
                this.clearCallData();
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send not answered callin data, not answered callin fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send not answered callin data, not answered callin fail'
                });
            });
        });
    };
    sendStopCallin(options) {
        return new Promise((resolve, reject) => {
            if (!this.callData.callId || this.callData.callType !== this.callConstants.CALL_TYPE_CALLIN) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot stop callin when not currently on callin'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot stop callin when not currently on callin'
                });
                return;
            }

            const stopCallinPacket = {
                service: this.serviceTypes.CALLIN_STATUS_CHANGED,
                body: JSON.stringify({
                    callId: this.callData.callId,
                    callType: this.callData.callinType,
                    destination: this.callData.fromPhoneNumber,
                    phonenumber: this.callData.toPhoneNumber,
                    code: this.callConstants.CALL_STATUS_CALLIN_STATUS_FROM_SERVER_STOP
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send stop callin packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Stop callin packet',
                payload: stopCallinPacket
            });
            this.sendPacketFunction(stopCallinPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send stop callin packet successfully'
                });
                this.clearCallData();
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send stop callin data, stop callin fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send stop callin data, stop callin fail'
                });
            });
        });
    };

    receivePaidCallLog(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect paid call log, ignored'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got paid call log'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Paid call log data',
                payload: body
            });

            let callLog = {
                callId: body.data.callId,
                fromPhoneNumber: body.data.from,
                toPhoneNumber: body.data.to,
                recordTime: body.data.recordTime,
                recordUrl: body.data.urlRecord,
                userId: body.data.azUserId,
                callType: this.callConstants.CALL_PAID_LOG_CALL_TYPE_UNKNOWN,
                callStatus: this.callConstants.CALL_PAID_LOG_CALL_STATUS_UNKNOWN
            }

            switch (body.data.callType) {
                case this.callConstants.CALL_PAID_LOG_FROM_SERVER_CALL_TYPE_CALLOUT:
                    callLog.callType = this.callConstants.CALL_PAID_LOG_CALL_TYPE_CALLOUT;
                    break;
                case this.callConstants.CALL_PAID_LOG_FROM_SERVER_CALL_TYPE_CALLIN:
                    callLog.callType = this.callConstants.CALL_PAID_LOG_CALL_TYPE_CALLIN;
                    break;
                default:
                    break;
            }

            switch (body.data.status) {
                case this.callConstants.CALL_PAID_LOG_FROM_SERVER_CALL_STATUS_ANSWERED:
                    callLog.callStatus = this.callConstants.CALL_PAID_LOG_CALL_STATUS_ANSWERED;
                    break;
                case this.callConstants.CALL_PAID_LOG_FROM_SERVER_CALL_STATUS_REJECTED:
                    callLog.callStatus = this.callConstants.CALL_PAID_LOG_CALL_STATUS_REJECTED;
                    break;
                case this.callConstants.CALL_PAID_LOG_FROM_SERVER_CALL_STATUS_NOT_ANSWERED:
                    callLog.callStatus = this.callConstants.CALL_PAID_LOG_CALL_STATUS_NOT_ANSWERED;
                    break;
                default:
                    break;
            }

            resolve(callLog);
        });
    };
};

export default Call;