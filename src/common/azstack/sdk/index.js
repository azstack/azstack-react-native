import React from 'react';
import {
    Dimensions,
    View,
    Alert,
} from 'react-native';
import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';

import * as eventConstants from './constant/eventConstants';
import * as linkConstants from './constant/linkConstants';

import Language from './language/';
import CustomStyle from './style/';

import { AZStackCore } from '../core/';

import Event from './handler/event';
import Member from './handler/member';

import AZStackBaseComponent from './component/AZStackBaseComponent';

export class AZStackSdk extends AZStackBaseComponent {
    constructor(props) {
        super(props);
        this.subscriptions = {};
        this.members = [];
        this.state = {
            navigation: []
        };

        this.eventConstants = eventConstants;
        this.linkConstants = linkConstants;

        this.Language = new Language({ languageCode: props.options.languageCode });
        this.CustomStyle = new CustomStyle({ themeName: props.options.themeName });

        this.AZStackCore = new AZStackCore(props.options.azstackConfig);
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_CALLIN_START] = (error, result) => {
            this.onCallinStart(error, result);
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_FREE_CALL_START] = (error, result) => {
            this.onFreeCallStart(error, result);
        };

        this.EventEmitter = new EventEmitter();
        this.Event = new Event({
            eventConstants: this.eventConstants,
            AZStackCore: this.AZStackCore,
            EventEmitter: this.EventEmitter
        });
        this.Event.delegatesToEvents();

