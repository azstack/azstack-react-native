import React from 'react';
import {
    Platform,
    AppState,
    Keyboard,
    Alert,
    Dimensions,
    View
} from 'react-native';
import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';
import DeviceInfo from 'react-native-device-info';

import * as eventConstants from './constant/eventConstants';
import * as linkConstants from './constant/linkConstants';
import * as limitConstants from './constant/limitConstants';

import Language from './language/';
import CustomStyle from './style/';

import { AZStackCore } from '../core/';

import DateTimeFormatter from './helper/dateTimeFormatter';
import FileConverter from './helper/fileConverter';
import Diacritic from './helper/diacritic';

import Event from './handler/event';
import Member from './handler/member';
import PhoneNumber from './handler/phoneNumber';
import Message from './handler/message';
import Call from './handler/call';
import Notification from './handler/notification';

import AZStackNavigation from './AZStackNavigation';

export class AZStackSdk extends AZStackNavigation {
    constructor(props) {
        super(props);
        this.subscriptions = {};
        this.state = {
            navigation: []
        };

        this.eventConstants = eventConstants;
        this.linkConstants = linkConstants;
        this.limitConstants = limitConstants;

        this.defaultLayout = {
            withStatusbar: true,
            withHeader: true,
            screenStyle: {},
            statusbarStyle: {}
        };

        if (props.options.defaultLayout && typeof props.options.defaultLayout === 'object') {
            if (typeof props.options.defaultLayout.withStatusbar === 'boolean') {
                this.defaultLayout.withStatusbar = props.options.defaultLayout.withStatusbar;
            }
            if (typeof props.options.defaultLayout.withHeader === 'boolean') {
                this.defaultLayout.withHeader = props.options.defaultLayout.withHeader;
            }
            if (typeof props.options.defaultLayout.screenStyle === 'object') {
                for (let field in props.options.defaultLayout.screenStyle) {
                    if (typeof props.options.defaultLayout.screenStyle[field] === 'string' || !isNaN(typeof props.options.defaultLayout.screenStyle[field])) {
                        this.defaultLayout.screenStyle[field] = props.options.defaultLayout.screenStyle[field];
                    }
                }
            }
            if (typeof props.options.defaultLayout.statusbarStyle === 'object') {
                for (let field in props.options.defaultLayout.statusbarStyle) {
                    if (typeof props.options.defaultLayout.statusbarStyle[field] === 'string' || !isNaN(typeof props.options.defaultLayout.statusbarStyle[field])) {
                        this.defaultLayout.statusbarStyle[field] = props.options.defaultLayout.statusbarStyle[field];
                    }
                }
            }
        }

        this.Language = new Language({ languageCode: props.options.languageCode });
        this.CustomStyle = new CustomStyle({ themeName: props.options.themeName });

        this.AZStackCore = new AZStackCore(props.options.azstackConfig);
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_CALLIN_START] = (error, result) => {
            this.onCallinStart(error, result);
        };
        this.AZStackCore.Delegates[this.AZStackCore.delegateConstants.DELEGATE_ON_FREE_CALL_START] = (error, result) => {
            this.onFreeCallStart(error, result);
        };

        this.DateTimeFormatter = new DateTimeFormatter();
        this.FileConverter = new FileConverter();
        this.Diacritic = new Diacritic();

        this.EventEmitter = new EventEmitter();
        this.Event = new Event({
            eventConstants: this.eventConstants,
            AZStackCore: this.AZStackCore,
            EventEmitter: this.EventEmitter
        });
        this.Event.delegatesToEvents();

        this.Member = new Member();
        if (this.props.options.getInitialMembers && typeof this.props.options.getInitialMembers === 'function') {
            this.Member.getInitialMembers = this.props.options.getInitialMembers;
        }
        if (this.props.options.getMoreMembers && typeof this.props.options.getMoreMembers === 'function') {
            this.Member.getMoreMembers = this.props.options.getMoreMembers;
        }

        this.PhoneNumber = new PhoneNumber();
        if (this.props.options.getFromPhoneNumbers && typeof this.props.options.getFromPhoneNumbers === 'function') {
            this.PhoneNumber.getFromPhoneNumbers = this.props.options.getFromPhoneNumbers;
        }

