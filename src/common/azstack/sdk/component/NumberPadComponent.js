import React from 'react';
import {
	BackHandler,
	View,
	Text,
	Image,
	TouchableOpacity
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import ConnectionBlockComponent from './part/common/ConnectionBlockComponent';


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
	onClearButtonPressed() {
		this.setState({ toPhoneNumber: this.state.toPhoneNumber.slice(0, -1) });
	};
	onClearButtonLongPressed() {
		this.setState({ toPhoneNumber: '' });
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
					<View
						style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BLOCK_STYLE')}
					>
						<View style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_CONTENT_BLOCK_STYLE')}>
							{
								this.state.fromPhoneNumbers.length > 1 &&
								!!this.state.toPhoneNumber && (
									<View
										style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_CALL_FROM_BLOCK_STYLE')}
									>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_CALL_FROM_TITLE_TEXT_STYLE')}
										>
											Call from
										</Text>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_CALL_FROM_PHONE_NUMBER_TEXT_STYLE')}
											onPress={this.onFromPhoneNumberPressed}
										>
											{this.state.fromPhoneNumber}
										</Text>
									</View>
								)
							}
							<View
								style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_TO_PHONE_NUMBER_BLOCK_STYLE')}
							>
								<Text
									style={[
										this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_TO_PHONE_NUMBER_TEXT_STYLE'),
										(this.state.toPhoneNumber.length <= 9 ? this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_TO_PHONE_NUMBER_TEXT_BIG_STYLE') : {}),
										((this.state.toPhoneNumber.length > 9 && this.state.toPhoneNumber.length <= 12) ? this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_TO_PHONE_NUMBER_TEXT_MEDIUM_STYLE') : {})
									]}
									numberOfLines={1}
								>
									{this.state.toPhoneNumber}
								</Text>
								<View
									style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_TO_PHONE_NUMBER_CLEAR_BLOCK_STYLE')}
								>
									{
										this.state.toPhoneNumber != '' && <TouchableOpacity
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_TO_PHONE_NUMBER_CLEAR_BUTTON_BLOCK_STYLE')}
											onPress={() => this.onClearButtonPressed()}
											onLongPress={() => this.onClearButtonLongPressed()}
										>

											<Image
												style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_TO_PHONE_NUMBER_CLEAR_BUTTON_IMAGE_STYLE')}
												source={this.coreInstances.CustomStyle.getImage('IMAGE_BACK_X')}
											/>
										</TouchableOpacity>
									}
								</View>
							</View>
							<View
								style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_BLOCK_STYLE')}
							>
								<View
									style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_LINE_BLOCK_STYLE')}
								>
									<TouchableOpacity
										style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_BLOCK_STYLE')}
										onPress={() => { this.onClickNumber('1') }}
									>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_NUMBER_TEXT_STYLE')}
										>
											1
										</Text>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_CHARACTER_TEXT_STYLE')}
										>
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_BLOCK_STYLE')}
										onPress={() => { this.onClickNumber('2') }}
									>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_NUMBER_TEXT_STYLE')}
										>
											2
										</Text>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_CHARACTER_TEXT_STYLE')}
										>
											A B C
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_BLOCK_STYLE')}
										onPress={() => { this.onClickNumber('3') }}
									>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_NUMBER_TEXT_STYLE')}
										>
											3
										</Text>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_CHARACTER_TEXT_STYLE')}
										>
											D E F
										</Text>
									</TouchableOpacity>
								</View>
								<View
									style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_LINE_BLOCK_STYLE')}
								>
									<TouchableOpacity
										style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_BLOCK_STYLE')}
										onPress={() => { this.onClickNumber('4') }}
									>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_NUMBER_TEXT_STYLE')}
										>
											4
										</Text>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_CHARACTER_TEXT_STYLE')}
										>
											G H I
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_BLOCK_STYLE')}
										onPress={() => { this.onClickNumber('5') }}
									>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_NUMBER_TEXT_STYLE')}
										>
											5
										</Text>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_CHARACTER_TEXT_STYLE')}
										>
											J K L
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_BLOCK_STYLE')}
										onPress={() => { this.onClickNumber('6') }}
									>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_NUMBER_TEXT_STYLE')}
										>
											6
										</Text>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_CHARACTER_TEXT_STYLE')}
										>
											M N O
										</Text>
									</TouchableOpacity>
								</View>
								<View
									style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_LINE_BLOCK_STYLE')}
								>
									<TouchableOpacity
										style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_BLOCK_STYLE')}
										onPress={() => { this.onClickNumber('7') }}
									>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_NUMBER_TEXT_STYLE')}
										>
											7
										</Text>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_CHARACTER_TEXT_STYLE')}
										>
											P Q R S
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_BLOCK_STYLE')}
										onPress={() => { this.onClickNumber('8') }}
									>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_NUMBER_TEXT_STYLE')}
										>
											8
										</Text>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_CHARACTER_TEXT_STYLE')}
										>
											T U V
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_BLOCK_STYLE')}
										onPress={() => { this.onClickNumber('9') }}
									>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_NUMBER_TEXT_STYLE')}
										>
											9
										</Text>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_CHARACTER_TEXT_STYLE')}
										>
											W X Y Z
										</Text>
									</TouchableOpacity>
								</View>
								<View
									style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_LINE_BLOCK_STYLE')}
								>
									<TouchableOpacity
										style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_BLOCK_STYLE')}
										onPress={() => { this.onClickNumber('*') }}
									>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_NUMBER_TEXT_STYLE')}
										>
											*
										</Text>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_CHARACTER_TEXT_STYLE')}
										>
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_BLOCK_STYLE')}
										onPress={() => { this.onClickNumber('0') }}
										onLongPress={() => this.onClickNumber('+')}
									>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_NUMBER_TEXT_STYLE')}
										>
											0
										</Text>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_CHARACTER_TEXT_STYLE')}
										>
											+
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_BLOCK_STYLE')}
										onPress={() => { this.onClickNumber('#') }}
									>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_NUMBER_TEXT_STYLE')}
										>
											#
										</Text>
										<Text
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_ITEM_CHARACTER_TEXT_STYLE')}
										>
										</Text>
									</TouchableOpacity>
								</View>
								<View
									style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_LAST_LINE_BLOCK_STYLE')}
								>
									<TouchableOpacity
										style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_CALL_BUTTON_BLOCK_STYLE')}
										onPress={this.onCallButtonPressed}
									>
										<Image
											style={this.coreInstances.CustomStyle.getStyle('NUMBER_PAD_BUTTONS_CALL_BUTTON_IMAGE_STYLE')}
											source={this.coreInstances.CustomStyle.getImage('IMAGE_CALLOUT_START')}
										/>
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