        this.Member = new Member({
            AZStackCore: this.AZStackCore
        });
    };

    addSubscriptions() {
        this.subscriptions.onConnected = this.EventEmitter.addListener(this.eventConstants.EVENT_NAME_CONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
        this.subscriptions.onAutoReconnected = this.EventEmitter.addListener(this.eventConstants.EVENT_NAME_ON_AUTO_RECONNECTED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
        this.subscriptions.onReconnected = this.EventEmitter.addListener(this.eventConstants.EVENT_NAME_RECONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

    getMembers() {
        if (!this.AZStackCore.slaveSocketConnected) {
            return;
        }
        this.Member.prepareMembers({ rawMembers: this.props.options.members }).then((result) => {
            this.members = result;
            this.EventEmitter.emit(this.eventConstants.EVENT_NAME_ON_MEMBERS_CHANGED, { error: null, result });
        }).catch(() => { });
    };
    initRun() {
        this.getMembers();
    };

    componentDidMount() {
        this.addSubscriptions();
        this.initRun();
    };
    componentWillUnmount() {
        this.clearSubscriptions();
    };

    render() {
        const { children } = this.props;

        var childrenWithProps = React.Children.map(children, child => {
            return React.cloneElement(child, { AZStackSdk: this })
        });

        return (
            <View style={{ flex: 1 }}>
                {childrenWithProps}
                {this.renderScreens()}
            </View>
        );
    };

    /* AZStack functions */
    connect() {
        return this.AZStackCore.connect();
    };
    reconnect() {
        return this.AZStackCore.reconnect();
    };
    disconnect() {
        return this.AZStackCore.disconnect();
    };

    getConstants(constantGroup) {
        return this.AZStackCore[constantGroup];
    };

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
    };
    onFreeCallStart(error, result) {
        this.AZStackCore.getUsersInformation({
            userIds: [result.fromUserId]
        }).then((resultUser) => {
            if (resultUser.list.length > 0) {
                if (result.mediaType === this.AZStackCore.callConstants.CALL_MEDIA_TYPE_AUDIO) {
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
                            this.AZStackCore.answerFreeCall({}, (error, result) => { });
                        },
                        onToggleAudio: (toOn) => {
                            this.AZStackCore.toggleAudioState({
                                state: toOn === true ? this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_ON : this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_OFF
                            }, (error, result) => {

                            });
                        },
                        onTimeout: () => {
                            this.AZStackCore.notAnswerFreeCall({}, (error, result) => { });
                        }
                    });
                } else if (result.mediaType === this.AZStackCore.callConstants.CALL_MEDIA_TYPE_VIDEO) {
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
                            this.AZStackCore.answerFreeCall({}, (error, result) => { });
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
                            this.AZStackCore.notAnswerFreeCall({}, (error, result) => { });
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
    };

    startCallout(options) {
        this.AZStackCore.startCallout({
            toPhoneNumber: options.info.phoneNumber
        }).then((result) => {
            this.navigate(
                this.getNavigation().OnCallComponent,
                {
                    ...options,
                    onEndCall: () => {
                        if (options.onEndCall) {
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
        }).catch((error) => {
            Alert.alert("Error", error.message, [{ text: 'OK', onPress: () => { } }]);
        });
    };
    startAudioCall(options) {
        this.AZStackCore.startFreeCall({
            mediaType: this.AZStackCore.callConstants.CALL_MEDIA_TYPE_AUDIO,
            toUserId: options.info.userId,
        }).then((result) => {
            this.navigate(
                this.getNavigation().OnCallComponent,
                {
                    ...options,
                    onEndCall: () => {
                        if (options.onEndCall) {
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
        }).catch((error) => {
            Alert.alert("Error", error.message, [{ text: 'OK', onPress: () => { } }]);
        });
    };
    startVideoCall(options) {
        this.AZStackCore.startFreeCall({
            mediaType: this.AZStackCore.callConstants.CALL_MEDIA_TYPE_VIDEO,
            toUserId: options.info.userId,
        }).then((result) => {
            this.navigate(
                this.getNavigation().VideoCallComponent,
                {
                    ...options,
                    onEndCall: () => {
                        if (options.onEndCall) {
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
        }).catch((error) => {
            Alert.alert("Error", error.message, [{ text: 'OK', onPress: () => { } }]);
        });
    };
    startChat(options) {
        this.navigate(this.getNavigation().ChatComponent, {
            ...options,
            onBackButtonPressed: () => {
                if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                    options.onBackButtonPressed();
                    return;
                }

                this.pop();
            }
        });
    };

    showNumberPad(options) {
        this.navigate(
            this.getNavigation().NumberPadComponent,
            {
                ...options,
                onBackButtonPressed: () => {
                    if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                        options.onBackButtonPressed();
                        return;
                    }

                    this.pop();
                },
                onCallout: (options) => {
                    this.startCallout(options);
                }
            }
        );
    };
    showContacts(options) {
        this.navigate(
            this.getNavigation().ContactComponent,
            {
                ...options,
                onBackButtonPressed: () => {
                    if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                        options.onBackButtonPressed();
                        return;
                    }

                    this.pop();
                },
                onVideoCall: (options) => {
                    this.startVideoCall(options);
                },
                onAudioCall: (options) => {
                    this.startAudioCall(options);
                },
                onCallout: (options) => {
                    this.startCallout(options);
                },
            }
        );
    };
    showCallLogs(options) {
        this.navigate(
            this.getNavigation().CallLogsComponent,
            {
                ...options,
                onBackButtonPressed: () => {
                    if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                        options.onBackButtonPressed();
                        return;
                    }

                    this.pop();
                },
                onVideoCall: (options) => {
                    this.startVideoCall(options);
                },
                onAudioCall: (options) => {
                    this.startAudioCall(options);
                },
                onCallout: (options) => {
                    this.startCallout(options);
                },
            }
        );
    };
    showConversations(options) {
        this.navigate(this.getNavigation().ConversationsComponent, {
            ...options,
            onBackButtonPressed: () => {
                if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                    options.onBackButtonPressed();
                    return;
                }

                this.pop();
            },
            onPressConversation: (conversation) => {
                if (options && typeof options === 'object' && typeof options.onPressConversation === 'function') {
                    options.onPressConversation();
                    return;
                }

                this.startChat({
                    chatType: conversation.chatType,
                    chatId: conversation.chatId,
                });
            },
        });
    };
    showUser(options) {
        this.navigate(this.getNavigation().UserComponent, {
            ...options,
            onBackButtonPressed: () => {
                if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                    options.onBackButtonPressed();
                    return;
                }

                this.pop();
            }
        });
    };
    showGroup(options) {
        this.navigate(this.getNavigation().GroupComponent, {
            ...options,
            onBackButtonPressed: () => {
                if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                    options.onBackButtonPressed();
                    return;
                }

                this.pop();
            }
        });
    };

    UIContacts(options) {
        return this.renderScreen(
            this.getNavigation().ConversationsComponent,
            {
                ...options,
                onBackButtonPressed: () => {
                    if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                        options.onBackButtonPressed();
                        return;
                    }

                    this.pop();
                },
                onVideoCall: (options) => {
                    this.startVideoCall(options);
                },
                onAudioCall: (options) => {
                    this.startAudioCall(options);
                },
                onCallout: (options) => {
                    this.startCallout(options);
                },
            },
            0
        );
    };
    UICallLogs(options) {
        return this.renderScreen(
            this.getNavigation().CallLogsComponent,
            {
                ...options,
                onBackButtonPressed: () => {
                    if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                        options.onBackButtonPressed();
                        return;
                    }

                    this.pop();
                },
                onVideoCall: (options) => {
                    this.startVideoCall(options);
                },
                onAudioCall: (options) => {
                    this.startAudioCall(options);
                },
                onCallout: (options) => {
                    this.startCallout(options);
                }
            },
            0
        );
    };
    UINumberPad(options) {
        return this.renderScreen(
            this.getNavigation().NumberPadComponent,
            {
                ...options,
                onBackButtonPressed: () => {
                    if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                        options.onBackButtonPressed();
                        return;
                    }

                    this.pop();
                },
                onCallout: (options) => {
                    this.startCallout(options);
                },
            },
            0
        );
    };
    UIConversations(options) {
        return this.renderScreen(
            this.getNavigation().ConversationsComponent,
            {
                ...options,
                onBackButtonPressed: () => {
                    if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                        options.onBackButtonPressed();
                        return;
                    }

                    this.pop();
                },
                onPressConversation: (conversation) => {
                    if (options && typeof options === 'object' && typeof options.onPressConversation === 'function') {
                        options.onPressConversation();
                    }

                    this.startChat({
                        chatType: conversation.chatType,
                        chatId: conversation.chatId,
                    });
                },
            },
            0
        );
    };
    UIChat(options) {
        return this.renderScreen(
            this.getNavigation().ChatComponent,
            {
                ...options,
                onBackButtonPressed: () => {
                    if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                        options.onBackButtonPressed();
                        return;
                    }

                    this.pop();
                }
            },
            0
        );
    };
    UIUser(options) {
        return this.renderScreen(
            this.getNavigation().UserComponent,
            {
                ...options,
                onBackButtonPressed: () => {
                    if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                        options.onBackButtonPressed();
                        return;
                    }

                    this.pop();
                }
            },
            0
        );
    };
    UIGroup(options) {
        return this.renderScreen(
            this.getNavigation().GroupComponent,
            {
                ...options,
                onBackButtonPressed: () => {
                    if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                        options.onBackButtonPressed();
                        return;
                    }

                    this.pop();
                }
            },
            0
        );
    };
};