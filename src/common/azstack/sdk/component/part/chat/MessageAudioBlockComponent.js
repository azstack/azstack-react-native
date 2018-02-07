import React from 'react';
import {
    View,
    TouchableOpacity,
    Image
} from 'react-native';
import Video from 'react-native-video';

class MessageAudioBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.state = {
            playing: false
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

    onAudioLoadStart(data) {
        console.log('load start');
        console.log(data);
    };
    onAudioLoad(data) {
        console.log('load');
        console.log(data);
    };
    onAudioProcess(data) {
        console.log('process');
        console.log(data);
    };
    onAudioEnd(data) {
        console.log('end');
        console.log(data);
    };
    onAudioError(data) {
        console.log('error');
        console.log(data);
    };
    onAudioBuffer(data) {
        console.log('buffer');
        console.log(data);
    };
    onAudioTimedMetadata(data) {
        console.log('time metadata');
        console.log(data);
    };

    render() {
        return (
            <View
                style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_AUDIO_BLOCK_STYLE')}
            >
                <TouchableOpacity
                    style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_AUDIO_CONTROL_BUTTON_STYLE')}
                    activeOpacity={0.5}
                    onPress={this.onTogglePlayState}
                >
                    {
                        !this.state.playing && (
                            <Image
                                style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_AUDIO_CONTROL_IMAGE_STYLE')}
                                source={this.coreInstances.CustomStyle.getImage('IMAGE_PLAY')}
                            />
                        )
                    }
                    {
                        this.state.playing && (
                            <Image
                                style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_AUDIO_CONTROL_IMAGE_STYLE')}
                                source={this.coreInstances.CustomStyle.getImage('IMAGE_PAUSE')}
                            />
                        )
                    }
                </TouchableOpacity>
                <View
                    style={this.coreInstances.CustomStyle.getStyle('MESSAGE_TYPE_MEDIA_FILE_AUDIO_DURATION_BLOCK_STYLE')}
                >
                </View>
                <Video source={{ uri: this.props.audioFile.url }}
                    ref={(ref) => {
                        this.player = ref
                    }}
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