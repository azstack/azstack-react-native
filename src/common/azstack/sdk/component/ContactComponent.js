import React from 'react';
import {
    View,
    FlatList,
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';
import SearchBlockComponent from './part/common/SearchBlockComponent';


class ContactComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            contact: [],
        };
    };

    componentDidMount() {
        this.getContact();
    };

    componentWillUnmount() {
    };

    getContact() {
    }

    render() {
        return (
            <ScreenBlockComponent
                Sizes={this.props.Sizes}
                CustomStyle={this.props.CustomStyle}
            >
                <ScreenHeaderBlockComponent
                    CustomStyle={this.props.CustomStyle}
                    onBackButtonPressed={() => this.props.onBackButtonPressed()}
                    title={this.props.Language.getText('CONVERSATIONS_LIST_HEADER_TITLE_TEXT')}
                />
                <ScreenBodyBlockComponent
                    CustomStyle={this.props.CustomStyle}
                >
                    <View
                        style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_SEARCH_BLOCK_STYLE')}
                    >
                        <SearchBlockComponent
                            CustomStyle={this.props.CustomStyle}
                            onSearchTextChanged={this.onSearchTextChanged}
                            onSearchTextCleared={this.onSearchTextCleared}
                            placeholder={this.props.Language.getText('CONVERSATIONS_LIST_SEARCH_PLACEHOLDER_TEXT')}
                        />
                    </View>
                    {
                        this.state.contact.length === 0 && <EmptyBlockComponent
                            CustomStyle={this.props.CustomStyle}
                            emptyText={this.props.Language.getText('CONVERSATIONS_LIST_EMPTY_TEXT')}
                        />
                    }
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    };
};

export default ContactComponent;