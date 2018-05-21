import React from 'react';
import {
	Text,
} from 'react-native';

class TimerTextComponent extends React.Component {
	state = {
		time: 0,
		interval: null,
	};

	componentWillMount() {
		var interval = setInterval(() => {
			this.setState({ time: this.state.time + 1 });
		}, 1000);

		this.setState({ interval: interval });
	};

	componentWillUnmount() {
		clearInterval(this.state.interval);
	};

	render() {
		return (
			<Text style={{ color: '#fff', fontSize: 15, lineHeight: 20 }}>{this.pad(Math.floor(this.state.time / 60))}:{this.pad(this.state.time % 60)}</Text>
		);
	};

	pad(d) {
		return (d < 10) ? '0' + d.toString() : d.toString();
	};
};

export default TimerTextComponent;