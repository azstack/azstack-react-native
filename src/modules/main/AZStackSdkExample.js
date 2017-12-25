import React from 'react';
import {
    Text
} from 'react-native';

import { AZStackSdk } from '../../common/azstack/';

class AZStackSdkExample extends React.Component {
    constructor(props) {
        super(props);

        this.AZStackSdk = new AZStackSdk({
            azstackConfig: this.props.azstackConfig,
            languageCode: this.props.languageCode,
            themeName: this.props.themeName
        });
    };

    render() {
        return (
            <Text>123</Text>
        );
    };
};

export default AZStackSdkExample;