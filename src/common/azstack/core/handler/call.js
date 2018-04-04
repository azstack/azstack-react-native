import {
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
    getUserMedia
} from 'react-native-webrtc';

class Call {
    constructor(options) {
        this.logLevelConstants = options.logLevelConstants;
        this.serviceTypes = options.serviceTypes;
        this.errorCodes = options.errorCodes;
        this.callConstants = options.callConstants;
        this.listConstants = options.listConstants;
        this.Logger = options.Logger;
        this.sendPacketFunction = options.sendPacketFunction;
        this.onLocalStreamArrived = options.onLocalStreamArrived;
        this.onRemoteStreamArrived = options.onRemoteStreamArrived;

        this.iceServers = null;
        this.callData = {
            mediaType: null,
            isCaller: null,
            callType: null,
            callId: null,
            callStatus: null,
            fromUserId: null,
            toUserId: null,
            fromPhoneNumber: null,
            toPhoneNumber: null,
            callinType: null,
            webRTC: {
                audioState: null,
                videoState: null,
                cameraType: null,
                peerConnection: null,
                localIceCandidates: [],
                localSessionDescription: null,
                localStream: null,
                remoteIceCandidates: [],
                remoteSessionDescription: null,
                remoteStream: null
            }
        };
    };
    setIceServers(options) {
        this.iceServers = options.iceServers;
    };
    setCallData(options) {
        for (let field in options) {
            this.callData[field] = options[field];
        }
    };
    setWebRTCCallData(options) {
        for (let field in options) {
            this.callData.webRTC[field] = options[field];
        }
    };
    clearCallData() {

        if (this.callData.webRTC.peerConnection) {
            this.callData.webRTC.peerConnection.close();
        }
        if (this.callData.webRTC.localStream) {
            this.callData.webRTC.localStream.release();
        }

        this.callData.mediaType = null;
        this.callData.isCaller = null;
        this.callData.callType = null;
        this.callData.callId = null;
        this.callData.callStatus = null;
        this.callData.fromUserId = null;
        this.callData.toUserId = null;
        this.callData.fromPhoneNumber = null;
        this.callData.toPhoneNumber = null;
        this.callData.callinType = null;
        this.callData.webRTC.audioState = null;
        this.callData.webRTC.videoState = null;
        this.callData.webRTC.cameraType = null;
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
                                code: this.callConstants.CALL_STATUS_CALLIN_STATUS_ANSWERED,
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

                if (this.callData.callType === this.callConstants.CALL_TYPE_FREE_CALL) {
                    const freeCallDataPacket = {
                        service: this.serviceTypes.FREE_CALL_DATA,
                        body: JSON.stringify({
                            callId: this.callData.callId,
                            type: this.callConstants.CALL_WEBRTC_DATA_TYPE_ICE_CANDIDATE,
                            to: this.callData.isCaller ? this.callData.toUserId : this.callData.fromUserId,
                            data: {
                                sdpMid: event.candidate.sdpMid,
                                sdpMLineIndex: event.candidate.sdpMLineIndex,
                                sdp: event.candidate.candidate
                            }
                        })
                    };
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Send free call data packet'
                    });
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                        message: 'Free call data packet',
                        payload: freeCallDataPacket
                    });
                    this.sendPacketFunction(freeCallDataPacket).then(() => {
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                            message: 'Send free call data packet successfully'
                        });
                    }).catch((error) => {
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                            message: 'Cannot send free call data data, free call data fail'
                        });
                    });
                }
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

                if (this.callData.mediaType === this.callConstants.CALL_MEDIA_TYPE_VIDEO) {
                    this.onRemoteStreamArrived({ stream: event.stream });
                }
            };

            const mediaConstraints = {
                audio: true,
                video: this.callData.mediaType === this.callConstants.CALL_MEDIA_TYPE_AUDIO ? false : {
                    mandatory: {
                        minWidth: 500,
                        minHeight: 300,
                        minFrameRate: 30
                    },
                    facingMode: this.callConstants.CALL_WEBRTC_CAMERA_TYPE_FRONT
                }
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

                if (this.callData.mediaType === this.callConstants.CALL_MEDIA_TYPE_VIDEO) {
                    this.onLocalStreamArrived({ stream: stream });
                }

                const peerConnectionMandatory = {
                    OfferToReceiveAudio: true,
                    OfferToReceiveVideo: this.callData.mediaType === this.callConstants.CALL_MEDIA_TYPE_AUDIO ? false : true
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
                    if (this.callData.callType === this.callConstants.CALL_TYPE_FREE_CALL) {
                        const answerFreeCallPacket = {
                            service: this.serviceTypes.FREE_CALL_STATUS_CHANGED,
                            body: JSON.stringify({
                                callId: this.callData.callId,
                                to: this.callData.fromUserId,
                                status: this.callConstants.CALL_STATUS_FREE_CALL_ANSWERED
                            })
                        };
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                            message: 'Send answer free call packet'
                        });
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                            message: 'Answer free call packet',
                            payload: answerFreeCallPacket
                        });
                        this.sendPacketFunction(answerFreeCallPacket).then(() => {
                            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                                message: 'Send answer free call packet successfully'
                            });
                            resolve();
                        }).catch((error) => {
                            this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                                message: 'Cannot send answer free call data, answer free call fail'
                            });
                            this.clearCallData();
                            reject({
                                code: error.code,
                                message: 'Cannot send answer free call data, answer free call fail'
                            });
                        });
                    }

                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Set remote session description to peer connection'
                    });
                    this.callData.webRTC.peerConnection.setRemoteDescription(this.callData.webRTC.remoteSessionDescription).then(() => {
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                            message: 'Set remote session description success'
                        });
                    }).catch((error) => {
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                            message: 'Set remote session description fail'
                        });
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                            message: 'Set remote session description error',
                            payload: error
                        });
                    });

                    let totalUnAddedIceCandidates = this.callData.webRTC.remoteIceCandidates.length;
                    for (let i = 0; i < totalUnAddedIceCandidates; i++) {
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                            message: 'Add remote ice candidate to peer connection'
                        });
                        this.callData.webRTC.peerConnection.addIceCandidate(this.callData.webRTC.remoteIceCandidates[i]).then(() => {
                            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                                message: 'Add remote ice candidate success'
                            });
                        }).catch((error) => {
                            this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                                message: 'Add remote ice candidate fail'
                            });
                            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                                message: 'Add remote ice candidate error',
                                payload: error
                            });
                        });
                    }

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
                if (this.callData.callType === this.callConstants.CALL_TYPE_FREE_CALL) {
                    if (this.callData.isCaller) {
                        const startFreeCallPacket = {
                            service: this.serviceTypes.FREE_CALL_START,
                            body: JSON.stringify({
                                callId: this.callData.callId,
                                mediaType: this.callData.mediaType,
                                to: this.callData.toUserId,
                                sdp: this.callData.webRTC.localSessionDescription
                            })
                        };
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                            message: 'Send start free call packet'
                        });
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                            message: 'Start free call packet',
                            payload: startFreeCallPacket
                        });
                        this.sendPacketFunction(startFreeCallPacket).then(() => {
                            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                                message: 'Send start free call packet successfully'
                            });
                            resolve();
                        }).catch((error) => {
                            this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                                message: 'Cannot send start free call data, start free call fail'
                            });
                            this.clearCallData();
                            reject({
                                code: error.code,
                                message: 'Cannot send start free call data, start free call fail'
                            });
                        });
                    } else {
                        const freeCallDataPacket = {
                            service: this.serviceTypes.FREE_CALL_DATA,
                            body: JSON.stringify({
                                callId: this.callData.callId,
                                to: this.callData.fromUserId,
                                type: this.callConstants.CALL_WEBRTC_DATA_TYPE_SESSION_DESCRIPTION,
                                data: this.callData.webRTC.localSessionDescription
                            })
                        };
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                            message: 'Send free call data packet'
                        });
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                            message: 'Free call data packet',
                            payload: freeCallDataPacket
                        });
                        this.sendPacketFunction(freeCallDataPacket).then(() => {
                            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                                message: 'Send free call data packet successfully'
                            });
                        }).catch((error) => {
                            this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                                message: 'Cannot send free call data packet'
                            });
                        });
                    }
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

            if (options.state !== undefined) {
                audioTracks.map((audioTrack) => {
                    audioTrack.enabled = options.state === this.callConstants.CALL_WEBRTC_AUDIO_STATE_OFF ? false : true;
                });
                if (audioTracks[0].enabled) {
                    this.callData.webRTC.audioState = this.callConstants.CALL_WEBRTC_AUDIO_STATE_ON;
                } else {
                    this.callData.webRTC.audioState = this.callConstants.CALL_WEBRTC_AUDIO_STATE_OFF;
                }
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Set audio state done'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Audio state',
                    payload: this.callData.webRTC.audioState
                });
            } else {
                audioTracks.map((audioTrack) => {
                    audioTrack.enabled = !audioTrack.enabled
                });
                if (audioTracks[0].enabled) {
                    this.callData.webRTC.audioState = this.callConstants.CALL_WEBRTC_AUDIO_STATE_ON;
                } else {
                    this.callData.webRTC.audioState = this.callConstants.CALL_WEBRTC_AUDIO_STATE_OFF;
                }

                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Toggle audio state done'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Audio state',
                    payload: this.callData.webRTC.audioState
                });
            }
            resolve({ audioState: this.callData.webRTC.audioState });
        });
    };
    toggleVideoState(options) {
        return new Promise((resolve, reject) => {
            if (!this.callData.callId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot toggle video state when not currently on call'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot toggle video state when not currently on call'
                });
                return;
            }
            if (!this.callData.webRTC.localStream) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot toggle video state, local stream not found'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot toggle video state, local stream not found'
                });
                return;
            }
            if (this.callData.mediaType !== this.callConstants.CALL_MEDIA_TYPE_VIDEO) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot toggle video state, no video used'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot toggle video state, no video used'
                });
                return;
            }

            const videoTracks = this.callData.webRTC.localStream.getVideoTracks();
            if (videoTracks.length === 0) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot toggle video state, no video stream found'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot toggle video state, no video stream found'
                });
                return;
            }

            if (options.state !== undefined) {
                videoTracks.map((videoTrack) => {
                    videoTrack.enabled = options.state === this.callConstants.CALL_WEBRTC_VIDEO_STATE_OFF ? false : true;
                });
                if (videoTracks[0].enabled) {
                    this.callData.webRTC.videoState = this.callConstants.CALL_WEBRTC_VIDEO_STATE_ON;
                } else {
                    this.callData.webRTC.videoState = this.callConstants.CALL_WEBRTC_VIDEO_STATE_OFF;
                }
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Set video state done'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Video state',
                    payload: this.callData.webRTC.videoState
                });
            } else {
                videoTracks.map((videoTrack) => {
                    videoTrack.enabled = !videoTrack.enabled
                });
                if (videoTracks[0].enabled) {
                    this.callData.webRTC.videoState = this.callConstants.CALL_WEBRTC_VIDEO_STATE_ON;
                } else {
                    this.callData.webRTC.videoState = this.callConstants.CALL_WEBRTC_VIDEO_STATE_OFF;
                }

                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Toggle video state done'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Video state',
                    payload: this.callData.webRTC.videoState
                });
            }
            resolve({ videoState: this.callData.webRTC.videoState });
        });
    };
    switchCameraType(options) {
        return new Promise((resolve, reject) => {
            if (!this.callData.callId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot switch camera type when not currently on call'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot switch camera type when not currently on call'
                });
                return;
            }
            if (!this.callData.webRTC.localStream) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot switch camera type, local stream not found'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot switch camera type, local stream not found'
                });
                return;
            }
            if (this.callData.mediaType !== this.callConstants.CALL_MEDIA_TYPE_VIDEO) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot switch camera type, no video used'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot switch camera type, no video used'
                });
                return;
            }

            const videoTracks = this.callData.webRTC.localStream.getVideoTracks();
            if (videoTracks.length === 0) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot toggle video state, no video stream found'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot toggle video state, no video stream found'
                });
                return;
            }

            videoTracks.map((videoTrack) => {
                videoTrack._switchCamera();
            });

            if (this.callData.webRTC.cameraType === this.callConstants.CALL_WEBRTC_CAMERA_TYPE_FRONT) {
                this.callData.webRTC.cameraType = this.callConstants.CALL_WEBRTC_CAMERA_TYPE_BACK;
            } else if (this.callData.webRTC.cameraType === this.callConstants.CALL_WEBRTC_CAMERA_TYPE_BACK) {
                this.callData.webRTC.cameraType = this.callConstants.CALL_WEBRTC_CAMERA_TYPE_FRONT;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Switch camera type done'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Switch camera type',
                payload: this.callData.webRTC.cameraType
            });
            resolve({ cameraType: this.callData.webRTC.cameraType });
        });
    };

    sendStartFreeCall(options) {
        return new Promise((resolve, reject) => {
            if (this.callData.callId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot start free call when currently on call'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot start free call when currently on call'
                });
                return;
            }

            this.setCallData({
                mediaType: options.mediaType,
                isCaller: true,
                callType: this.callConstants.CALL_TYPE_FREE_CALL,
                callId: options.callId,
                callStatus: this.callConstants.CALL_STATUS_FREE_CALL_CONNECTING,
                fromUserId: options.fromUserId,
                toUserId: options.toUserId
            });
            this.setWebRTCCallData({
                audioState: this.callConstants.CALL_WEBRTC_AUDIO_STATE_ON,
                videoState: options.mediaType === this.callConstants.CALL_MEDIA_TYPE_VIDEO ? this.callConstants.CALL_WEBRTC_VIDEO_STATE_ON : null,
                cameraType: options.mediaType === this.callConstants.CALL_MEDIA_TYPE_VIDEO ? this.callConstants.CALL_WEBRTC_CAMERA_TYPE_FRONT : null
            });

            return this.initWebRTC().then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
    };
    receiveFreeCallStart(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect free call start request, ignored'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got free call start request data'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Callin start request data',
                payload: body
            });

            if (this.callData.callId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot receive free call when currently on call'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });

                const responseBusyFreeCallPacket = {
                    service: this.serviceTypes.FREE_CALL_STATUS_CHANGED,
                    body: JSON.stringify({
                        callId: body.callId,
                        to: body.from,
                        status: this.callConstants.CALL_STATUS_FREE_CALL_BUSY
                    })
                };
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send response busy free call packet'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Response busy free call packet',
                    payload: responseBusyFreeCallPacket
                });
                this.sendPacketFunction(responseBusyFreeCallPacket).then(() => {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Send response busy free call packet successfully'
                    });
                }).catch((error) => {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                        message: 'Cannot send response busy free call data'
                    });
                });
                return;
            }

            const responseRingingFreeCallPacket = {
                service: this.serviceTypes.FREE_CALL_STATUS_CHANGED,
                body: JSON.stringify({
                    callId: body.callId,
                    to: body.from,
                    status: this.callConstants.CALL_STATUS_FREE_CALL_RINGING
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send response ringing free call packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Response ringing free call packet',
                payload: responseRingingFreeCallPacket
            });
            this.sendPacketFunction(responseRingingFreeCallPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send response ringing free call packet successfully'
                });
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send response ringing free call data'
                });
            });

            this.setCallData({
                mediaType: body.mediaType,
                isCaller: false,
                callType: this.callConstants.CALL_TYPE_FREE_CALL,
                callId: body.callId,
                callStatus: this.callConstants.CALL_STATUS_FREE_CALL_RINGING,
                fromUserId: body.from,
                toUserId: body.to
            });
            this.setWebRTCCallData({
                audioState: this.callConstants.CALL_WEBRTC_AUDIO_STATE_ON,
                videoState: body.mediaType === this.callConstants.CALL_MEDIA_TYPE_VIDEO ? this.callConstants.CALL_WEBRTC_VIDEO_STATE_ON : null,
                cameraType: body.mediaType === this.callConstants.CALL_MEDIA_TYPE_VIDEO ? this.callConstants.CALL_WEBRTC_CAMERA_TYPE_FRONT : null
            });

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got remote session description'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Remote session description',
                payload: body.sdp
            });
            this.callData.webRTC.remoteSessionDescription = new RTCSessionDescription(body.sdp);

            resolve({
                mediaType: body.mediaType,
                fromUserId: body.from,
                toUserId: body.to
            });
        });
    };
    receiveFreeCallData(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect free call data, ignored'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got free call data'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Free call data',
                payload: body
            });

            if (this.callData.callId !== body.callId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Ignore free call packet when callId not matched'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                return;
            }

            if (body.type === this.callConstants.CALL_WEBRTC_DATA_TYPE_SESSION_DESCRIPTION) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Got remote session description'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Remote session description',
                    payload: body.data
                });

                this.callData.webRTC.remoteSessionDescription = new RTCSessionDescription(body.data);

                if (this.callData.webRTC.peerConnection) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Set remote session description to peer connection'
                    });
                    this.callData.webRTC.peerConnection.setRemoteDescription(this.callData.webRTC.remoteSessionDescription).then(() => {
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                            message: 'Set remote session description success'
                        });
                    }).catch((error) => {
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                            message: 'Set remote session description fail'
                        });
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                            message: 'Set remote session description error',
                            payload: error
                        });
                    });
                }
            }

            if (body.type === this.callConstants.CALL_WEBRTC_DATA_TYPE_ICE_CANDIDATE) {
                let originalIceCandidate = new RTCIceCandidate({
                    candidate: body.data.sdp,
                    sdpMid: body.data.sdpMid,
                    sdpMLineIndex: body.data.sdpMLineIndex
                });

                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Got remote ice candidate'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Remote ice candidate',
                    payload: originalIceCandidate
                });

                this.callData.webRTC.remoteIceCandidates.push(originalIceCandidate);

                if (this.callData.webRTC.peerConnection) {
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Add remote ice candidate to peer connection'
                    });
                    this.callData.webRTC.peerConnection.addIceCandidate(originalIceCandidate).then(() => {
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                            message: 'Add remote ice candidate success'
                        });
                    }).catch((error) => {
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                            message: 'Add remote ice candidate fail'
                        });
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                            message: 'Add remote ice candidate error',
                            payload: error
                        });
                    });
                }
            }
        });
    };
    receiveFreeCallStatusChanged(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect free call status, ignored'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got free call status changed data'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Free call status changed data',
                payload: body
            });

            if (this.callData.callId !== body.callId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Ignore free call status changed packet when callId not matched'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                return;
            }

            switch (body.status) {
                case this.callConstants.CALL_STATUS_FREE_CALL_CONNECTING:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Free call status changed to connecting'
                    });
                    this.callData.callStatus = this.callConstants.CALL_STATUS_FREE_CALL_CONNECTING;
                    resolve({
                        status: this.callConstants.CALL_STATUS_FREE_CALL_CONNECTING,
                        message: 'Free call status changed to connecting'
                    });
                    break;
                case this.callConstants.CALL_STATUS_FREE_CALL_RINGING:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Free call status changed to ringing'
                    });
                    this.callData.callStatus = this.callConstants.CALL_STATUS_FREE_CALL_RINGING;
                    resolve({
                        status: this.callConstants.CALL_STATUS_FREE_CALL_RINGING,
                        message: 'Free call status changed to ringing'
                    });
                    break;
                case this.callConstants.CALL_STATUS_FREE_CALL_ANSWERED:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Free call status changed to answered'
                    });
                    this.callData.callStatus = this.callConstants.CALL_STATUS_FREE_CALL_ANSWERED;
                    resolve({
                        status: this.callConstants.CALL_STATUS_FREE_CALL_ANSWERED,
                        message: 'Free call status changed to answered'
                    });
                    break;
                case this.callConstants.CALL_STATUS_FREE_CALL_BUSY:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Free call status changed to busy, free call end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_FREE_CALL_BUSY,
                        message: 'Free call status changed to busy, free call end'
                    });
                    break;
                case this.callConstants.CALL_STATUS_FREE_CALL_REJECTED:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Free call status changed to rejected, free call end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_FREE_CALL_REJECTED,
                        message: 'Free call status changed to rejected, free call end'
                    });
                    break;
                case this.callConstants.CALL_STATUS_FREE_CALL_STOP:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Free call status changed to stop, free call end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_FREE_CALL_STOP,
                        message: 'Free call status changed to stop, free call end'
                    });
                    break;
                case this.callConstants.CALL_STATUS_FREE_CALL_NOT_ANSWERED:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Free call status changed to not answered, free call end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_FREE_CALL_NOT_ANSWERED,
                        message: 'Free call status changed to not answered, free call end'
                    });
                    break;
                default:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Free call status changed to unknown, free call end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_FREE_CALL_UNKNOWN,
                        message: 'Free call status changed to unknown, free call end'
                    });
                    break;
            }
        });
    };
    receiveFreeCallStatusChangedByMe(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect free call status by me, ignored'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got free call status by me changed data'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Free call status by me changed data',
                payload: body
            });

            if (this.callData.callId !== body.callId) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Ignore free call status by me changed packet when callId not matched'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                return;
            }

            switch (body.status) {
                case this.callConstants.CALL_STATUS_FREE_CALL_CONNECTING:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Free call status changed to connecting by me'
                    });
                    resolve({
                        status: this.callConstants.CALL_STATUS_FREE_CALL_CONNECTING,
                        message: 'Free call status changed to connecting by me'
                    });
                    break;
                case this.callConstants.CALL_STATUS_FREE_CALL_RINGING:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Free call status changed to ringing by me'
                    });
                    resolve({
                        status: this.callConstants.CALL_STATUS_FREE_CALL_RINGING,
                        message: 'Free call status changed to ringing by me'
                    });
                    break;
                case this.callConstants.CALL_STATUS_FREE_CALL_ANSWERED:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Free call status changed to answered by me, free call end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_FREE_CALL_ANSWERED,
                        message: 'Free call status changed to answered by me, free call end'
                    });
                    break;
                case this.callConstants.CALL_STATUS_FREE_CALL_BUSY:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Free call status changed to busy by me, free call end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_FREE_CALL_BUSY,
                        message: 'Free call status changed to busy by me, free call end'
                    });
                    break;
                case this.callConstants.CALL_STATUS_FREE_CALL_REJECTED:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Free call status changed to rejected by me, free call end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_FREE_CALL_REJECTED,
                        message: 'Free call status changed to rejected by me, free call end'
                    });
                    break;
                case this.callConstants.CALL_STATUS_FREE_CALL_STOP:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Free call status changed to stop by me, free call end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_FREE_CALL_STOP,
                        message: 'Free call status changed to stop by me, free call end'
                    });
                    break;
                case this.callConstants.CALL_STATUS_FREE_CALL_NOT_ANSWERED:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Free call status changed to not answered by me, free call end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_FREE_CALL_NOT_ANSWERED,
                        message: 'Free call status changed to not answered by me, free call end'
                    });
                    break;
                default:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Free call status changed to unknown by me, free call end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_FREE_CALL_UNKNOWN,
                        message: 'Free call status changed to unknown by me, free call end'
                    });
                    break;
            }
        });
    };
    sendStopFreeCall(options) {
        return new Promise((resolve, reject) => {
            if (!this.callData.callId || this.callData.callType !== this.callConstants.CALL_TYPE_FREE_CALL) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot stop free call when not currently on free call'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot stop free call when not currently on free call'
                });
                return;
            }

            if (this.callData.callStatus !== this.callConstants.CALL_STATUS_FREE_CALL_CONNECTING && this.callData.callStatus !== this.callConstants.CALL_STATUS_FREE_CALL_RINGING && this.callData.callStatus !== this.callConstants.CALL_STATUS_FREE_CALL_ANSWERED) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot stop free call when current status is not connecting or ringing or answered'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot stop free call when current status is not connecting or ringing or answered'
                });
                return;
            }

            const stopFreeCallPacket = {
                service: this.serviceTypes.FREE_CALL_STATUS_CHANGED,
                body: JSON.stringify({
                    callId: this.callData.callId,
                    to: this.callData.isCaller ? this.callData.toUserId : this.callData.fromUserId,
                    status: this.callConstants.CALL_STATUS_FREE_CALL_STOP
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send stop free call packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Stop free call packet',
                payload: stopFreeCallPacket
            });
            this.sendPacketFunction(stopFreeCallPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send stop free call packet successfully'
                });
                this.clearCallData();
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send stop free call data, stop free call fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send stop free call data, stop free call fail'
                });
            });
        });
    };
    sendAnswerFreeCall(options) {
        return new Promise((resolve, reject) => {
            if (!this.callData.callId || this.callData.callType !== this.callConstants.CALL_TYPE_FREE_CALL) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot answer free call when not currently on free call'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot answer free call when not currently on free call'
                });
                return;
            }

            if (this.callData.isCaller) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot answer free call when is caller'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot answer free call when is caller'
                });
                return;
            }

            if (this.callData.callStatus !== this.callConstants.CALL_STATUS_FREE_CALL_CONNECTING && this.callData.callStatus !== this.callConstants.CALL_STATUS_FREE_CALL_RINGING) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot answer free call when current status is not connecting or ringing'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot answer free call when current status is not connecting or ringing'
                });
                return;
            }

            return this.initWebRTC().then(() => {
                this.callData.callStatus = this.callConstants.CALL_STATUS_FREE_CALL_ANSWERED;
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
    };
    sendRejectFreeCall(options) {
        return new Promise((resolve, reject) => {
            if (!this.callData.callId || this.callData.callType !== this.callConstants.CALL_TYPE_FREE_CALL) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot reject free call when not currently on free call'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot reject free call when not currently on free call'
                });
                return;
            }

            if (this.callData.isCaller) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot reject free call when is caller'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot reject free call when is caller'
                });
                return;
            }

            if (this.callData.callStatus !== this.callConstants.CALL_STATUS_FREE_CALL_CONNECTING && this.callData.callStatus !== this.callConstants.CALL_STATUS_FREE_CALL_RINGING) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot reject free call when current status is not connecting or ringing'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot reject free call when current status is not connecting or ringing'
                });
                return;
            }

            const rejectFreeCallPacket = {
                service: this.serviceTypes.FREE_CALL_STATUS_CHANGED,
                body: JSON.stringify({
                    callId: this.callData.callId,
                    to: this.callData.fromUserId,
                    status: this.callConstants.CALL_STATUS_FREE_CALL_REJECTED
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send reject free call packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Reject free call packet',
                payload: rejectFreeCallPacket
            });
            this.sendPacketFunction(rejectFreeCallPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send reject free call packet successfully'
                });
                this.clearCallData();
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send reject free call data, reject free call fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send reject free call data, reject free call fail'
                });
            });
        });
    };
    sendNotAnswerFreeCall(options) {
        return new Promise((resolve, reject) => {
            if (!this.callData.callId || this.callData.callType !== this.callConstants.CALL_TYPE_FREE_CALL) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot not answer free call when not currently on free call'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot not answer free call when not currently on free call'
                });
                return;
            }

            if (this.callData.isCaller) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot not answer free call when is caller'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot not answer free call when is caller'
                });
                return;
            }

            if (this.callData.callStatus !== this.callConstants.CALL_STATUS_FREE_CALL_CONNECTING && this.callData.callStatus !== this.callConstants.CALL_STATUS_FREE_CALL_RINGING) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot not answer free call when current status is not connecting or ringing'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot not answer free call when current status is not connecting or ringing'
                });
                return;
            }

            const notAnswerFreeCallPacket = {
                service: this.serviceTypes.FREE_CALL_STATUS_CHANGED,
                body: JSON.stringify({
                    callId: this.callData.callId,
                    to: this.callData.fromUserId,
                    status: this.callConstants.CALL_STATUS_FREE_CALL_NOT_ANSWERED
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send not answer free call packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Not answer free call packet',
                payload: notAnswerFreeCallPacket
            });
            this.sendPacketFunction(notAnswerFreeCallPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send not answer free call packet successfully'
                });
                this.clearCallData();
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send not answer free call data, not answer free call fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send not answer free call data, not answer free call fail'
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
                mediaType: this.callConstants.CALL_MEDIA_TYPE_AUDIO,
                isCaller: true,
                callType: this.callConstants.CALL_TYPE_CALLOUT,
                callId: options.callId,
                callStatus: this.callConstants.CALL_STATUS_CALLOUT_STATUS_CONNECTING,
                toPhoneNumber: options.toPhoneNumber,
                fromPhoneNumber: options.fromPhoneNumber
            });
            this.setWebRTCCallData({
                audioState: this.callConstants.CALL_WEBRTC_AUDIO_STATE_ON
            });

            const startCalloutPacket = {
                service: this.serviceTypes.CALLOUT_START_SEND,
                body: JSON.stringify({
                    callId: this.callData.callId,
                    to: this.callData.toPhoneNumber,
                    from: this.callData.fromPhoneNumber
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
                this.clearCallData();
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

            if (this.callData.callId !== body.callId) {
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
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Ignore start callout initial because of no error'
                });
                return;
            }

            const error = {
                code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                status: this.callConstants.CALL_STATUS_CALLOUT_INITIAL_UNKNOWN,
                message: 'Unknown error'
            };
            switch (body.chargingError) {
                case this.callConstants.CALL_STATUS_CALLOUT_INITIAL_BUSY:
                    error.status = this.callConstants.CALL_STATUS_CALLOUT_INITIAL_BUSY;
                    error.message = 'The toPhoneNumber currently busy'
                    break;
                case this.callConstants.CALL_STATUS_CALLOUT_INITIAL_NOT_ENOUGH_BALANCE:
                    error.status = this.callConstants.CALL_STATUS_CALLOUT_INITIAL_NOT_ENOUGH_BALANCE;
                    error.message = 'Your account has not enough balance'
                    break;
                case this.callConstants.CALL_STATUS_CALLOUT_INITIAL_INVALID_NUMBER:
                    error.status = this.callConstants.CALL_STATUS_CALLOUT_INITIAL_INVALID_NUMBER;
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

            if (this.callData.callId !== body.callId) {
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
                resolve();
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

            if (this.callData.callId !== body.callId) {
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
                case this.callConstants.CALL_STATUS_CALLOUT_STATUS_CONNECTING:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to connecting'
                    });
                    this.callConstants.callStatus = this.callConstants.CALL_STATUS_CALLOUT_STATUS_CONNECTING;
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLOUT_STATUS_CONNECTING,
                        message: 'Callout status changed to connecting'
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLOUT_STATUS_RINGING:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to ringing'
                    });
                    this.callConstants.callStatus = this.callConstants.CALL_STATUS_CALLOUT_STATUS_RINGING;
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLOUT_STATUS_RINGING,
                        message: 'Callout status changed to ringing'
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLOUT_STATUS_ANSWERED:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to answered'
                    });
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Got remote session description'
                    });
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                        message: 'Remote session description',
                        payload: body.sdp_candidate
                    });
                    this.callData.webRTC.remoteSessionDescription = new RTCSessionDescription({
                        sdp: body.sdp_candidate,
                        type: 'answer'
                    });
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Set remote session description to peer connection'
                    });
                    this.callData.webRTC.peerConnection.setRemoteDescription(this.callData.webRTC.remoteSessionDescription).then(() => {
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                            message: 'Set remote session description success'
                        });
                    }).catch((error) => {
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                            message: 'Set remote session description fail'
                        });
                        this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                            message: 'Set remote session description error',
                            payload: error
                        });
                    });
                    this.callConstants.callStatus = this.callConstants.CALL_STATUS_CALLOUT_STATUS_ANSWERED;
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLOUT_STATUS_ANSWERED,
                        message: 'Callout status changed to answered'
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLOUT_STATUS_REJECTED:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to rejected, callout end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLOUT_STATUS_REJECTED,
                        message: 'Callout status changed to rejected, callout end'
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLOUT_STATUS_BUSY:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to busy, callout end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLOUT_STATUS_BUSY,
                        message: 'Callout status changed to busy, callout end'
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLOUT_STATUS_NOT_ANSWERED:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to not answered, callout end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLOUT_STATUS_NOT_ANSWERED,
                        message: 'Callout status changed to not answered, callout end'
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLOUT_STATUS_STOP:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to stop, callout end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLOUT_STATUS_STOP,
                        message: 'Callout status changed to stop, callout end'
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLOUT_STATUS_NOT_ENOUGH_BALANCE:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to not enough balance, callout end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLOUT_STATUS_NOT_ENOUGH_BALANCE,
                        message: 'Callout status changed to not enough balance, callout end'
                    });
                    break;
                default:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callout status changed to unknown'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLOUT_STATUS_UNKNOWN,
                        message: 'Callout status changed to unknown'
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

            if (this.callData.callStatus !== this.callConstants.CALL_STATUS_CALLOUT_STATUS_CONNECTING && this.callData.callStatus !== this.callConstants.CALL_STATUS_CALLOUT_STATUS_RINGING && this.callData.callStatus !== this.callConstants.CALL_STATUS_CALLOUT_STATUS_ANSWERED) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot stop callout when current status is not connecting or ringing or answered'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot stop callout when current status is not connecting or ringing or answered'
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
                        code: this.callConstants.CALL_STATUS_CALLIN_STATUS_BUSY
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
                    code: this.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING
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
                mediaType: this.callConstants.CALL_MEDIA_TYPE_AUDIO,
                isCaller: false,
                callType: this.callConstants.CALL_TYPE_CALLIN,
                callId: body.callId,
                callStatus: this.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING,
                callinType: body.callType,
                fromPhoneNumber: body.from,
                toPhoneNumber: body.to
            });
            this.setWebRTCCallData({
                audioState: this.callConstants.CALL_WEBRTC_AUDIO_STATE_ON
            });

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got remote session description'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Remote session description',
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

            if (this.callData.callId !== body.callId) {
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
                case this.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING_STOP:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to stop when ringing, callin end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING_STOP,
                        message: 'Callin status changed to stop when ringing, callin end'
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLIN_STATUS_STOP:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to stop, callin end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_STATUS_STOP,
                        message: 'Callin status changed to stop, callin end'
                    });
                    break;
                default:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to unknown, callin end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_STATUS_UNKNOWN,
                        message: 'Callin status changed to unknown, callin end'
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

            if (this.callData.callId !== body.callId) {
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
                case this.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to ringing by me'
                    });
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING,
                        message: 'Callin status changed to ringing by me'
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLIN_STATUS_ANSWERED:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to answered by me, callin end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_STATUS_ANSWERED,
                        message: 'Callin status changed to answered by me, callin end'
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLIN_STATUS_BUSY:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to busy by me, callin end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_STATUS_BUSY,
                        message: 'Callin status changed to busy by me, callin end'
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING_STOP:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to rejected by me, callin end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING_STOP,
                        message: 'Callin status changed to rejected by me, callin end'
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLIN_STATUS_STOP:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to stop by me, callin end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_STATUS_STOP,
                        message: 'Callin status changed to stop by me, callin end'
                    });
                    break;
                case this.callConstants.CALL_STATUS_CALLIN_STATUS_NOT_ANSWERED:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to not answered by me, callin end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_STATUS_NOT_ANSWERED,
                        message: 'Callin status changed to not answered by me, callin end'
                    });
                    break;
                default:
                    this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                        message: 'Callin status changed to unknown by me, callin end'
                    });
                    this.clearCallData();
                    resolve({
                        status: this.callConstants.CALL_STATUS_CALLIN_STATUS_UNKNOWN,
                        message: 'Callin status changed to unknown by me, callin end'
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

            if (this.callData.callStatus !== this.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot answer callin when current status is not ringing'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot answer callin when current status is not ringing'
                });
                return;
            }

            return this.initWebRTC().then(() => {
                this.callData.callStatus = this.callConstants.CALL_STATUS_CALLIN_STATUS_ANSWERED;
                resolve();
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

            if (this.callData.callStatus !== this.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot reject callin when current status is not ringing'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot reject callin when current status is not ringing'
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
                    code: this.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING_STOP
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

            if (this.callData.callStatus !== this.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot not answer callin when current status is not ringing'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot not answer callin when current status is not ringing'
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
                    code: this.callConstants.CALL_STATUS_CALLIN_STATUS_NOT_ANSWERED
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

            if (this.callData.callStatus !== this.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING || this.callData.callStatus !== this.callConstants.CALL_STATUS_CALLIN_STATUS_ANSWERED) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot stop callin when current status is not ringing or answered'
                });
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                    message: 'Current call data',
                    payload: this.callData
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_DATA,
                    message: 'Cannot stop callin when current status is not ringing or answered'
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
                    code: this.callConstants.CALL_STATUS_CALLIN_STATUS_STOP
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

            resolve({
                callId: body.data.callId,
                fromPhoneNumber: body.data.from,
                toPhoneNumber: body.data.to,
                duration: body.data.duration,
                recordTime: body.data.recordTime,
                recordUrl: body.data.urlRecord,
                userId: body.data.azUserId,
                callType: body.data.callType,
                callStatus: body.data.status
            });
        });
    };
    sendGetPaidCallLogs(options, callback) {
        return new Promise((resolve, reject) => {

            const getPaidCallLogsPacket = {
                service: this.serviceTypes.PAID_CALL_LOGS_GET,
                body: JSON.stringify({})
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send get paid call logs packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Get paid call logs packet',
                payload: getPaidCallLogsPacket
            });
            this.sendPacketFunction(getPaidCallLogsPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send get paid call logs packet successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send get paid call logs data, get paid call logs fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send get paid call logs data, get paid call logs fail'
                });
            });
        });
    };
    receivePaidCallLogs(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect paid call logs list, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect paid call logs list, get paid call logs fail'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got paid call logs list'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Paid call logs list data',
                payload: body
            });

            if (body.r !== this.errorCodes.REQUEST_SUCCESS_FROM_SERVER) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Server response with error, get paid call logs fail'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Server response with error, get paid call logs fail'
                });
                return;
            }

            let callLogs = body.data.map((item) => {
                return {
                    callId: item.callId,
                    fromPhoneNumber: item.from,
                    toPhoneNumber: item.to,
                    duration: item.duration,
                    recordTime: item.recordTime,
                    recordUrl: item.url,
                    userId: item.userId,
                    callType: item.callType,
                    callStatus: item.status
                };
            });

            resolve({
                done: this.listConstants.GET_LIST_DONE,
                list: callLogs
            });
        });
    };
};

export default Call;