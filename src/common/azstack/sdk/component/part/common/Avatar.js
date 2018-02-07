import React from 'react';
import {
    View,
    Text,
    Image,
} from 'react-native';

export default class Avatar extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isError: false,
        }

        this.colors = ['#4C87B9', '#1BA39C', '#E35B5A', '#5E738B', '#C49F47', '#F3C200', '#95A5A6', '#C8D046', '#8775A7'];
    }

    getColor(options) {
        if (!options.text) {
            return this.colors[0];
        }
        return this.colors[options.text.charCodeAt(0) % this.colors.length];
    };

    getFirstLetters(options) {
        if (!options.text) {
            return '-';
        }
        if ([1, 2].indexOf(options.getNumber) === -1 || options.getNumber === 1) {
            return options.text[0].toUpperCase();
        }
        let textParts = options.text.split(' ');
        for (let i = textParts.length - 1; i >= 0; i--) {
            if (!textParts[i]) {
                textParts.splice(i, 1);
            }
        }
        if (textParts.length === 0) {
            return '--'.toUpperCase();
        }
        if (textParts.length === 1) {
            return (textParts[0][0] + (textParts[0].length === 1 ? '-' : textParts[0][1])).toUpperCase();
        }
        return (textParts[0][0] + textParts[1][0]).toUpperCase();
    };

    render() {
        const {
            source,
            onErrorText,
            onErrorChars,
            onErrorTextStyle,
            style,
            ...rest
        } = this.props;

        if(source === undefined || source === {} || source === null || this.state.isError === false) {
            return (
                <View
                    style={[
                        styles.ErrorTextWrapper,
                        style || {},
                        {backgroundColor: this.getColor({ text: onErrorText })}
                    ]}
                >
                    <Text
                        style={[
                            styles.ErrorText,
                            onErrorTextStyle || {},
                        ]}
                    >
                        {this.getFirstLetters({ text: onErrorText, getNumber: onErrorChars || 1 })}
                    </Text>
                </View>
            );
        }

        return (
            <Image source={source} onError={() => this.setState({isError: true})} rest style={[style || {}, styles.DefaultImageStyle ]} />
        );
    };
};

const styles = {
    DefaultImageStyle: {
        borderRadius: 25, 
        width: 50, 
        height: 50,
    },
    ErrorTextWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    ErrorText: {
        color: '#fff',
        fontSize: 20,
    },
}