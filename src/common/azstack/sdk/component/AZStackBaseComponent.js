import React from 'react';
import {
    StatusBar,
    Dimensions,
    View,
} from 'react-native';

import ConversationsComponent from './ConversationsComponent';
import ChatComponent from './ChatComponent';
import OnCallComponent from './OnCallComponent';
import ContactComponent from './ContactComponent';
import NumberPadComponent from './NumberPadComponent';
import VideoCallComponent from './VideoCallComponent';
import CallLogsComponent from './CallLogsComponent';
import UserComponent from './UserComponent';
import GroupComponent from './GroupComponent';

const NavigationEnum = {
    ConversationsComponent: 'ConversationsComponent',
    ChatComponent: 'ChatComponent',
    OnCallComponent: 'OnCallComponent',
    ContactComponent: 'ContactComponent',
    NumberPadComponent: 'NumberPadComponent',
    VideoCallComponent: 'VideoCallComponent',
    CallLogsComponent: 'CallLogsComponent',
    UserComponent: 'UserComponent',
    GroupComponent: 'GroupComponent'
};

export default class AZStackBaseComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            navigation: [],
        };
        const { width, height } = Dimensions.get('window');
        this.Sizes = {
            width,
            height: height - StatusBar.currentHeight
        };
    };

    renderScreens() {
        let screens = [];
        this.state.navigation.map((value, index) => {
            screens.push(this.renderScreen(value.screen, value.options, index));
        });

        return screens;
    };

    renderScreen(screen, options, index) {
        switch (screen) {
            case 'ConversationsComponent':
                return this.renderConversations(options, index);
            case 'ChatComponent':
                return this.renderChat(options, index);
            case 'OnCallComponent':
                return this.renderOnCall(options, index);
            case 'ContactComponent':
                return this.renderContact(options, index)
            case 'NumberPadComponent':
                return this.renderNumberPad(options, index);
            case 'VideoCallComponent':
                return this.renderVideoCall(options, index);
            case 'CallLogsComponent':
                return this.renderCallLogs(options, index);
            case 'UserComponent':
                return this.renderUser(options, index);
            case 'GroupComponent':
                return this.renderGroup(options, index);
            default:
                break;
        }
    };

    /* Navigation functions */
    navigate(screen, options) {
        let newNavigation = [...this.state.navigation];
        newNavigation.push({ screen, options });
        this.setState({ navigation: newNavigation });
    };

    dismiss() {
        this.setState({
            navigation: []
        })
    };

    getNavigation() {
        return NavigationEnum;
    };

    pop() {
        let newNavigation = [...this.state.navigation];
        newNavigation.splice(-1, 1);
        this.setState({ navigation: newNavigation });
    };

    push(screen, options) {
        let newNavigation = [...this.state.navigation];
        newNavigation.push({ screen, options });
        this.setState({ navigation: newNavigation });
    };

    /* Render component */
    renderConversations(options, key) {
        return <ConversationsComponent
            key={key}
            Sizes={this.Sizes}
            Language={this.Language}
            CustomStyle={this.CustomStyle}
            eventConstants={this.eventConstants}
            AZStackCore={this.AZStackCore}
            EventEmitter={this.EventEmitter}
            {...options}
        />;
    };

    renderChat(options, key) {
        return <ChatComponent
            key={key}
            Sizes={this.Sizes}
            Language={this.Language}
            CustomStyle={this.CustomStyle}
            eventConstants={this.eventConstants}
            linkConstants={this.linkConstants}
            AZStackCore={this.AZStackCore}
            EventEmitter={this.EventEmitter}
            {...options}
        />;
    };

    renderOnCall(options, key) {
        return <OnCallComponent
            key={key}
            Sizes={this.Sizes}
            Language={this.Language}
            CustomStyle={this.CustomStyle}
            eventConstants={this.eventConstants}
            AZStackCore={this.AZStackCore}
            EventEmitter={this.EventEmitter}
            {...options}
        />;
    };

    renderContact(options, key) {
        return <ContactComponent
            key={key}
            Sizes={this.Sizes}
            Language={this.Language}
            CustomStyle={this.CustomStyle}
            eventConstants={this.eventConstants}
            AZStackCore={this.AZStackCore}
            EventEmitter={this.EventEmitter}
            {...options}
        />;
    };

    renderNumberPad(options, key) {
        return <NumberPadComponent
            key={key}
            Sizes={this.Sizes}
            Language={this.Language}
            CustomStyle={this.CustomStyle}
            eventConstants={this.eventConstants}
            AZStackCore={this.AZStackCore}
            EventEmitter={this.EventEmitter}
            {...options}
        />;
    };

    renderVideoCall(options, key) {
        return <VideoCallComponent
            key={key}
            Sizes={this.Sizes}
            Language={this.Language}
            CustomStyle={this.CustomStyle}
            eventConstants={this.eventConstants}
            AZStackCore={this.AZStackCore}
            EventEmitter={this.EventEmitter}
            {...options}
        />;
    };

    renderCallLogs(options, key) {
        return <CallLogsComponent
            key={key}
            Sizes={this.Sizes}
            Language={this.Language}
            CustomStyle={this.CustomStyle}
            eventConstants={this.eventConstants}
            AZStackCore={this.AZStackCore}
            EventEmitter={this.EventEmitter}
            {...options}
        />;
    };

    renderUser(options, key) {
        return <UserComponent
            key={key}
            Sizes={this.Sizes}
            Language={this.Language}
            CustomStyle={this.CustomStyle}
            eventConstants={this.eventConstants}
            AZStackCore={this.AZStackCore}
            EventEmitter={this.EventEmitter}
            {...options}
        />;
    };

    renderGroup(options, key) {
        return <GroupComponent
            key={key}
            Sizes={this.Sizes}
            Language={this.Language}
            CustomStyle={this.CustomStyle}
            eventConstants={this.eventConstants}
            AZStackCore={this.AZStackCore}
            EventEmitter={this.EventEmitter}
            members={this.members}
            {...options}
        />;
    };
};