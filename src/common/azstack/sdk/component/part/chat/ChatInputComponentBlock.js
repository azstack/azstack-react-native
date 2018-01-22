import React from 'react';
import {
    View,
    TextInput,
    Image,
    TouchableOpacity,
    ScrollView
} from 'react-native';

class ChatInputComponentBlock extends React.Component {
    constructor(props) {

        super(props);

        this.subscriptions = {};

        this.state = {
            text: {
                focused: false,
                val: ''
            },
            sticker: {
                showed: false,
                selected: 0,
                items: [
                    {
                        catId: 1,
                        iconName: 'icon.png',
                        content: [
                            '001.png', '002.png', '003.png', '004.png', '005.png',
                            '006.png', '007.png', '008.png', '009.png', '010.png',
                            '011.png', '012.png', '013.png', '014.png', '015.png',
                            '016.png', '017.png', '018.png', '019.png', '020.png',
                            '021.png', '022.png', '023.png', '024.png', '025.png',
                            '026.png', '027.png', '028.png', '029.png', '030.png',
                            '031.png', '032.png', '033.png', '034.png', '035.png',
                            '036.png', '037.png', '038.png', '039.png', '040.png',
                            '041.png', '042.png', '043.png', '044.png', '045.png',
                            '046.png', '047.png', '048.png', '049.png', '050.png'
                        ]
                    }
                ]
            }
        };

        this.onTextInputChanged = this.onTextInputChanged.bind(this);
        this.onTextInputFocused = this.onTextInputFocused.bind(this);
        this.onTextInputBlured = this.onTextInputBlured.bind(this);
        this.showStickerBox = this.showStickerBox.bind(this);
        this.changeStickerTab = this.changeStickerTab.bind(this);
        this.sendTextMessage = this.sendTextMessage.bind(this);
        this.sendStickerMessage = this.sendStickerMessage.bind(this);
    };

    onTextInputChanged(newText) {
        this.setState({ text: Object.assign({}, this.state.text, { val: newText }) });
    };
    onTextInputFocused() {
        if (this.state.sticker.showed) {
            this.setState({ sticker: Object.assign({}, this.state.sticker, { showed: false }) });
        }
        this.setState({ text: Object.assign({}, this.state.text, { focused: true }) });
    };
    onTextInputBlured() {
        this.setState({ text: Object.assign({}, this.state.text, { focused: false }) });
    };

    showStickerBox() {
        if (this.state.sticker.showed) {
            return;
        }

        if (this.state.text.focused) {
            this.refs.TextInput.blur();
        }

        this.setState({ sticker: Object.assign({}, this.state.sticker, { showed: true }) });
    };
    changeStickerTab(index) {

        if (this.state.sticker.selected === index) {
            return;
        }

        this.setState({ sticker: Object.assign({}, this.state.sticker, { selected: index }) });
    };

    sendTextMessage() {
        if (!this.state.text.val) {
            return;
        }

        this.props.AZStackCore.newMessage({
            chatType: this.props.chatType,
            chatId: this.props.chatId,
            text: this.state.text.val
        }).then((result) => {
            this.setState({ text: Object.assign({}, this.state.text, { val: '' }) });
        }).catch((error) => { });
    };
    sendStickerMessage(itemName) {
        this.props.AZStackCore.newMessage({
            chatType: this.props.chatType,
            chatId: this.props.chatId,
            sticker: {
                name: itemName,
                catId: this.state.sticker.items[this.state.sticker.selected].catId,
                url: `${this.props.linkConstants.LINK_API_URL_STICKER}${this.state.sticker.items[this.state.sticker.selected].catId}/${itemName}`
            }
        }).then((result) => { }).catch((error) => { });
    };

