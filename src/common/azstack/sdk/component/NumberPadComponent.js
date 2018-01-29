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

const ic_action_answer = require('../static/image/ic_action_answer.png');
const ic_input_back = require('../static/image/ic_input_back.png');


class NumberPadComponent extends React.Component {
	constructor(props) {
		super(props);
		this.coreInstances = props.getCoreInstances();
		this.state = {
			phoneNumber: '',
			onCall: null,

		};
	}

	onClickNumber(number) {
		this.setState({ phoneNumber: this.state.phoneNumber + number });
	}

	onClear() {
		this.setState({ phoneNumber: this.state.phoneNumber.slice(0, -1) });
	}

	onCall() {
		this.props.onCallout({
			info: {
				name: '',
				phoneNumber: this.state.phoneNumber,
				avatar: '',
			}
		});
	}

	render() {
		return (
			<ScreenBlockComponent
				fullScreen={false}
				getCoreInstances={this.props.getCoreInstances}
                statusbar={this.props.statusbar}
                style={this.props.style}
			>
				{this.props.header !== 'hidden' && <ScreenHeaderBlockComponent
					getCoreInstances={this.props.getCoreInstances}
					onBackButtonPressed={() => this.props.onBackButtonPressed()}
					title={"Callout"}
				/>}
				<View style={{ backgroundColor: '#fff', justifyContent: 'flex-end', alignItems: 'center', flex: 1, paddingBottom: 40 }}>
					<View style={{ width: 270, alignSelf: 'center', flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: '#fff', alignItems: 'center', height: 50, marginBottom: 20 }}>
						<View style={{ alignItems: 'flex-end' }}>
							<Text style={{ fontSize: this.state.phoneNumber.length <= 10 ? 40 : this.state.phoneNumber.length <= 13 ? 30 : 20 }}>{this.state.phoneNumber}</Text>
						</View>
						{
							this.state.phoneNumber != '' && <TouchableOpacity onPress={() => this.onClear()}>
								<View style={{ justifyContent: 'center', alignItems: 'flex-end', width: 40, height: 50 }}>
									<Image source={ic_input_back} style={{ width: 25, height: 19 }} />
								</View>
							</TouchableOpacity>
						}
					</View>
					<View style={{ width: width, justifyContent: 'center', alignItems: 'center' }}>
						<View style={{ width: 270, alignSelf: 'center' }}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
								<TouchableOpacity onPress={() => { this.onClickNumber('1') }}>
									<View style={styles.number}>
										<Text style={{ fontSize: 34 }}>1</Text>
										<Text style={{ fontSize: 10 }}> </Text>
									</View>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => { this.onClickNumber('2') }}>
									<View style={styles.number}>
										<Text style={{ fontSize: 34 }}>2</Text>
										<Text style={{ fontSize: 10 }}>A B C</Text>
									</View>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => { this.onClickNumber('3') }}>
									<View style={[styles.number, { marginRight: 0 }]}>
										<Text style={{ fontSize: 34 }}>3</Text>
										<Text style={{ fontSize: 10 }}>D E F</Text>
									</View>
								</TouchableOpacity>
							</View>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
								<TouchableOpacity onPress={() => { this.onClickNumber('4') }}>
									<View style={styles.number}>
										<Text style={{ fontSize: 34 }}>4</Text>
										<Text style={{ fontSize: 10 }}>G H I</Text>
									</View>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => { this.onClickNumber('5') }}>
									<View style={styles.number}>
										<Text style={{ fontSize: 34 }}>5</Text>
										<Text style={{ fontSize: 10 }}>J K L</Text>
									</View>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => { this.onClickNumber('6') }}>
									<View style={[styles.number, { marginRight: 0 }]}>
										<Text style={{ fontSize: 34 }}>6</Text>
										<Text style={{ fontSize: 10 }}>M N O</Text>
									</View>
								</TouchableOpacity>
							</View>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
								<TouchableOpacity onPress={() => { this.onClickNumber('7') }}>
									<View style={styles.number}>
										<Text style={{ fontSize: 34 }}>7</Text>
										<Text style={{ fontSize: 10 }}>P Q R S</Text>
									</View>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => { this.onClickNumber('8') }}>
									<View style={styles.number}>
										<Text style={{ fontSize: 34 }}>8</Text>
										<Text style={{ fontSize: 10 }}>T U V</Text>
									</View>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => { this.onClickNumber('9') }}>
									<View style={[styles.number, { marginRight: 0 }]}>
										<Text style={{ fontSize: 34 }}>9</Text>
										<Text style={{ fontSize: 10 }}>W X Y Z</Text>
									</View>
								</TouchableOpacity>
							</View>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
								<TouchableOpacity onPress={() => { this.onClickNumber('*') }}>
									<View style={styles.number}>
										<Text style={{ fontSize: 34 }}>*</Text>
										<Text style={{ fontSize: 10 }}> </Text>
									</View>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => { this.onClickNumber('0') }} onLongPress={() => this.onClickNumber('+')}>
									<View style={styles.number}>
										<Text style={{ fontSize: 34 }}>0</Text>
										<Text style={{ fontSize: 10 }}>+</Text>
									</View>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => { this.onClickNumber('#') }}>
									<View style={[styles.number, { marginRight: 0 }]}>
										<Text style={{ fontSize: 34 }}>#</Text>
										<Text style={{ fontSize: 10 }}> </Text>
									</View>
								</TouchableOpacity>
							</View>
							<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
								<TouchableOpacity onPress={() => this.onCall()}>
									<View style={[styles.number, { backgroundColor: '#44f441', marginRight: 0 }]}>
										<Image source={ic_action_answer} style={{ width: 40, height: 40 }} />
									</View>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</View>
				{
					this.state.onCall
				}
			</ScreenBlockComponent>
		);
	}
}

export default NumberPadComponent;


const styles = {
	number: {
		backgroundColor: '#f0f0f0',
		width: 70,
		height: 70,
		borderRadius: 35,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 10,
		marginTop: 5,
		marginBottom: 5,
	}
};

