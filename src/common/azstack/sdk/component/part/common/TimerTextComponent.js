import React from 'react';
import {
	Text,
} from 'react-native';

class TimerTextComponent extends React.Component {
	constructor(props) {
		super(props);

		this.coreInstances = props.getCoreInstances();

		this.state = {
			time: 0,
			interval: null,
		};
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
			<Text
				style={[
					this.coreInstances.CustomStyle.getStyle('TIMER_TEXT_STYLE'),
					(this.props.style ? this.props.style : {})
				]}
			>
				{this.coreInstances.DateTimeFormatter.pad(Math.floor(this.state.time / 60))}:{this.coreInstances.DateTimeFormatter.pad(this.state.time % 60)}
			</Text>
		);
	};
};

export default TimerTextComponent;