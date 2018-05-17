import React from 'react';
import {
	BackHandler,
	View,
	Text,
	Image,
	Dimensions,
	TouchableOpacity
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import ConnectionBlockComponent from './part/common/ConnectionBlockComponent';

const { height, width } = Dimensions.get('window');

const ic_action_answer = require('../static/image/ic_action_answer.png');
const ic_input_back = require('../static/image/ic_input_back.png');


class NumberPadComponent extends React.Component {
	constructor(props) {
		super(props);
		this.coreInstances = props.getCoreInstances();

		this.state = {
			fromPhoneNumbers: [],
			fromPhoneNumber: '',
			toPhoneNumber: ''
		};

		this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);

		this.onFromPhoneNumberPressed = this.onFromPhoneNumberPressed.bind(this);
		this.onCallButtonPressed = this.onCallButtonPressed.bind(this);
	};

	onHardBackButtonPressed() {
		this.props.onBackButtonPressed();
		return true;
	};

	onFromPhoneNumberPressed() {
		this.props.showSelectPhoneNumber({
			phoneNumbers: this.state.fromPhoneNumbers,
			onSelectDone: (event) => {
				this.setState({
					fromPhoneNumber: event.phoneNumber
				});
			}
		});
	};
	onClickNumber(number) {
		this.setState({ toPhoneNumber: this.state.toPhoneNumber + number });
	};
	onClear() {
		this.setState({ toPhoneNumber: this.state.toPhoneNumber.slice(0, -1) });
	};
	onCallButtonPressed() {
		this.props.startCallout({
			info: {
				name: '',
				toPhoneNumber: this.state.toPhoneNumber,
				fromPhoneNumber: this.state.fromPhoneNumber,
				avatar: '',
			}
		});
	};

	componentDidMount() {
		if (this.props.withBackButtonHandler) {
			BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
		}
		this.coreInstances.PhoneNumber.getFromPhoneNumbers().then((fromPhoneNumbers) => {
			this.setState({
				fromPhoneNumbers: fromPhoneNumbers,
				fromPhoneNumber: fromPhoneNumbers[0]
			});
		});
	};
	componentWillUnmount() {
		if (this.props.withBackButtonHandler) {
			BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
		}
	};

	render() {
		return (
			<ScreenBlockComponent
				fullScreen={false}
				withStatusbar={this.props.withStatusbar}
				screenStyle={this.props.screenStyle}
				statusbarStyle={this.props.statusbarStyle}
				getCoreInstances={this.props.getCoreInstances}
			>
				{
					(this.props.withHeader || (this.props.withHeader === undefined && this.coreInstances.defaultLayout.withHeader)) && (
						<ScreenHeaderBlockComponent
							getCoreInstances={this.props.getCoreInstances}
							onBackButtonPressed={() => this.props.onBackButtonPressed()}
							title={"Callout"}
						/>
					)
				}
				<ScreenBodyBlockComponent
					getCoreInstances={this.props.getCoreInstances}
				>
					<View style={{ backgroundColor: '#fff', justifyContent: 'flex-end', alignItems: 'center', flex: 1, paddingBottom: 40 }}>
						<View style={{ width: '69%', height: 30, marginBottom: 10 }}>
							{
								this.state.fromPhoneNumbers.length > 1 &&
								!!this.state.toPhoneNumber && (
									<View style={{ position: 'relative' }}>
										<View style={{ flexDirection: 'row', height: 40, justifyContent: 'flex-end', alignItems: 'flex-end', paddingBottom: 10 }}>
											<Text style={{ fontSize: 14 }}>Call from </Text>
											<Text style={{ color: 'blue', fontSize: 16 }} onPress={this.onFromPhoneNumberPressed}>{this.state.fromPhoneNumber}</Text>
										</View>
									</View>
								)
							}
						</View>
						<View style={{ width: '69%', alignSelf: 'center', flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: '#fff', alignItems: 'center', height: 50, marginBottom: 15 }}>
							<View style={{ alignItems: 'flex-end', flex: 1, height: 50, justifyContent: 'center' }}>
								<Text style={{ fontSize: this.state.toPhoneNumber.length <= 9 ? 40 : this.state.toPhoneNumber.length <= 12 ? 30 : 20 }} numberOfLines={1}>{this.state.toPhoneNumber}</Text>
							</View>
							{
								this.state.toPhoneNumber != '' && <TouchableOpacity onPress={() => this.onClear()}>
									<View style={{ justifyContent: 'center', alignItems: 'flex-end', width: 40, height: 50 }}>
										<Image source={ic_input_back} style={{ width: 25, height: 19 }} />
									</View>
								</TouchableOpacity>
							}
						</View>
						<View style={{ width: width, justifyContent: 'center', alignItems: 'center' }}>
							<View style={{ width: '69%', alignSelf: 'center' }}>
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
									<TouchableOpacity onPress={this.onCallButtonPressed}>
										<View style={[styles.number, { backgroundColor: '#44f441', marginRight: 0 }]}>
											<Image source={ic_action_answer} style={{ width: 40, height: 40 }} />
										</View>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</View>
					<ConnectionBlockComponent
						getCoreInstances={this.props.getCoreInstances}
					/>
				</ScreenBodyBlockComponent>
			</ScreenBlockComponent>
		);
	};
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

