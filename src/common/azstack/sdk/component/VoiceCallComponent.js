import React from 'react';
import {
	BackHandler,
	View,
	Text,
	Image,
	TouchableOpacity
} from 'react-native';
import InCallManager from 'react-native-incall-manager';
import Video from 'react-native-video';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import TimerTextComponent from './part/common/TimerTextComponent';
import PulseAnimateComponent from './part/common/PulseAnimateComponent';

class VoiceCallComponent extends React.Component {
	constructor(props) {
		super(props);
		this.coreInstances = props.getCoreInstances();
		this.subscriptions = {};

		let isOnCall = false;
		let textLineOne = '';
		let textLineTwo = '';

		switch (props.callData.callType) {
			case this.coreInstances.AZStackCore.callConstants.CALL_TYPE_CALLOUT:
				isOnCall = true;
				textLineOne = props.callData.fullname || props.callData.toPhoneNumber;
				textLineTwo = props.callData.fullname ? props.callData.toPhoneNumber : '';
				break;
			case this.coreInstances.AZStackCore.callConstants.CALL_TYPE_CALLIN:
				isOnCall = false;
				textLineOne = props.callData.fullname || props.callData.toPhoneNumber;
				textLineTwo = props.callData.fullname ? props.callData.toPhoneNumber : '';
				break;
			case this.coreInstances.AZStackCore.callConstants.CALL_TYPE_FREE_CALL:
				isOnCall = props.callData.isCaller;
				textLineOne = props.callData.fullname;
				textLineTwo = '';
				break;
			default:
				break;
		};

		this.state = {
			status: props.callData.status,
			isAudioOn: true,
			isSpeakerOn: false,
			isOnCall: isOnCall,
			textLineOne: textLineOne,
			textLineTwo: textLineTwo,
			showTimerText: false,
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

		this.notAnswerInterval = {
			runner: null,
			time: 0
		};

		this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);
	};

	onHardBackButtonPressed() {
		return true;
	};

	addSubscriptions() {
		this.subscriptions.onCalloutStatusChanged = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_CALLOUT_STATUS_CHANGED, ({ error, result }) => {
			if (error) {
				return;
			}

			this.setState({ status: result.status });

			switch (result.status) {
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_UNKNOWN:
					this.setState({
						showTimerText: false,
						showButtons: false,
						audios: Object.assign({}, this.state.audios, { ringingOut: false, error: true })
					});
					setTimeout(() => {
						this.props.onCallEnded();
					}, 1500);
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_CONNECTING:
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_RINGING:
					this.setState({ audios: Object.assign({}, this.state.audios, { ringingOut: true }) });
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_ANSWERED:
					this.setState({
						showTimerText: true,
						audios: Object.assign({}, this.state.audios, { ringingOut: false })
					});
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_REJECTED:
					this.setState({
						showButtons: false,
						audios: Object.assign({}, this.state.audios, { ringingOut: false, rejected: true })
					});
					setTimeout(() => {
						this.props.onCallEnded();
					}, 1500);
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_BUSY:
					this.setState({
						showButtons: false,
						audios: Object.assign({}, this.state.audios, { ringingOut: false, busy: true })
					});
					setTimeout(() => {
						this.props.onCallEnded();
					}, 1500);
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_NOT_ANSWERED:
					this.setState({
						showButtons: false,
						audios: Object.assign({}, this.state.audios, { ringingOut: false, notAnswered: true })
					});
					setTimeout(() => {
						this.props.onCallEnded();
					}, 1500);
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_STOP:
					this.setState({
						showTimerText: false,
						showButtons: false,
						audios: Object.assign({}, this.state.audios, { ringingOut: false, end: true })
					});
					setTimeout(() => {
						this.props.onCallEnded();
					}, 1500);
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_NOT_ENOUGH_BALANCE:
					this.setState({
						showTimerText: false,
						showButtons: false,
						audios: Object.assign({}, this.state.audios, { ringingOut: false, error: true })
					});
					setTimeout(() => {
						this.props.onCallEnded();
					}, 1500);
					break;
			}
		});

