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

import ScreenBlockComponent from './component/part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './component/part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './component/part/screen/ScreenBodyBlockComponent';
import EmptyBlockComponent from './component/part/common/EmptyBlockComponent';

import ConversationsListComponent from './component/ConversationsListComponent';
import OnCallComponent from './component/OnCallComponent';
import ContactComponent from './component/ContactComponent';
import NumberPadComponent from './component/NumberPadComponent';

const NavigationEnum = {
    ConversationsListComponent: 'ConversationsListComponent',
    OnCallComponent: 'OnCallComponent',
    ContactComponent: 'ContactComponent',
    NumberPadComponent: 'NumberPadComponent'
}

export class AZStackSdkComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentScreen: '',
            options: null,
        };
        const { width, height } = Dimensions.get('window');
        this.Sizes = {
            width,
            height: height - StatusBar.currentHeight
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

    render() {
        switch(this.state.currentScreen) {
            case 'ConversationsListComponent': 
                return this.renderConversationsList(this.state.options);
            case 'OnCallComponent': 
                return this.renderOnCall(this.state.options);
            case 'ContactComponent': 
                return this.renderContact(this.state.options);
            case 'NumberPadComponent': 
                return this.renderNumberPad(this.state.options);
            default: 
                return null;
        }
    }

    connect() {
        return this.AZStackCore.connect();
    };
    disconnect() {
        return this.AZStackCore.disconnect();
    };

    getConstants(constantGroup) {
        return this.AZStackCore[constantGroup];
    }

    getNavigation() {
        return NavigationEnum;
    }

    onCallout(options) {
        return this.renderOnCall(options);
    }

    onFreeCall(otpions) {
        return this.renderOnCall(options);
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

        this.setState({
            currentScreen: NavigationEnum.OnCallComponent,
            options: {
                ...options,
                onEndCall: () => {
                    if(options.onEndCall) {
                        options.onEndCall()
                    }
                    this.AZStackCore.stopCallout().then((result) => {
                        setTimeout(() => {
                            this.dismiss();
                        }, 1500);
                    });
                }
            },
        })
    }

    startFreeCall(options) {
        this.AZStackCore.startFreeCall({
            mediaType: options.mediaType,
            toUserId: options.info.userId,
        }).then((result) => {

        });

        this.setState({
            currentScreen: NavigationEnum.OnCallComponent,
            options: {
                ...options,
                onEndCall: () => {
                    if(options.onEndCall) {
                        options.onEndCall()
                    }

                    this.dismiss();
                }
            },
        })
    }

    navigate(screen, options) {
        this.setState({
            currentScreen: screen,
            options: {
                ...options,
                moreOption: ':D'
            }
        })
    }

    dismiss() {
        this.setState({
            currentScreen: '',
            options: null,
        })
    }

    renderConversationsList(options) {
        return <ConversationsListComponent
            Sizes={this.Sizes}
            Language={this.Language}
            CustomStyle={this.CustomStyle}
            eventConstants={this.eventConstants}
            AZStackCore={this.AZStackCore}
            EventEmitter={this.EventEmitter}
            onBackButtonPressed={options.onBackButtonPressed ? options.onBackButtonPressed : () => {
                this.setState({currentScreen: '', options: null})
            }}
        />;
    };

    renderOnCall(options) {
        return <OnCallComponent
            Sizes={this.Sizes}
            Language={this.Language}
            CustomStyle={this.CustomStyle}
            eventConstants={this.eventConstants}
            AZStackCore={this.AZStackCore}
            EventEmitter={this.EventEmitter}
            {...options}
        />;
    }

    renderContact(options) {
        return <ContactComponent
            Sizes={this.Sizes}
            Language={this.Language}
            CustomStyle={this.CustomStyle}
            eventConstants={this.eventConstants}
            AZStackCore={this.AZStackCore}
            EventEmitter={this.EventEmitter}
            onBackButtonPressed={options.onBackButtonPressed ? options.onBackButtonPressed : () => {
                this.setState({currentScreen: '', options: null})
            }}
        />;
    }

    renderNumberPad(options) {
        return <NumberPadComponent
            Sizes={this.Sizes}
            Language={this.Language}
            CustomStyle={this.CustomStyle}
            eventConstants={this.eventConstants}
            AZStackCore={this.AZStackCore}
            EventEmitter={this.EventEmitter}
            onCallout={(options) => this.startCallout(options)}
            onBackButtonPressed={options.onBackButtonPressed ? options.onBackButtonPressed : () => {
                this.setState({currentScreen: '', options: null})
            }}
        />;
    }
};