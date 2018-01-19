import React from 'react';
import {
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
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import Timer from './part/common/Timer';

const { height, width } = Dimensions.get('window');

const ic_action_hangup = require('../static/image/ic_action_hangup.png');
const ic_action_answer = require('../static/image/ic_action_answer.png');
const call_bg = require('../static/image/call_bg.jpg');
const ic_avatar = require('../static/image/ic_avatar.png');
const ic_answer_phone = require('../static/image/ic_answer_phone.png');
const ic_cancel = require('../static/image/ic_cancel.png');
const ic_voice = require('../static/image/ic_voice.png');

class OnCallComponent extends React.Component {
	constructor(props) {
		super(props);        
		this.subscriptions = {};
		this.state = {
			isIncomingCall: false,
			status: null,
			message: '',
			isAudioOn: true,
		};
	}

    addSubscriptions() {
        this.subscriptions.onCalloutStatusChanged = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_CALLOUT_STATUS_CHANGED, ({ error, result }) => {
            if (error) {
                return;
			}

			this.setState({status: result.status, message: result.message});
			
			if(result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLOUT_INITIAL_BUSY ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLOUT_INITIAL_NOT_ENOUGH_BALANCE ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLOUT_INITIAL_INVALID_NUMBER ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_STOP ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_BUSY ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_NOT_ANSWERED ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_NOT_ENOUGH_BALANCE) {
				
				this.props.onCallEnded();
			}
		});
		
        this.subscriptions.onCallinStatusChanged = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_CALLIN_STATUS_CHANGED, ({ error, result }) => {
            if (error) {
                return;
			}

			this.setState({status: result.status, message: result.message});

			if(result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_STOP ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING_STOP ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_BUSY ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_NOT_ANSWERED) {
					
				this.props.onCallEnded();
			}
		});
		
		this.subscriptions.onCallinStatusChangedByMe = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_CALLIN_STATUS_CHANGED_BY_ME, ({error, result}) => {

			if (error) {
                return;
			}

			console.log(result);
			if(result.status !== this.props.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING) {
				this.props.onCallEnded();
			}
		});
		
        this.subscriptions.onFreeCallStatusChanged = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_FREE_CALL_STATUS_CHANGED, ({ error, result }) => {
            if (error) {
                return;
			}

			this.setState({status: result.status, message: result.message});
            
			if(result.status === this.props.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_REJECTED ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_STOP ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_BUSY ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_NOT_ANSWERED) {
					
				this.props.onCallEnded();
			}
        });
		
        this.subscriptions.onFreeCallStatusChangedByMe = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_FREE_CALL_STATUS_CHANGED_BY_ME, ({ error, result }) => {
            if (error) {
                return;
			}

			this.setState({status: result.status, message: result.message});

			if(result.status === this.props.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_REJECTED ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_ANSWERED ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_STOP ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_BUSY ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_NOT_ANSWERED) {
					
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
		if(this.props.isIncomingCall) {
			this.setState({isIncomingCall: this.props.isIncomingCall, message: 'Ringing'});
		}
	}

	componentDidMount() {
        this.addSubscriptions();
	}

	componentWillUnmount() {
		this.clearSubscriptions();
	}

	renderStatus() {
		if(this.props.callType === CallConstant.CALL_TYPE_CALLIN) {
			return (
				<View style={{ position: 'absolute', top: 0, left: 0, }}>
					<Text style={{color: "#fff"}}>{this.props.status}</Text>
				</View>
			);
		} else {
			return (
				<View style={{ position: 'absolute', top: 0, left: 0, }}>
					<Text style={{color: "#fff"}}>{this.props.status}</Text>
				</View>
			);
		}
	}

	renderButton() {
		return (
			<TouchableOpacity onPress={() => this.onPressEndCall()}>
				<View style={[styles.button, {backgroundColor: 'red'}]}>
					<Image source={ic_action_hangup} style={styles.buttonIcon} resizeMode={'contain'} />
				</View>
			</TouchableOpacity>
		);
	}

	renderIncomingCall() {
		return (
			<View style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0}}>
				<View style={styles.userInfoCenter}>
					<View style={{paddingBottom: 160, alignItems: 'center'}}>
						<Image source={ic_avatar} style={{width: 90, height: 90, borderRadius: 45}} />
						<View style={{alignItems: 'center', backgroundColor: 'rgba(0,0,0,0)'}}>
							<Text style={{color: '#fff', marginVertical: 10, fontSize: 20}}>{this.props.info.name || this.props.info.phoneNumber}</Text>
							<Text style={{color: '#8f8f8f'}}>{this.state.message}</Text>
						</View>
					</View>
				</View>
				<View style={[styles.bottomActionBlock, {}]}>
					<View style={styles.bottomActionBlockWrapper}>
						<TouchableOpacity onPress={() => this.onPressAnswer()}>
							<View style={[styles.button, {backgroundColor: 'green', marginHorizontal: 60}]}>
								<Image source={ic_answer_phone} style={{width: 30, height: 30}} resizeMode={'contain'} />
							</View>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => this.props.onReject()}>
							<View style={[styles.button, {backgroundColor: 'red', marginHorizontal: 60}]}>
								<Image source={ic_cancel} style={{width: 30, height: 30}} resizeMode={'contain'} />
							</View>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		);
	}

	renderOncall() {
		return (
			<View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0)'}}>
				<View style={{height: (height - 20) * 2 / 5}}>
					<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
						<Image source={ic_avatar} style={{width: 90, height: 90, borderRadius: 45}} />
						<Text style={{color: '#fff', fontSize: 30}}>{this.props.info.name || this.props.info.phoneNumber}</Text>
						<Text style={{color: '#e3e2e1', fontSize: 18,}}>{this.state.message}</Text>
						{
							this.state.status === 200 && <Timer />
						}
					</View>
				</View>
				<View style={{height: (height - 20) * 3 / 5, justifyContent: 'flex-end', paddingBottom: 60}}>
					<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
						<TouchableOpacity onPress={() => this.toggleAudio()}>
							<View style={{padding: 20}}>
								{this.state.isAudioOn && <View style={{width: 70, height: 70, borderRadius: 35, backgroundColor: 'green', justifyContent: 'center', alignItems: 'center'}}>
									<Text style={{color: "#fff"}}>Tắt âm</Text>
								</View>}
								{!this.state.isAudioOn && <View style={{width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center'}}>
									<Text style={{color: "#2a2a2a"}}>Bật âm</Text>
								</View>}
							</View>
						</TouchableOpacity>
						<TouchableOpacity>
							<View style={{padding: 20}}>
								<Text style={{color: "#fff"}}>Loa ngoài</Text>
							</View>
						</TouchableOpacity>
					</View>
					<View style={{justifyContent: 'center', marginTop: 20, width: width, alignItems: 'center'}}>
						{this.renderButton()}
					</View>
				</View>
			</View>
		);
	}

	render() {
		return (
            <ScreenBlockComponent
				fullScreen={true}
                CustomStyle={this.props.CustomStyle}
            >
				<Image source={call_bg} style={{width: width, height: height}} />
				{this.state.isIncomingCall === true && this.renderIncomingCall()}
				{this.state.isIncomingCall === false && this.renderOncall()}
            </ScreenBlockComponent>
		);
	}

	onPressEndCall() {
		this.props.onEndCall();
		this.setState({message: 'Ending'});
	}

	onPressAnswer() {
		this.props.onAnswer();
		this.setState({isIncomingCall: false, status: 200, message: "Calling"});
	}

	onPressReject() {
		this.props.onReject();
	}

	toggleAudio() {
		this.props.onToggleAudio(!this.state.isAudioOn);
		this.setState({isAudioOn: !this.state.isAudioOn});
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

