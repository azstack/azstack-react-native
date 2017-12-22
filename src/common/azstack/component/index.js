import React from 'react';
import {
    Alert,
    View,
    Text
} from 'react-native';

import { AZStackCore } from '../core/';

import Language from './language/';

export class AZStackComponent extends React.Component {
    constructor(props) {
        super(props);

        this.Language = new Language({ languageCode: this.props.languageCode });

        this.AZStackCore = new AZStackCore();
        this.AZStackCore.config(this.props.azstackConfig);
        this.AZStackCore.connect().then((result) => {

        }).catch((error) => {
            Alert.alert(
                this.Language.getText('ALERT_TITLE_ERROR'),
                this.Language.getText('MESSAGE_ERROR_CAN_NOT_CONNECT_TO_AZSTACK'),
                [{
                    text: this.Language.getText('ALERT_BUTTON_OK'),
                    onPress: () => { }
                }],
                {
                    cancelable: true
                }
            );
        });
    }

    render() {
        return (
            <View>
                <Text>Hello world</Text>
            </View>
        );
    };
};