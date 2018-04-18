import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image
} from 'react-native';

class ConnectionBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.coreInstances = props.getCoreInstances();

        this.subscriptions = {};

        this.state = {
            autoReconnectedTimes: 0,
            connectionState: 'connecting',
            show: true
        };

        this.timeoutHide = null;

        this.onReconnectButtonPressed = this.onReconnectButtonPressed.bind(this);
    };

    addSubscriptions() {
        this.subscriptions.onConnected = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_CONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.setState({
                connectionState: 'connected'
            });
            this.timeoutHide = setTimeout(() => {
                this.setState({
                    show: false
                });
                this.timeoutHide = null;
            }, 2000);
        });
        this.subscriptions.onAutoReconnecStart = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_AUTO_RECONNECT_START, ({ error, result }) => {
            if (error) {
                return;
            }
            if (this.timeoutHide) {
                clearTimeout(this.timeoutHide);
                this.timeoutHide = null;
            }
            this.setState({
                connectionState: 'connecting',
                autoReconnectedTimes: 1,
                show: true
            });
        });
        this.subscriptions.onAutoReconnecStop = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_AUTO_RECONNECT_STOP, ({ error, result }) => {
            if (error) {
                this.setState({
                    connectionState: 'disconnected',
                    autoReconnectedTimes: 0,
                    show: true
                });
                return;
            }
        });
        this.subscriptions.onAutoReconnected = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_AUTO_RECONNECTED, ({ error, result }) => {
            if (error) {
                this.setState({
                    autoReconnectedTimes: this.state.autoReconnectedTimes + 1
                });
                return;
            }
            this.setState({
                connectionState: 'connected'
            });
            this.timeoutHide = setTimeout(() => {
                this.setState({
                    show: false
                });
                this.timeoutHide = null;
            }, 2000);
        });
        this.subscriptions.onReconnected = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_RECONNECT_RETURN, ({ error, result }) => {
            if (error) {
                this.setState({
                    connectionState: 'disconnected',
                    show: true
                });
                return;
            }
            this.setState({
                connectionState: 'connected'
            });
            this.timeoutHide = setTimeout(() => {
                this.setState({
                    show: false
                });
                this.timeoutHide = null;
            }, 2000);
        });
        this.subscriptions.onDisconnected = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_DISCONNECTED, ({ error, result }) => {
            if (error) {
                return;
            }
            if (this.timeoutHide) {
                clearTimeout(this.timeoutHide);
                this.timeoutHide = null;
            }
            this.setState({
                connectionState: 'disconnected',
                show: true
            });
        });
    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

    onReconnectButtonPressed() {
        this.setState({
            connectionState: 'connecting',
            show: true
        });
        this.coreInstances.AZStackCore.reconnect();
    };

    componentDidMount() {
        this.addSubscriptions();
        if (this.coreInstances.AZStackCore.slaveSocketConnected) {
            this.setState({
                connectionState: 'connected',
                show: false
            });
        }
    };
    componentWillUnmount() {
        this.clearSubscriptions();
    };

    render() {
        if (!this.state.show) {
            return null;
        }
        return (
            <View
                style={[
                    this.coreInstances.CustomStyle.getStyle('CONNECTION_BLOCK_STYLE'),
                    (this.state.connectionState === 'connecting' ? this.coreInstances.CustomStyle.getStyle('CONNECTION_BLOCK_CONNECTING_STYLE') : {}),
                    (this.state.connectionState === 'disconnected' ? this.coreInstances.CustomStyle.getStyle('CONNECTION_BLOCK_DISCONNECTED_STYLE') : {}),
                    (this.state.connectionState === 'connected' ? this.coreInstances.CustomStyle.getStyle('CONNECTION_BLOCK_CONNECTED_STYLE') : {})
                ]}
            >
                <Text
                    style={this.coreInstances.CustomStyle.getStyle('CONNECTION_TEXT_STYLE')}
                >
                    {this.state.connectionState === 'connecting' && `${this.state.autoReconnectedTimes ? `(${this.state.autoReconnectedTimes}) ` : ''}${this.coreInstances.Language.getText('CONNECTTION_CONNECTING_TEXT')}`}
                    {this.state.connectionState === 'disconnected' && this.coreInstances.Language.getText('CONNECTTION_DISCONNECTED_TEXT')}
                    {this.state.connectionState === 'connected' && this.coreInstances.Language.getText('CONNECTTION_CONNECTED_TEXT')}
                </Text>
                {this.state.connectionState === 'disconnected' && (
                    <TouchableOpacity
                        style={this.coreInstances.CustomStyle.getStyle('CONNECTION_RECONNECT_BUTTON_BLOCK_STYLE')}
                        activeOpacity={0.5}
                        onPress={this.onReconnectButtonPressed}
                    >
                        <Image
                            style={this.coreInstances.CustomStyle.getStyle('CONNECTION_RECONNECT_BUTTON_IMAGE_STYLE')}
                            source={this.coreInstances.CustomStyle.getImage('IMAGE_REFRESH')}
                        />
                    </TouchableOpacity>
                )}
            </View>
        );
    };
};

export default ConnectionBlockComponent;