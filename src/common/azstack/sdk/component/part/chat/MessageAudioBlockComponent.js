import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image
} from 'react-native';
import Video from 'react-native-video';

class MessageAudioBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.state = {
            playing: false,
            currentTime: 0,
            duration: 0,
            playableDuration: 0
        };

        this.onTogglePlayState = this.onTogglePlayState.bind(this);

        this.onAudioLoadStart = this.onAudioLoadStart.bind(this);
        this.onAudioLoad = this.onAudioLoad.bind(this);
        this.onAudioProcess = this.onAudioProcess.bind(this);
        this.onAudioEnd = this.onAudioEnd.bind(this);
        this.onAudioError = this.onAudioError.bind(this);
        this.onAudioBuffer = this.onAudioBuffer.bind(this);
        this.onAudioTimedMetadata = this.onAudioTimedMetadata.bind(this);
    };

    onTogglePlayState() {
        this.setState({ playing: !this.state.playing });
    };

    onAudioLoadStart(data) { };
    onAudioLoad(data) {
        this.setState({
            duration: data.duration
        });
    };
    onAudioProcess(data) {
        this.setState({
            currentTime: data.currentTime,
            playableDuration: data.playableDuration
        });
    };
    onAudioEnd(data) {
        this.setState({ playing: true });
    };
    onAudioError(data) {
        this.setState({ playing: false });
    };
    onAudioBuffer(data) { };
    onAudioTimedMetadata(data) { };

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_AUDIO_CONTROL_BLOCK_STYLE')}
            >
                <TouchableOpacity
                    style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_AUDIO_STATE_BUTTON_STYLE')}
                    activeOpacity={0.5}
                    onPress={this.onTogglePlayState}
                >
                    {
                        !this.state.playing && (
                            <Image
                                style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_AUDIO_STATE_IMAGE_STYLE')}
                                source={this.coreInstances.CustomStyle.getImage('IMAGE_PLAY')}
                            />
                        )
                    }
                    {
                        this.state.playing && (
                            <Image
                                style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_AUDIO_STATE_IMAGE_STYLE')}
                                source={this.coreInstances.CustomStyle.getImage('IMAGE_PAUSE')}
                            />
                        )
                    }
                </TouchableOpacity>
                <View
                    style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_AUDIO_DURATION_BLOCK_STYLE')}
                >
                    <Text
                        style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_AUDIO_NAME_TEXT_STYLE')}
                        numberOfLines={1}
                    >
                        {this.props.audioFile.name}
                    </Text>
                    <View
                        style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_AUDIO_DURATION_LINES_BLOCK_STYLE')}
                    >
                        <View
                            style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_AUDIO_DURATION_LINE_STYLE')}
                        />
                        <View
                            style={[
                                this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_AUDIO_PLAYABLE_LINE_STYLE'),
                                { width: `${Math.round(this.state.playableDuration / this.state.duration * 100)}%` }
                            ]}
                        />
                        <View
                            style={[
                                this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_AUDIO_CURRENT_LINE_STYLE'),
                                { width: `${Math.round(this.state.currentTime / this.state.duration * 100)}%` }
                            ]}
                        />
                    </View>
                    <Text
                        style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_AUDIO_NAME_TEXT_STYLE')}
                    >
                        {this.coreInstances.FileConverter.timeAsString(this.state.currentTime)}
                        /
                        {this.coreInstances.FileConverter.timeAsString(this.state.duration)}
                    </Text>
                </View>
                <Video source={{ uri: this.props.audioFile.url }}
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
                    onLoadStart={this.onAudioLoadStart}
                    onLoad={this.onAudioLoad}
                    onProgress={this.onAudioProcess}
                    onEnd={this.onAudioEnd}
                    onError={this.onAudioError}
                    onBuffer={this.onAudioBuffer}
                    onTimedMetadata={this.onAudioTimedMetadata}
                />
            </View>
        );
    };
};

export default MessageAudioBlockComponent;