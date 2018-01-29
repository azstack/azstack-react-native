import React from 'react';
import {
    Keyboard,
    Animated,
    Platform,
    Dimensions,
} from 'react-native';
import CustomStatusBar from '../common/CustomStatusBar';

const { height, width } = Dimensions.get('window');

class ScreenBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.state = {
            opacityAnimated: new Animated.Value(0),
            marginLeftAnimated: new Animated.Value(width),
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
                    duration: 200,
                }
            ),
            Animated.timing(
                this.state.marginLeftAnimated,
                {
                    toValue: 0,
                    duration: 200,
                }
            )
        ]).start();

        this.keyboardListeners.onShowed = Keyboard.addListener('keyboardDidShow', (event) => {
            Animated.timing(
                this.state.heightAnimated,
                {
                    toValue: height - event.endCoordinates.height,
                    duration: 0,
                }
            ).start();
        });
        this.keyboardListeners.onHided = Keyboard.addListener('keyboardDidHide', (event) => {
            Animated.timing(
                this.state.heightAnimated,
                {
                    toValue: height,
                    duration: 0,
                }
            ).start();
        });
    };

    componentWillUnmount() {
        this.keyboardListeners.onShowed.remove();
        this.keyboardListeners.onHided.remove();
    };

    dismiss() {
        Animated.parallel([
            Animated.timing(
                this.state.opacityAnimated,
                {
                    toValue: 0,
                    duration: 200,
                }
            ),
            Animated.timing(
                this.state.marginLeftAnimated,
                {
                    toValue: width,
                    duration: 200,
                }
            )
        ]).start();
    }

    render() {
        return (
            <Animated.View
                style={{
                    ...this.coreInstances.CustomStyle.getStyle('SCREEN_BLOCK_STYLE'),
                    opacity: this.state.opacityAnimated,
                    marginLeft: this.state.marginLeftAnimated,
                    height: this.state.heightAnimated,
                    ...this.props.style || {}
                }}
            >
                <CustomStatusBar backgroundColor="#fff" barStyle="dark-content" hidden={this.props.fullScreen === true} />
                {this.props.children}
            </Animated.View >
        );
    };
};

export default ScreenBlockComponent;