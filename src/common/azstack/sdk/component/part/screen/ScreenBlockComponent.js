import React from 'react';
import {
    Keyboard,
    Platform,
    StatusBar,
    View
} from 'react-native';
import CustomStatusBar from '../common/CustomStatusBar';

class ScreenBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.state = {
            realHeight: 0,
            takePartHeight: 0
        };

        this.withStatusbar = (this.props.withStatusbar || (this.props.withStatusbar === undefined && this.coreInstances.defaultLayout.withStatusbar)) ? true : false;
        this.fullScreen = (this.props.fullScreen || (this.props.fullScreen === undefined && this.coreInstances.defaultLayout.fullScreen)) ? true : false;

        this.keyboardListeners = {
            onShowed: null,
            onHided: null
        };

        this.onScreenLayout = this.onScreenLayout.bind(this);
    };

    onScreenLayout(event) {
        this.setState({
            realHeight: event.nativeEvent.layout.height - (this.fullScreen ? 0 : (this.withStatusbar ? 0 : (Platform.OS === 'ios' ? 20 : StatusBar.currentHeight)))
        });
    };

    componentDidMount() {
        this.keyboardListeners.onShowed = Keyboard.addListener('keyboardDidShow', (event) => {
            this.setState({
                takePartHeight: event.endCoordinates.height
            });
        });
        this.keyboardListeners.onHided = Keyboard.addListener('keyboardDidHide', (event) => {
            this.setState({
                takePartHeight: 0
            });
        });
    };
    componentWillUnmount() {
        this.keyboardListeners.onShowed.remove();
        this.keyboardListeners.onHided.remove();
    };

    render() {
        return (
            <View
                style={{
                    ...this.coreInstances.CustomStyle.getStyle('SCREEN_BLOCK_STYLE'),
                    ...this.coreInstances.defaultLayout.screenStyle,
                    ...this.props.screenStyle
                }}
                onLayout={this.onScreenLayout}
            >
                {
                    !!this.state.realHeight && (
                        <View
                            style={{
                                ...this.coreInstances.CustomStyle.getStyle('SCREEN_CONTENT_BLOCK_STYLE'),
                                height: this.state.realHeight - this.state.takePartHeight
                            }}
                        >
                            {
                                this.withStatusbar && (
                                    <CustomStatusBar
                                        {...this.coreInstances.CustomStyle.getStyle('SCREEN_STATUS_BAR_PROPS_STYLE')}
                                        {...this.coreInstances.defaultLayout.statusbarStyle}
                                        {...this.props.statusbarStyle}
                                        hidden={this.fullScreen}
                                    />
                                )
                            }
                            {this.props.children}
                        </View>
                    )
                }
            </View>
        );
    };
};

export default ScreenBlockComponent;