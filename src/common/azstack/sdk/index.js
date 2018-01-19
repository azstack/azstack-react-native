import React from 'react';
import {
    Dimensions,
    View,
} from 'react-native';
import EventEmitter from 'EventEmitter';

import * as eventConstants from './constant/eventConstants';

import Language from './language/';
import CustomStyle from './style/';

import { AZStackCore } from '../core/';

import Event from './handler/event';

import AZStackBaseComponent from './component/AZStackBaseComponent';

export class AZStackSdk extends AZStackBaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            navigation: [],
        };

        this.eventConstants = eventConstants;

        this.Language = new Language({ languageCode: props.options.languageCode });
        this.CustomStyle = new CustomStyle({ themeName: props.options.themeName });

        this.AZStackCore = new AZStackCore(props.options.azstackConfig);
        this.AZStackCore.Delegates.onCallinStart = (error, result) => {
            this.onCallinStart(error, result);
        };
        this.AZStackCore.Delegates.onFreeCallStart = (error, result) => {
            this.onFreeCallStart(error, result);
        };

        this.EventEmitter = new EventEmitter();
        this.Event = new Event({
            eventConstants: this.eventConstants,
            AZStackCore: this.AZStackCore,
            EventEmitter: this.EventEmitter
        });
        this.Event.delegatesToEvents();
    };

    /* AZStack functions */
    connect() {
        return this.AZStackCore.connect();
    };
    disconnect() {
        return this.AZStackCore.disconnect();
    };

    getConstants(constantGroup) {
        return this.AZStackCore[constantGroup];
    }

    onCallinStart(error, result) {
        this.navigate(this.getNavigation().OnCallComponent, {
            info: {
                phoneNumber: result.fromPhoneNumber
            },
            isIncomingCall: true,
            onCallEnded: () => {
                setTimeout(() => {
                    this.pop();
                }, 1500);
            },
            onEndCall: () => {
                this.AZStackCore.stopCallin({}, (error, result) => {
                    setTimeout(() => {
                        this.pop();
                    }, 1500);
                });
            },
            onReject: () => {
                this.AZStackCore.rejectCallin({}, (error, result) => {
                    setTimeout(() => {
                        this.pop();
                    }, 1500);
                });
            },
            onAnswer: () => {
                this.AZStackCore.answerCallin({}, (error, result) => {
                });
            },
            onToggleAudio: (toOn) => {
                this.AZStackCore.toggleAudioState({
                    state: toOn === true ? this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_ON : this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_OFF
                }, (error, result) => {

                });
            },
            onToggleSpeaker: () => {

            },
            onTimeout: () => {
                this.AZStackCore.notAnsweredCallin({}, (error, result) => {
                    setTimeout(() => {
                        this.pop();
                    }, 1500);
                });
            }
        });
    }

    onFreeCallStart(error, result) {
        this.AZStackCore.getUsersInformation({
            userIds: [result.fromUserId]
        }).then((resultUser) => {
            if(resultUser.list.length > 0) {
                if(result.mediaType === this.AZStackCore.callConstants.CALL_MEDIA_TYPE_AUDIO) {
                    this.navigate(this.getNavigation().OnCallComponent, {
                        info: {
                            name: resultUser.list[0].fullname,
                            userId: resultUser.list[0].userId,
                        },
                        isIncomingCall: true,
                        onCallEnded: () => {
                            setTimeout(() => {
                                this.pop();
                            }, 1500);
                        },
                        onEndCall: () => {
                            this.AZStackCore.stopFreeCall({}, (error, result) => {
                                setTimeout(() => {
                                    this.pop();
                                }, 1500);
                            });
                        },
                        onReject: () => {
                            this.AZStackCore.rejectFreeCall({}, (error, result) => {
                                setTimeout(() => {
                                    this.pop();
                                }, 1500);
                            });
                        },
                        onAnswer: () => {
                            this.AZStackCore.answerFreeCall({}, (error, result) => {});
                        },
                        onToggleAudio: (toOn) => {
                            this.AZStackCore.toggleAudioState({
                                state: toOn === true ? this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_ON : this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_OFF
                            }, (error, result) => {
            
                            });
                        },
                        onTimeout: () => {
                            this.AZStackCore.notAnswerFreeCall({}, (error, result) => {});
                        }
                    });
                } else if(result.mediaType === this.AZStackCore.callConstants.CALL_MEDIA_TYPE_VIDEO) {
                    this.navigate(this.getNavigation().VideoCallComponent, {
                        info: {
                            name: resultUser.list[0].fullname,
                            userId: resultUser.list[0].userId,
                        },
                        isIncomingCall: true,
                        onCallEnded: () => {
                            setTimeout(() => {
                                this.pop();
                            }, 1500);
                        },
                        onEndCall: () => {
                            this.AZStackCore.stopFreeCall({}, (error, result) => {
                                setTimeout(() => {
                                    this.pop();
                                }, 1500);
                            });
                        },
                        onReject: () => {
                            this.AZStackCore.rejectFreeCall({}, (error, result) => {
                                setTimeout(() => {
                                    this.pop();
                                }, 1500);
                            });
                        },
                        onAnswer: () => {
                            this.AZStackCore.answerFreeCall({}, (error, result) => {});
                        },
                        onToggleAudio: (toOn) => {
                            this.AZStackCore.toggleAudioState({
                                state: toOn === true ? this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_ON : this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_OFF
                            }, (error, result) => {
            
                            });
                        },
                        onToggleVideo: (toOn) => {
                            this.AZStackCore.toggleVideoState({
                                state: toOn === true ? this.AZStackCore.callConstants.CALL_WEBRTC_VIDEO_STATE_ON : this.AZStackCore.callConstants.CALL_WEBRTC_VIDEO_STATE_OFF
                            }, (error, result) => {
            
                            });
                        },
                        onTimeout: () => {
                            this.AZStackCore.notAnswerFreeCall({}, (error, result) => {});
                        },
                        onSwitchCameraType: () => {
                            this.AZStackCore.switchCameraType({});
                        }
                    });
                }
            }
        }).catch((error) => {
            console.log(error);
        });
    }

    startCallout(options) {
        this.AZStackCore.startCallout({
            toPhoneNumber: options.info.phoneNumber
        }).then((result) => {

        });

        this.navigate(
            this.getNavigation().OnCallComponent, 
            {
                ...options, 
                onEndCall: () => {
                    if(options.onEndCall) {
                        options.onEndCall()
                    }
                    this.AZStackCore.stopCallout().then((result) => {
                        setTimeout(() => {
                            this.pop();
                        }, 1500);
                    });
                },
                onCallEnded: () => {
                    setTimeout(() => {
                        this.pop();
                    }, 1500);
                },
                onToggleAudio: (toOn) => {
                    this.AZStackCore.toggleAudioState({
                        state: toOn === true ? this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_ON : this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_OFF
                    }, (error, result) => {
    
                    });
                },
            }
        );
    }

    startAudioCall(options) {
        this.AZStackCore.startFreeCall({
            mediaType: this.AZStackCore.callConstants.CALL_MEDIA_TYPE_AUDIO,
            toUserId: options.info.userId,
        }).then((result) => {

        });

        this.navigate(
            this.getNavigation().OnCallComponent, 
            {
                ...options, 
                onEndCall: () => {
                    if(options.onEndCall) {
                        options.onEndCall()
                    }

                    this.AZStackCore.stopFreeCall().then((result) => {
                        setTimeout(() => {
                            this.pop();
                        }, 1500);
                    });
                }, 
                onCallEnded: () => {
                    setTimeout(() => {
                        this.pop();
                    }, 1500);
                },
                onToggleAudio: (toOn) => {
                    this.AZStackCore.toggleAudioState({
                        state: toOn === true ? this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_ON : this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_OFF
                    }, (error, result) => {
    
                    });
                },
            }
        );
    }

    startVideoCall(options) {
        this.AZStackCore.startFreeCall({
            mediaType: this.AZStackCore.callConstants.CALL_MEDIA_TYPE_VIDEO,
            toUserId: options.info.userId,
        }).then((result) => {

        });

        this.navigate(
            this.getNavigation().VideoCallComponent, 
            {
                ...options, 
                onEndCall: () => {
                    if(options.onEndCall) {
                        options.onEndCall()
                    }

                    this.AZStackCore.stopFreeCall().then((result) => {
                        setTimeout(() => {
                            this.pop();
                        }, 1500);
                    });
                },
                onCallEnded: () => {
                    setTimeout(() => {
                        this.pop();
                    }, 1500);
                },
                onSwitchCameraType: () => {
                    this.AZStackCore.switchCameraType({});
                },
                onToggleAudio: (toOn) => {
                    this.AZStackCore.toggleAudioState({
                        state: toOn === true ? this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_ON : this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_OFF
                    }, (error, result) => {

                    });
                },
                onToggleVideo: (toOn) => {
                    this.AZStackCore.toggleVideoState({
                        state: toOn === true ? this.AZStackCore.callConstants.CALL_WEBRTC_VIDEO_STATE_ON : this.AZStackCore.callConstants.CALL_WEBRTC_VIDEO_STATE_OFF
                    }, (error, result) => {
    
                    });
                },
            }
        );
    }

    showNumberPad(options,) {
        this.navigate(
            this.getNavigation().NumberPadComponent, 
            {
                ...options,
                onCallout: (options) => {
                    this.startCallout(options);
                },
                onBackButtonPressed: () => {
                    this.pop();
                },
            }
        );
    }

    showContacts(options) {
        this.navigate(
            this.getNavigation().ContactComponent, 
            {
                ...options,
                onVideoCall: (options) => {
                    this.startVideoCall(options);
                },
                onAudioCall: (options) => {
                    this.startAudioCall(options);
                },
                onCallout: (options) => {
                    this.startCallout(options);
                }
            }
        );
    }

    showCallLogs(options) {
        this.navigate(
            this.getNavigation().CallLogsComponent, 
            {
                ...options,
                onVideoCall: (options) => {
                    this.startVideoCall(options);
                },
                onAudioCall: (options) => {
                    this.startAudioCall(options);
                },
                onCallout: (options) => {
                    this.startCallout(options);
                }
            }
        );
    }

    startChat({ chatType, chatId, ...rest }) {
        this.navigate(this.getNavigation().ChatComponent, { chatType, chatId, ...rest});
    }

    showConversations(options) {
        this.navigate(this.getNavigation().ConversationsComponent, {
            ...options,
            onPressConversation: (conversation) => {
                if(typeof options.onPressConversation === 'function') {
                    options.onPressConversation();
                }

                if(options.prevenDefault !== true) {
                    this.navigate(this.getNavigation().ChatComponent, {
                        chatType: conversation.chatType,
                        chatId: conversation.chatId,
                    });
                }
            },
        });
    }
};