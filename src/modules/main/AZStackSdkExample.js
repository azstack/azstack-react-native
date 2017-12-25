import React from 'react';
import {
    Text
} from 'react-native';

import { AZStackSdk } from '../../common/azstack/';

class AZStackSdkExample extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            authenticatedUser: null
        };

        this.AZStackSdk = new AZStackSdk({
            azstackConfig: this.props.azstackConfig,
            languageCode: this.props.languageCode,
            themeName: this.props.themeName
        });
        this.AZStackSdk.AZStackCore.connect().then((result) => {
            this.setState({ authenticatedUser: result });
        }).catch({});
    };

    render() {
        return (
            <Text>{this.state.authenticatedUser ? 'Connected, ' + this.state.authenticatedUser.fullname : 'Connecting'}</Text>
        );
    };
};

export default AZStackSdkExample;