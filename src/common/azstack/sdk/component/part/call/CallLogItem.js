import React from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    Image
} from 'react-native';

import TimeFromNowBlockComponent from '../common/TimeFromNowBlockComponent';

class CallLogItem extends React.Component {
    constructor(props) {
        super(props);
        this.coreInstances = props.getCoreInstances();

        this.onCallLogItemPressed = this.onCallLogItemPressed.bind(this);
    };

    onCallLogItemPressed() {
        this.props.onCallLogItemPressed({
            phoneNumber: this.props.callLog.callType === this.coreInstances.AZStackCore.callConstants.CALL_PAID_LOG_CALL_TYPE_CALLOUT ? this.props.callLog.toPhoneNumber : this.props.callLog.fromPhoneNumber
        });
    };

    render() {
        return (
            <TouchableOpacity
                style={this.coreInstances.CustomStyle.getStyle('CALL_LOG_BLOCK_STYLE')}
                activeOpacity={0.5}
                onPress={this.onCallLogItemPressed}
            >
                <Image
                    style={this.coreInstances.CustomStyle.getStyle('CALL_LOG_TYPE_IMAGE_BLOCK_STYLE')}
                    source={this.coreInstances.CustomStyle.getImage(this.props.callLog.callType === this.coreInstances.AZStackCore.callConstants.CALL_PAID_LOG_CALL_TYPE_CALLOUT ? 'IMAGE_CALLOUT' : 'IMAGE_CALLIN')}
                />
                <View
                    style={this.coreInstances.CustomStyle.getStyle('CALL_LOG_INFORMATION_BLOCK_STYLE')}
                >
                    <Text
                        style={this.coreInstances.CustomStyle.getStyle('CALL_LOG_PHONE_NUMBER_TEXT_STYLE')}
                    >
                        {this.props.callLog.callType === this.coreInstances.AZStackCore.callConstants.CALL_PAID_LOG_CALL_TYPE_CALLOUT ? this.props.callLog.toPhoneNumber : this.props.callLog.fromPhoneNumber}
                    </Text>
                    {
                        this.props.callLog.callStatus === this.coreInstances.AZStackCore.callConstants.CALL_PAID_LOG_CALL_STATUS_ANSWERED && (
                            <Text
                                style={[
                                    this.coreInstances.CustomStyle.getStyle('CALL_LOG_CALL_STATUS_TEXT_STYLE'),
                                    this.coreInstances.CustomStyle.getStyle('CALL_LOG_CALL_STATUS_ANSWERED_TEXT_STYLE')
                                ]}
                            >
                                {this.coreInstances.Language.getText('CALL_LOG_ANSWERED_TEXT')}
                            </Text>
                        )
                    }
                    {
                        this.props.callLog.callStatus === this.coreInstances.AZStackCore.callConstants.CALL_PAID_LOG_CALL_STATUS_REJECTED && (
                            <Text
                                style={[
                                    this.coreInstances.CustomStyle.getStyle('CALL_LOG_CALL_STATUS_TEXT_STYLE'),
                                    this.coreInstances.CustomStyle.getStyle('CALL_LOG_CALL_STATUS_REJECTED_TEXT_STYLE')
                                ]}
                            >
                                {this.coreInstances.Language.getText('CALL_LOG_REJECTED_TEXT')}
                            </Text>
                        )
                    }
                    {
                        this.props.callLog.callStatus === this.coreInstances.AZStackCore.callConstants.CALL_PAID_LOG_CALL_STATUS_NOT_ANSWERED && (
                            <Text
                                style={[
                                    this.coreInstances.CustomStyle.getStyle('CALL_LOG_CALL_STATUS_TEXT_STYLE'),
                                    this.coreInstances.CustomStyle.getStyle('CALL_LOG_CALL_STATUS_NOT_ANSWERED_TEXT_STYLE')
                                ]}
                            >
                                {this.coreInstances.Language.getText('CALL_LOG_NOT_ANSWERED_TEXT')}
                            </Text>
                        )
                    }
                </View>
                <View
                    style={this.coreInstances.CustomStyle.getStyle('CALL_LOG_CALL_TIME_BLOCK_STYLE')}
                >
                    <TimeFromNowBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                        textStyle={this.coreInstances.CustomStyle.getStyle('CALL_LOG_FROM_NOW_TEXT_STYLE')}
                        time={this.props.callLog.recordTime}
                    />
                    {
                        this.props.callLog.callStatus === this.coreInstances.AZStackCore.callConstants.CALL_PAID_LOG_CALL_STATUS_ANSWERED && (
                            <Text
                                style={this.coreInstances.CustomStyle.getStyle('CALL_LOG_CALL_DURATION_TEXT_STYLE')}
                            >
                                {this.coreInstances.FileConverter.timeAsString(this.props.callLog.duration)}
                            </Text>
                        )
                    }
                </View>
            </TouchableOpacity>
        );
    };
};

export default CallLogItem;