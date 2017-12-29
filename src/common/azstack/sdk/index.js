import React from 'react';
import { AZStackCore } from '../core/';
import {
    StatusBar,
    Dimensions
} from 'react-native';

import Language from './language/';
import CustomStyle from './style/';

import ConversationsListComponent from './component/ConversationsListComponent';

export class AZStackSdk {
    constructor(options) {

        const { width, height } = Dimensions.get('window');
        this.Sizes = {
            width,
            height: height - StatusBar.currentHeight
        };

        this.Language = new Language({ languageCode: options.languageCode });
        this.CustomStyle = new CustomStyle({ themeName: options.themeName });

        this.AZStackCore = new AZStackCore(options.azstackConfig);

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
            Language={this.Language}
            CustomStyle={this.CustomStyle}
            AZStackCore={this.AZStackCore}
            Sizes={this.Sizes}
            onBackButtonPressed={options.onBackButtonPressed ? options.onBackButtonPressed : () => { }}
        />;
    };
};