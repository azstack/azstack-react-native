import React from 'react';
import {
    Text
} from 'react-native';

class TypingBlockComponent extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        return (
            <Text
                style={[
                    this.props.CustomStyle.getStyle('TYPING_BLOCK_STYLE'),
                    (this.props.textStyle ? this.props.textStyle : {})
                ]}
            >
                <Text
                    style={this.props.CustomStyle.getStyle('TYPING_BLOCK_BOLD_STYLE')}
                >
                    {
                        `${this.props.typing.senders.map((sender) => {
                            return sender.fullname
                        }).join(', ')}`
                    }
                </Text>
                {
                    ` ${this.props.Language.getText(this.props.typing.senders.length > 1 ? 'TYPING_PREPOSITION_MANY_TEXT' : 'TYPING_PREPOSITION_TEXT')}`
                }
                {
                    ` ${this.props.Language.getText('TYPING_TEXT')}`
                }
            </Text>
        );
    };
};

export default TypingBlockComponent;