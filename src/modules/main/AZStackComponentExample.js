import React from 'react';

import { AZStackComponent } from '../../common/azstack/';

class AZStackComponentExample extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        return (
            <AZStackComponent azstackConfig={this.props.azstackConfig} languageCode={this.props.languageCode} themeName={this.props.themeName} />
        );
    };
};

export default AZStackComponentExample;