        this.Message = new Message();
        if (this.props.options.onBeforeMessageSend && typeof this.props.options.onBeforeMessageSend === 'function') {
            this.Message.onBeforeMessageSend = this.props.options.onBeforeMessageSend;
        }

        this.Call = new Call();
        if (this.props.options.onBeforeCalloutStart && typeof this.props.options.onBeforeCalloutStart === 'function') {
            this.Call.onBeforeCalloutStart = this.props.options.onBeforeCalloutStart;
        }

        this.Notification = new Notification({
            AZStackCore: this.AZStackCore
        });
        this.deviceToken = null;
        this.devicePlatformOS = Platform.OS === 'android' ? this.AZStackCore.platformConstants.PLATFORM_ANDROID : (Platform.OS === 'ios' ? this.AZStackCore.platformConstants.PLATFORM_IOS : this.AZStackCore.platformConstants.PLATFORM_WEB);
        this.applicationBundleId = DeviceInfo.getBundleId();

        this.getCoreInstances = this.getCoreInstances.bind(this);

        this.handleAppStateChange = this.handleAppStateChange.bind(this);
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
        this.subscriptions.onReconnected = this.EventEmitter.addListener(this.eventConstants.EVENT_NAME_ON_RECONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
        this.subscriptions.onDisconnectReturn = this.EventEmitter.addListener(this.eventConstants.EVENT_NAME_ON_DISCONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.deviceToken = null;
        });
    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

    registerDeviceToken() {
        if (!this.AZStackCore.slaveSocketConnected) {
            return;
        }
        if (this.deviceToken) {
            return;
        }
        this.Notification.init().then((deviceToken) => {
            this.deviceToken = deviceToken;
            this.AZStackCore.notificationRegisterDevice({
                deviceToken: this.deviceToken,
                devicePlatformOS: this.devicePlatformOS,
                applicationBundleId: this.applicationBundleId
            }).then((result) => { }).catch((error) => { });
        }).catch((error) => { });
    };
    getInitialNotification() {
        this.Notification.getInitialNotification().then((notification) => {
            console.log('initial notification');
            console.log(notification);
        }).catch((error) => {
            console.log('initial notification error');
            console.log(error);
        });
    };
    handleAppStateChange(nextAppState) {
        if (!!this.AZStackCore && this.AZStackCore.slaveSocketConnected) {
            this.AZStackCore.changeApplicationState({
                state: nextAppState === 'active' ? this.AZStackCore.applicationStateConstants.APPLICATION_STATE_FOREGROUND : this.AZStackCore.applicationStateConstants.APPLICATION_STATE_BACKGROUND
            }).then(() => { }).catch(() => { });
        };

        if (nextAppState === 'active') {
            if (Platform.OS === 'android') {
                this.getInitialNotification();
            }
        }
    };
    initRun() {
        this.registerDeviceToken();
    };

    getCoreInstances() {
        return {

            defaultLayout: this.defaultLayout,

            eventConstants: this.eventConstants,
            linkConstants: this.linkConstants,
            limitConstants: this.limitConstants,

            Language: this.Language,
            CustomStyle: this.CustomStyle,

            AZStackCore: this.AZStackCore,

            DateTimeFormatter: this.DateTimeFormatter,
            FileConverter: this.FileConverter,
            Diacritic: this.Diacritic,

            EventEmitter: this.EventEmitter,

            Member: this.Member,
            Message: this.Message,
            PhoneNumber: this.PhoneNumber,
            Call: this.Call
        };
    };

