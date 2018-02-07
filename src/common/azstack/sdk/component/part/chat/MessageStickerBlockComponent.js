import React from 'react';
import {
    Image
} from 'react-native';

class MessageStickerBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();
    };

    render() {
        return (
            <Image
                style={[
                    this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_STICKER_STYLE'),
                    this.coreInstances.FileConverter.ajustImageSizes(this.props.sticker, { width: 60, height: 60 })
                ]}
                source={{
                    uri: this.props.sticker.url
                }}
            />
        );
    };
};

export default MessageStickerBlockComponent;