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
};