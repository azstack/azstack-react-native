import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
} from 'react-native';

class PulseAnimateComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.mounted = true;
        this.createPulseTimer = null;
        this.timer = null;

        const defaultSettings = this.coreInstances.CustomStyle.getStyle('PULSE_ANIMATE_DEFAULT_SETTING');

        this.state = {
            started: false,
            image: this.props.image,
            color: this.props.color || defaultSettings.color,
            numPulses: this.props.numPulses || defaultSettings.numPulses,
            maxDiameter: this.props.maxDiameter || defaultSettings.maxDiameter,
            maxOpacity: this.props.maxOpacity || defaultSettings.maxOpacity,
            speed: this.props.speed || defaultSettings.speed,
            duration: this.props.duration || defaultSettings.duration,
            pulses: []
        };

    };

    componentDidMount() {
        const { numPulses, duration, speed } = this.state;

        this.setState({ started: true });

        let a = 0;
        while (a < numPulses) {
            this.createPulseTimer = setTimeout(() => {
                this.createPulse(a);
            }, a * duration);

            a++;
        }

        this.timer = setInterval(() => {
            this.updatePulse();
        }, speed);
    };
    componentWillUnmount() {
        this.mounted = false;
        clearTimeout(this.createPulseTimer);
        clearInterval(this.timer);
    };

    createPulse = (pKey) => {

        if (this.mounted) {
            let pulses = this.state.pulses;

            let pulse = {
                pulseKey: pulses.length + 1,
                diameter: 0,
                opacity: this.state.maxOpacity
            };

            pulses.push(pulse);

            this.setState({ pulses });
        }

    };

    updatePulse = () => {
        if (this.mounted) {
            const pulses = this.state.pulses.map((p, i) => {
                let maxDiameter = this.state.maxDiameter;
                let newDiameter = (p.diameter > maxDiameter ? 0 : p.diameter + 2);
                let centerOffset = (maxDiameter - newDiameter) / 2;
                let opacity = Math.abs((newDiameter / this.state.maxDiameter) - 1);

                let pulse = {
                    pulseKey: i + 1,
                    diameter: newDiameter,
                    opacity: (opacity > this.state.maxOpacity ? this.state.maxOpacity : opacity),
                    centerOffset: centerOffset
                };

                return pulse;

            });

            this.setState({ pulses });
        }
    };

    render() {
        const { image, maxDiameter, color, started, pulses } = this.state;
        const wrapperStyle = [this.coreInstances.CustomStyle.getStyle('PULSE_ANIMATE_WRAPPER_BLOCK_STYLE'), this.props.style];
        const containerStyle = { width: maxDiameter, height: maxDiameter };

        return (
            <View style={wrapperStyle}>
                {started &&
                    <View style={containerStyle}>
                        {
                            pulses.map((pulse) =>
                                <View
                                    key={pulse.pulseKey}
                                    style={[
                                        this.coreInstances.CustomStyle.getStyle('PULSE_ANIMATE_PULSE_STYLE'),
                                        {
                                            backgroundColor: color,
                                            width: pulse.diameter,
                                            height: pulse.diameter,
                                            opacity: pulse.opacity,
                                            borderRadius: pulse.diameter / 2,
                                            top: pulse.centerOffset,
                                            left: pulse.centerOffset
                                        }
                                    ]}
                                />
                            )
                        }
                        {
                            image &&
                            <View
                                style={this.coreInstances.CustomStyle.getStyle('PULSE_ANIMATE_IMAGE_BLOCK_STYLE')}
                            >
                                <Image
                                    style={[image.style, {}]}
                                    source={image.source}
                                />
                            </View>
                        }
                    </View>
                }
            </View>
        )

    };
};

export default PulseAnimateComponent;