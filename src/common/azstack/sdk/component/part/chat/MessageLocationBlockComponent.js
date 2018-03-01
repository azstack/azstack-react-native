import React from 'react';
import {
    TouchableOpacity,
    Text
} from 'react-native';

class MessageLocationBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.onPressed = this.onPressed.bind(this);
    };

    onPressed() {
        this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_MESSAGE_MEDIA_PLAYED, { error: null, result: { msgId: this.props.msgId } });
        this.props.onMessageLocationPressed({
            location: this.props.location
        });
    };

    render() {
        return (
            <TouchableOpacity
                activeOpacity={0.5}
                onPress={this.onPressed}
                style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_LOCATION_BLOCK_STYLE')}
            >
                <Text
                    style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_LOCATION_ADDRESS_TEXT_STYLE')}
                >
                    {this.props.location.address}
                </Text>
            </TouchableOpacity>
        );
    };
};

export default MessageLocationBlockComponent;