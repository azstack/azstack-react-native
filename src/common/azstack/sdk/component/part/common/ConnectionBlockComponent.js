import React from 'react';
import {
    View,
    Text
} from 'react-native';

class ConnectionBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.subscriptions = {};

        this.state = {
            connectionState: 'connecting',
            show: true
        };

        this.timeoutHide = null;
    };

    addSubscriptions() {
        this.subscriptions.onConnected = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_CONNECT_RETURN, ({ error, result }) => {
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
        this.subscriptions.onReconnected = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_AUTO_RECONNECTED, ({ error, result }) => {
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
        this.subscriptions.onReconnected = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_DISCONNECTED, ({ error, result }) => {
            if (error) {
                return;
            }
            if (this.timeoutHide) {
                clearTimeout(this.timeoutHide);
                this.timeoutHide = null;
            }
            this.setState({
                connectionState: 'connecting',
                show: true
            });
        });
    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

    componentDidMount() {
        this.addSubscriptions();
        if (this.props.AZStackCore.slaveSocketConnected) {
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
                    this.props.CustomStyle.getStyle('CONNECTION_BLOCK_STYLE'),
                    (this.state.connectionState === 'connecting' ? this.props.CustomStyle.getStyle('CONNECTION_BLOCK_CONNECTING_STYLE') : {}),
                    (this.state.connectionState === 'connected' ? this.props.CustomStyle.getStyle('CONNECTION_BLOCK_CONNECTED_STYLE') : {})
                ]}
            >
                <Text
                    style={this.props.CustomStyle.getStyle('CONNECTION_TEXT_STYLE')}
                >
                    {this.props.Language.getText(this.state.connectionState === 'connecting' ? 'CONNECTTION_CONNECTING_TEXT' : 'CONNECTTION_CONNECTED_TEXT')}
                </Text>
            </View>
        );
    };
};

export default ConnectionBlockComponent;