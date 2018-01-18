import React from 'react';
import {
    Keyboard,
    Animated,
    Platform,
    Dimensions,
} from 'react-native';
import CustomStatusBar from '../common/CustomStatusBar';

const {height, width} = Dimensions.get('window');

class ScreenBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            opacityAnimated: new Animated.Value(0),
            marginLeftAnimated: new Animated.Value(-width),
            heightAnimated: new Animated.Value(height)
        };

        this.keyboardListeners = {
            onShowed: null,
            onHided: null
        };
    };

    componentDidMount() {
        Animated.parallel([
            Animated.timing(
                this.state.opacityAnimated,
                {
                    toValue: 1,
                    duration: 500,
                }
            ),
            Animated.timing(
                this.state.marginLeftAnimated,
                {
                    toValue: 0,
                    duration: 500,
                }
            )
        ]).start();

        this.keyboardListeners.onShowed = Keyboard.addListener('keyboardDidShow', (event) => {
            Animated.timing(
                this.state.heightAnimated,
                {
                    toValue: height - event.endCoordinates.height,
                    duration: 500,
                }
            ).start();
        });
        this.keyboardListeners.onHided = Keyboard.addListener('keyboardDidHide', (event) => {
            Animated.timing(
                this.state.heightAnimated,
                {
                    toValue: height,
                    duration: 500,
                }
            ).start();
        });
    };

    componentWillUnmount() {
        Animated.parallel([
            Animated.timing(
                this.state.opacityAnimated,
                {
                    toValue: 0,
                    duration: 500,
                }
            ),
            Animated.timing(
                this.state.marginLeftAnimated,
                {
                    toValue: -width,
                    duration: 500,
                }
            )
        ]).start();

        this.keyboardListeners.onShowed.remove();
        this.keyboardListeners.onHided.remove();
    };

    render() {
        return (
            <Animated.View
                style={{
                    ...Platform.select({
                        ios: {
                            paddingTop: this.props.fullScreen === true ? 0 : 20,
                        },
                        android: {
                            paddingTop: 20,
                        }
                    }),
                    ...this.props.CustomStyle.getStyle('SCREEN_BLOCK_STYLE'),
                    opacity: this.state.opacityAnimated,
                    marginLeft: this.state.marginLeftAnimated,
                    height: this.state.heightAnimated
                }}
            >
                {this.props.children}
            </Animated.View >
        );
    };
};

export default ScreenBlockComponent;