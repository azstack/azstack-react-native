import React from 'react';
import {
    StatusBar,
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

export class AZStackSdkComponent extends AZStackBaseComponent {
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
        this.navigate(NavigationEnum.OnCallComponent, {
            info: {
                phoneNumber: result.fromPhoneNumber
            },
            onCallEnded: () => {
                setTimeout(() => {
                    this.dismiss();
                }, 1500);
            },
            onEndCall: () => {
                this.AZStackCore.stopCallin({}, (error, result) => {
                });
            },
            onReject: () => {
                this.AZStackCore.rejectCallin({}, (error, result) => {
                });
            },
            onAnswer: () => {
                this.AZStackCore.answerCallin({}, (error, result) => {
                });
            },
            onTimeout: () => {
                this.AZStackCore.notAnsweredCallin({}, (error, result) => {
                });
            }
        });
    }

    startCallout(options) {
        this.AZStackCore.startCallout({
            toPhoneNumber: options.info.phoneNumber
        }).then((result) => {

        });

        this.navigate(
            this.getNavigation().NumberPadComponent, 
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
                }
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

                    this.pop();
                }
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

                    this.pop();
                }
            }
        );
    }
};