		this.subscriptions.onCallinStatusChanged = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_CALLIN_STATUS_CHANGED, ({ error, result }) => {
			if (error) {
				return;
			}

			this.setState({ status: result.status });

			switch (result.status) {
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_UNKNOWN:

					clearInterval(this.notAnswerInterval.runner);
					this.notAnswerInterval.runner = null;
					this.notAnswerInterval.time = 0;

					this.setState({
						showTimerText: false,
						showButtons: false,
						audios: Object.assign({}, this.state.audios, { ringingIn: false, error: true })
					});
					setTimeout(() => {
						this.props.onCallEnded();
					}, 1500);
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING_STOP:

					clearInterval(this.notAnswerInterval.runner);
					this.notAnswerInterval.runner = null;
					this.notAnswerInterval.time = 0;

					this.setState({
						showTimerText: false,
						showButtons: false,
						audios: Object.assign({}, this.state.audios, { ringingIn: false, end: true }),
						status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_STOP
					});
					setTimeout(() => {
						this.props.onCallEnded();
					}, 1500);
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_STOP:
					this.setState({
						showTimerText: false,
						showButtons: false,
						audios: Object.assign({}, this.state.audios, { end: true })
					});
					setTimeout(() => {
						this.props.onCallEnded();
					}, 1500);
					break;
				default:
					break;
			}
		});
		this.subscriptions.onCallinStatusChangedByMe = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_CALLIN_STATUS_CHANGED_BY_ME, ({ error, result }) => {

			if (error) {
				return;
			}

			switch (result.status) {
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING:
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_UNKNOWN:
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_ANSWERED:
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_BUSY:
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_NOT_ANSWERED:
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING_STOP:
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_STOP:

					clearInterval(this.notAnswerInterval.runner);
					this.notAnswerInterval.runner = null;
					this.notAnswerInterval.time = 0;

					this.props.onCallEnded();
				default:
					break;
			}
		});

		this.subscriptions.onFreeCallStatusChanged = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_FREE_CALL_STATUS_CHANGED, ({ error, result }) => {
			if (error) {
				return;
			}

			this.setState({ status: result.status });

			switch (result.status) {
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_UNKNOWN:
					clearInterval(this.notAnswerInterval.runner);
					this.notAnswerInterval.runner = null;
					this.notAnswerInterval.time = 0;

					this.setState({
						showTimerText: false,
						showButtons: false,
						audios: Object.assign({}, this.state.audios, { ringingIn: false, ringingOut: false, error: true })
					});
					setTimeout(() => {
						this.props.onCallEnded();
					}, 1500);
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_CONNECTING:
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_RINGING:
					this.setState({ audios: Object.assign({}, this.state.audios, { ringingOut: true }) });
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_ANSWERED:
					this.setState({
						showTimerText: true,
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
					clearInterval(this.notAnswerInterval.runner);
					this.notAnswerInterval.runner = null;
					this.notAnswerInterval.time = 0;

					this.setState({
						showTimerText: false,
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
					break;
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_UNKNOWN:
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_ANSWERED:
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_BUSY:
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_REJECTED:
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_STOP:
				case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_NOT_ANSWERED:
					clearInterval(this.notAnswerInterval.runner);
					this.notAnswerInterval.runner = null;
					this.notAnswerInterval.time = 0;

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

		switch (this.props.callData.callType) {
			case this.coreInstances.AZStackCore.callConstants.CALL_TYPE_CALLOUT:

				switch (this.state.status) {
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_INITIAL_BUSY:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLOUT_STATUS_MESSAGE_INITIAL_BUSY_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_INITIAL_NOT_ENOUGH_BALANCE:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLOUT_STATUS_MESSAGE_INITIAL_NOT_ENOUGH_BALANCE_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_INITIAL_INVALID_TO_NUMBER:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLOUT_STATUS_MESSAGE_INITIAL_TO_NUMBER_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_INITIAL_INVALID_FROM_NUMBER:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLOUT_STATUS_MESSAGE_INITIAL_FROM_NUMBER_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_UNKNOWN:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLOUT_STATUS_MESSAGE_UNKNOWN_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_CONNECTING:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLOUT_STATUS_MESSAGE_CONNECTING_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_RINGING:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLOUT_STATUS_MESSAGE_RINGING_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_ANSWERED:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLOUT_STATUS_MESSAGE_ANSWERED_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_REJECTED:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLOUT_STATUS_MESSAGE_REJECTED_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_BUSY:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLOUT_STATUS_MESSAGE_BUSY_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_NOT_ANSWERED:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLOUT_STATUS_MESSAGE_NOT_ANSWERED_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_STOP:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLOUT_STATUS_MESSAGE_STOP_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_NOT_ENOUGH_BALANCE:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLOUT_STATUS_MESSAGE_NOT_ENOUGH_BALANCE_TEXT');
						break;
				}

				break;
			case this.coreInstances.AZStackCore.callConstants.CALL_TYPE_CALLIN:
				switch (this.state.status) {
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_UNKNOWN:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLOUT_STATUS_MESSAGE_STOP_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLIN_STATUS_MESSAGE_RINGING_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_ANSWERED:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLIN_STATUS_MESSAGE_ANSWERED_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_BUSY:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLIN_STATUS_MESSAGE_BUSY_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_NOT_ANSWERED:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLIN_STATUS_MESSAGE_NOT_ANSWERED_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING_STOP:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLIN_STATUS_MESSAGE_RINGING_STOP_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_STOP:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_CALLIN_STATUS_MESSAGE_STOP_TEXT');
						break;
					default:
						break;
				}
				break;
			case this.coreInstances.AZStackCore.callConstants.CALL_TYPE_FREE_CALL:
				switch (this.state.status) {
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_UNKNOWN:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_FREE_CALL_STATUS_MESSAGE_UNKNOWN_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_CONNECTING:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_FREE_CALL_STATUS_MESSAGE_CONNECTING_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_RINGING:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_FREE_CALL_STATUS_MESSAGE_RINGING_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_ANSWERED:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_FREE_CALL_STATUS_MESSAGE_ANSWERED_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_BUSY:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_FREE_CALL_STATUS_MESSAGE_BUSY_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_REJECTED:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_FREE_CALL_STATUS_MESSAGE_REJECTED_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_STOP:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_FREE_CALL_STATUS_MESSAGE_STOP_TEXT');
						break;
					case this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_NOT_ANSWERED:
						statusMessage = this.coreInstances.Language.getText('VOICE_CALL_FREE_CALL_STATUS_MESSAGE_NOT_ANSWERED_TEXT');
						break;
					default:
						break;
				}
				break;
			default:
				break;
		};

		return statusMessage;
	};

	onEndCallButtonPressed() {
		switch (this.props.callData.callType) {
			case this.coreInstances.AZStackCore.callConstants.CALL_TYPE_CALLOUT:
				this.coreInstances.AZStackCore.stopCallout({}).then((result) => { }).catch((error) => { });
				this.setState({
					showTimerText: false,
					showButtons: false,
					audios: Object.assign({}, this.state.audios, { ringingOut: false, end: true }),
					status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_STOP
				});
				setTimeout(() => {
					this.props.onCallEnded();
				}, 1500);
				break;
			case this.coreInstances.AZStackCore.callConstants.CALL_TYPE_CALLIN:
				this.coreInstances.AZStackCore.stopCallin({}).then((result) => { }).catch((error) => { });
				this.setState({
					showTimerText: false,
					showButtons: false,
					audios: Object.assign({}, this.state.audios, { end: true }),
					status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_STOP
				});
				setTimeout(() => {
					this.props.onCallEnded();
				}, 1500);
				break;
			case this.coreInstances.AZStackCore.callConstants.CALL_TYPE_FREE_CALL:
				this.coreInstances.AZStackCore.stopFreeCall({}).then((result) => { }).catch((error) => { });
				this.setState({
					showTimerText: false,
					showButtons: false,
					audios: Object.assign({}, this.state.audios, { ringingOut: false, end: true }),
					status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_STOP
				});
				setTimeout(() => {
					this.props.onCallEnded();
				}, 1500);
				break;
			default:
				break;
		};
	};
	onAnswerButtonPressed() {
		switch (this.props.callData.callType) {
			case this.coreInstances.AZStackCore.callConstants.CALL_TYPE_CALLOUT:
				break;
			case this.coreInstances.AZStackCore.callConstants.CALL_TYPE_CALLIN:
				clearInterval(this.notAnswerInterval.runner);
				this.notAnswerInterval.runner = null;
				this.notAnswerInterval.time = 0;

				this.coreInstances.AZStackCore.answerCallin({}).then((result) => { }).catch((error) => { });
				this.setState({
					isOnCall: true,
					showTimerText: true,
					audios: Object.assign({}, this.state.audios, { ringingIn: false }),
					status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_ANSWERED
				});
				break;
			case this.coreInstances.AZStackCore.callConstants.CALL_TYPE_FREE_CALL:
				clearInterval(this.notAnswerInterval.runner);
				this.notAnswerInterval.runner = null;
				this.notAnswerInterval.time = 0;

				this.coreInstances.AZStackCore.answerFreeCall({}).then((result) => { }).catch((error) => { });
				this.setState({
					isOnCall: true,
					showTimerText: true,
					audios: Object.assign({}, this.state.audios, { ringingIn: false }),
					status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_ANSWERED
				});
				break;
			default:
				break;
		};
	};
	onRejectButtonPressed() {
		switch (this.props.callData.callType) {
			case this.coreInstances.AZStackCore.callConstants.CALL_TYPE_CALLOUT:
				break;
			case this.coreInstances.AZStackCore.callConstants.CALL_TYPE_CALLIN:
				clearInterval(this.notAnswerInterval.runner);
				this.notAnswerInterval.runner = null;
				this.notAnswerInterval.time = 0;

				this.coreInstances.AZStackCore.rejectCallin({}).then((result) => { }).catch((error) => { });
				this.setState({
					showButtons: false,
					audios: Object.assign({}, this.state.audios, { ringingIn: false, rejected: true }),
					status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING_STOP
				});
				setTimeout(() => {
					this.props.onCallEnded();
				}, 1500);

				break;
			case this.coreInstances.AZStackCore.callConstants.CALL_TYPE_FREE_CALL:
				clearInterval(this.notAnswerInterval.runner);
				this.notAnswerInterval.runner = null;
				this.notAnswerInterval.time = 0;

				this.coreInstances.AZStackCore.rejectFreeCall({}).then((result) => { }).catch((error) => { });
				this.setState({
					showButtons: false,
					audios: Object.assign({}, this.state.audios, { ringingIn: false, rejected: true }),
					status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_REJECTED
				});
				setTimeout(() => {
					this.props.onCallEnded();
				}, 1500);

				break;
			default:
				break;
		};
	};
	onToggleAudioButtonPressed() {
		this.setState({ isAudioOn: !this.state.isAudioOn }, () => {
			this.coreInstances.AZStackCore.toggleAudioState({
				state: this.state.isAudioOn ? this.coreInstances.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_ON : this.coreInstances.AZStackCore.callConstants.CALL_WEBRTC_AUDIO_STATE_OFF
			}, (error, result) => { });
		});
	};
	onToggleSpeakerButtonPressed() {
		this.setState({ isSpeakerOn: !this.state.isSpeakerOn }, () => {
			InCallManager.setForceSpeakerphoneOn(this.state.isSpeakerOn);
		});
	};

	componentDidMount() {
		this.addSubscriptions();
		if (this.props.withBackButtonHandler) {
			BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
		}
		switch (this.props.callData.callType) {
			case this.coreInstances.AZStackCore.callConstants.CALL_TYPE_CALLOUT:
				this.setState({
					status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_CONNECTING
				});
				this.coreInstances.AZStackCore.startCallout({
					toPhoneNumber: this.props.callData.toPhoneNumber,
					fromPhoneNumber: this.props.callData.fromPhoneNumber
				}).then((result) => {

				}).catch((error) => {
					this.setState({
						status: error.status ? error.status : this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_UNKNOWN,
						showButtons: false,
						audios: Object.assign({}, this.state.audios, { error: true })
					});
					setTimeout(() => {
						this.props.onCallEnded();
					}, 1500);
				});
				break;
			case this.coreInstances.AZStackCore.callConstants.CALL_TYPE_CALLIN:
				this.setState({
					audios: Object.assign({}, this.state.audios, { ringingIn: true }),
					status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING
				});
				this.notAnswerInterval.runner = setInterval(() => {
					this.notAnswerInterval.time += 1;
					if (this.notAnswerInterval.time >= 30) {
						clearInterval(this.notAnswerInterval.runner);
						this.notAnswerInterval.runner = null;
						this.notAnswerInterval.time = 0;

						this.coreInstances.AZStackCore.notAnsweredCallin({}).then((result) => { }).catch((error) => { });
						this.setState({
							showButtons: false,
							audios: Object.assign({}, this.state.audios, { ringingIn: false, notAnswered: true }),
							status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_NOT_ANSWERED
						});
						setTimeout(() => {
							this.props.onCallEnded();
						}, 1500);
					}
				}, 1000);
				break;
			case this.coreInstances.AZStackCore.callConstants.CALL_TYPE_FREE_CALL:
				if (this.props.callData.isCaller) {
					this.setState({
						status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_CONNECTING
					});
					this.coreInstances.AZStackCore.startFreeCall({
						mediaType: this.coreInstances.AZStackCore.callConstants.CALL_MEDIA_TYPE_AUDIO,
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
						audios: Object.assign({}, this.state.audios, { ringingIn: true }),
						status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_RINGING
					});
					this.notAnswerInterval.runner = setInterval(() => {
						this.notAnswerInterval.time += 1;
						if (this.notAnswerInterval.time >= 30) {
							clearInterval(this.notAnswerInterval.runner);
							this.notAnswerInterval.runner = null;
							this.notAnswerInterval.time = 0;

							this.coreInstances.AZStackCore.notAnswerFreeCall({}).then((result) => { }).catch((error) => { });
							this.setState({
								showButtons: false,
								audios: Object.assign({}, this.state.audios, { ringingIn: false, notAnswered: true }),
								status: this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_NOT_ANSWERED
							});
							setTimeout(() => {
								this.props.onCallEnded();
							}, 1500);
						}
					}, 1000);
				}
				break;
			default:
				break;
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
				<View
					style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_BLOCK_STYLE')}
				>
					<View
						style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_TOP_PART_BLOCK_STYLE')}
					>
						<Text
							style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_FULLNAME_TEXT_STYLE')}
						>
							{this.state.textLineOne}
						</Text>
						{
							!!this.state.textLineTwo && (
								<Text
									style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_PHONE_NUMBER_TEXT_STYLE')}
								>
									{this.state.textLineTwo}
								</Text>
							)
						}
						<Text
							style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_STATUS_MESSAGE_TEXT_STYLE')}
						>
							{this.getStatusMessage()}
						</Text>
						<View
							style={this.coreInstances.CustomStyle.getStyle('VOICE_CALL_CALL_TIME_BLOCK_STYLE')}
						>
							{
								this.state.showTimerText && <TimerTextComponent />
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
							this.state.showButtons &&
							!this.state.isOnCall && (
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
							this.state.showButtons &&
							this.state.isOnCall && (
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
											source={this.coreInstances.CustomStyle.getImage('IMAGE_VOICE_OFF')}
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

