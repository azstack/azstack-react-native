import React from 'react';
import {
    BackHandler,
    Alert
} from 'react-native';
import MapView from 'react-native-maps';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import LocationSelectingHeaderBlockComponent from './part/location/LocationSelectingHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import LocationSelectingFooterBlockComponent from './part/location/LocationSelectingFooterBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';

class LocationSelectingComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.state = {
            selectedLocation: {
                latitude: null,
                longitude: null
            },
            map: {
                sizes: {
                    width: null,
                    height: null
                }
            }
        };

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);

        this.onDoneButtonPressed = this.onDoneButtonPressed.bind(this);

        this.onMapBoundLayout = this.onMapBoundLayout.bind(this);

        this.selectLocationButtonPressed = this.selectLocationButtonPressed.bind(this);
    };

    onHardBackButtonPressed() {
        this.props.onBackButtonPressed();
        return true;
    };

    onDoneButtonPressed() {
        if (this.state.selectedLocation.latitude === null || this.state.selectedLocation.longitude === null) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('LOCATION_SELECTING_GET_CURRENT_LOCATION_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
            return;
        }

        this.props.onLocationSelected(this.state.selectedLocation);
        this.props.onDoneClose();
    };

    getCurrentLocation() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    selectedLocation: Object.assign({}, this.state.selectedLocation, { latitude: position.coords.latitude, longitude: position.coords.longitude })
                });
            },
            (error) => {
                Alert.alert(
                    this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                    this.coreInstances.Language.getText('LOCATION_SELECTING_GET_CURRENT_LOCATION_ERROR_TEXT'),
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
        console.log(event);
        this.setState({ map: Object.assign({}, this.state.map, { sizes: Object.assign({}, this.state.map.sizes, { width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height }) }) })
    };

    selectLocationButtonPressed() { };

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
                <LocationSelectingHeaderBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    onBackButtonPressed={() => this.props.onBackButtonPressed()}
                    onDoneButtonPressed={this.onDoneButtonPressed}
                    title={this.coreInstances.Language.getText('LOCATION_SELECTING_HEADER_TITLE_TEXT')}
                />
                <ScreenBodyBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    style={this.props.contentContainerStyle}
                    onLayout={this.onMapBoundLayout}
                >
                    {
                        this.state.selectedLocation.latitude === null &&
                        this.state.selectedLocation.longitude === null && (
                            <EmptyBlockComponent
                                getCoreInstances={this.props.getCoreInstances}
                                emptyText={this.coreInstances.Language.getText('LOCATION_SELECTING_EMPTY_TEXT')}
                            />
                        )
                    }
                    {
                        !!this.state.map.sizes.height &&
                        !!this.state.map.sizes.width &&
                        this.state.selectedLocation.latitude !== null &&
                        this.state.selectedLocation.longitude !== null && (
                            <MapView
                                style={{
                                    width: this.state.map.sizes.width,
                                    height: this.state.map.sizes.height
                                }}
                                initialRegion={{
                                    latitude: this.state.selectedLocation.latitude,
                                    longitude: this.state.selectedLocation.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01 * this.state.map.sizes.width / this.state.map.sizes.height,
                                }}
                            >
                                <MapView.Marker
                                    coordinate={{
                                        latitude: this.state.selectedLocation.latitude,
                                        longitude: this.state.selectedLocation.longitude
                                    }}
                                />
                            </MapView>
                        )
                    }
                </ScreenBodyBlockComponent>
                <LocationSelectingFooterBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    selectLocationButtonPressed={this.selectLocationButtonPressed}
                />
            </ScreenBlockComponent>
        );
    };
};

export default LocationSelectingComponent;