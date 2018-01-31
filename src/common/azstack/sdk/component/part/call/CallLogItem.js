import React from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    Image
} from 'react-native';

import call_icon from '../../../static/image/call-icon.png';
import ic_avatar from '../../../static/image/ic_avatar.png';

class CallLogItem extends React.Component {
    constructor(props) {
        super(props);
        this.coreInstances = props.getCoreInstances();
        this.state = {
            showActions: false,
        };
    }

    render() {
        return (
            <View>
                <TouchableOpacity onPress={() => this.onPress()}>
                    <View style={styles.contactToggle}>
                        <View style={styles.avatar}>
                            <Image source={ic_avatar} style={{ height: 50, width: 50 }} resizeMode={'contain'} />
                        </View>
                        <View style={{ flex: 1, paddingRight: 60 }}>
                            <Text numberOfLines={1}>{this.props.callLog.callType === 1 ? this.props.callLog.toPhoneNumber : this.props.callLog.fromPhoneNumber}</Text>
                            <Text numberOfLines={1}>{this.props.callLog.callType} <Text>{this.coreInstances.DateTimeFormatter.formatDate(this.props.callLog.recordTime, "YYYY/MM/DD HH:mm:ss")}</Text></Text>
                        </View>
                        <View style={styles.inlineActions}>
                            <TouchableOpacity onPress={() => this.callout()}>
                                <View style={{ alignSelf: 'flex-end' }}>
                                    <Image source={call_icon} style={{ width: 25, height: 25 }} resizeMode={'contain'} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    onPress() {
        this.props.onPress();
    }
}

export default CallLogItem;

const styles = {
    contactToggle: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e3e2e1',
        justifyContent: 'space-around'
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    inlineActions: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 20,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'space-around',
        display: 'none'
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e3e2e1',
    },
    actionButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    }
}