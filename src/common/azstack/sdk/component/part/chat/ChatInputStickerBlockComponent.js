import React from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    Text
} from 'react-native';

class ChatInputStickerBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.state = {
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
        };

        this.changeStickerTab = this.changeStickerTab.bind(this);
    };

    changeStickerTab() {
        this.setState({ selected: index });
    };

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_BLOCK_STYLE')}
            >
                <View
                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_HEADER_BLOCK_STYLE')}
                >
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_TABS_BLOCK_STYLE')}
                    >
                        {
                            this.state.items.map((item, index) => {
                                return (
                                    <TouchableOpacity
                                        style={[
                                            this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_TABS_TAB_BUTTON_STYLE'),
                                            (this.state.selected === index ? this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_TABS_TAB_BUTTON_ACTIVE_STYLE') : {})
                                        ]}
                                        activeOpacity={0.5}
                                        onPress={() => { this.changeStickerTab(index) }}
                                        key={`sticker_tab_${item.catId}`}
                                    >
                                        <Image
                                            style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_TABS_TAB_IMAGE_STYLE')}
                                            source={{
                                                uri: `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}${item.catId}/${item.iconName}`
                                            }}
                                        />
                                    </TouchableOpacity>
                                );
                            })
                        }
                    </View>
                    <TouchableOpacity
                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_CLOSE_BUTTON_BLOCK_STYLE')}
                        activeOpacity={0.5}
                        onPress={this.props.onCloseButtonPressed}
                    >
                        <Text
                            style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_CLOSE_BUTTON_TEXT_STYLE')}
                        >×</Text>
                    </TouchableOpacity>
                </View>
                <View
                    style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_BODY_BLOCK_STYLE')}
                >
                    <ScrollView
                        contentContainerStyle={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_STICKERS_BLOCK_STYLE')}
                    >
                        {
                            this.state.items[this.state.selected].content.map((item) => {
                                return (
                                    <TouchableOpacity
                                        style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_STICKERS_STICKER_BUTTON_STYLE')}
                                        activeOpacity={0.5}
                                        onPress={() => { this.props.onStickerPressed({ catId: this.state.items[this.state.selected].catId, name: item }) }}
                                        key={`sticker_${this.state.items[this.state.selected].catId}_${item}`}
                                    >
                                        <Image
                                            style={this.coreInstances.CustomStyle.getStyle('CHAT_INPUT_STICKER_BOX_STICKERS_STICKER_IMAGE_STYLE')}
                                            source={{
                                                uri: `${this.coreInstances.linkConstants.LINK_API_URL_STICKER}${this.state.items[this.state.selected].catId}/${item}`
                                            }}
                                        />
                                    </TouchableOpacity>
                                );
                            })
                        }
                    </ScrollView>
                </View>
            </View>
        );
    };
};

export default ChatInputStickerBlockComponent;