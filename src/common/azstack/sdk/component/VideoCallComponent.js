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
import {
    RTCView
} from 'react-native-webrtc';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';

const { height, width } = Dimensions.get('window');

const ic_action_hangup = require('../static/image/ic_action_hangup.png');
const ic_video_overlay = require('../static/image/ic_video_overlay.png');
const ic_video_call_bubble = require('../static/image/ic_video_call_bubble.png');
const ic_voice = require('../static/image/ic_voice.png');

class VideoCallComponent extends React.Component {
	constructor(props) {
		super(props);        
		this.subscriptions = {};
		this.state = {
            localVideoUrl: null,
            remoteVideoUrl: null,
		};
	}

    addSubscriptions() {
        this.subscriptions.onLocalStreamArrived = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_LOCAL_STREAM_ARRIVED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.setState({
                localVideoUrl: result.stream.toURL()
            });
        });
        
        this.subscriptions.onRemoteStreamArrived = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_REMOTE_STREAM_ARRIVED, ({ error, result }) => {
            if (error) {
                return;
			}
            this.setState({
                remoteVideoUrl: result.stream.toURL()
            });
		});
		
        this.subscriptions.onFreeCallStatusChanged = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_FREE_CALL_STATUS_CHANGED, ({ error, result }) => {
            if (error) {
                return;
			}
			
			console.log(result);
            
			if(result.status === this.props.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_REJECTED ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_STOP ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_NOT_ANSWERED) {
					
				this.props.onCallEnded();
			}
        });
		
        this.subscriptions.onFreeCallStatusChangedByMe = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_FREE_CALL_STATUS_CHANGED_BY_ME, ({ error, result }) => {
            if (error) {
                return;
            }
			
			console.log(result);

			if(result.status === this.props.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_REJECTED ||
				result.status === this.props.AZStackCore.callConstants.CALL_STATUS_FREE_CALL_STOP ||
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

	render() {
		return (
            <ScreenBlockComponent
                Sizes={this.props.Sizes}
                CustomStyle={this.props.CustomStyle}
            >
                <View style={styles.userCamera}>
                    {
                        this.state.remoteVideoUrl !== null && <RTCView streamURL={this.state.remoteVideoUrl} style={{width: width, height: height}} objectFit={"cover"} />
                    }
                    {
                        this.state.remoteVideoUrl === null && <Text>User camera off</Text>
                    }
                </View>
                <View style={styles.bottomActionBlock}>
                    <View style={styles.bottomActionBlockWrapper}>
                        <TouchableOpacity onPress={() => this.onPressEndCall()}>
                            <View style={[styles.button, {backgroundColor: 'red'}]}>
                                <Image source={ic_action_hangup} style={styles.buttonIcon} resizeMode={'contain'} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.myCamera}>
                    {
                        this.state.localVideoUrl !== null && <RTCView streamURL={this.state.localVideoUrl} style={{height: 150, width: 100}} objectFit={"cover"} />
                    }
                    {
                        this.state.localVideoUrl === null && <Text>Your camera off</Text>
                    }
                </View>
            </ScreenBlockComponent>
		);
	}

	onPressEndCall() {
		this.props.onEndCall();
	}
}

export default VideoCallComponent;


const styles = {
	userCamera: {
		flex: 1, 
		backgroundColor: '#fafafa', 
		justifyContent: 'center', 
		alignItems: 'center',
	},
	myCamera: {
		position: 'absolute', 
		top: 0, 
		right: 0, 
		backgroundColor: '#fff', 
		justifyContent: 'center', 
		alignItems: 'center'
	},
	bottomActionBlock: {
		position: 'absolute', 
		top: 0, 
		right: 0, 
		left: 0, 
		bottom: 0, 
		justifyContent: 'flex-end'
	},
	bottomActionBlockWrapper: {
		flexDirection: 'row', 
		alignItems: 'center', 
		justifyContent: 'center', 
		padding: 15,
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