    render() {
        return (
            <View
                style={this.props.CustomStyle.getStyle('CHAT_INPUT_BLOCK_STYLE')}
            >
                <View
                    style={[this.props.CustomStyle.getStyle('CHAT_INPUT_INPUT_BLOCK_STYLE'), {borderWidth: 0}]}
                >
                    <TouchableOpacity
                        style={this.props.CustomStyle.getStyle('CHAT_INPUT_STICKER_BUTTON_BLOCK_STYLE')}
                        activeOpacity={0.5}
                        onPress={this.showStickerBox}
                    >
                        <Image
                            style={this.props.CustomStyle.getStyle('CHAT_INPUT_STICKER_BUTTON_IMAGE_STYLE')}
                            source={this.props.CustomStyle.getImage('IMAGE_STICKER')}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={this.props.CustomStyle.getStyle('CHAT_INPUT_ATTACH_BUTTON_BLOCK_STYLE')}
                        activeOpacity={0.5}
                        onPress={() => { }}
                    >
                        <Image
                            style={this.props.CustomStyle.getStyle('CHAT_INPUT_ATTACH_BUTTON_IMAGE_STYLE')}
                            source={this.props.CustomStyle.getImage('IMAGE_ATTACH')}
                        />
                    </TouchableOpacity>
                    <View
                        style={[this.props.CustomStyle.getStyle('CHAT_INPUT_TEXT_INPUT_BLOCK_STYLE')]}
                    >
                        <TextInput
                            ref={'TextInput'}
                            style={this.props.CustomStyle.getStyle('CHAT_INPUT_TEXT_INPUT_STYLE')}
                            onChangeText={this.onTextInputChanged}
                            onFocus={this.onTextInputFocused}
                            onBlur={this.onTextInputBlured}
                            value={this.state.text.val}
                            placeholder={this.props.Language.getText('CHAT_INPUT_TEXT_INPUT_PLACEHOLDER_TEXT')}
                            returnKeyType={'done'}
                            autoCapitalize={'none'}
                            autogrow
                            multiline
                            {
                            ...this.props.CustomStyle.getStyle('CHAT_INPUT_TEXT_INPUT_PROPS_STYLE')
                            }
                        />
                    </View>
                    <TouchableOpacity
                        style={this.props.CustomStyle.getStyle('CHAT_INPUT_SEND_BUTTON_BLOCK_STYLE')}
                        activeOpacity={0.5}
                        onPress={this.sendTextMessage}
                    >
                        <Image
                            style={this.props.CustomStyle.getStyle('CHAT_INPUT_SEND_BUTTON_IMAGE_STYLE')}
                            source={this.props.CustomStyle.getImage('IMAGE_SEND')}
                        />
                    </TouchableOpacity>
                </View>
                {
                    !!this.state.sticker.showed && (
                        <View
                            style={this.props.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_BLOCK_STYLE')}
                        >
                            <View
                                style={this.props.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_TABS_BLOCK_STYLE')}
                            >
                                {
                                    this.state.sticker.items.map((item, index) => {
                                        return (
                                            <TouchableOpacity
                                                style={[
                                                    this.props.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_TABS_TAB_BUTTON_STYLE'),
                                                    (this.state.sticker.selected === index ? this.props.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_TABS_TAB_BUTTON_ACTIVE_STYLE') : {})
                                                ]}
                                                activeOpacity={0.5}
                                                onPress={() => { this.changeStickerTab(index) }}
                                                key={`sticker_tab_${item.catId}`}
                                            >
                                                <Image
                                                    style={this.props.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_TABS_TAB_IMAGE_STYLE')}
                                                    source={{
                                                        uri: `${this.props.linkConstants.LINK_API_URL_STICKER}${item.catId}/${item.iconName}`
                                                    }}
                                                />
                                            </TouchableOpacity>
                                        );
                                    })
                                }
                            </View>
                            <View
                                style={this.props.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_STICKERS_BLOCK_STYLE')}
                            >
                                <ScrollView
                                    contentContainerStyle={this.props.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_STICKERS_ITEMS_BLOCK_STYLE')}
                                >
                                    {
                                        this.state.sticker.items[this.state.sticker.selected].content.map((item) => {
                                            return (
                                                <TouchableOpacity
                                                    style={this.props.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_STICKERS_STICKER_BUTTON_STYLE')}
                                                    activeOpacity={0.5}
                                                    onPress={() => { this.sendStickerMessage(item) }}
                                                    key={`sticker_${this.state.sticker.items[this.state.sticker.selected].catId}_${item}`}
                                                >
                                                    <Image
                                                        style={this.props.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_STICKERS_STICKER_IMAGE_STYLE')}
                                                        source={{
                                                            uri: `${this.props.linkConstants.LINK_API_URL_STICKER}${this.state.sticker.items[this.state.sticker.selected].catId}/${item}`
                                                        }}
                                                    />
                                                </TouchableOpacity>
                                            );
                                        })
                                    }
                                </ScrollView>
                            </View>
                        </View>
                    )
                }
            </View>
        );
    };
};

export default ChatInputComponentBlock;