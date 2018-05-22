import React from 'react';
import {
	BackHandler,
	View,
	Text,
	Image,
	TouchableOpacity
} from 'react-native';
import {
	RTCView
} from 'react-native-webrtc';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import TimerTextComponent from './part/common/TimerTextComponent';
import PulseAnimateComponent from './part/common/PulseAnimateComponent';

class VideoCallComponent extends React.Component {
	constructor(props) {
		super(props);
		this.coreInstances = props.getCoreInstances();
		this.subscriptions = {};
		this.state = {
			localVideoUrl: null,
			remoteVideoUrl: null,
			status: null
		};

		this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);
	};

	onHardBackButtonPressed() {
		return true;
	};

	addSubscriptions() {
		this.subscriptions.onLocalStreamArrived = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_LOCAL_STREAM_ARRIVED, ({ error, result }) => {
			if (error) {
				return;
			}
			this.setState({
				localVideoUrl: result.stream.toURL()
			});
		});

		this.subscriptions.onRemoteStreamArrived = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_REMOTE_STREAM_ARRIVED, ({ error, result }) => {
			if (error) {
				return;
			}
			this.setState({
				remoteVideoUrl: result.stream.toURL()
			});
		});

		this.subscriptions.onFreeCallStatusChanged = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_FREE_CALL_STATUS_CHANGED, ({ error, result }) => {
			if (error) {
				return;
			}

			this.setState({ status: result.status });
		});

		this.subscriptions.onFreeCallStatusChangedByMe = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_FREE_CALL_STATUS_CHANGED_BY_ME, ({ error, result }) => {
			if (error) {
				return;
			}
		});
	};
	clearSubscriptions() {
		for (let subscriptionName in this.subscriptions) {
			this.subscriptions[subscriptionName].remove();
		}
	};

	componentDidMount() {
		this.addSubscriptions();
		if (this.props.withBackButtonHandler) {
			BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
		}
	};
	componentWillUnmount() {
		this.clearSubscriptions();
		if (this.props.withBackButtonHandler) {
			BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
		}
	};

	render() {
		return (
			<ScreenBlockComponent
				fullScreen={true}
				withStatusbar={this.props.withStatusbar}
				screenStyle={this.props.screenStyle}
				statusbarStyle={this.props.statusbarStyle}
				getCoreInstances={this.props.getCoreInstances}
			>

			</ScreenBlockComponent>
		);
	};
};

export default VideoCallComponent;

