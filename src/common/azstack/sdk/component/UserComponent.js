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

        this.coreInstances = props.getCoreInstances();

        this.subscriptions = {};

        this.state = {
            user: null
        };

        this.onStartChatButtonPressed = this.onStartChatButtonPressed.bind(this);
        this.onVoiceCallButtonPressed = this.onVoiceCallButtonPressed.bind(this);
        this.onVideoCallButtonPressed = this.onVideoCallButtonPressed.bind(this);
    };

    addSubscriptions() {
        this.subscriptions.onConnected = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_CONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
        this.subscriptions.onAutoReconnected = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_AUTO_RECONNECTED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
        this.subscriptions.onReconnected = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_RECONNECT_RETURN, ({ error, result }) => {
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
        this.coreInstances.AZStackCore.getUsersInformation({
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
                getCoreInstances={this.props.getCoreInstances}
                style={this.props.style}
            >
                {this.props.hidden !== 'hidden' && <ScreenHeaderBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    onBackButtonPressed={this.props.onBackButtonPressed}
                    title={this.coreInstances.Language.getText('USER_HEADER_TITLE_TEXT')}
                />}
                <ScreenBodyBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    style={this.props.contentContainerStyle}
                >
                    {
                        !this.state.user && <EmptyBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            emptyText={this.coreInstances.Language.getText('USER_EMPTY_TEXT')}
                        />
                    }
                    {
                        !!this.state.user && (
                            <View
                                style={this.coreInstances.CustomStyle.getStyle('USER_BLOCK_STYLE')}
                            >
                                <View
                                    style={this.coreInstances.CustomStyle.getStyle('USER_AVATAR_BLOCK_STYLE')}
                                >
                                    <ChatAvatarBlockComponent
                                        getCoreInstances={this.props.getCoreInstances}
                                        chatType={this.coreInstances.AZStackCore.chatConstants.CHAT_TYPE_USER}
                                        chatTarget={this.state.user}
                                        textStyle={this.coreInstances.CustomStyle.getStyle('USER_AVATAR_TEXT_STYLE')}
                                    />
                                </View>
                                <Text
                                    style={this.coreInstances.CustomStyle.getStyle('USER_NAME_TEXT_STYLE')}
                                >
                                    {this.state.user.fullname}
                                </Text>
                                {
                                    this.state.user.status === this.coreInstances.AZStackCore.userConstants.USER_STATUS_ONLINE && (
                                        <Text
                                            style={this.coreInstances.CustomStyle.getStyle('USER_ONLINE_TEXT_STYLE')}
                                        >
                                            {this.coreInstances.Language.getText('USER_ONLINE_TEXT')}
                                        </Text>
                                    )
                                }
                                {
                                    this.state.user.status === this.coreInstances.AZStackCore.userConstants.USER_STATUS_NOT_ONLINE && (
                                        <Text
                                            style={this.coreInstances.CustomStyle.getStyle('USER_OFFLINE_TEXT_STYLE')}
                                        >
                                            {`${this.coreInstances.Language.getText('USER_OFFLINE_TEXT')} `}
                                            <TimeFromNowBlockComponent
                                                getCoreInstances={this.props.getCoreInstances}
                                                textStyle={this.coreInstances.CustomStyle.getStyle('USER_OFFLINE_TEXT_STYLE')}
                                                time={this.state.user.lastVisitDate * 1000}
                                            />
                                        </Text>
                                    )
                                }
                                <View
                                    style={this.coreInstances.CustomStyle.getStyle('USER_ACTION_BLOCK_STYLE')}
                                >
                                    <TouchableOpacity
                                        style={this.coreInstances.CustomStyle.getStyle('USER_ACTION_BUTTON_STYLE')}
                                        activeOpacity={0.5}
                                        onPress={this.onStartChatButtonPressed}
                                    >
                                        <Image
                                            style={this.coreInstances.CustomStyle.getStyle('USER_ACTION_BUTTON_IMAGE_STYLE')}
                                            source={this.coreInstances.CustomStyle.getImage('IMAGE_START_CHAT')}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={this.coreInstances.CustomStyle.getStyle('USER_ACTION_BUTTON_STYLE')}
                                        activeOpacity={0.5}
                                        onPress={this.onVoiceCallButtonPressed}
                                    >
                                        <Image
                                            style={this.coreInstances.CustomStyle.getStyle('USER_ACTION_BUTTON_IMAGE_STYLE')}
                                            source={this.coreInstances.CustomStyle.getImage('IMAGE_VOICE_CALL')}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={this.coreInstances.CustomStyle.getStyle('USER_ACTION_BUTTON_STYLE')}
                                        activeOpacity={0.5}
                                        onPress={this.onVideoCallButtonPressed}
                                    >
                                        <Image
                                            style={this.coreInstances.CustomStyle.getStyle('USER_ACTION_BUTTON_IMAGE_STYLE')}
                                            source={this.coreInstances.CustomStyle.getImage('IMAGE_VIDEO_CALL')}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )
                    }
                    <ConnectionBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                    />
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    };
};

export default UserComponent;