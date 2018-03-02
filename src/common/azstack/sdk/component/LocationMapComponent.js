import React from 'react';
import {
    BackHandler,
    Linking
} from 'react-native';
import MapView from 'react-native-maps';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import LocationMapFooterBlockComponent from './part/location/LocationMapFooterBlockComponent';

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

        this.currentLocation = {
            latitude: null,
            longitude: null
        };

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);

        this.onMapBoundLayout = this.onMapBoundLayout.bind(this);

        this.openMapButtonPressed = this.openMapButtonPressed.bind(this);
    };

    onHardBackButtonPressed() {
        this.props.onBackButtonPressed();
        return true;
    };

    getCurrentLocation() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.currentLocation.latitude = position.coords.latitude;
                this.currentLocation.longitude = position.coords.longitude;
            },
            (error) => {
                Alert.alert(
                    this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                    this.coreInstances.Language.getText('LOCATION_MAP_GET_CURRENT_LOCATION_ERROR_TEXT'),
                    [
                        { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                    ],
                    { cancelable: true }
                );
            },
            { enableHighAccuracy: false, timeout: 2000, maximumAge: 1000 }
        );
    };

    onMapBoundLayout(event) {
        this.setState({ mapSizes: Object.assign({}, this.state.mapSizes, { width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height }) })
    };

    openMapButtonPressed() {
        const url = `${this.coreInstances.linkConstants.LINK_GOOGLE_MAP_WEB}?daddr=${this.props.location.latitude},${this.props.location.longitude}${(this.currentLocation.latitude !== null && this.currentLocation.longitude !== null) ? `&saddr=${this.currentLocation.latitude},${this.currentLocation.longitude}` : ''}`;
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

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
        this.getCurrentLocation();
    };
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
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
                <LocationMapFooterBlockComponent 
                    getCoreInstances={this.props.getCoreInstances}
                    openMapButtonPressed={this.openMapButtonPressed}
                />
            </ScreenBlockComponent>
        );
    };
};

export default LocationMapComponent;