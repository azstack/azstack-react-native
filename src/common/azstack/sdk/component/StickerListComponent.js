import React from 'react';
import {
    BackHandler,
    Image,
    TouchableOpacity,
    FlatList,
    Platform,
    Text
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';
import ConnectionBlockComponent from './part/common/ConnectionBlockComponent';
import SearchBlockComponent from './part/common/SearchBlockComponent';

class StickerListComponent extends React.Component {
    constructor(props) {

        super(props);

        this.coreInstances = props.getCoreInstances();

        this.subscriptions = {};

        this.state = {
            stickers: []
        };

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);

        this.onSearchTextChanged = this.onSearchTextChanged.bind(this);
        this.onSearchTextCleared = this.onSearchTextCleared.bind(this);

        this.onStickerPressed = this.onStickerPressed.bind(this);
    };

    onHardBackButtonPressed() {
        this.props.onBackButtonPressed();
        return true;
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
        this.subscriptions.onReconnected = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_RECONNECT_RETURN, ({ error, result }) => {
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
        this.getStickers();
    };

    getStickers() {
        if (!this.coreInstances.AZStackCore.slaveSocketConnected) {
            return;
        }

        this.coreInstances.AZStackCore.getStickersList({
            isDefault: true
        }).then((result) => {
            let stickers = result.list;
            stickers.map((sticker) => {
                sticker.searchString = this.coreInstances.Diacritic.clear(sticker.name).toLowerCase();
            });
            console.log(stickers);
            this.setState({ stickers: stickers });
        }).catch((error) => { });
    };

    onSearchTextChanged(newText) {
        this.setState({ searchText: newText });
    };
    onSearchTextCleared() {
        this.setState({ searchText: '' });
    };
    getFilteredStickers() {
        if (!this.state.searchText) {
            return this.state.stickers;
        }
        let searchParts = this.coreInstances.Diacritic.clear(this.state.searchText).toLowerCase().split(' ');
        return this.state.stickers.filter((sticker) => {
            let matched = false;
            for (let i = 0; i < searchParts.length; i++) {
                if (sticker.searchString.indexOf(searchParts[i]) > -1) {
                    matched = true;
                    break;
                }
            }
            return matched;
        });
    };

    onStickerPressed(sticker) {
        console.log(sticker);
        this.props.showStickerDetails({
            sticker: sticker
        });
    };

    componentDidMount() {
        this.addSubscriptions();
        this.initRun();
        BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
    };
    componentWillUnmount() {
        this.clearSubscriptions();
        BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
    };

    render() {
        let filteredStickers = this.getFilteredStickers();
        return (
            <ScreenBlockComponent
                fullScreen={false}
                getCoreInstances={this.props.getCoreInstances}
                statusbar={this.props.statusbar}
                style={this.props.style}
            >
                {this.props.hidden !== 'hidden' && <ScreenHeaderBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    onBackButtonPressed={this.props.onBackButtonPressed}
                    title={this.coreInstances.Language.getText('STICKERS_LIST_HEADER_TITLE_TEXT')}
                />}
                <ScreenBodyBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    style={this.props.contentContainerStyle}
                >
                    <SearchBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                        containerStyle={this.coreInstances.CustomStyle.getStyle('STICKERS_LIST_SEARCH_BLOCK_STYLE')}
                        onSearchTextChanged={this.onSearchTextChanged}
                        onSearchTextCleared={this.onSearchTextCleared}
                        placeholder={this.coreInstances.Language.getText('STICKERS_LIST_EARCH_PLACEHOLDER_TEXT')}
                    />
                    {
                        !filteredStickers.length && <EmptyBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            emptyText={this.coreInstances.Language.getText('STICKERS_LIST_EMPTY_TEXT')}
                        />
                    }
                    {
                        filteredStickers.length > 0 && <FlatList
                            style={this.coreInstances.CustomStyle.getStyle('STICKERS_LIST_BLOCK_STYLE')}
                            data={filteredStickers}
                            keyExtractor={(item, index) => (item.catId)}
                            renderItem={({ item, index }) => {
                                return (
                                    <TouchableOpacity
                                        style={this.coreInstances.CustomStyle.getStyle('STICKERS_LIST_ITEM_BLOCK_STYLE')}
                                        activeOpacity={0.5}
                                        onPress={() => this.onStickerPressed(item)}
                                    >
                                        <Image
                                            style={this.coreInstances.CustomStyle.getStyle('STICKERS_LIST_ITEM_MINI_COVER_IMAGE')}
                                            source={{ uri: item.urls.miniCover }}
                                        />
                                        <Text
                                            style={this.coreInstances.CustomStyle.getStyle('STICKERS_LIST_ITEM_NAME_TEXT_STYLE')}
                                        >
                                            {item.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                            keyboardDismissMode={Platform.select({ ios: 'interactive', android: 'on-drag' })}
                        />
                    }
                    <ConnectionBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                    />
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    };
};

export default StickerListComponent;