import React from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    Linking
} from 'react-native';
import MapView from 'react-native-maps';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';

class LocationMapComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.state = {
            mapSizes: {
                width: null,
                height: null
            }
        };

        this.onMapBoundLayout = this.onMapBoundLayout.bind(this);

        this.openMapButtonPressed = this.openMapButtonPressed.bind(this);
    };

    onMapBoundLayout(event) {
        this.setState({ mapSizes: Object.assign({}, this.state.mapSizes, { width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height }) })
    };

    openMapButtonPressed() {
        const url = `${this.coreInstances.linkConstants.LINK_GOOGLE_PLACE_WEB}${this.props.location.latitude},${this.props.location.longitude}`;
        Linking.canOpenURL(url).then((supported) => {
            if (!supported) {
                Alert.alert(
                    this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                    this.coreInstances.Language.getText('LOCATION_MAP_OPEN_MAP_ERROR_TEXT'),
                    [
                        { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                    ],
                    { cancelable: true }
                );
                return;
            }
            Linking.openURL(url);
        }).catch((error) => {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('ALERT_GENERAL_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
        });

    };

    render() {
        return (
            <ScreenBlockComponent
                fullScreen={false}
                getCoreInstances={this.props.getCoreInstances}
                statusbar={this.props.statusbar}
                style={this.props.style}
            >
                <ScreenHeaderBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    onBackButtonPressed={this.props.onBackButtonPressed}
                    title={this.coreInstances.Language.getText('LOCATION_MAP_HEADER_TITLE_TEXT')}
                />
                <ScreenBodyBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    style={this.props.contentContainerStyle}
                    onLayout={this.onMapBoundLayout}
                >
                    {
                        !!this.state.mapSizes.height &&
                        !!this.state.mapSizes.width && (
                            <MapView
                                style={{
                                    width: this.state.mapSizes.width,
                                    height: this.state.mapSizes.height
                                }}
                                initialRegion={{
                                    latitude: this.props.location.latitude,
                                    longitude: this.props.location.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01 * this.state.mapSizes.width / this.state.mapSizes.height,
                                }}
                            >
                                <MapView.Marker
                                    coordinate={{
                                        latitude: this.props.location.latitude,
                                        longitude: this.props.location.longitude
                                    }}
                                />
                            </MapView>
                        )
                    }
                </ScreenBodyBlockComponent>
                <View
                    style={this.coreInstances.CustomStyle.getStyle('LOCATION_MAP_FOOTER_BLOCK_STYLE')}
                >
                    <TouchableOpacity
                        style={this.coreInstances.CustomStyle.getStyle('LOCATION_MAP_FOOTER_OPEN_MAP_BUTTON_BLOCK_STYLE')}
                        activeOpacity={0.5}
                        onPress={this.openMapButtonPressed}
                    >
                        <Text
                            style={this.coreInstances.CustomStyle.getStyle('LOCATION_MAP_FOOTER_OPEN_MAP_BUTTON_TEXT_BLOCK_STYLE')}
                        >
                            {this.coreInstances.Language.getText('LOCATION_MAP_OPEN_MAP_BUTTON_TITLE_TEXT')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScreenBlockComponent>
        );
    };
};

export default LocationMapComponent;