import React from 'react';
import {
    StatusBar,
    Dimensions,
    View,
} from 'react-native';

import ConversationsComponent from './component/ConversationsComponent';
import ChatComponent from './component/ChatComponent';
import NumberPadComponent from './component/NumberPadComponent';
import VoiceCallComponent from './component/VoiceCallComponent';
import VideoCallComponent from './component/VideoCallComponent';
import CallLogsComponent from './component/CallLogsComponent';
import UserComponent from './component/UserComponent';
import GroupComponent from './component/GroupComponent';
import SelectMembersComponent from './component/SelectMembersComponent';
import SelectMemberComponent from './component/SelectMemberComponent';
import GroupInputNameComponent from './component/GroupInputNameComponent';
import ImageGalleryComponent from './component/ImageGalleryComponent';
import LocationMapComponent from './component/LocationMapComponent';
import SketchDrawingComponent from './component/SketchDrawingComponent';
import StickerListComponent from './component/StickerListComponent';
import StickerDetailsComponent from './component/StickerDetailsComponent';


const NavigationEnum = {
    ConversationsComponent: 'ConversationsComponent',
    ChatComponent: 'ChatComponent',
    NumberPadComponent: 'NumberPadComponent',
    VoiceCallComponent: 'VoiceCallComponent',
    VideoCallComponent: 'VideoCallComponent',
    CallLogsComponent: 'CallLogsComponent',
    UserComponent: 'UserComponent',
    GroupComponent: 'GroupComponent',
    SelectMembersComponent: 'SelectMembersComponent',
    SelectMemberComponent: 'SelectMemberComponent',
    GroupInputNameComponent: 'GroupInputNameComponent',
    ImageGalleryComponent: 'ImageGalleryComponent',
    LocationMapComponent: 'LocationMapComponent',
    SketchDrawingComponent: 'SketchDrawingComponent',
    StickerListComponent: 'StickerListComponent',
    StickerDetailsComponent: 'StickerDetailsComponent'
};

export default class AZStackNavigation extends React.Component {
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
            case 'NumberPadComponent':
                return this.renderNumberPad(options, index);
            case 'VoiceCallComponent':
                return this.renderVoiceCall(options, index);
            case 'VideoCallComponent':
                return this.renderVideoCall(options, index);
            case 'CallLogsComponent':
                return this.renderCallLogs(options, index);
            case 'UserComponent':
                return this.renderUser(options, index);
            case 'GroupComponent':
                return this.renderGroup(options, index);
            case 'SelectMembersComponent':
                return this.renderSelectMembers(options, index);
            case 'SelectMemberComponent':
                return this.renderSelectMember(options, index);
            case 'GroupInputNameComponent':
                return this.renderGroupInputName(options, index);
            case 'ImageGalleryComponent':
                return this.renderImageGallery(options, index);
            case 'LocationMapComponent':
                return this.renderLocationMap(options, index);
            case 'SketchDrawingComponent':
                return this.renderSketchDrawing(options, index);
            case 'StickerListComponent':
                return this.renderStickersList(options, index);
            case 'StickerDetailsComponent':
                return this.renderStickerDetails(options, index);
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
            getCoreInstances={this.getCoreInstances}
            {...options}
        />;
    };

    renderChat(options, key) {
        return <ChatComponent
            key={key}
            Sizes={this.Sizes}
            getCoreInstances={this.getCoreInstances}
            {...options}
        />;
    };

    renderVoiceCall(options, key) {
        return <VoiceCallComponent
            key={key}
            Sizes={this.Sizes}
            getCoreInstances={this.getCoreInstances}
            {...options}
        />;
    };

    renderNumberPad(options, key) {
        return <NumberPadComponent
            key={key}
            Sizes={this.Sizes}
            getCoreInstances={this.getCoreInstances}
            {...options}
        />;
    };

    renderVideoCall(options, key) {
        return <VideoCallComponent
            key={key}
            Sizes={this.Sizes}
            getCoreInstances={this.getCoreInstances}
            {...options}
        />;
    };

    renderCallLogs(options, key) {
        return <CallLogsComponent
            key={key}
            Sizes={this.Sizes}
            getCoreInstances={this.getCoreInstances}
            {...options}
        />;
    };

    renderUser(options, key) {
        return <UserComponent
            key={key}
            Sizes={this.Sizes}
            getCoreInstances={this.getCoreInstances}
            {...options}
        />;
    };

    renderGroup(options, key) {
        return <GroupComponent
            key={key}
            Sizes={this.Sizes}
            getCoreInstances={this.getCoreInstances}
            {...options}
        />;
    };

    renderSelectMembers(options, key) {
        return <SelectMembersComponent
            key={key}
            Sizes={this.Sizes}
            getCoreInstances={this.getCoreInstances}
            {...options}
        />;
    };

    renderSelectMember(options, key) {
        return <SelectMemberComponent
            key={key}
            Sizes={this.Sizes}
            getCoreInstances={this.getCoreInstances}
            {...options}
        />;
    };

    renderGroupInputName(options, key) {
        return <GroupInputNameComponent
            key={key}
            Sizes={this.Sizes}
            getCoreInstances={this.getCoreInstances}
            {...options}
        />;
    };

    renderImageGallery(options, key) {
        return <ImageGalleryComponent
            key={key}
            Sizes={this.Sizes}
            getCoreInstances={this.getCoreInstances}
            {...options}
        />;
    };

    renderLocationMap(options, key) {
        return <LocationMapComponent
            key={key}
            Sizes={this.Sizes}
            getCoreInstances={this.getCoreInstances}
            {...options}
        />;
    };

    renderSketchDrawing(options, key) {
        return <SketchDrawingComponent
            key={key}
            Sizes={this.Sizes}
            getCoreInstances={this.getCoreInstances}
            {...options}
        />;
    };

    renderStickersList(options, key) {
        return <StickerListComponent
            key={key}
            Sizes={this.Sizes}
            getCoreInstances={this.getCoreInstances}
            {...options}
        />;
    };

    renderStickerDetails(options, key) {
        return <StickerDetailsComponent
            key={key}
            Sizes={this.Sizes}
            getCoreInstances={this.getCoreInstances}
            {...options}
        />;
    };
};