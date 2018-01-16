import React from 'react';
import {
    View,
    FlatList,
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';
import ChatHeaderComponent from './part/chat/ChatHeaderComponent';
import ChatInputDisabledComponent from './part/chat/ChatInputDisabledComponent';

class ChatComponent extends React.Component {
    constructor(props) {
        super(props);

        this.subscriptions = {};
        this.pagination = {
            page: 1,
            lastCreated: new Date().getTime(),
            loading: false,
            done: false
        };

        this.state = {
            chatTarget: null,
            messages: []
        };
    };

    addSubscriptions() {
        this.subscriptions.onAuthenticated = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_AUTHENTICATED_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.getChatTarget();
        });

    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

    getChatTarget() {
        if (!this.props.AZStackCore.slaveSocketConnected) {
            return;
        }

        if (this.props.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_USER) {
            this.props.AZStackCore.getUsersInformation({
                userIds: [this.props.chatId]
            }).then((result) => {
                this.setState({ chatTarget: result.list[0] });
                this.getMessages();
            }).catch((error) => { })
        } else if (this.props.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_GROUP) {
            this.props.AZStackCore.getDetailsGroup({
                groupId: this.props.chatId
            }).then((result) => {
                this.setState({ chatTarget: result });
                this.getMessages();
            }).catch((error) => { });
        }
    };
    getMessages() {
        console.log(this.state.chatTarget);
    };

    componentDidMount() {
        this.addSubscriptions();
        this.getChatTarget();
    };

    componentWillUnmount() {
        this.clearSubscriptions();
    };

    render() {
        return (
            <ScreenBlockComponent
                Sizes={this.props.Sizes}
                CustomStyle={this.props.CustomStyle}
            >
                {
                    !this.state.chatTarget && <ScreenHeaderBlockComponent
                        CustomStyle={this.props.CustomStyle}
                        onBackButtonPressed={this.props.onBackButtonPressed}
                        title={this.props.Language.getText('CHAT_HEADER_TITLE_TEXT')}
                    />
                }
                {
                    !!this.state.chatTarget && <ChatHeaderComponent
                        CustomStyle={this.props.CustomStyle}
                        Language={this.props.Language}
                        AZStackCore={this.props.AZStackCore}
                        onBackButtonPressed={this.props.onBackButtonPressed}
                        chatType={this.props.chatType}
                        chatTarget={this.state.chatTarget}
                    />
                }
                <ScreenBodyBlockComponent
                    CustomStyle={this.props.CustomStyle}
                >
                    {
                        this.state.messages.length === 0 && <EmptyBlockComponent
                            CustomStyle={this.props.CustomStyle}
                            emptyText={this.props.Language.getText('MESSAGES_LIST_EMPTY_TEXT')}
                        />
                    }
                </ScreenBodyBlockComponent>
                <ChatInputDisabledComponent
                    CustomStyle={this.props.CustomStyle}
                    Language={this.props.Language}
                />
            </ScreenBlockComponent>
        );
    };
};

export default ChatComponent;