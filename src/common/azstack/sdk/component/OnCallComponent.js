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

class OnCallComponent extends React.Component {
	constructor(props) {
		super(props);
		this.coreInstances = props.getCoreInstances();
		this.subscriptions = {};
		this.state = {
			isIncomingCall: false,
			status: null,
			message: '',
			isAudioOn: true,
			isSpeaker: false,
		};

		this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);
	}

	onHardBackButtonPressed() {
        return true;
	};

	addSubscriptions() {
		this.subscriptions.onCalloutStatusChanged = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_CALLOUT_STATUS_CHANGED, ({ error, result }) => {
			if (error) {
				return;
			}

			this.setState({ status: result.status, message: result.message });

			if (result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_INITIAL_BUSY ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_INITIAL_NOT_ENOUGH_BALANCE ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_INITIAL_INVALID_NUMBER ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_STOP ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_BUSY ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_NOT_ANSWERED ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_NOT_ENOUGH_BALANCE) {

				this.props.onCallEnded();
			}
		});

		this.subscriptions.onCallinStatusChanged = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_CALLIN_STATUS_CHANGED, ({ error, result }) => {
			if (error) {
				return;
			}

			this.setState({ status: result.status, message: result.message });

			if (result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_STOP ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING_STOP ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_BUSY ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_NOT_ANSWERED) {

				this.props.onCallEnded();
			}
		});

		this.subscriptions.onCallinStatusChangedByMe = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_CALLIN_STATUS_CHANGED_BY_ME, ({ error, result }) => {

			if (error) {
				return;
			}

			if (result.status !== this.coreInstances.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING) {
				this.props.onCallEnded();
			}
		});

		this.subscriptions.onFreeCallStatusChanged = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_FREE_CALL_STATUS_CHANGED, ({ error, result }) => {
			if (error) {
				return;
			}

			this.setState({ status: result.status, message: result.message });

			if (result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_REJECTED ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_STOP ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_BUSY ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_NOT_ANSWERED) {

				this.props.onCallEnded();
			}
		});

		this.subscriptions.onFreeCallStatusChangedByMe = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_FREE_CALL_STATUS_CHANGED_BY_ME, ({ error, result }) => {
			if (error) {
				return;
			}

			this.setState({ status: result.status, message: result.message });

			if (result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_REJECTED ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_ANSWERED ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_STOP ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_BUSY ||
				result.status === this.coreInstances.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_NOT_ANSWERED) {

				this.props.onCallEnded();
			}
		});
	};
	clearSubscriptions() {
		for (let subscriptionName in this.subscriptions) {
			this.subscriptions[subscriptionName].remove();
		}
	};

	componentWillMount() {
		if (this.props.isIncomingCall) {
			this.setState({ isIncomingCall: this.props.isIncomingCall, message: 'Ringing' });
		}
	}
	componentDidMount() {
		this.addSubscriptions();
		BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
	};
	componentWillUnmount() {
		this.clearSubscriptions();
		BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
	};

	renderStatus() {
		if (this.props.callType === CallConstant.CALL_TYPE_CALLIN) {
			return (
				<View style={{ position: 'absolute', top: 0, left: 0, }}>
					<Text style={{ color: "#fff" }}>{this.props.status}</Text>
				</View>
			);
		} else {
			return (
				<View style={{ position: 'absolute', top: 0, left: 0, }}>
					<Text style={{ color: "#fff" }}>{this.props.status}</Text>
				</View>
			);
		}
	}

	renderButtons() {
		return (
			<View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
				<TouchableOpacity onPress={() => this.toggleAudio()}>
					{this.state.isAudioOn &&  <View style={{ width: 70, height: 70, borderRadius: 35, 
					justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fff' }}>
					<Image source={ic_muted_white} /></View>}
					{!this.state.isAudioOn && 
					<View style={{ width: 70, height: 70, borderRadius: 35, 
					justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)' }}>
					<Image source={ic_muted_white} /></View>}
				</TouchableOpacity>
				<TouchableOpacity onPress={() => this.onPressEndCall()}>
					<View style={[styles.button, { backgroundColor: 'red' }]}>
						<Image source={ic_end_call_white} style={styles.buttonIcon} resizeMode={'contain'} />
					</View>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => this.toggleSpeaker()}>
					{this.state.isSpeaker && <View style={{ width: 70, height: 70, borderRadius: 35, 
					justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)'}}><Image source={ic_speaker_white} /></View>}
					{!this.state.isSpeaker && <View style={{ width: 70, height: 70, borderRadius: 35, 
					justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fff' }}><Image source={ic_speaker_white} /></View>}
				</TouchableOpacity>
			</View>
		);
	}

	renderIncomingCall() {
		return (
			<View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#353535', justifyContent: 'space-between'}}>
				<View style={{ flex: 0.3}}>
					<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
						<Text style={{ color: '#fff', fontSize: 30 }}>{this.props.info.name || this.props.info.phoneNumber}</Text>
						<Text style={{ color: '#fff', fontSize: 20}}>{this.props.info.name ? this.props.info.phoneNumber : ''}</Text>
						<Text style={{ color: '#57FFC1', fontSize: 18, }}>{this.state.message}</Text>
						{
							this.state.status === 200 && <Timer />
						}
					</View>
				</View>
				<View>
					<View style={{justifyContent: 'center', alignItems: 'center'}}>
						<Pulse style={{justifyContent: 'center', alignItems: 'center',}} color={'#48D2A0'} numPulses={7} diameter={250} duration={850} speed={34} image={{source:ic_avatar, style:{width: 100, height: 100, borderRadius: 50,}}} />
					</View>
				</View>
				<View style={{ flex: 0.3, justifyContent: 'flex-end', paddingBottom: 60}}>
					<View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
						<TouchableOpacity onPress={() => this.onPressAnswer()}>
							<View style={[styles.button, { backgroundColor: 'green', marginHorizontal: 60 }]}>
								<Image source={ic_answer_phone} style={{ width: 30, height: 30 }} resizeMode={'contain'} />
							</View>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => this.props.onReject()}>
							<View style={[styles.button, { backgroundColor: 'red', marginHorizontal: 60 }]}>
								<Image source={ic_cancel} style={{ width: 30, height: 30 }} resizeMode={'contain'} />
							</View>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		);
	}

	renderOncall() {
		return (
			<View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#353535', justifyContent: 'space-between'}}>
				<View style={{ flex: 0.3}}>
					<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
						<Text style={{ color: '#fff', fontSize: 30 }}>{this.props.info.name || this.props.info.phoneNumber}</Text>
						<Text style={{ color: '#fff', fontSize: 20}}>{this.props.info.name ? this.props.info.phoneNumber : ''}</Text>
						<Text style={{ color: '#57FFC1', fontSize: 18, }}>{this.state.message}</Text>
					</View>
				</View>
				<View>
					<View style={{justifyContent: 'center', alignItems: 'center'}}>
						<Pulse style={{justifyContent: 'center', alignItems: 'center',}} color={'#48D2A0'} numPulses={7} diameter={250} duration={560} speed={30} image={{source:ic_avatar, style:{width: 100, height: 100, borderRadius: 50,}}} />
					</View>
				</View>
				<View style={{ flex: 0.3, justifyContent: 'flex-end', paddingBottom: 60}}>
					{this.renderButtons()}
				</View>
			</View>
		);
	}

	render() {
		return (
			<ScreenBlockComponent
				fullScreen={true}
				getCoreInstances={this.props.getCoreInstances}
                statusbar={this.props.statusbar}
                style={this.props.style}
			>
				{this.state.isIncomingCall === true && this.renderIncomingCall()}
				{this.state.isIncomingCall === false && this.renderOncall()}
			</ScreenBlockComponent>
		);
	}

	onPressEndCall() {
		this.props.onEndCall();
		this.setState({ message: 'Ending' });
	}

	onPressAnswer() {
		this.props.onAnswer();
		this.setState({ isIncomingCall: false, status: 200, message: "Calling" });
	}

	onPressReject() {
		this.props.onReject();
	}

	toggleAudio() {
		this.props.onToggleAudio(!this.state.isAudioOn);
		this.setState({ isAudioOn: !this.state.isAudioOn });
	}

	toggleSpeaker() {
		this.setState({isSpeaker: !this.state.isSpeaker});
	}

}

export default OnCallComponent;


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

