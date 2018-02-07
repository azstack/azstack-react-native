import React from 'react';
import {
    Image
} from 'react-native';

class MessageImageBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();
    };

    render() {
        return (
            <Image
                style={[
                    this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_IMAGE_STYLE'),
                    this.coreInstances.FileConverter.ajustImageSizes(this.props.imageFile, { width: 250, height: 250 })
                ]}
                source={{
                    uri: this.props.imageFile.url
                }}
            />
        );
    };
};

export default MessageImageBlockComponent;