import React from 'react';
import {
    View,
    TextInput,
    Image,
    TouchableOpacity,
    Text
} from 'react-native';

class SearchBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.textInputRef = null;

        this.state = {
            searchText: ''
        };

        this.onTextInputInitDone = this.onTextInputInitDone.bind(this);
        this.onSearchTextChanged = this.onSearchTextChanged.bind(this);
        this.clearSearchText = this.clearSearchText.bind(this);
    }

    onTextInputInitDone(textInputRef) {
        this.textInputRef = textInputRef;
    };
    onSearchTextChanged(newText) {
        this.setState({ searchText: newText });
        this.props.onSearchTextChanged(newText);
    };
    clearSearchText() {
        this.setState({ searchText: '' });
        // this.textInputRef.blur();
        this.props.onSearchTextCleared();
    };

    render() {
        return (
            <View
                style={this.props.CustomStyle.getStyle('SEARCH_BLOCK_STYLE')}
            >
                <TextInput
                    ref={this.onTextInputInitDone}
                    style={this.props.CustomStyle.getStyle('SEARCH_INPUT_STYLE')}
                    onChangeText={this.onSearchTextChanged}
                    value={this.state.searchText}
                    placeholder={this.props.placeholder}
                    returnKeyType='done'
                    {
                    ...this.props.CustomStyle.getStyle('SEARCH_INPUT_PROPS_STYLE')
                    }
                />
                <Image
                    style={this.props.CustomStyle.getStyle('SEARCH_IMAGE_STYLE')}
                    source={require('../../../static/image/search.png')}
                />
                {
                    !!this.state.searchText && <TouchableOpacity
                        style={this.props.CustomStyle.getStyle('SEARCH_CLEAR_BUTTON_BLOCK_STYLE')}
                        activeOpacity={0.5}
                        onPress={this.clearSearchText}
                    >
                        <Text
                            style={this.props.CustomStyle.getStyle('SEARCH_CLEAR_BUTTON_TEXT_STYLE')}
                        >×</Text>
                    </TouchableOpacity>
                }
            </View>
        );
    };
};

export default SearchBlockComponent;