import React from 'react';
import {
    Animated
} from 'react-native';

class ScreenBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            opacityAnimated: new Animated.Value(0),
            marginLeftAnimated: new Animated.Value(-this.props.Sizes.width)
        };
    };

    componentDidMount() {
        Animated.parallel([
            Animated.timing(
                this.state.opacityAnimated,
                {
                    toValue: 1,
                    duration: 1000,
                }
            ),
            Animated.timing(
                this.state.marginLeftAnimated,
                {
                    toValue: 0,
                    duration: 1000,
                }
            )
        ]).start();
    };

    componentWillUnmount() {
        Animated.parallel([
            Animated.timing(
                this.state.opacityAnimated,
                {
                    toValue: 0,
                    duration: 1000,
                }
            ),
            Animated.timing(
                this.state.marginLeftAnimated,
                {
                    toValue: -this.props.Sizes.width,
                    duration: 1000,
                }
            )
        ]).start();
    };

    render() {
        return (
            <Animated.View
                style={{
                    ...this.props.CustomStyle.getStyle('SCREEN_BLOCK_STYLE'),
                    ...this.props.Sizes,
                    opacity: this.state.opacityAnimated,
                    marginLeft: this.state.marginLeftAnimated
                }}
            >
                {this.props.children}
            </Animated.View >
        );
    };
};

export default ScreenBlockComponent;