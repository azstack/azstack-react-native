import React from 'react';
import {
    BackHandler,
    Dimensions,
    Image,
    View,
    Text,
    ScrollView
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';
import ConnectionBlockComponent from './part/common/ConnectionBlockComponent';

class StickerDetailsComponent extends React.Component {
    constructor(props) {

        super(props);

        this.coreInstances = props.getCoreInstances();

        this.state = {
            fullCoverSizes: {
                width: 0,
                height: 0
            }
        };

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);
    };

    onHardBackButtonPressed() {
        this.props.onBackButtonPressed();
        return true;
    };

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);

        Image.getSize(this.props.sticker.urls.fullCover, (imageWidth, imageHeight) => {
            if (!imageWidth || !imageHeight) {
                return;
            }

            let imageSizes = {
                width: imageWidth,
                height: imageHeight
            };

            const { height, width } = Dimensions.get('window');

            if (imageWidth > width - 30) {
                imageSizes.width = width - 30;
                imageSizes.height = (width - 30) / imageWidth * imageHeight;
            }

            this.setState({ fullCoverSizes: imageSizes });
        });
    };
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
    };

    render() {
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
                    title={this.coreInstances.Language.getText('STICKER_DETAILS_HEADER_TITLE_TEXT')}
                />}
                <ScreenBodyBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    style={this.props.contentContainerStyle}
                >
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_MAIN_BLOCK_STYLE')}
                    >
                        <Image
                            style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_MINI_COVER_IMAGE')}
                            source={{
                                uri: this.props.sticker.urls.miniCover
                            }}
                        />
                        <Text
                            style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_NAME_TEXT_STYLE')}
                        >
                            {this.props.sticker.name}
                        </Text>
                    </View>
                    <ScrollView
                        style={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_FULL_COVER_BLOCK_STYLE')}
                        contentContainerStyle={this.coreInstances.CustomStyle.getStyle('STICKER_DETAILS_FULL_COVER_CONTAINER_BLOCK_STYLE')}
                    >
                        <Image
                            style={{ width: this.state.fullCoverSizes.width, height: this.state.fullCoverSizes.height }}
                            source={{ uri: this.props.sticker.urls.fullCover }}
                        />
                    </ScrollView>
                    <ConnectionBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                    />
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    };
};

export default StickerDetailsComponent;