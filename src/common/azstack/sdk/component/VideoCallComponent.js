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
import {
	RTCView
} from 'react-native-webrtc';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import Timer from './part/common/Timer';
import Pulse from './part/common/Pulse';

const { height, width } = Dimensions.get('window');

const ic_end_call_white = require('../static/image/ic_end_call_white.png');
const ic_video_overlay = require('../static/image/ic_video_overlay.png');
const ic_video_call_bubble = require('../static/image/ic_video_call_bubble.png');
const ic_avatar = require('../static/image/ic_avatar.png');
const ic_switch_camera = require('../static/image/ic_switch_camera.png');
const ic_cancel = require('../static/image/ic_cancel.png');
const ic_camera_off = require('../static/image/ic_camera_off.png');
const call_bg = require('../static/image/call_bg.jpg');
const ic_muted_white = require('../static/image/ic_muted_white.png');
const ic_answer_phone = require('../static/image/ic_answer_phone.png');

class VideoCallComponent extends React.Component {
	constructor(props) {
		super(props);
		this.coreInstances = props.getCoreInstances();
		this.subscriptions = {};
		this.state = {
			// ux
			showAction: false,
			touchTimeout: null,
			callTime: 0,
			isIncomingCall: false,
			isAudioOn: true,
			isVideoOn: true,
			// az
			localVideoUrl: null,
			remoteVideoUrl: null,
			status: -1,
			message: '',
		};

		this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);
	}

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

		this.subscriptions.onSwitchCameraTypeReturn = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_SWITCH_CAMERA_TYPE_RETURN, ({ error, result }) => {
			if (error) {
				return;
			}

			// currently do nothing
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
		if (!this.props.isIncomingCall) {
			if (this.coreInstances.AZStackCore.Call.callData.webRTC.localStream) {
				this.setState({
					localVideoUrl: this.coreInstances.AZStackCore.Call.callData.webRTC.localStream.toURL()
				});
			}
		}
		BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
	}

	componentWillUnmount() {
		this.clearSubscriptions();
		BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
	}

	renderUserInfoCenter() {
		return (
			<View style={styles.userInfoCenter}>
				<View style={{alignItems: 'center'}}>
					<View>
						<View style={{justifyContent: 'center', alignItems: 'center'}}>
							<Pulse style={{justifyContent: 'center', alignItems: 'center',}} color={'#48D2A0'} numPulses={7} diameter={250} duration={850} speed={34} image={{source:ic_avatar, style:{width: 100, height: 100, borderRadius: 50,}}} />
						</View>
					</View>
					<View style={{ alignItems: 'center' }}>
						<Text style={{ color: '#fff', marginVertical: 10, fontSize: 20 }}>{this.props.info.name}</Text>
						<Text style={{ color: '#2a2a2a' }}>{this.state.message}</Text>
					</View>
				</View>
			</View>
		);
	}

	renderBackgroundContent() {
		if (this.state.status !== 200) {
			// 
			return (
				<View style={styles.userCamera}>
					{
						this.state.localVideoUrl !== null && this.state.isVideoOn === true && <RTCView streamURL={this.state.localVideoUrl} style={{ width: width, height: height }} objectFit={"cover"} />
					}
					{
						(this.state.localVideoUrl === null || this.state.isVideoOn) === false && <Text style={{ color: '#8f8f8f' }}>Your camera off</Text>
					}
					{this.renderUserInfoCenter()}
				</View>
			);
		}
		return (
			<View style={styles.userCamera}>
				{
					this.state.remoteVideoUrl !== null && <RTCView streamURL={this.state.remoteVideoUrl} style={{ width: width, height: height }} objectFit={"cover"} />
				}
				{
					this.state.remoteVideoUrl === null && <Text>User camera off</Text>
				}
			</View>
		);
	}

	renderMyCamera() {
		return (
			<View style={[styles.myCamera, { top: this.state.showAction === true ? 60 : 10 }]}>
				{
					this.state.localVideoUrl !== null && <RTCView streamURL={this.state.localVideoUrl} style={{ height: 150, width: 100 }} objectFit={"cover"} />
				}
				{
					this.state.localVideoUrl === null && <Text>Your camera off</Text>
				}
				<TouchableWithoutFeedback onPress={() => this.onPressMyCameraTouchLayer()}>
					<View style={styles.myCameraTouchLayer}>

					</View>
				</TouchableWithoutFeedback>
			</View>
		);
	}

	renderBottomActions() {
		return (
			<View style={[styles.bottomActionBlock, { opacity: this.state.showAction === false ? 0 : 1 }]}>
				<View style={styles.bottomActionBlockWrapper}>
					<TouchableOpacity onPress={() => this.onPressToggleVideo()}>
						{this.state.isVideoOn === true && <View style={[styles.button, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#fff' }]}>
							<Image source={ic_camera_off} style={{height: 20}} resizeMode='contain' />
						</View>}
						{this.state.isVideoOn === false && <View style={[styles.button, { backgroundColor: 'rgba(255,255,255,0.5)' }]}>
							<Image source={ic_camera_off} style={{height: 20}} resizeMode='contain' />
						</View>}
					</TouchableOpacity>
					<TouchableOpacity onPress={() => this.onPressEndCall()}>
						<View style={[styles.button, { backgroundColor: 'red' }]}>
							<Image source={ic_end_call_white} style={styles.buttonIcon} resizeMode={'contain'} />
						</View>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => this.onPressToggleAudio()}>
						{this.state.isAudioOn === true && <View style={[styles.button, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#fff' }]}>
							<Image source={ic_muted_white} />
						</View>}
						{this.state.isAudioOn === false && <View style={[styles.button, { backgroundColor: 'rgba(255,255,255,0.5)' }]}>
							<Image source={ic_muted_white} />
						</View>}
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	renderUserInfoTop() {
		return (
			<View style={[styles.userInfoTop, { opacity: this.state.showAction === false ? 0 : 1 }]}>
				<View style={styles.userInfoTopWrapper}>
					<View>
						<Image source={ic_avatar} style={{ width: 60, height: 60, borderRadius: 45, marginRight: 10 }} />
					</View>
					<View style={{ flex: 1 }}>
						<Text style={{ color: '#fff', fontSize: 16 }}>{this.props.info.name || "Anonymous"}</Text>
						<Timer />
					</View>
					<View style={{ position: 'absolute', top: 0, right: 0 }}>
						<TouchableOpacity onPress={() => this.onPressChangeDeviceCamera()}>
							<View style={{ height: 60, width: 60, justifyContent: 'center', alignItems: 'center' }}>
								<Image source={ic_switch_camera} style={{ width: 30, height: 30 }} resizeMode={'contain'} />
							</View>
						</TouchableOpacity>
					</View>
				</View>
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

	renderRinging() {
		return (
			<View style={{flex: 1, backgroundColor: '#353535'}}>
				<View style={styles.userCamera}>
					{
						this.state.localVideoUrl !== null && this.state.isVideoOn === true && <View style={{width: '100%', height: '100%'}}><RTCView streamURL={this.state.localVideoUrl} style={{ width: '100%', height: '100%' }} objectFit={"cover"} /></View>
					}
					{
						(this.state.localVideoUrl === null || this.state.isVideoOn) === false && <View style={{width: '100%', height: '100%'}}><RTCView streamURL={this.state.localVideoUrl} objectFit={"cover"} /></View>
					}
				</View>
				<View style={[styles.topLayer, {justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0)',}]}>
					<View style={{paddingTop: 40}}>
						<Text style={{ color: '#fff', marginVertical: 10, fontSize: 20, backgroundColor: 'transparent'}}>{this.props.info.name}</Text>
						<Text style={{ color: '#2a2a2a', backgroundColor: 'transparent'}}>{this.state.message}</Text>
					</View>
					<View>
						<Pulse style={{}} color={'#48D2A0'} numPulses={7} diameter={250} duration={850} speed={34} image={{source:ic_avatar, style:{width: 100, height: 100, borderRadius: 50,}}} />
					</View>
					<View style={styles.bottomActionBlockWrapper}>
						<TouchableOpacity onPress={() => this.onPressToggleVideo()}>
							{this.state.isVideoOn === true && <View style={[styles.button, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#fff' }]}>
								<Image source={ic_camera_off} style={{height: 20}} resizeMode='contain' />
							</View>}
							{this.state.isVideoOn === false && <View style={[styles.button, { backgroundColor: 'rgba(255,255,255,0.5)' }]}>
								<Image source={ic_camera_off} style={{height: 20}} resizeMode='contain' />
							</View>}
						</TouchableOpacity>
						<TouchableOpacity onPress={() => this.onPressEndCall()}>
							<View style={[styles.button, { backgroundColor: 'red' }]}>
								<Image source={ic_end_call_white} style={styles.buttonIcon} resizeMode={'contain'} />
							</View>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => this.onPressToggleAudio()}>
							{this.state.isAudioOn === true && <View style={[styles.button, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#fff' }]}>
								<Image source={ic_muted_white} />
							</View>}
							{this.state.isAudioOn === false && <View style={[styles.button, { backgroundColor: 'rgba(255,255,255,0.5)' }]}>
								<Image source={ic_muted_white} />
							</View>}
						</TouchableOpacity>
					</View>
				</View>
			</View>
		);
	}

	renderOnCall() {
		return (
			<View style={{flex: 1, backgroundColor: '#353535'}}>
				<View style={styles.userCamera}>
					{
						this.state.remoteVideoUrl !== null && <View style={{width: '100%', height: '100%'}}><RTCView streamURL={this.state.remoteVideoUrl} style={{ width: '100%', height: '100%' }} objectFit={"cover"} /></View>
					}
					{
						this.state.remoteVideoUrl === null && <View style={{width: '100%', height: '100%'}}><RTCView streamURL={this.state.remoteVideoUrl} objectFit={"cover"} /></View>
					}
				</View>
				<TouchableWithoutFeedback onPress={() => this.onPressTouchLayer()}>
					<View style={[styles.topLayer, {justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0)'}, { opacity: this.state.showAction === false ? 0 : 1 }]}>
						{this.renderBottomActions()}
						{this.renderUserInfoTop()}
						{this.renderMyCamera()}
					</View>
				</TouchableWithoutFeedback>
			</View>
		);
	}

	render() {
		return (
			<ScreenBlockComponent
				fullScreen={true}
				statusbar={this.props.statusbar}
				style={[this.props.style, {width: width, height: height}]}
				getCoreInstances={this.props.getCoreInstances}
			>
				{ this.state.isIncomingCall === true && this.renderIncomingCall()}
				{ this.state.status < 200 && this.state.isIncomingCall === false && this.renderRinging()}
				{ this.state.status >= 200 && this.state.isIncomingCall === false && this.renderOnCall()}
			</ScreenBlockComponent>
		);
	}

	onPressTouchLayer() {
		this.setState({ showAction: true });
		let touchTimer = setTimeout(() => {
			this.setState({ showAction: false });
		}, 5000);
		if (this.state.touchTimeout !== null) {
			clearTimeout(this.state.touchTimeout);
			this.setState({ touchTimeout: touchTimer });
		}
	}

	onPressChangeDeviceCamera() {
		this.props.onSwitchCameraType();
	}

	onPressMyCameraTouchLayer() {
		this.setState({ remoteVideoUrl: this.state.localVideoUrl, localVideoUrl: this.state.remoteVideoUrl });
	}

	onPressEndCall() {
		this.props.onEndCall();
	}

	onPressAnswer() {
		this.props.onAnswer();
		this.setState({ isIncomingCall: false, status: 200 });
	}

	onPressToggleAudio() {
		this.props.onToggleAudio(!this.state.isAudioOn);
		this.setState({ isAudioOn: !this.state.isAudioOn });
	}

	onPressToggleVideo() {
		this.props.onToggleVideo(!this.state.isVideoOn);
		this.setState({ isVideoOn: !this.state.isVideoOn });
	}
}

export default VideoCallComponent;

const styles = {
	topLayer: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
	},
	userCamera: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0)',
	},
	touchLayer: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		left: 0,
		top: 0,
	},
	userInfoTop: {
		position: 'absolute',
		right: 0,
		left: 0,
		top: 0,
		justifyContent: 'flex-start',
	},
	userInfoTopWrapper: {
		flexDirection: 'row',
		padding: 10,
	},
	userInfoCenter: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
	},
	myCamera: {
		position: 'absolute',
		top: 10,
		right: 10,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center'
	},
	myCameraTouchLayer: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
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
	button: {
		width: 60,
		height: 60,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 35,
		marginHorizontal: 20
	},
	buttonIcon: {
		width: 40,
		height: 40,
	}
};

