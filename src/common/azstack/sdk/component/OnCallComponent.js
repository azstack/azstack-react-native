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

const { height, width } = Dimensions.get('window');

const ic_action_hangup = require('../static/image/ic_action_hangup.png');
const ic_action_answer = require('../static/image/ic_action_answer.png');
const call_bg = require('../static/image/call_bg.jpg');

class OnCallComponent extends React.Component {
	constructor(props) {
		super(props);        
		this.subscriptions = {};
		this.state = {
			calloutStatus: null,
			calloutMessage: '',
			callinStatus: null,
			callinMessage: '',
		};
	}

    addSubscriptions() {
        this.subscriptions.onCalloutStatusChanged = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_CALLOUT_STATUS_CHANGED_RETURN, ({ error, result }) => {
            if (error) {
                return;
			}

			this.setState({calloutStatus: result.status, calloutMessage: result.message});
			
			if(result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLOUT_INITIAL_BUSY ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLOUT_INITIAL_NOT_ENOUGH_BALANCE ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLOUT_INITIAL_INVALID_NUMBER ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_STOP ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_BUSY ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_NOT_ANSWERED ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLOUT_STATUS_NOT_ENOUGH_BALANCE) {
				setTimeout(() => {
					this.props.onCallEnded();
				}, 1500);
			}
		});
		
        this.subscriptions.onCallinStatusChanged = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_CALLIN_STATUS_CHANGED_RETURN, ({ error, result }) => {
            if (error) {
                return;
			}

			this.setState({callinStatus: result.status, callinMessage: result.message});

			if(result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_STOP ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_RINGING_STOP ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_BUSY ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_CALLIN_STATUS_NOT_ANSWERED) {
				setTimeout(() => {
					this.props.onCallEnded();
				}, 1500);
			}
        });
	};
	
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

	componentWillMount() {
	}

	componentDidMount() {
        this.addSubscriptions();
	}

	renderStatus() {
		if(this.props.callType === CallConstant.CALL_TYPE_CALLIN) {
			return (
				<View style={{ position: 'absolute', top: 0, left: 0, }}>
					<Text style={{color: "#fff"}}>{this.props.callinStatus}</Text>
				</View>
			);
		} else {
			return (
				<View style={{ position: 'absolute', top: 0, left: 0, }}>
					<Text style={{color: "#fff"}}>{this.props.calloutStatus}</Text>
				</View>
			);
		}
	}

	renderButton() {
		// if(this.props.callType === CallConstant.CALL_TYPE_CALLIN &&  this.props.callinStatus === CallConstant.CALL_STATUS_CALLIN_STATUS_RINGING) {
		// 	return (
		// 		<TouchableOpacity onPress={() => this.onPressAnswer()}>
		// 			<View style={[styles.button, {backgroundColor: '#44f441'}]}>
		// 				<Image source={ic_action_answer} style={styles.buttonIcon} resizeMode={'contain'} />
		// 			</View>
		// 		</TouchableOpacity>
		// 	);
		// }

		// if(this.props.callType === CallConstant.CALL_TYPE_CALLIN) {
		// 	return (
		// 		<TouchableOpacity onPress={() => this.onPressEndCallin()}>
		// 			<View style={[styles.button, {backgroundColor: 'red'}]}>
		// 				<Image source={ic_action_hangup} style={styles.buttonIcon} resizeMode={'contain'} />
		// 			</View>
		// 		</TouchableOpacity>
		// 	);
		// }

		return (
			<TouchableOpacity onPress={() => this.onPressEndCall()}>
				<View style={[styles.button, {backgroundColor: 'red'}]}>
					<Image source={ic_action_hangup} style={styles.buttonIcon} resizeMode={'contain'} />
				</View>
			</TouchableOpacity>
		);
	}

	render() {
		return (
            <ScreenBlockComponent
                Sizes={this.props.Sizes}
                CustomStyle={this.props.CustomStyle}
            >
				<Image source={call_bg} style={{width: width, height: height}} />
				<View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0)'}}>
					<View style={{height: (height - 20) * 2 / 5}}>
						<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
							<Text style={{color: '#fff', fontSize: 30}}>{this.props.info.name || this.props.info.phoneNumber}</Text>
							<Text style={{color: '#e3e2e1', fontSize: 18,}}>{this.state.calloutMessage}</Text>
						</View>
					</View>
					<View style={{height: (height - 20) * 3 / 5, justifyContent: 'flex-end', paddingBottom: 60}}>
						<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
							<TouchableOpacity>
								<View style={{padding: 20}}>
									<Text style={{color: "#fff"}}>Tắt âm</Text>
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
            </ScreenBlockComponent>
		);
	}

	onPressEndCall() {
		this.props.onEndCall();
	}

	onPressAnswer() {
	}

	onPressReject() {
		
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
	}
};

