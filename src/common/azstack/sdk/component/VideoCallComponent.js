import React from 'react';
import {
	BackHandler,
	View,
	Text,
	Image,
	TouchableOpacity,
	TouchableWithoutFeedback
} from 'react-native';
import {
	RTCView
} from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import Video from 'react-native-video';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import TimerTextComponent from './part/common/TimerTextComponent';
import TimeoutCallComponent from './part/common/TimeoutCallComponent';
import PulseAnimateComponent from './part/common/PulseAnimateComponent';

class VideoCallComponent extends React.Component {
	constructor(props) {
		super(props);
		this.coreInstances = props.getCoreInstances();
		this.subscriptions = {};

		this.state = {
			localVideoUrl: null,
			remoteVideoUrl: null,
			status: null,
			isOnCall: false,
			showLocalVideo: false,
			showControlBlock: false,
			isAudioOn: true,
			isVideoOn: true,
			isSpeakerOn: false,
			timeoutNotAnswer: false,
			showButtons: true,
			audios: {
				ringingOut: false,
				ringingIn: false,
				error: false,
				busy: false,
				rejected: false,
				notAnswered: false,
				end: false
			}
		};

		this.timeoutHideControlBlock = null;

		this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);

		this.onNotAnsweredTimeUp = this.onNotAnsweredTimeUp.bind(this);
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
			}, () => {
				setTimeout(() => {
					this.setState({ showLocalVideo: true });
				}, 500);
			});
		});

		this.subscriptions.onFreeCallStatusChanged = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_FREE_CALL_STATUS_CHANGED, ({ error, result }) => {
			if (error) {
				return;
			}

			this.setState({ status: result.status });

			switch (result.status) {
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_UNKNOWN:
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_CONNECTING:
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_RINGING:
					this.setState({ audios: Object.assign({}, this.state.audios, { ringingOut: true }) });
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_ANSWERED:
					this.setState({
						isOnCall: true,
						audios: Object.assign({}, this.state.audios, { ringingOut: false })
					});
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_BUSY:
					this.setState({
						showButtons: false,
						audios: Object.assign({}, this.state.audios, { ringingOut: false, busy: true })
					});
					setTimeout(() => {
						this.props.onCallEnded();
					}, 1500);
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_REJECTED:
					this.setState({
						showButtons: false,
						audios: Object.assign({}, this.state.audios, { ringingOut: false, rejected: true })
					});
					setTimeout(() => {
						this.props.onCallEnded();
					}, 1500);
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_STOP:
					this.setState({
						isOnCall: false,
						timeoutNotAnswer: false,
						showButtons: false,
						audios: Object.assign({}, this.state.audios, { ringingIn: false, end: true })
					});
					setTimeout(() => {
						this.props.onCallEnded();
					}, 1500);
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_NOT_ANSWERED:
					this.setState({
						showButtons: false,
						audios: Object.assign({}, this.state.audios, { ringingOut: false, notAnswered: true })
					});
					setTimeout(() => {
						this.props.onCallEnded();
					}, 1500);
					break;
				default:
					break;
			}
		});
		this.subscriptions.onFreeCallStatusChangedByMe = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_FREE_CALL_STATUS_CHANGED_BY_ME, ({ error, result }) => {
			if (error) {
				return;
			}

			switch (result.status) {
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_CONNECTING:
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_RINGING:
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_UNKNOWN:
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_ANSWERED:
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_BUSY:
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_REJECTED:
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_STOP:
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_NOT_ANSWERED:
					this.props.onCallEnded();
				default:
					break;
			}
		});
	};
	clearSubscriptions() {
		for (let subscriptionName in this.subscriptions) {
			this.subscriptions[subscriptionName].remove();
		}
	};

	getStatusMessage() {
		let statusMessage = '';

		switch (this.state.status) {
			case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_UNKNOWN:
				statusMessage = this.coreInstances.Language.getText('VIDEO_CALL_FREE_CALL_STATUS_MESSAGE_UNKNOWN_TEXT');
				break;
			case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_CONNECTING:
				statusMessage = this.coreInstances.Language.getText('VIDEO_CALL_FREE_CALL_STATUS_MESSAGE_CONNECTING_TEXT');
				break;
			case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_RINGING:
				statusMessage = this.coreInstances.Language.getText('VIDEO_CALL_FREE_CALL_STATUS_MESSAGE_RINGING_TEXT');
				break;
			case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_ANSWERED:
				statusMessage = this.coreInstances.Language.getText('VIDEO_CALL_FREE_CALL_STATUS_MESSAGE_ANSWERED_TEXT');
				break;
			case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_BUSY:
				statusMessage = this.coreInstances.Language.getText('VIDEO_CALL_FREE_CALL_STATUS_MESSAGE_BUSY_TEXT');
				break;
			case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_REJECTED:
				statusMessage = this.coreInstances.Language.getText('VIDEO_CALL_FREE_CALL_STATUS_MESSAGE_REJECTED_TEXT');
				break;
			case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_STOP:
				statusMessage = this.coreInstances.Language.getText('VIDEO_CALL_FREE_CALL_STATUS_MESSAGE_STOP_TEXT');
				break;
			case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_NOT_ANSWERED:
				statusMessage = this.coreInstances.Language.getText('VIDEO_CALL_FREE_CALL_STATUS_MESSAGE_NOT_ANSWERED_TEXT');
				break;
			default:
				break;
		}

		return statusMessage;
	};

	onEndCallButtonPressed() {
		if (this.state.isOnCall && !this.state.showControlBlock) {
			return false;
		}
		this.coreInstances.AZStackCore.stopFreeCall({}).then((result) => { }).catch((error) => { });
		this.setState({
			isOnCall: false,
			showButtons: false,
			audios: Object.assign({}, this.state.audios, { ringingOut: false, end: true }),
			status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_STOP
		});
		setTimeout(() => {
			this.props.onCallEnded();
		}, 1500);
	};
	onAnswerButtonPressed() {
		this.coreInstances.AZStackCore.answerFreeCall({}).then((result) => { }).catch((error) => { });
		this.setState({
			isOnCall: true,
			timeoutNotAnswer: false,
			audios: Object.assign({}, this.state.audios, { ringingIn: false }),
			status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_ANSWERED
		});
	};
	onRejectButtonPressed() {
		this.coreInstances.AZStackCore.rejectFreeCall({}).then((result) => { }).catch((error) => { });
		this.setState({
			timeoutNotAnswer: false,
			showButtons: false,
			audios: Object.assign({}, this.state.audios, { ringingIn: false, rejected: true }),
			status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_REJECTED
		});
		setTimeout(() => {
			this.props.onCallEnded();
		}, 1500);
	};
	onNotAnsweredTimeUp() {
		this.coreInstances.AZStackCore.notAnswerFreeCall({}).then((result) => { }).catch((error) => { });
		this.setState({
			timeoutNotAnswer: false,
			showButtons: false,
			audios: Object.assign({}, this.state.audios, { ringingIn: false, notAnswered: true }),
			status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_NOT_ANSWERED
		});
		setTimeout(() => {
			this.props.onCallEnded();
		}, 1500);
	};
	onToggleAudioButtonPressed() {
		if (this.state.isOnCall && !this.state.showControlBlock) {
			return;
		}
		this.setState({ isAudioOn: !this.state.isAudioOn }, () => {
			this.coreInstances.AZStackCore.toggleAudioState({
				state: this.state.isAudioOn ? this.coreInstances.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_ON : this.coreInstances.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_OFF
			}).then((result) => { }).catch((error) => { });
		});
	};
	onToggleVideoButtonPressed() {
		if (this.state.isOnCall && !this.state.showControlBlock) {
			return;
		}
		this.setState({ isVideoOn: !this.state.isVideoOn }, () => {
			this.coreInstances.AZStackCore.toggleVideoState({
				state: this.state.isVideoOn ? this.coreInstances.AZStackCore.callConstants.CALL_WEBRTC_VIDEO_STATE_ON : this.coreInstances.AZStackCore.callConstants.CALL_WEBRTC_VIDEO_STATE_OFF
			}).then((result) => { }).catch((error) => { });
		});
	};
	onToggleSpeakerButtonPressed() {
		if (this.state.isOnCall && !this.state.showControlBlock) {
			return;
		}
		this.setState({ isSpeakerOn: !this.state.isSpeakerOn }, () => {
			InCallManager.setForceSpeakerphoneOn(this.state.isSpeakerOn);
		});
	};
	onSwitchButtonPressed() {
		if (this.state.isOnCall && !this.state.showControlBlock) {
			return;
		}
		this.coreInstances.AZStackCore.switchCameraType({}).then((result) => { }).catch((error) => { });
	};
	onOnCallViewPressed() {
		if (this.timeoutHideControlBlock) {
			clearTimeout(this.timeoutHideControlBlock);
			this.timeoutHideControlBlock = null;
		}
		if (this.state.showControlBlock) {
			this.setState({ showControlBlock: false });
		} else {
			this.setState({ showControlBlock: true });
			this.timeoutHideControlBlock = setTimeout(() => {
				this.setState({ showControlBlock: false });
				this.timeoutHideControlBlock = null;
			}, 3000);
		}

	};

	componentDidMount() {
		this.addSubscriptions();
		if (this.props.withBackButtonHandler) {
			BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
		}
		InCallManager.start();
		if (this.props.callData.isCaller) {
			this.setState({
				status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_CONNECTING
			});
			this.coreInstances.AZStackCore.startFreeCall({
				mediaType: this.coreInstances.AZStackCore.callConstants.CALL_MEDIA_TYPE_VIDEO,
				toUserId: this.props.callData.toUserId
			}).then((result) => {

			}).catch((error) => {
				this.setState({
					status: error.status ? error.status : this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_UNKNOWN,
					showButtons: false,
					audios: Object.assign({}, this.state.audios, { error: true })
				});
				setTimeout(() => {
					this.props.onCallEnded();
				}, 1500);
			});
		} else {
			this.setState({
				localVideoUrl: this.coreInstances.AZStackCore.Call.callData.webRTC.localStream.toURL(),
				timeoutNotAnswer: true,
				audios: Object.assign({}, this.state.audios, { ringingIn: true }),
				status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_RINGING
			});
		}
	};
	componentWillUnmount() {
		this.clearSubscriptions();
		if (this.props.withBackButtonHandler) {
			BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
		}
		InCallManager.stop();
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
				<Video
					source={require('../static/audio/ringing_out.wav')}
					rate={1.0}
					volume={1.0}
					muted={false}
					paused={!this.state.audios.ringingOut}
					resizeMode='cover'
					repeat={true}
					playInBackground={false}
					playWhenInactive={false}
					ignoreSilentSwitch={'ignore'}
					progressUpdateInterval={250.0}
				/>
				<Video
					source={require('../static/audio/ringing_on.wav')}
					rate={1.0}
					volume={1.0}
					muted={false}
					paused={!this.state.audios.ringingIn}
					resizeMode='cover'
					repeat={true}
					playInBackground={false}
					playWhenInactive={false}
					ignoreSilentSwitch={'ignore'}
					progressUpdateInterval={250.0}
				/>
				<Video
					source={require('../static/audio/call_error.mp3')}
					rate={1.0}
					volume={1.0}
					muted={false}
					paused={!this.state.audios.error}
					resizeMode='cover'
					repeat={false}
					playInBackground={false}
					playWhenInactive={false}
					ignoreSilentSwitch={'ignore'}
					progressUpdateInterval={250.0}
				/>
				<Video
					source={require('../static/audio/call_busy.mp3')}
					rate={1.0}
					volume={1.0}
					muted={false}
					paused={!this.state.audios.busy}
					resizeMode='cover'
					repeat={false}
					playInBackground={false}
					playWhenInactive={false}
					ignoreSilentSwitch={'ignore'}
					progressUpdateInterval={250.0}
				/>
				<Video
					source={require('../static/audio/call_rejected.mp3')}
					rate={1.0}
					volume={1.0}
					muted={false}
					paused={!this.state.audios.rejected}
					resizeMode='cover'
					repeat={false}
					playInBackground={false}
					playWhenInactive={false}
					ignoreSilentSwitch={'ignore'}
					progressUpdateInterval={250.0}
				/>
				<Video
					source={require('../static/audio/call_end.mp3')}
					rate={1.0}
					volume={1.0}
					muted={false}
					paused={!this.state.audios.end}
					resizeMode='cover'
					repeat={false}
					playInBackground={false}
					playWhenInactive={false}
					ignoreSilentSwitch={'ignore'}
					progressUpdateInterval={250.0}
				/>
				{
					this.state.timeoutNotAnswer && (
						<TimeoutCallComponent
							callTime={30}
							callFunction={this.onNotAnsweredTimeUp}
						/>
					)
				}
				<View
					style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_BLOCK_STYLE')}
				>
					{
						!this.state.isOnCall && (
							<View
								style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_BLOCK_STYLE')}
							>
								<View
									style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TOP_PART_BLOCK_STYLE')}
								>
									<Text
										style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TITLE_TEXT_STYLE')}
									>
										{this.coreInstances.Language.getText('VIDEO_CALL_FREE_CALL_TITLE_TEXT')}
									</Text>
									<Text
										style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_FULLNAME_TEXT_STYLE')}
									>
										{this.props.callData.fullname}
									</Text>
									<Text
										style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_STATUS_MESSAGE_TEXT_STYLE')}
									>
										{this.getStatusMessage()}
									</Text>
								</View>
								<View
									style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_MIDDLE_PART_BLOCK_STYLE')}
								>
									<PulseAnimateComponent
										getCoreInstances={this.props.getCoreInstances}
										style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_PULSE_BLOCK_STYLE')}
										{...this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_PULSE_PROPS_STYLE')}
										image={{
											source: this.coreInstances.CustomStyle.getImage('IMAGE_AVATAR'),
											style: this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_PULSE_IMAGE_STYLE')
										}}
									/>
								</View>
								<View
									style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_BOTTOM_PART_BLOCK_STYLE')}
								>
									{
										this.state.showButtons &&
										!this.props.callData.isCaller && (
											<View
												style={[
													this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_BUTTONS_BLOCK_STYLE'),
													this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_BUTTONS_PADDING_BIGGER_STYLE')
												]}
											>
												<TouchableOpacity
													style={[
														this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TOGGLE_AUDIO_BUTTON_BLOCK_STYLE'),
														!this.state.isAudioOn ? this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TOGGLE_AUDIO_BUTTON_ACTIVE_STYLE') : {}
													]}
													activeOpacity={0.5}
													onPress={() => this.onToggleAudioButtonPressed()}
												>
													<Image
														style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TOGGLE_AUDIO_BUTTON_IMAGE_STYLE')}
														source={this.coreInstances.CustomStyle.getImage('IMAGE_VOICE_OFF')}
													/>
												</TouchableOpacity>
												<TouchableOpacity
													style={[
														this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TOGGLE_VIDEO_BUTTON_BLOCK_STYLE'),
														!this.state.isVideoOn ? this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TOGGLE_VIDEO_BUTTON_ACTIVE_STYLE') : {}
													]}
													activeOpacity={0.5}
													onPress={() => this.onToggleVideoButtonPressed()}
												>
													<Image
														style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TOGGLE_VIDEO_BUTTON_IMAGE_STYLE')}
														source={this.coreInstances.CustomStyle.getImage('IMAGE_CAMRERA_OFF')}
													/>
												</TouchableOpacity>
												<TouchableOpacity
													style={[
														this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TOGGLE_SPEAKER_BUTTON_BLOCK_STYLE'),
														this.state.isSpeakerOn ? this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TOGGLE_SPEAKER_BUTTON_ACTIVE_STYLE') : {}
													]}
													activeOpacity={0.5}
													onPress={() => this.onToggleSpeakerButtonPressed()}
												>
													<Image
														style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TOGGLE_SPEAKER_BUTTON_IMAGE_STYLE')}
														source={this.coreInstances.CustomStyle.getImage('IMAGE_SPEAKER')}
													/>
												</TouchableOpacity>
											</View>
										)
									}
									{
										this.state.showButtons &&
										!this.props.callData.isCaller && (
											<View
												style={[
													this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_BUTTONS_BLOCK_STYLE'),
													this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_BUTTONS_PADDING_BIGGER_STYLE'),
													this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_BUTTONS_MARGIN_TOP_STYLE')
												]}
											>
												<TouchableOpacity
													style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_ANSWER_BUTTON_BLOCK_STYLE')}
													activeOpacity={0.5}
													onPress={() => this.onAnswerButtonPressed()}
												>
													<Image
														source={this.coreInstances.CustomStyle.getImage('IMAGE_ANSWER_CALL')}
														style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_ANSWER_BUTTON_IMAGE_STYLE')}
													/>
												</TouchableOpacity>
												<TouchableOpacity
													style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_REJECT_BUTTON_BLOCK_STYLE')}
													activeOpacity={0.5}
													onPress={() => this.onRejectButtonPressed()}
												>
													<Image
														source={this.coreInstances.CustomStyle.getImage('IMAGE_REJECT_CALL')}
														style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_REJECT_BUTTON_IMAGE_STYLE')}
													/>
												</TouchableOpacity>
											</View>
										)
									}
									{
										this.state.showButtons &&
										this.props.callData.isCaller && (
											<View
												style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_BUTTONS_BLOCK_STYLE')}
											>
												<TouchableOpacity
													style={[
														this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TOGGLE_AUDIO_BUTTON_BLOCK_STYLE'),
														!this.state.isAudioOn ? this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TOGGLE_AUDIO_BUTTON_ACTIVE_STYLE') : {}
													]}
													activeOpacity={0.5}
													onPress={() => this.onToggleAudioButtonPressed()}
												>
													<Image
														style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TOGGLE_AUDIO_BUTTON_IMAGE_STYLE')}
														source={this.coreInstances.CustomStyle.getImage('IMAGE_VOICE_OFF')}
													/>
												</TouchableOpacity>
												<TouchableOpacity
													style={[
														this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TOGGLE_VIDEO_BUTTON_BLOCK_STYLE'),
														!this.state.isVideoOn ? this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TOGGLE_VIDEO_BUTTON_ACTIVE_STYLE') : {}
													]}
													activeOpacity={0.5}
													onPress={() => this.onToggleVideoButtonPressed()}
												>
													<Image
														style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TOGGLE_VIDEO_BUTTON_IMAGE_STYLE')}
														source={this.coreInstances.CustomStyle.getImage('IMAGE_CAMRERA_OFF')}
													/>
												</TouchableOpacity>
												<TouchableOpacity
													style={[
														this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TOGGLE_SPEAKER_BUTTON_BLOCK_STYLE'),
														this.state.isSpeakerOn ? this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TOGGLE_SPEAKER_BUTTON_ACTIVE_STYLE') : {}
													]}
													activeOpacity={0.5}
													onPress={() => this.onToggleSpeakerButtonPressed()}
												>
													<Image
														style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_TOGGLE_SPEAKER_BUTTON_IMAGE_STYLE')}
														source={this.coreInstances.CustomStyle.getImage('IMAGE_SPEAKER')}
													/>
												</TouchableOpacity>
												<TouchableOpacity
													style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_END_BUTTON_BLOCK_STYLE')}
													activeOpacity={0.5}
													onPress={() => this.onEndCallButtonPressed()}
												>
													<Image
														style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_REQUEST_END_BUTTON_IMAGE_STYLE')}
														source={this.coreInstances.CustomStyle.getImage('IMAGE_END_CALL')}
													/>
												</TouchableOpacity>
											</View>
										)
									}
								</View>
							</View>
						)
					}
					{
						this.state.isOnCall && (
							<TouchableWithoutFeedback
								onPress={() => this.onOnCallViewPressed()}
							>
								<View
									style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_BLOCK_STYLE')}
								>
									<RTCView
										streamURL={this.state.remoteVideoUrl}
										style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_REMOTE_VIDEO_BLOCK_STYLE')}
									/>
									{
										this.state.showLocalVideo && (
											<RTCView
												streamURL={this.state.localVideoUrl}
												style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_LOCAL_VIDEO_BLOCK_STYLE')}
											/>
										)
									}
									<View
										style={[
											this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_BLOCK_STYLE'),
											(this.state.showControlBlock ? {} : this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_HIDDEN_STYLE'))
										]}
									>
										<View
											style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_TOP_PART_BLOCK_STYLE')}
										>
											<View
												style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_TOP_PART_INFORMATION_BLOCK_STYLE')}
											>
												<View
													style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_TEXTS_BLOCK_STYLE')}
												>
													<Text
														style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_FULLNAME_TEXT_STYLE')}
													>
														{this.props.callData.fullname}
													</Text>
													<TimerTextComponent
														getCoreInstances={this.props.getCoreInstances}
														style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_CALL_TIME_TEXT_STYLE')}
													/>
												</View>
												<Image
													source={this.coreInstances.CustomStyle.getImage('IMAGE_AVATAR')}
													style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_AVATAR_BLOCK_STYLE')}
												/>
											</View>
											<View
												style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_TOP_PART_BUTTONS_BLOCK_STYLE')}
											>
												<TouchableOpacity
													style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_SWITCH_CAMERA_BUTTON_BLOCK_STYLE')}
													activeOpacity={0.5}
													onPress={() => this.onSwitchButtonPressed()}
												>
													<Image
														style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_SWITCH_CAMERA_BUTTON_IMAGE_STYLE')}
														source={this.coreInstances.CustomStyle.getImage('IMAGE_SWITCH_CAMERA')}
													/>
												</TouchableOpacity>
											</View>
										</View>
										<View
											style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_MIDDLE_PART_BLOCK_STYLE')}
										>
										</View>
										<View
											style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_BOTTOM_PART_BLOCK_STYLE')}
										>
											<View
												style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_BUTTONS_BLOCK_STYLE')}
											>
												<TouchableOpacity
													style={[
														this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_TOGGLE_AUDIO_BUTTON_BLOCK_STYLE'),
														!this.state.isAudioOn ? this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_TOGGLE_AUDIO_BUTTON_ACTIVE_STYLE') : {}
													]}
													activeOpacity={0.5}
													onPress={() => this.onToggleAudioButtonPressed()}
												>
													<Image
														style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_TOGGLE_AUDIO_BUTTON_IMAGE_STYLE')}
														source={this.coreInstances.CustomStyle.getImage('IMAGE_VOICE_OFF')}
													/>
												</TouchableOpacity>
												<TouchableOpacity
													style={[
														this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_TOGGLE_VIDEO_BUTTON_BLOCK_STYLE'),
														!this.state.isVideoOn ? this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_TOGGLE_VIDEO_BUTTON_ACTIVE_STYLE') : {}
													]}
													activeOpacity={0.5}
													onPress={() => this.onToggleVideoButtonPressed()}
												>
													<Image
														style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_TOGGLE_VIDEO_BUTTON_IMAGE_STYLE')}
														source={this.coreInstances.CustomStyle.getImage('IMAGE_CAMRERA_OFF')}
													/>
												</TouchableOpacity>
												<TouchableOpacity
													style={[
														this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_TOGGLE_SPEAKER_BUTTON_BLOCK_STYLE'),
														this.state.isSpeakerOn ? this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_TOGGLE_SPEAKER_BUTTON_ACTIVE_STYLE') : {}
													]}
													activeOpacity={0.5}
													onPress={() => this.onToggleSpeakerButtonPressed()}
												>
													<Image
														style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_TOGGLE_SPEAKER_BUTTON_IMAGE_STYLE')}
														source={this.coreInstances.CustomStyle.getImage('IMAGE_SPEAKER')}
													/>
												</TouchableOpacity>
												<TouchableOpacity
													style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_END_BUTTON_BLOCK_STYLE')}
													activeOpacity={0.5}
													onPress={() => this.onEndCallButtonPressed()}
												>
													<Image
														style={this.coreInstances.CustomStyle.getStyle('VIDEO_CALL_ON_CALL_CONTROL_END_BUTTON_IMAGE_STYLE')}
														source={this.coreInstances.CustomStyle.getImage('IMAGE_END_CALL')}
													/>
												</TouchableOpacity>
											</View>
										</View>
									</View>
								</View>
							</TouchableWithoutFeedback>
						)
					}
				</View>
			</ScreenBlockComponent>
		);
	};
};

export default VideoCallComponent;