import React from 'react';
import {
    BackHandler,
    Dimensions,
    TouchableOpacity,
    Text,
    View,
    Image
} from 'react-native';
import Swiper from 'react-native-swiper';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';

const { height, width } = Dimensions.get('window');

class ImageGalleryComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);
    };

    onHardBackButtonPressed() {
        this.props.onBackButtonPressed();
        return true;
    };

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
    };
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
    };

    render() {
        return (
            <ScreenBlockComponent
                fullScreen={true}
                statusbar={this.props.statusbar}
                getCoreInstances={this.props.getCoreInstances}
                style={this.coreInstances.CustomStyle.getStyle('IMAGE_GALLERY_SCREEN_BLOCK_STYLE')}
            >
                {
                    (!this.props.imageFiles.length || this.props.initialIndex === -1) && <EmptyBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                        emptyText={this.coreInstances.Language.getText('IMAGE_GALLERY_EMPTY_TEXT')}
                    />
                }
                {
                    !!this.props.imageFiles.length && this.props.initialIndex !== -1 && (
                        <Swiper
                            style={this.coreInstances.CustomStyle.getStyle('IMAGE_GALLERY_BLOCK_STYLE')}
                            loadMinimal={true}
                            loadMinimalSize={1}
                            showsPagination={false}
                            showsButtons={this.props.imageFiles.length > 1 ? true : false}
                            nextButton={<Text style={this.coreInstances.CustomStyle.getStyle('IMAGE_GALLERY_CONTROL_BUTTON_TEXT_STYLE')}>›</Text>}
                            prevButton={<Text style={this.coreInstances.CustomStyle.getStyle('IMAGE_GALLERY_CONTROL_BUTTON_TEXT_STYLE')}>‹</Text>}
                            index={this.props.initialIndex}
                        >
                            {
                                this.props.imageFiles.map((imageFile, index) => {
                                    return (
                                        <View
                                            style={this.coreInstances.CustomStyle.getStyle('IMAGE_GALLERY_ITEM_BLOCK_STYLE')}
                                            key={`image_gallery_item${imageFile.msgId}`}
                                        >
                                            <Image
                                                source={{ uri: imageFile.file.url }}
                                                style={this.coreInstances.FileConverter.ajustImageSizes(imageFile.file, { width, height })}
                                            />
                                            {
                                                this.props.imageFiles.length > 1 && (
                                                    <View
                                                        style={this.coreInstances.CustomStyle.getStyle('IMAGE_GALLERY_ITEM_TITLE_BLOCK_STYLE')}
                                                    >
                                                        <Text
                                                            style={this.coreInstances.CustomStyle.getStyle('IMAGE_GALLERY_ITEM_TITLE_INDEX_STYLE')}
                                                        >
                                                            {`${index + 1}/${this.props.imageFiles.length}`}
                                                        </Text>
                                                    </View>
                                                )
                                            }
                                        </View>
                                    );
                                })
                            }
                        </Swiper>
                    )
                }
                <TouchableOpacity
                    style={this.coreInstances.CustomStyle.getStyle('IMAGE_GALLERY_CLOSE_BUTTON_BLOCK_STYLE')}
                    activeOpacity={0.5}
                    onPress={this.props.onBackButtonPressed}
                >
                    <Text
                        style={this.coreInstances.CustomStyle.getStyle('IMAGE_GALLERY_CLOSE_BUTTON_TEXT_STYLE')}
                    >×</Text>
                </TouchableOpacity>
            </ScreenBlockComponent>
        );
    };
};

export default ImageGalleryComponent;