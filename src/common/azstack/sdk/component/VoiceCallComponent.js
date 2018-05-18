import React from 'react';
import {
	BackHandler,
	View,
	Text,
	TouchableWithoutFeedback,
	StyleSheet,
	Image,
	Dimensions,
	TouchableOpacity,
	FlatList,
	StatusBar,
	Platform,
	Alert,
	TextInput,
	ScrollView,
} from 'react-native';
import InCallManager from 'react-native-incall-manager';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import Timer from './part/common/Timer';
import Pulse from './part/common/Pulse';

const { height, width } = Dimensions.get('window');

const ic_end_call_white = require('../static/image/ic_end_call_white.png');
const ic_avatar = require('../static/image/ic_avatar.png');
const ic_answer_phone = require('../static/image/ic_answer_phone.png');
const ic_cancel = require('../static/image/ic_cancel.png');
const ic_muted_white = require('../static/image/ic_muted_white.png');
const ic_speaker_white = require('../static/image/ic_speaker_white.png');

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
		this.props.onEndCall();
		this.setState({ message: 'Ending' });
	};
	onAnswerButtonPressed() {
		this.props.onAnswer();
		this.setState({ isIncomingCall: false, status: 200, message: "Calling" });
	};
	onRejectButtonPressed() {
		this.props.onReject();
	};
	onToggleAudioButtonPressed() {
		this.props.onToggleAudio(!this.state.isAudioOn);
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
				<View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#353535', paddingTop: 40 }}>
					<View style={{ justifyContent: 'center', alignItems: 'center' }}>
						<Text style={{ color: '#fff', fontSize: 30, lineHeight: 35, marginTop: 5 }}>{this.props.info.fullname || this.props.info.phoneNumber}</Text>
						{
							!!this.props.info.fullname &&
							!!this.props.info.phoneNumber && (
								<Text style={{ color: '#fff', fontSize: 20, lineHeight: 25, marginTop: 5 }}>{this.props.info.phoneNumber}</Text>
							)
						}
						<Text style={{ color: '#57FFC1', fontSize: 18, lineHeight: 20, marginTop: 5 }}>{this.state.message}</Text>
						<View style={{ height: 20, marginTop: 5 }}>
							{
								this.state.status === 200 && <Timer />
							}
						</View>
					</View>
					<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
						<Pulse style={{ justifyContent: 'center', alignItems: 'center', }} color={'#48D2A0'} numPulses={7} diameter={250} duration={850} speed={34} image={{ source: ic_avatar, style: { width: 100, height: 100, borderRadius: 50, } }} />
					</View>
					<View style={{ justifyContent: 'flex-end', paddingBottom: 40 }}>
						{
							this.state.isIncomingCall && (
								<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
									<TouchableOpacity style={[styles.button, { backgroundColor: 'green', marginHorizontal: 60 }]} onPress={() => this.onAnswerButtonPressed()}>
										<Image source={ic_answer_phone} style={{ width: 30, height: 30 }} resizeMode={'contain'} />
									</TouchableOpacity>
									<TouchableOpacity style={[styles.button, { backgroundColor: 'red', marginHorizontal: 60 }]} onPress={() => this.props.onReject()}>
										<Image source={ic_cancel} style={{ width: 30, height: 30 }} resizeMode={'contain'} />
									</TouchableOpacity>
								</View>
							)
						}
						{
							!this.state.isIncomingCall && (
								<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
									<TouchableOpacity onPress={() => this.onToggleAudioButtonPressed()}>
										{this.state.isAudioOn && <View style={{
											width: 70, height: 70, borderRadius: 35,
											justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fff'
										}}>
											<Image source={ic_muted_white} /></View>}
										{!this.state.isAudioOn &&
											<View style={{
												width: 70, height: 70, borderRadius: 35,
												justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)'
											}}>
												<Image source={ic_muted_white} /></View>}
									</TouchableOpacity>
									<TouchableOpacity onPress={() => this.onEndCallButtonPressed()}>
										<View style={[styles.button, { backgroundColor: 'red' }]}>
											<Image source={ic_end_call_white} style={styles.buttonIcon} resizeMode={'contain'} />
										</View>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => this.onToggleSpeakerButtonPressed()}>
										{this.state.isSpeakerOn && <View style={{
											width: 70, height: 70, borderRadius: 35,
											justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)'
										}}><Image source={ic_speaker_white} /></View>}
										{!this.state.isSpeakerOn && <View style={{
											width: 70, height: 70, borderRadius: 35,
											justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fff'
										}}><Image source={ic_speaker_white} /></View>}
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


const styles = {
	button: {
		width: 70,
		height: 70,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 35,
	},
	buttonIcon: {
		width: 40,
		height: 40,
	},
	bottomActionBlock: {
		position: 'absolute',
		right: 0,
		left: 0,
		bottom: 0,
		justifyContent: 'flex-end',
	},
	bottomActionBlockWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 15,
		paddingBottom: 40,
	},
	userInfoCenter: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		alignItems: 'center',
		justifyContent: 'center',
	},
};

