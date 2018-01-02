import React from 'react';
import {
    Animated,
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    FlatList
} from 'react-native';

class ConversationsListComponent extends React.Component {
    constructor(props) {
        super(props);

        this.subscriptions = {};
        this.instanceRefs = {
            searchText: null
        };
        this.pagination = {
            page: 1,
            lastCreated: new Date().getTime(),
            loading: false,
            done: false
        };

        this.state = {
            opacityAnimated: new Animated.Value(0),
            marginLeftAnimated: new Animated.Value(-this.props.Sizes.width),
            conversations: [],
            searchText: ''
        };

        this.onSearchTextInitDone = this.onSearchTextInitDone.bind(this);
        this.onSearchTextChange = this.onSearchTextChange.bind(this);
        this.clearSearchText = this.clearSearchText.bind(this);
    };

    addSubscriptions() {
        this.subscriptions.onAuthenticated = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_AUTHENTICATED_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.getConversations();
        });
    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

    getConversations() {
        if (!this.props.AZStackCore.slaveSocketConnected) {
            return;
        }
        if (this.pagination.loading) {
            return;
        }
        if (this.pagination.done) {
            return;
        }

        this.pagination.loading = true;
        this.props.AZStackCore.getModifiedConversations({
            page: this.pagination.page,
            lastCreated: this.pagination.lastCreated
        }).then((result) => {
            this.prepareConversations(result.list).then((preparedConversations) => {
                this.pagination.loading = false;
                if (result.done === this.props.AZStackCore.listConstants.GET_LIST_DONE) {
                    this.pagination.done = true;
                }
                this.pagination.page += 1;
                this.setState({ conversations: this.state.conversations.concat(preparedConversations) });
            }).catch((error) => { });
        }).catch((error) => {
            this.pagination.loading = false;
        });
    };
    prepareConversations(conversations) {
        return Promise.all(
            conversations.map((conversation) => {
                return new Promise((resolve, reject) => {
                    if (conversation.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_USER) {
                        this.props.AZStackCore.getUsersInformation({
                            userIds: [conversation.chatId]
                        }).then((result) => {
                            conversation.user = result.list[0];
                            resolve(conversation);
                        }).catch((error) => {
                            conversation.user = {};
                            resolve(conversation);
                        });
                    } else if (conversation.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_GROUP) {
                        this.props.AZStackCore.getDetailsGroup({
                            groupId: conversation.chatId
                        }).then((result) => {
                            conversation.group = result;
                            resolve(conversation);
                        }).catch((error) => {
                            conversation.group = {};
                            resolve(conversation);
                        });
                    } else {
                        resolve(conversation);
                    }
                });
            })
        );
    };

    onSearchTextInitDone(searchTextRef) {
        this.instanceRefs.searchText = searchTextRef;
    };
    onSearchTextChange(newText) {
        this.setState({ searchText: newText });
    };
    clearSearchText() {
        this.setState({ searchText: '' });
        this.instanceRefs.searchText.blur();
    };

    componentDidMount() {
        Animated.parallel([
            Animated.timing(
                this.state.opacityAnimated,
                {
                    toValue: 1,
                    duration: 1000,
                }
            ),
            Animated.timing(
                this.state.marginLeftAnimated,
                {
                    toValue: 0,
                    duration: 1000,
                }
            )
        ]).start();

        this.addSubscriptions();
        this.getConversations();
    };

    componentWillUnmount() {
        Animated.parallel([
            Animated.timing(
                this.state.opacityAnimated,
                {
                    toValue: 0,
                    duration: 1000,
                }
            ),
            Animated.timing(
                this.state.marginLeftAnimated,
                {
                    toValue: -this.props.Sizes.width,
                    duration: 1000,
                }
            )
        ]).start();

        this.clearSubscriptions();
    };

    render() {
        return (
            <Animated.View
                style={{
                    ...this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_BLOCK_STYLE'),
                    ...this.props.Sizes,
                    opacity: this.state.opacityAnimated,
                    marginLeft: this.state.marginLeftAnimated
                }}
            >
                <View
                    style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_HEADER_BLOCK_STYLE')}
                >
                    <TouchableOpacity
                        style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_HEADER_BACK_BUTTON_STYLE')}
                        activeOpacity={0.5}
                        onPress={this.props.onBackButtonPressed}
                    >
                        <Image
                            style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_HEADER_BACK_BUTTON_IMAGE_STYLE')}
                            source={require('../static/image/back.png')}
                        />
                    </TouchableOpacity>
                    <Text
                        style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_HEADER_TITLE_TEXT_STYLE')}
                    >
                        {this.props.Language.getText('CONVERSATIONS_LIST_HEADER_TITLE_TEXT')}
                    </Text>
                </View>
                <View
                    style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_SEARCH_BLOCK_STYLE')}
                >
                    <TextInput
                        ref={this.onSearchTextInitDone}
                        style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_SEARCH_INPUT_STYLE')}
                        onChangeText={this.onSearchTextChange}
                        value={this.state.searchText}
                        placeholder={this.props.Language.getText('CONVERSATIONS_LIST_SEARCH_PLACEHOLDER_TEXT')}
                        returnKeyType='done'
                        {
                        ...this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_SEARCH_INPUT_PROPS_STYLE')
                        }
                    />
                    <Image
                        style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_SEARCH_IMAGE_STYLE')}
                        source={require('../static/image/search.png')}
                    />
                    {
                        !!this.state.searchText && <TouchableOpacity
                            style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_SEARCH_CLEAR_BUTTON_BLOCK_STYLE')}
                            activeOpacity={0.5}
                            onPress={this.clearSearchText}
                        >
                            <Text
                                style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_SEARCH_CLEAR_BUTTON_TEXT_STYLE')}
                            >×</Text>
                        </TouchableOpacity>
                    }
                </View>
                {
                    this.state.conversations.length === 0 && <View
                        style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_EMPTY_BLOCK_STYLE')}
                    >
                        <Text
                            style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_EMPTY_TEXT_STYLE')}
                        >
                            {this.props.Language.getText('CONVERSATIONS_LIST_EMPTY_TEXT')}
                        </Text>
                    </View>
                }
                {
                    this.state.conversations.length > 0 && <FlatList
                        style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_ITEMS_STYLE')}
                        data={this.state.conversations}
                        renderItem={(itemInstance) => {
                            let conversation = itemInstance.item;
                            return (
                                <TouchableOpacity
                                    style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_ITEM_STYLE')}
                                    activeOpacity={0.5}
                                    onPress={() => { }}
                                >
                                    <View
                                        style={{
                                            ...this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_ITEM_AVATAR_BLOCK_STYLE_STYLE'),
                                            backgroundColor: this.props.ChatAvatar.getColor({ text: conversation.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_USER ? conversation.user.fullname : conversation.group.name })
                                        }}
                                    >
                                        <Text
                                            style={{
                                                ...this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_ITEM_AVATAR_TEXT_STYLE_STYLE')
                                            }}
                                        >
                                            {this.props.ChatAvatar.getFirstLetters({ text: conversation.chatType === this.props.AZStackCore.chatConstants.CHAT_TYPE_USER ? conversation.user.fullname : conversation.group.name, getNumber: conversation.chatType })}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    >

                    </FlatList>
                }
            </Animated.View >
        );
    };
};

export default ConversationsListComponent;