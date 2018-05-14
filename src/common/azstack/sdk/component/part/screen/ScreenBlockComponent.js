import React from 'react';
import {
    Keyboard,
    Animated,
    Platform,
    Dimensions,
    StatusBar
} from 'react-native';
import CustomStatusBar from '../common/CustomStatusBar';

const { height, width } = Dimensions.get('window');

class ScreenBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.withStatusbar = (this.props.withStatusbar || (this.props.withStatusbar === undefined && this.coreInstances.defaultLayout.withStatusbar)) ? true : false;
        this.realHeight = height - (this.withStatusbar ? 0 : (Platform.OS === 'ios' ? 20 : StatusBar.currentHeight));

        this.state = {
            heightAnimated: new Animated.Value(this.realHeight)
        };

        this.keyboardListeners = {
            onShowed: null,
            onHided: null
        };
    };

    componentDidMount() {
        this.keyboardListeners.onShowed = Keyboard.addListener('keyboardDidShow', (event) => {
            Animated.timing(
                this.state.heightAnimated,
                {
                    toValue: this.realHeight - event.endCoordinates.height,
                    duration: 0,
                }
            ).start();
        });
        this.keyboardListeners.onHided = Keyboard.addListener('keyboardDidHide', (event) => {
            Animated.timing(
                this.state.heightAnimated,
                {
                    toValue: this.realHeight,
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
                    height: this.state.heightAnimated,
                    ...this.props.style || {}
                }}
            >
                {this.withStatusbar && <CustomStatusBar backgroundColor="#fff" barStyle="dark-content" hidden={this.props.fullScreen} />}
                {this.props.children}
            </Animated.View >
        );
    };
};

export default ScreenBlockComponent;