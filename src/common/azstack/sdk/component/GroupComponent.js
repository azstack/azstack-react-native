import React from 'react';
import {
    View,
    FlatList,
    TextInput,
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';
import SearchBlockComponent from './part/common/SearchBlockComponent';

class GroupComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: null,
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <ScreenBlockComponent
                fullScreen={false}
                CustomStyle={this.props.CustomStyle}
            >
                <ScreenHeaderBlockComponent
                    CustomStyle={this.props.CustomStyle}
                    onBackButtonPressed={() => this.props.onBackButtonPressed()}
                    title={'Create group'}
                />
                <TextInput
                    onChangeText={(text) => {this.setState({text})}}
                    value={this.state.text}
                    placeholder={this.props.Language.getText('CHAT_INPUT_TEXT_INPUT_PLACEHOLDER_TEXT')}
                    returnKeyType={'done'}
                    autoCapitalize={'none'}
                    autogrow
                    multiline
                    blurOnSubmit={false}
                />
            </ScreenBlockComponent>
        );
    }
};

export default GroupComponent;