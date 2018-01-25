import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';
import ConnectionBlockComponent from './part/common/ConnectionBlockComponent';
import ChatAvatarBlockComponent from './part/common/ChatAvatarBlockComponent';
import TimeFromNowBlockComponent from './part/common/TimeFromNowBlockComponent';

class UserComponent extends React.Component {
    constructor(props) {

        super(props);

        this.subscriptions = {};

        this.state = {
            user: null
        };

        this.onStartChatButtonPressed = this.onStartChatButtonPressed.bind(this);
        this.onVoiceCallButtonPressed = this.onVoiceCallButtonPressed.bind(this);
        this.onVideoCallButtonPressed = this.onVideoCallButtonPressed.bind(this);
    };

    addSubscriptions() {
        this.subscriptions.onConnected = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_CONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
        this.subscriptions.onAutoReconnected = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_AUTO_RECONNECTED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
        this.subscriptions.onReconnected = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_RECONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

    initRun() {
        this.state.user = null;
        this.getUser();
    };

    getUser() {
        this.props.AZStackCore.getUsersInformation({
            userIds: [this.props.userId]
        }).then((result) => {
            this.setState({ user: result.list[0] });
        }).catch((error) => { });
    };

    onStartChatButtonPressed() {
        this.props.onStartChatButtonPressed({
            userId: this.props.userId
        });
    };
    onVoiceCallButtonPressed() {
        this.props.onVoiceCallButtonPressed({
            userId: this.props.userId
        });
    };
    onVideoCallButtonPressed() {
        this.props.onVideoCallButtonPressed({
            userId: this.props.userId
        });
    };

    componentDidMount() {
        this.addSubscriptions();
        this.initRun();
    };
    componentWillUnmount() {
        this.clearSubscriptions();
    };

    render() {
        return (
            <ScreenBlockComponent
                fullScreen={false}
                CustomStyle={this.props.CustomStyle}
                style={this.props.style}
            >
                {this.props.hidden !== 'hidden' && <ScreenHeaderBlockComponent
                    CustomStyle={this.props.CustomStyle}
                    onBackButtonPressed={this.props.onBackButtonPressed}
                    title={this.props.Language.getText('USER_HEADER_TITLE_TEXT')}
                />}
                <ScreenBodyBlockComponent
                    CustomStyle={this.props.CustomStyle}
                    style={this.props.contentContainerStyle}
                >
                    {
                        !this.state.user && <EmptyBlockComponent
                            CustomStyle={this.props.CustomStyle}
                            emptyText={this.props.Language.getText('USER_EMPTY_TEXT')}
                        />
                    }
                    {
                        !!this.state.user && (
                            <View
                                style={this.props.CustomStyle.getStyle('USER_BLOCK_STYLE')}
                            >
                                <View
                                    style={this.props.CustomStyle.getStyle('USER_AVATAR_BLOCK_STYLE')}
                                >
                                    <ChatAvatarBlockComponent
                                        CustomStyle={this.props.CustomStyle}
                                        chatType={this.props.AZStackCore.chatConstants.CHAT_TYPE_USER}
                                        chatTarget={this.state.user}
                                        textStyle={this.props.CustomStyle.getStyle('USER_AVATAR_TEXT_STYLE')}
                                    />
                                </View>
                                <Text
                                    style={this.props.CustomStyle.getStyle('USER_NAME_TEXT_STYLE')}
                                >
                                    {this.state.user.fullname}
                                </Text>
                                {
                                    this.state.user.status === this.props.AZStackCore.userConstants.USER_STATUS_ONLINE && (
                                        <Text
                                            style={this.props.CustomStyle.getStyle('USER_ONLINE_TEXT_STYLE')}
                                        >
                                            {this.props.Language.getText('USER_ONLINE_TEXT')}
                                        </Text>
                                    )
                                }
                                {
                                    this.state.user.status === this.props.AZStackCore.userConstants.USER_STATUS_NOT_ONLINE && (
                                        <Text
                                            style={this.props.CustomStyle.getStyle('USER_OFFLINE_TEXT_STYLE')}
                                        >
                                            {`${this.props.Language.getText('USER_OFFLINE_TEXT')} `}
                                            <TimeFromNowBlockComponent
                                                Language={this.props.Language}
                                                CustomStyle={this.props.CustomStyle}
                                                textStyle={this.props.CustomStyle.getStyle('USER_OFFLINE_TEXT_STYLE')}
                                                time={this.state.user.lastVisitDate * 1000}
                                            />
                                        </Text>
                                    )
                                }
                                <View
                                    style={this.props.CustomStyle.getStyle('USER_ACTION_BLOCK_STYLE')}
                                >
                                    <TouchableOpacity
                                        style={this.props.CustomStyle.getStyle('USER_ACTION_BUTTON_STYLE')}
                                        activeOpacity={0.5}
                                        onPress={this.onStartChatButtonPressed}
                                    >
                                        <Image
                                            style={this.props.CustomStyle.getStyle('USER_ACTION_BUTTON_IMAGE_STYLE')}
                                            source={this.props.CustomStyle.getImage('IMAGE_START_CHAT')}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={this.props.CustomStyle.getStyle('USER_ACTION_BUTTON_STYLE')}
                                        activeOpacity={0.5}
                                        onPress={this.onVoiceCallButtonPressed}
                                    >
                                        <Image
                                            style={this.props.CustomStyle.getStyle('USER_ACTION_BUTTON_IMAGE_STYLE')}
                                            source={this.props.CustomStyle.getImage('IMAGE_VOICE_CALL')}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={this.props.CustomStyle.getStyle('USER_ACTION_BUTTON_STYLE')}
                                        activeOpacity={0.5}
                                        onPress={this.onVideoCallButtonPressed}
                                    >
                                        <Image
                                            style={this.props.CustomStyle.getStyle('USER_ACTION_BUTTON_IMAGE_STYLE')}
                                            source={this.props.CustomStyle.getImage('IMAGE_VIDEO_CALL')}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )
                    }
                    <ConnectionBlockComponent
                        Language={this.props.Language}
                        CustomStyle={this.props.CustomStyle}
                        eventConstants={this.props.eventConstants}
                        AZStackCore={this.props.AZStackCore}
                        EventEmitter={this.props.EventEmitter}
                    />
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    };
};

export default UserComponent;