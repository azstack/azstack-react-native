import React from 'react';
import { Text } from 'react-native';

import AZStack from '../../common/azstack/';

class AppMain extends React.Component {

    constructor(props) {
        super(props);
        this.AZStack = new AZStack();
        this.AZStack.config({
            logLevel: this.AZStack.logLevelConstants.LOG_LEVEL_DEBUG
        });
        this.AZStack.connect();
    };

    render() {
        return (
            <Text>Hello world</Text>
        );
    };
};

export default AppMain;