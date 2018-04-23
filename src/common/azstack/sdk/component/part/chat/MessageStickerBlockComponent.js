import React from 'react';
import {
    Image,
    Dimensions
} from 'react-native';

class MessageStickerBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();
    };

    render() {
        const { width: windowWidth } = Dimensions.get('window');
        let limitSize = 200;
        if (windowWidth / 3 < limitSize) {
            limitSize = windowWidth / 3;
        }
        return (
            <Image
                style={[
                    this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_STICKER_STYLE'),
                    this.coreInstances.FileConverter.ajustImageSizes(this.props.sticker, { width: limitSize, height: limitSize })
                ]}
                source={{
                    uri: this.props.sticker.url
                }}
            />
        );
    };
};

export default MessageStickerBlockComponent;