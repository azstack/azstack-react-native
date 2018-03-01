import React from 'react';
import {
    TouchableOpacity,
    Text,
    Image
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
                <Image
                    style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_LOCATION_IMAGLE_STYLE')}
                    source={{
                        uri: `${this.coreInstances.linkConstants.LINK_GOOGLE_STATIC_MAP_API}?center=${this.props.location.latitude},${this.props.location.longitude}&maptype=roadmap&zoom=16&size=250x200&markers=color:blue%7Clabel:C%7C${this.props.location.latitude},${this.props.location.longitude}&key=${this.coreInstances.googleApiKey}`
                    }}
                />
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