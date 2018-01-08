import React from 'react';
import {
    StatusBar,
    Dimensions
} from 'react-native';
import EventEmitter from 'EventEmitter';

import * as eventConstants from './constant/eventConstants';

import Language from './language/';
import CustomStyle from './style/';

import { AZStackCore } from '../core/';

import Event from './handler/event';

import ConversationsListComponent from './component/ConversationsListComponent';
import OnCallComponent from './component/OnCallComponent';
import ContactComponent from './component/ContactComponent';
import NumberPadComponent from './component/NumberPadComponent';

export class AZStackSdk {
    constructor(options) {

        const { width, height } = Dimensions.get('window');
        this.Sizes = {
            width,
            height: height - StatusBar.currentHeight
        };

        this.eventConstants = eventConstants;

        this.Language = new Language({ languageCode: options.languageCode });
        this.CustomStyle = new CustomStyle({ themeName: options.themeName });

        this.AZStackCore = new AZStackCore(options.azstackConfig);

        this.EventEmitter = new EventEmitter();
        this.Event = new Event({
            eventConstants: this.eventConstants,
            AZStackCore: this.AZStackCore,
            EventEmitter: this.EventEmitter
        });
        this.Event.delegatesToEvents();

        this.renderConversationsList = this.renderConversationsList.bind(this);
    };

    connect() {
        return this.AZStackCore.connect();
    };
    disconnect() {
        return this.AZStackCore.disconnect();
    };

    getConstants(constantGroup) {
        return this.AZStackCore[constantGroup];
    }

    onCallout(options) {
        return this.renderOnCall(options);
    }

    onFreeCall(otpions) {
        return this.renderOnCall(options);
    }

    startCallout(options) {
        this.AZStackCore.startCallout({
            toPhoneNumber: options.info.phoneNumber
        }).then((result) => {

        });

        return this.renderOnCall(options);
    }

    startFreeCall(options) {
        this.AZStackCore.startFreeCall({
            mediaType: options.mediaType,
            toUserId: options.info.userId,
        }).then((result) => {

        });

        return this.renderOnCall(options);
    }

    renderConversationsList(options) {
        return <ConversationsListComponent
            Sizes={this.Sizes}
            Language={this.Language}
            CustomStyle={this.CustomStyle}
            eventConstants={this.eventConstants}
            AZStackCore={this.AZStackCore}
            EventEmitter={this.EventEmitter}
            onBackButtonPressed={options.onBackButtonPressed ? options.onBackButtonPressed : () => { }}
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
            info={options.info}
            onEndCall={options.onEndCall ? options.onEndCall : () => { }}
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
            onBackButtonPressed={options.onBackButtonPressed ? options.onBackButtonPressed : () => { }}
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
            onBackButtonPressed={options.onBackButtonPressed ? options.onBackButtonPressed : () => { }}
        />;
    }
};