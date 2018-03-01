import React from 'react';
import {
    TouchableOpacity,
    Text,
    View
} from 'react-native';
import MapView from 'react-native-maps';

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
                <MapView
                    style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_LOCATION_MAP_BLOCK_STYLE')}
                    initialRegion={{
                        latitude: this.props.location.latitude,
                        longitude: this.props.location.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01 * 250 / 200,
                    }}
                >
                    <MapView.Marker
                        coordinate={{
                            latitude: this.props.location.latitude,
                            longitude: this.props.location.longitude
                        }}
                    />
                </MapView>
                <Text
                    style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_LOCATION_ADDRESS_TEXT_STYLE')}
                >
                    {this.props.location.address}
                </Text>
                <View
                    style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_LOCATION_MAP_COVER_BLOCK_STYLE')}
                />
            </TouchableOpacity>
        );
    };
};

export default MessageLocationBlockComponent;