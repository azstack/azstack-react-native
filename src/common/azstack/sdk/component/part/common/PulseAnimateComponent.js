import React, {
    Component
} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
} from 'react-native';

class PulseAnimateComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            started: false,
            style: [{ top: 0, bottom: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }, this.props.style],
            image: this.props.image,
            color: this.props.color || "blue",
            numPulses: this.props.numPulses || 3,
            maxDiameter: this.props.diameter || 400,
            speed: this.props.speed || 10,
            duration: this.props.duration || 1000,
            pulses: []
        };

    };

    mounted = true;

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
                opacity: .5
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
                    opacity: (opacity > .5 ? .5 : opacity),
                    centerOffset: centerOffset
                };

                return pulse;

            });

            this.setState({ pulses });
        }
    };

    render() {
        const { style, image, maxDiameter, color, started, pulses } = this.state;
        const wrapperStyle = [styles.container, style];
        const containerStyle = { width: maxDiameter, height: maxDiameter };

        return (
            <View style={wrapperStyle}>
                {started &&
                    <View style={containerStyle}>
                        {pulses.map((pulse) =>
                            <View
                                key={pulse.pulseKey}
                                style={[
                                    styles.pulse,
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
                        )}
                        {image &&
                            <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
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

const styles = StyleSheet.create({
    container: {
        alignItems: 'center'
    },
    pulse: {
        position: 'absolute',
        flex: 1
    }
});

export default PulseAnimateComponent;