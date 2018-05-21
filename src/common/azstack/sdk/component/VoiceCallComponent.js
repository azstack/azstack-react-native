import React from 'react';
import {
	BackHandler,
	View,
	Text,
	Image,
	TouchableOpacity
} from 'react-native';
import InCallManager from 'react-native-incall-manager';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import TimerTextComponent from './part/common/TimerTextComponent';
import PulseAnimateComponent from './part/common/PulseAnimateComponent';

class VoiceCallComponent extends React.Component {
	constructor(props) {
		super(props);
		this.coreInstances = props.getCoreInstances();
		this.subscriptions = {};
		this.state = {
			isIncomingCall: props.isIncomingCall,
			status: null,
			message: props.isIncomingCall ? this.coreInstances.Language.getText('CALL_RINGING') : this.coreInstances.Language.getText('CALL_CONNECTING'),
			isAudioOn: true,
			isSpeakerOn: false,
		};

		this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);
	};

	onHardBackButtonPressed() {
		return true;
	};

	addSubscriptions() {
		this.subscriptions.onCalloutStartReturn = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_CALLOUT_START_RETURN, ({ error, result }) => {
			if (error.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_INITIAL_BUSY ||
				error.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_INITIAL_NOT_ENOUGH_BALANCE ||
				error.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_INITIAL_INVALID_TO_NUMBER ||
				error.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_INITIAL_INVALID_FROM_NUMBER) {
				this.props.onCallEnded();
			}
		});
		this.subscriptions.onCalloutStatusChanged = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_CALLOUT_STATUS_CHANGED, ({ error, result }) => {
			if (error) {
				return;
			}

			if (result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING) {
				InCallManager.start({ media: 'audio', ringback: '_BUNDLE_' });
			}

			if (result.status !== this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING) {
				if (this.state.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING) {
					InCallManager.stopRingback();
				}
			}

			this.setState({ status: result.status, message: this.getStatusMessage(result.status) });

			if (result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_STOP ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_BUSY ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_NOT_ANSWERED ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_UNKNOWN ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_NOT_ENOUGH_BALANCE) {

				this.props.onCallEnded();
			}
		});

		this.subscriptions.onCallinStatusChanged = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_CALLIN_STATUS_CHANGED, ({ error, result }) => {
			if (error) {
				return;
			}

			this.setState({ status: result.status, message: this.getStatusMessage(result.status) });

			if (result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING) {
				InCallManager.startRingtone('_BUNDLE_');
			}

			if (result.status !== this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING) {
				InCallManager.stopRingtone();
			}

			if (result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_STOP ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING_STOP ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_BUSY ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_UNKNOWN ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_NOT_ANSWERED) {

				this.props.onCallEnded();
			}
		});

		this.subscriptions.onCallinStatusChangedByMe = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_CALLIN_STATUS_CHANGED_BY_ME, ({ error, result }) => {

			if (error) {
				return;
			}

			if (result.status !== this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING) {
				InCallManager.stop();
				this.props.onCallEnded();
			}
		});

		this.subscriptions.onFreeCallStatusChanged = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_FREE_CALL_STATUS_CHANGED, ({ error, result }) => {
			if (error) {
				return;
			}

			this.setState({ status: result.status, message: this.getStatusMessage(result.status) });

			if (result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_RINGING) {
				InCallManager.start({ media: 'audio' });
			}

			if (result.status !== this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_RINGING) {
				InCallManager.stop();
			}

			if (result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_REJECTED ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_STOP ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_BUSY ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_UNKNOWN ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_NOT_ANSWERED) {

				this.props.onCallEnded();
			}
		});

		this.subscriptions.onFreeCallStatusChangedByMe = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_FREE_CALL_STATUS_CHANGED_BY_ME, ({ error, result }) => {
			if (error) {
				return;
			}

			this.setState({ status: result.status, message: this.getStatusMessage(result.status) });

			if (result.status !== this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_RINGING) {
				InCallManager.stop();
				this.props.onCallEnded();
			}
		});
	};
	clearSubscriptions() {
		for (let subscriptionName in this.subscriptions) {
			this.subscriptions[subscriptionName].remove();
		}
	};

	getStatusMessage(status) {
		if (status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_CONNECTING ||
			status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_CONNECTING) {
			return this.coreInstances.Language.getText('CALL_CONNECTING');
		}
		if (status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_BUSY ||
			status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_BUSY ||
			status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_BUSY) {
			return this.coreInstances.Language.getText('CALL_BUSY');
		}
		if (status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_NOT_ANSWERED ||
			status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_NOT_ANSWERED ||
			status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_NOT_ANSWERED) {
			return this.coreInstances.Language.getText('CALL_NOT_ANSWERED');
		}
		if (status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING ||
			status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_RINGING ||
			status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_RINGING) {
			return this.coreInstances.Language.getText('CALL_RINGING');
		}
		if (status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_REJECTED ||
			status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_REJECTED ||
			status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING_STOP) {
			return this.coreInstances.Language.getText('CALL_REJECTED');
		}
		if (status === 700) {
			return this.coreInstances.Language.getText('CALL_END');
		}
		if (status === 200) {
			return this.coreInstances.Language.getText('CALL_CALLING');
		}
		return this.coreInstances.Language.getText('CALL_UNKNOWN');
	};

	onEndCallButtonPressed() {
		InCallManager.stopRingback();
		this.props.endCall();
		this.setState({ message: 'Ending' });
	};
	onAnswerButtonPressed() {
		this.props.answerCall();
		this.setState({ isIncomingCall: false, status: 200, message: "Calling" });
	};
	onRejectButtonPressed() {
		this.props.rejectCall();
	};
	onToggleAudioButtonPressed() {
		this.props.toggleAudio(!this.state.isAudioOn);
		this.setState({ isAudioOn: !this.state.isAudioOn });
	};
	onToggleSpeakerButtonPressed() {
		this.setState({ isSpeakerOn: !this.state.isSpeakerOn });
		InCallManager.setForceSpeakerphoneOn(!this.state.isSpeakerOn);
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
				<View
					style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_BLOCK_STYLE')}
				>
					<View
						style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_TOP_PART_BLOCK_STYLE')}
					>
						<Text
							style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_FULLNAME_TEXT_STYLE')}
						>
							{this.props.info.fullname || this.props.info.phoneNumber}
						</Text>
						{
							!!this.props.info.fullname &&
							!!this.props.info.phoneNumber && (
								<Text
									style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_PHONE_NUMBER_TEXT_STYLE')}
								>
									{this.props.info.phoneNumber}
								</Text>
							)
						}
						<Text
							style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_STATUS_MESSAGE_TEXT_STYLE')}
						>
							{this.state.message}
						</Text>
						<View
							style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_CALL_TIME_BLOCK_STYLE')}
						>
							{
								this.state.status === 200 && <TimerTextComponent />
							}
						</View>
					</View>
					<View
						style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_MIDDLE_PART_BLOCK_STYLE')}
					>
						<PulseAnimateComponent
							style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_PULSE_BLOCK_STYLE')}
							{...this.coreInstances.CustomStyle.getStyle('VOICE_CALL_PULSE_PROPS_STYLE')}
							image={{
								source: this.coreInstances.CustomStyle.getImage('IMAGE_AVATAR'),
								style: this.coreInstances.CustomStyle.getStyle('VOICE_CALL_PULSE_IMAGE_STYLE')
							}}
						/>
					</View>
					<View
						style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_BOTTOM_PART_BLOCK_STYLE')}
					>
						{
							this.state.isIncomingCall && (
								<View
									style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_BUTTONS_BLOCK_STYLE')}
								>
									<TouchableOpacity
										style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_ANSWER_BUTTON_BLOCK_STYLE')}
										activeOpacity={0.5}
										onPress={() => this.onAnswerButtonPressed()}
									>
										<Image
											source={this.coreInstances.CustomStyle.getImage('IMAGE_ANSWER_CALL')}
											style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_ANSWER_BUTTON_IMAGE_STYLE')}
										/>
									</TouchableOpacity>
									<TouchableOpacity
										style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_REJECT_BUTTON_BLOCK_STYLE')}
										activeOpacity={0.5}
										onPress={() => this.onRejectButtonPressed()}
									>
										<Image
											source={this.coreInstances.CustomStyle.getImage('IMAGE_REJECT_CALL')}
											style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_REJECT_BUTTON_IMAGE_STYLE')}
										/>
									</TouchableOpacity>
								</View>
							)
						}
						{
							!this.state.isIncomingCall && (
								<View
									style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_BUTTONS_BLOCK_STYLE')}
								>
									<TouchableOpacity
										style={[
											this.coreInstances.CustomStyle.getStyle('VOICE_CALL_TOGGLE_AUDIO_BUTTON_BLOCK_STYLE'),
											!this.state.isAudioOn ? this.coreInstances.CustomStyle.getStyle('VOICE_CALL_TOGGLE_AUDIO_BUTTON_ACTIVE_STYLE') : {}
										]}
										activeOpacity={0.5}
										onPress={() => this.onToggleAudioButtonPressed()}
									>
										<Image
											style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_TOGGLE_AUDIO_BUTTON_IMAGE_STYLE')}
											source={this.coreInstances.CustomStyle.getImage('IMAGE_MUTED')}
										/>
									</TouchableOpacity>
									<TouchableOpacity
										style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_END_BUTTON_BLOCK_STYLE')}
										activeOpacity={0.5}
										onPress={() => this.onEndCallButtonPressed()}
									>
										<Image
											style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_END_BUTTON_IMAGE_STYLE')}
											source={this.coreInstances.CustomStyle.getImage('IMAGE_END_CALL')}
										/>
									</TouchableOpacity>
									<TouchableOpacity
										style={[
											this.coreInstances.CustomStyle.getStyle('VOICE_CALL_TOGGLE_SPEAKER_BUTTON_BLOCK_STYLE'),
											this.state.isSpeakerOn ? this.coreInstances.CustomStyle.getStyle('VOICE_CALL_TOGGLE_SPEAKER_BUTTON_ACTIVE_STYLE') : {}
										]}
										activeOpacity={0.5}
										onPress={() => this.onToggleSpeakerButtonPressed()}
									>
										<Image
											style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_TOGGLE_SPEAKER_BUTTON_IMAGE_STYLE')}
											source={this.coreInstances.CustomStyle.getImage('IMAGE_SPEAKER')}
										/>
									</TouchableOpacity>
								</View>
							)
						}
					</View>
				</View>
			</ScreenBlockComponent>
		);
	};
};

export default VoiceCallComponent;

