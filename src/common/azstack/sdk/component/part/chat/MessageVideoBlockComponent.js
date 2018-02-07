import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image
} from 'react-native';
import Video from 'react-native-video';

class MessageVideoBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.state = {
            sizes: null,
            playing: false,
            currentTime: 0,
            duration: 0,
            playableDuration: 0
        };

        this.onTogglePlayState = this.onTogglePlayState.bind(this);

        this.onVideoLoadStart = this.onVideoLoadStart.bind(this);
        this.onVideoLoad = this.onVideoLoad.bind(this);
        this.onVideoProcess = this.onVideoProcess.bind(this);
        this.onVideoEnd = this.onVideoEnd.bind(this);
        this.onVideoError = this.onVideoError.bind(this);
        this.onVideoBuffer = this.onVideoBuffer.bind(this);
        this.onVideoTimedMetadata = this.onVideoTimedMetadata.bind(this);
    };

    onTogglePlayState() {
        this.setState({ playing: !this.state.playing });
    };

    onVideoLoadStart(data) { };
    onVideoLoad(data) {
        this.setState({
            duration: data.duration,
            sizes: {
                width: data.naturalSize.width,
                height: data.naturalSize.height
            }
        });
    };
    onVideoProcess(data) {
        this.setState({
            currentTime: data.currentTime,
            playableDuration: data.playableDuration
        });
    };
    onVideoEnd(data) {
        this.setState({ playing: true });
    };
    onVideoError(data) {
        this.setState({ playing: false });
    };
    onVideoBuffer(data) { };
    onVideoTimedMetadata(data) { };

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_VIDEO_BLOCK_STYLE')}
            >
                <View
                    style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_VIDEO_BLOCK_STYLE')}
                >
                    <Video source={{ uri: this.props.videoFile.url }}
                        style={[
                            this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_VIDEO_FRAME_DISPLAY_STYLE'),
                            (this.state.sizes ? this.coreInstances.FileConverter.ajustImageSizes(this.state.sizes, { width: 250, height: 250 }) : {})
                        ]}
                        rate={1.0}
                        volume={1.0}
                        muted={false}
                        paused={!this.state.playing}
                        resizeMode='cover'
                        repeat={false}
                        playInBackground={false}
                        playWhenInactive={false}
                        ignoreSilentSwitch={'ignore'}
                        progressUpdateInterval={250.0}
                        onLoadStart={this.onVideoLoadStart}
                        onLoad={this.onVideoLoad}
                        onProgress={this.onVideoProcess}
                        onEnd={this.onVideoEnd}
                        onError={this.onVideoError}
                        onBuffer={this.onVideoBuffer}
                        onTimedMetadata={this.onVideoTimedMetadata}
                    />
                </View>
                <View
                    style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_VIDEO_CONTROL_BLOCK_STYLE')}
                >
                    <TouchableOpacity
                        style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_VIDEO_STATE_BUTTON_STYLE')}
                        activeOpacity={0.5}
                        onPress={this.onTogglePlayState}
                    >
                        {
                            !this.state.playing && (
                                <Image
                                    style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_VIDEO_STATE_IMAGE_STYLE')}
                                    source={this.coreInstances.CustomStyle.getImage('IMAGE_PLAY')}
                                />
                            )
                        }
                        {
                            this.state.playing && (
                                <Image
                                    style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_VIDEO_STATE_IMAGE_STYLE')}
                                    source={this.coreInstances.CustomStyle.getImage('IMAGE_PAUSE')}
                                />
                            )
                        }
                    </TouchableOpacity>
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_VIDEO_DURATION_BLOCK_STYLE')}
                    >
                        <Text
                            style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_VIDEO_NAME_TEXT_STYLE')}
                            numberOfLines={1}
                        >
                            {this.props.videoFile.name}
                        </Text>
                        <View
                            style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_VIDEO_DURATION_LINES_BLOCK_STYLE')}
                        >
                            <View
                                style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_VIDEO_DURATION_LINE_STYLE')}
                            />
                            <View
                                style={[
                                    this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_VIDEO_PLAYABLE_LINE_STYLE'),
                                    { width: `${Math.round(this.state.playableDuration / this.state.duration * 100)}%` }
                                ]}
                            />
                            <View
                                style={[
                                    this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_VIDEO_CURRENT_LINE_STYLE'),
                                    { width: `${Math.round(this.state.currentTime / this.state.duration * 100)}%` }
                                ]}
                            />
                        </View>
                        <Text
                            style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_VIDEO_NAME_TEXT_STYLE')}
                        >
                            {this.coreInstances.FileConverter.timeAsString(this.state.currentTime)}
                            /
                        {this.coreInstances.FileConverter.timeAsString(this.state.duration)}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };
};

export default MessageVideoBlockComponent;