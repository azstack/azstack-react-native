import React from 'react';
import {
    TouchableOpacity,
    Image
} from 'react-native';

class MessageImageBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.onPressed = this.onPressed.bind(this);
    };

    onPressed() {
        this.coreInstances.EventEmitter.emit(this.coreInstances.eventConstants.EVENT_NAME_ON_MESSAGE_MEDIA_PLAYED, { error: null, result: { msgId: this.props.msgId } });
        this.props.onMessageImagePressed({
            msgId: this.props.msgId
        });
    };

    render() {
        return (
            <TouchableOpacity
                activeOpacity={0.5}
                onPress={this.onPressed}
            >
                <Image
                    style={[
                        this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_IMAGE_STYLE'),
                        this.coreInstances.FileConverter.ajustImageSizes(this.props.imageFile, { width: 250, height: 250 })
                    ]}
                    source={{
                        uri: this.props.imageFile.url
                    }}
                />
            </TouchableOpacity>
        );
    };
};

export default MessageImageBlockComponent;