    componentDidMount() {
        this.addSubscriptions();
        this.initRun();
        AppState.addEventListener('change', this.handleAppStateChange);
        if (Platform.OS === 'ios') {
            this.getInitialNotification();
        }
    };
    componentWillUnmount() {
        this.clearSubscriptions();
        AppState.removeEventListener('change', this.handleAppStateChange);
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
    connect(options) {
        return this.AZStackCore.connect(options);
    };
    reconnect() {
        return this.AZStackCore.reconnect();
    };
    disconnect() {
        return this.AZStackCore.disconnect();
    };

    onCallinStart(error, result) {
        this.navigate(this.getNavigation().VoiceCallComponent, {
            withBackButtonHandler: true,
            info: {
                fullname: '',
                phoneNumber: result.fromPhoneNumber
            },
            isIncomingCall: true,
            onCallEnded: () => {
                setTimeout(() => {
                    this.pop();
                }, 1500);
            },
            endCall: () => {
                this.AZStackCore.stopCallin({}, (error, result) => {
                    setTimeout(() => {
                        this.pop();
                    }, 1500);
                });
            },
            rejectCall: () => {
                this.AZStackCore.rejectCallin({}, (error, result) => {
                    setTimeout(() => {
                        this.pop();
                    }, 1500);
                });
            },
            answerCall: () => {
                this.AZStackCore.answerCallin({}, (error, result) => {
                });
            },
            notAnswerCall: () => {
                this.AZStackCore.notAnsweredCallin({}, (error, result) => {
                    setTimeout(() => {
                        this.pop();
                    }, 1500);
                });
            },
            toggleAudio: (toOn) => {
                this.AZStackCore.toggleAudioState({
                    state: toOn === true ? this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_ON : this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_OFF
                }, (error, result) => {

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
                    this.navigate(this.getNavigation().VoiceCallComponent, {
                        withBackButtonHandler: true,
                        info: {
                            fullname: resultUser.list[0].fullname,
                            phoneNumber: ''
                        },
                        isIncomingCall: true,
                        onCallEnded: () => {
                            setTimeout(() => {
                                this.pop();
                            }, 1500);
                        },
                        endCall: () => {
                            this.AZStackCore.stopFreeCall({}, (error, result) => {
                                setTimeout(() => {
                                    this.pop();
                                }, 1500);
                            });
                        },
                        rejectCall: () => {
                            this.AZStackCore.rejectFreeCall({}, (error, result) => {
                                setTimeout(() => {
                                    this.pop();
                                }, 1500);
                            });
                        },
                        answerCall: () => {
                            this.AZStackCore.answerFreeCall({}, (error, result) => { });
                        },
                        notAnswerCall: () => {
                            this.AZStackCore.notAnswerFreeCall({}, (error, result) => { });
                        },
                        toggleAudio: (toOn) => {
                            this.AZStackCore.toggleAudioState({
                                state: toOn === true ? this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_ON : this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_OFF
                            }, (error, result) => {

                            });
                        }
                    });
                } else if (result.mediaType === this.AZStackCore.callConstants.CALL_MEDIA_TYPE_VIDEO) {
                    this.navigate(this.getNavigation().VideoCallComponent, {
                        withBackButtonHandler: true,
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
        this.Call.onBeforeCalloutStart({
            toPhoneNumber: options.info.toPhoneNumber,
            fromPhoneNumber: options.info.fromPhoneNumber
        }).then((preparedCalloutData) => {
            this.navigate(
                this.getNavigation().VoiceCallComponent,
                {
                    ...options,
                    info: {
                        fullname: options.info.fullname,
                        phoneNumber: options.info.toPhoneNumber
                    },
                    withBackButtonHandler: true,
                    onCallEnded: () => {
                        if (options.onCallEnded) {
                            options.onCallEnded();
                            return;
                        }
                        setTimeout(() => {
                            this.pop();
                        }, 1500);
                    },
                    endCall: () => {
                        if (options.endCall) {
                            options.endCall();
                            return;
                        }
                        this.AZStackCore.stopCallout().then((result) => { });
                        setTimeout(() => {
                            this.pop();
                        }, 1500);
                    },
                    toggleAudio: (toOn) => {
                        this.AZStackCore.toggleAudioState({
                            state: toOn === true ? this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_ON : this.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_OFF
                        }, (error, result) => {

                        });
                    },
                }
            );
            this.AZStackCore.startCallout(preparedCalloutData).then((result) => {
            }).catch((error) => {
                Alert.alert("Error", error.message, [{ text: 'OK', onPress: () => { } }]);
            });
        }).catch((error) => { });
    };
    startAudioCall(options) {
        this.AZStackCore.startFreeCall({
            mediaType: this.AZStackCore.callConstants.CALL_MEDIA_TYPE_AUDIO,
            toUserId: options.info.userId
        }).then((result) => {
            this.navigate(
                this.getNavigation().VoiceCallComponent,
                {
                    ...options,
                    info: {
                        fullname: options.info.fullname,
                        phoneNumber: ''
                    },
                    withBackButtonHandler: true,
                    onCallEnded: () => {
                        if (options.onCallEnded) {
                            options.onCallEnded();
                            return;
                        }
                        setTimeout(() => {
                            this.pop();
                        }, 1500);
                    },
                    endCall: () => {
                        if (options.endCall) {
                            options.endCall();
                            return;
                        }

                        this.AZStackCore.stopFreeCall().then((result) => {
                            setTimeout(() => {
                                this.pop();
                            }, 1500);
                        });
                    },
                    toggleAudio: (toOn) => {
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
                    withBackButtonHandler: true,
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
            withBackButtonHandler: true,
            onBackButtonPressed: () => {
                if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                    options.onBackButtonPressed();
                    return;
                }

                this.pop();
            },
            showImageGallery: (event) => {
                this.showImageGallery(event);
            },
            showLocationMap: (event) => {
                this.showLocationMap(event);
            },
            showSketchDrawing: (event) => {
                this.showSketchDrawing(event);
            },
            showStickersList: (event) => {
                this.showStickersList(event);
            },
            showStickerDetails: (event) => {
                this.showStickerDetails(event);
            },
            onChatTargetPressed: (event) => {
                if (options && typeof options === 'object' && typeof options.onChatTargetPressed === 'function') {
                    options.onChatTargetPressed(event);
                    return;
                }

                if (event.chatType === this.AZStackCore.chatConstants.CHAT_TYPE_USER) {
                    this.showUser({
                        userId: event.chatTarget.userId
                    });
                } else if (event.chatType === this.AZStackCore.chatConstants.CHAT_TYPE_GROUP) {
                    this.showGroup({
                        groupId: event.chatTarget.groupId
                    })
                }
            },
            onSenderPressed: (event) => {
                if (options && typeof options === 'object' && typeof options.onSenderPressed === 'function') {
                    options.onSenderPressed(event);
                    return;
                }

                this.showUser({
                    userId: event.userId
                });
            },
            onVoiceCallButtonPressed: (event) => {
                if (options && typeof options === 'object' && typeof options.onVoiceCallButtonPressed === 'function') {
                    options.onVoiceCallButtonPressed(event);
                    return;
                }

                Keyboard.dismiss();
                this.startAudioCall({
                    info: {
                        userId: event.userId,
                        fullname: event.fullname
                    }
                });
            },
            onVideoCallButtonPressed: (event) => {
                if (options && typeof options === 'object' && typeof options.onVideoCallButtonPressed === 'function') {
                    options.onVideoCallButtonPressed();
                    return;
                }

                Keyboard.dismiss();
                this.startVideoCall({
                    info: {
                        userId: event.userId
                    }
                });
            }
        });
    };
    showNumberPad(options) {
        this.navigate(
            this.getNavigation().NumberPadComponent,
            {
                ...options,
                withBackButtonHandler: true,
                onBackButtonPressed: () => {
                    if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                        options.onBackButtonPressed();
                        return;
                    }

                    this.pop();
                },
                showSelectPhoneNumber: (options) => {
                    this.showSelectPhoneNumber(options)
                },
                startCallout: (options) => {
                    this.startCallout(options);
                }
            }
        );
    };
    showCallLogs(options) {
        this.navigate(
            this.getNavigation().CallLogsComponent,
            {
                ...options,
                withBackButtonHandler: true,
                onBackButtonPressed: () => {
                    if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                        options.onBackButtonPressed();
                        return;
                    }

                    this.pop();
                },
                onCallLogItemPressed: (event) => {
                    if (options && typeof options === 'object' && typeof options.onCallLogItemPressed === 'function') {
                        options.onCallLogItemPressed(event);
                        return;
                    }
                    this.startCallout({
                        info: {
                            phoneNumber: event.phoneNumber
                        }
                    });
                }
            }
        );
    };
    showConversations(options) {
        this.navigate(this.getNavigation().ConversationsComponent, {
            ...options,
            withBackButtonHandler: true,
            onBackButtonPressed: () => {
                if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                    options.onBackButtonPressed();
                    return;
                }

                this.pop();
            },
            showSelectMembers: (event) => {
                this.showSelectMembers(event);
            },
            showGroupInputName: (event) => {
                this.showGroupInputName(event);
            },
            onConversationPressed: (event) => {
                if (options && typeof options === 'object' && typeof options.onConversationPressed === 'function') {
                    options.onConversationPressed(event);
                    return;
                }

                this.startChat({
                    chatType: event.conversation.chatType,
                    chatId: event.conversation.chatId,
                });
            },
            onNewChat: (event) => {
                if (options && typeof options === 'object' && typeof options.onNewChat === 'function') {
                    options.onNewChat(event);
                    return;
                }

                this.startChat({
                    chatType: event.chatType,
                    chatId: event.chatId,
                });
            }
        });
    };
    showUser(options) {
        this.navigate(this.getNavigation().UserComponent, {
            ...options,
            withBackButtonHandler: true,
            onBackButtonPressed: () => {
                if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                    options.onBackButtonPressed();
                    return;
                }

                this.pop();
            },
            onStartChatButtonPressed: (event) => {
                if (options && typeof options === 'object' && typeof options.onStartChatButtonPressed === 'function') {
                    options.onStartChatButtonPressed(event);
                    return;
                }

                this.startChat({
                    chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
                    chatId: event.userId,
                });
            },
            onVoiceCallButtonPressed: (event) => {
                if (options && typeof options === 'object' && typeof options.onVoiceCallButtonPressed === 'function') {
                    options.onVoiceCallButtonPressed(event);
                    return;
                }

                this.startAudioCall({
                    info: {
                        userId: event.userId,
                        fullname: event.fullname
                    }
                });
            },
            onVideoCallButtonPressed: (event) => {
                if (options && typeof options === 'object' && typeof options.onVideoCallButtonPressed === 'function') {
                    options.onVideoCallButtonPressed(event);
                    return;
                }

                this.startVideoCall({
                    info: {
                        userId: event.userId
                    }
                });
            }
        });
    };
    showGroup(options) {
        this.navigate(this.getNavigation().GroupComponent, {
            ...options,
            withBackButtonHandler: true,
            onBackButtonPressed: () => {
                if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                    options.onBackButtonPressed();
                    return;
                }

                this.pop();
            },
            showSelectMembers: (event) => {
                this.showSelectMembers(event);
            },
            showSelectMember: (event) => {
                this.showSelectMember(event);
            },
            onMemberPressed: (event) => {
                if (options && typeof options === 'object' && typeof options.onMemberPressed === 'function') {
                    options.onMemberPressed(event);
                    return;
                }

                if (event.member.userId === this.AZStackCore.authenticatedUser.userId) {
                    return;
                }

                this.showUser({
                    userId: event.member.userId
                });
            }
        });
    };
    showSelectMembers(options) {
        this.navigate(this.getNavigation().SelectMembersComponent, {
            ...options,
            withBackButtonHandler: true,
            onBackButtonPressed: () => {
                if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                    options.onBackButtonPressed();
                    return;
                }

                this.pop();
            },
            onSelectDone: (event) => {
                if (options && typeof options === 'object' && typeof options.onSelectDone === 'function') {
                    options.onSelectDone(event);
                    return;
                }
            },
            onDoneClose: () => {
                if (options && typeof options === 'object' && typeof options.onDoneClose === 'function') {
                    options.onDoneClose(event);
                    return;
                }

                this.pop();
            }
        });
    };
    showSelectMember(options) {
        this.navigate(this.getNavigation().SelectMemberComponent, {
            ...options,
            withBackButtonHandler: true,
            onBackButtonPressed: () => {
                if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                    options.onBackButtonPressed();
                    return;
                }

                this.pop();
            },
            onSelectDone: (event) => {
                if (options && typeof options === 'object' && typeof options.onSelectDone === 'function') {
                    options.onSelectDone(event);
                    return;
                }
            },
            onDoneClose: () => {
                if (options && typeof options === 'object' && typeof options.onDoneClose === 'function') {
                    options.onDoneClose(event);
                    return;
                }

                this.pop();
            }
        });
    };
    showGroupInputName(options) {
        this.navigate(this.getNavigation().GroupInputNameComponent, {
            ...options,
            withBackButtonHandler: true,
            onBackButtonPressed: () => {
                if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                    options.onBackButtonPressed();
                    return;
                }

                this.pop();
            },
            onInputDone: (event) => {
                if (options && typeof options === 'object' && typeof options.onInputDone === 'function') {
                    options.onInputDone(event);
                    return;
                }
            },
            onDoneClose: () => {
                if (options && typeof options === 'object' && typeof options.onDoneClose === 'function') {
                    options.onDoneClose();
                    return;
                }

                this.pop();
            }
        });
    };
    showImageGallery(options) {
        this.navigate(this.getNavigation().ImageGalleryComponent, {
            ...options,
            withBackButtonHandler: true,
            onBackButtonPressed: () => {
                if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                    options.onBackButtonPressed();
                    return;
                }

                this.pop();
            }
        });
    };
    showLocationMap(options) {
        this.navigate(this.getNavigation().LocationMapComponent, {
            ...options,
            withBackButtonHandler: true,
            onBackButtonPressed: () => {
                if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                    options.onBackButtonPressed();
                    return;
                }

                this.pop();
            }
        });
    };
    showSketchDrawing(options) {
        this.navigate(this.getNavigation().SketchDrawingComponent, {
            ...options,
            withBackButtonHandler: true,
            onBackButtonPressed: () => {
                if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                    options.onBackButtonPressed();
                    return;
                }

                this.pop();
            },
            onDoneClose: () => {
                if (options && typeof options === 'object' && typeof options.onDoneClose === 'function') {
                    options.onDoneClose();
                    return;
                }

                this.pop();
            }
        });
    };
    showStickersList(options) {
        this.navigate(this.getNavigation().StickerListComponent, {
            ...options,
            withBackButtonHandler: true,
            onBackButtonPressed: () => {
                if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                    options.onBackButtonPressed();
                    return;
                }

                this.pop();
            }
        });
    };
    showStickerDetails(options) {
        this.navigate(this.getNavigation().StickerDetailsComponent, {
            ...options,
            withBackButtonHandler: true,
            onBackButtonPressed: () => {
                if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                    options.onBackButtonPressed();
                    return;
                }

                this.pop();
            }
        });
    };
    showSelectPhoneNumber(options) {
        this.navigate(this.getNavigation().SelectPhoneNumberComponent, {
            ...options,
            withBackButtonHandler: true,
            onBackButtonPressed: () => {
                if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                    options.onBackButtonPressed();
                    return;
                }

                this.pop();
            },
            onSelectDone: (event) => {
                if (options && typeof options === 'object' && typeof options.onSelectDone === 'function') {
                    options.onSelectDone(event);
                    return;
                }
            },
            onDoneClose: () => {
                if (options && typeof options === 'object' && typeof options.onDoneClose === 'function') {
                    options.onDoneClose(event);
                    return;
                }

                this.pop();
            }
        });
    };

    UICallLogs(options) {
        return this.renderScreen(
            this.getNavigation().CallLogsComponent,
            {
                ...options,
                withBackButtonHandler: false,
                onBackButtonPressed: () => {
                    if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                        options.onBackButtonPressed();
                        return;
                    }

                    this.pop();
                },
                onCallLogItemPressed: (event) => {
                    if (options && typeof options === 'object' && typeof options.onCallLogItemPressed === 'function') {
                        options.onCallLogItemPressed(event);
                        return;
                    }
                    this.startCallout({
                        info: {
                            phoneNumber: event.phoneNumber
                        }
                    });
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
                withBackButtonHandler: false,
                onBackButtonPressed: () => {
                    if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                        options.onBackButtonPressed();
                        return;
                    }

                    this.pop();
                },
                showSelectPhoneNumber: (options) => {
                    this.showSelectPhoneNumber(options)
                },
                startCallout: (options) => {
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
                withBackButtonHandler: false,
                onBackButtonPressed: () => {
                    if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                        options.onBackButtonPressed();
                        return;
                    }

                    this.pop();
                },
                showSelectMembers: (event) => {
                    this.showSelectMembers(event);
                },
                showGroupInputName: (event) => {
                    this.showGroupInputName(event);
                },
                onConversationPressed: (event) => {
                    if (options && typeof options === 'object' && typeof options.onConversationPressed === 'function') {
                        options.onConversationPressed(event);
                        return;
                    }

                    this.startChat({
                        chatType: event.conversation.chatType,
                        chatId: event.conversation.chatId,
                    });
                },
                onNewChat: (event) => {
                    if (options && typeof options === 'object' && typeof options.onNewChat === 'function') {
                        options.onNewChat(event);
                        return;
                    }

                    this.startChat({
                        chatType: event.chatType,
                        chatId: event.chatId,
                    });
                }
            },
            0
        );
    };
    UIChat(options) {
        return this.renderScreen(
            this.getNavigation().ChatComponent,
            {
                ...options,
                withBackButtonHandler: false,
                onBackButtonPressed: () => {
                    if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                        options.onBackButtonPressed();
                        return;
                    }

                    this.pop();
                },
                showImageGallery: (event) => {
                    this.showImageGallery(event);
                },
                showLocationMap: (event) => {
                    this.showLocationMap(event);
                },
                showSketchDrawing: (event) => {
                    this.showSketchDrawing(event);
                },
                showStickersList: (event) => {
                    this.showStickersList(event);
                },
                showStickerDetails: (event) => {
                    this.showStickerDetails(event);
                },
                onChatTargetPressed: (event) => {
                    if (options && typeof options === 'object' && typeof options.onChatTargetPressed === 'function') {
                        options.onChatTargetPressed(event);
                        return;
                    }

                    if (event.chatType === this.AZStackCore.chatConstants.CHAT_TYPE_USER) {
                        this.showUser({
                            userId: event.chatTarget.userId
                        });
                    } else if (event.chatType === this.AZStackCore.chatConstants.CHAT_TYPE_GROUP) {
                        this.showGroup({
                            groupId: event.chatTarget.groupId
                        })
                    }
                },
                onSenderPressed: (event) => {
                    if (options && typeof options === 'object' && typeof options.onSenderPressed === 'function') {
                        options.onSenderPressed(event);
                        return;
                    }

                    this.showUser({
                        userId: event.userId
                    });
                },
                onVoiceCallButtonPressed: (event) => {
                    if (options && typeof options === 'object' && typeof options.onVoiceCallButtonPressed === 'function') {
                        options.onVoiceCallButtonPressed(event);
                        return;
                    }

                    Keyboard.dismiss();
                    this.startAudioCall({
                        info: {
                            userId: event.userId,
                            fullname: event.fullname
                        }
                    });
                },
                onVideoCallButtonPressed: (event) => {
                    if (options && typeof options === 'object' && typeof options.onVideoCallButtonPressed === 'function') {
                        options.onVideoCallButtonPressed();
                        return;
                    }

                    Keyboard.dismiss();
                    this.startVideoCall({
                        info: {
                            userId: event.userId
                        }
                    });
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
                withBackButtonHandler: false,
                onBackButtonPressed: () => {
                    if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                        options.onBackButtonPressed();
                        return;
                    }

                    this.pop();
                },
                onStartChatButtonPressed: (event) => {
                    if (options && typeof options === 'object' && typeof options.onStartChatButtonPressed === 'function') {
                        options.onStartChatButtonPressed(event);
                        return;
                    }

                    this.startChat({
                        chatType: this.AZStackCore.chatConstants.CHAT_TYPE_USER,
                        chatId: event.userId,
                    });
                },
                onVoiceCallButtonPressed: (event) => {
                    if (options && typeof options === 'object' && typeof options.onVoiceCallButtonPressed === 'function') {
                        options.onVoiceCallButtonPressed(event);
                        return;
                    }

                    this.startAudioCall({
                        info: {
                            userId: event.userId,
                            fullname: event.fullname
                        }
                    });
                },
                onVideoCallButtonPressed: (event) => {
                    if (options && typeof options === 'object' && typeof options.onVideoCallButtonPressed === 'function') {
                        options.onVideoCallButtonPressed(event);
                        return;
                    }

                    this.startVideoCall({
                        info: {
                            userId: event.userId
                        }
                    });
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
                withBackButtonHandler: false,
                onBackButtonPressed: () => {
                    if (options && typeof options === 'object' && typeof options.onBackButtonPressed === 'function') {
                        options.onBackButtonPressed();
                        return;
                    }

                    this.pop();
                },
                onMemberPressed: (event) => {
                    if (options && typeof options === 'object' && typeof options.onMemberPressed === 'function') {
                        options.onMemberPressed(event);
                        return;
                    }

                    this.showUser({
                        userId: event.member.userId
                    });
                }
            },
            0
        );
    };
};