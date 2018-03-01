import React from 'react';
import {
    BackHandler,
    Alert,
    View,
    TouchableOpacity,
    Text,
    Image
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import LocationSelectingHeaderBlockComponent from './part/location/LocationSelectingHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';

class LocationSelectingComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.state = {
            location: null
        };

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);

        this.onDoneButtonPressed = this.onDoneButtonPressed.bind(this);
    };

    onHardBackButtonPressed() {
        this.props.onBackButtonPressed();
        return true;
    };

    onDoneButtonPressed() {
        if (!this.state.location) {
            Alert.alert(
                this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                this.coreInstances.Language.getText('CHAT_INPUT_GET_CURRENT_LOCATION_ERROR_TEXT'),
                [
                    { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                ],
                { cancelable: true }
            );
            return;
        }

        this.props.onLocationDetected(this.state.location);
        this.props.onBackButtonPressed();
    };

    getCurrentLocation() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log(position);
            },
            (error) => {
                Alert.alert(
                    this.coreInstances.Language.getText('ALERT_TITLE_ERROR_TEXT'),
                    this.coreInstances.Language.getText('CHAT_INPUT_GET_CURRENT_LOCATION_ERROR_TEXT'),
                    [
                        { text: this.coreInstances.Language.getText('ALERT_BUTTON_TITLE_OK_TEXT'), onPress: () => { } }
                    ],
                    { cancelable: true }
                );
            },
            { enableHighAccuracy: false, timeout: 2000, maximumAge: 1000 }
        );
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
                <LocationSelectingHeaderBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    onBackButtonPressed={() => this.props.onBackButtonPressed()}
                    onDoneButtonPressed={this.onDoneButtonPressed}
                    title={this.coreInstances.Language.getText('LOCATION_SELECTING_HEADER_TITLE_TEXT')}
                />
                <ScreenBodyBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    style={this.props.contentContainerStyle}
                >
                    {
                        !this.state.location && (
                            <EmptyBlockComponent
                                getCoreInstances={this.props.getCoreInstances}
                                emptyText={this.coreInstances.Language.getText('LOCATION_EMPTY_TEXT')}
                            />
                        )
                    }
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    };
};

export default LocationSelectingComponent;