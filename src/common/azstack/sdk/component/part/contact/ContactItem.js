import React from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    Image
} from 'react-native';

import call_icon from '../../../static/image/call-icon.png';
import ic_avatar from '../../../static/image/ic_avatar.png';

class ContactItem extends React.Component {
    constructor(props) {
        super(props);
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
                            <Image source={ic_avatar} style={{height: 30, width: 30}} resizeMode={'contain'} />
                        </View>
                        <View style={{flex: 1, paddingRight: 60}}>
                            <Text numberOfLines={1}>{this.props.contact.name}</Text>
                        </View>
                        <View style={styles.inlineActions}>
                            <TouchableOpacity onPress={() => this.callout()}>
                                <View style={{ alignSelf: 'flex-end'}}>
                                    <Image source={call_icon} style={{width: 25, height: 25}} resizeMode={'contain'} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
                {
                    this.props.showActions === true && (
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={() => this.audioCall()}>
                            <View style={styles.actionButton}>
                                <Text>Gọi Audio</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.videoCall()}>
                            <View style={styles.actionButton}>
                                <Text>Gọi Video</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.textMessage()}>
                            <View style={styles.actionButton}>
                                <Text>Nhắn tin</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    )
                }
            </View>
        );
    }
    
    onPress() {
        this.props.onPress();
    }

    callout() {
        this.props.onCallout({
            info: this.props.contact
        });
    }

    audioCall() {
        this.props.onAudioCall({
            info: this.props.contact
        });
    }

    videoCall() {
        this.props.onVideoCall({
            info: this.props.contact
        });
    }

    textMessage() {

    }
}

export default ContactItem;

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
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    inlineActions: {
        position: 'absolute',
        top: 0, 
        right: 20,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'space-around',
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