import React from 'react';
import {

} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';
import ConnectionBlockComponent from './part/common/ConnectionBlockComponent';

class GroupComponent extends React.Component {
    constructor(props) {

        super(props);

        this.subscriptions = {};

        this.state = {
            group: null
        };
    };

    addSubscriptions() {
        this.subscriptions.onConnected = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_CONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
        this.subscriptions.onReconnected = this.props.EventEmitter.addListener(this.props.eventConstants.EVENT_NAME_ON_AUTO_RECONNECTED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

    initRun() {
        this.state.group = null;
    };

    componentDidMount() {
        this.addSubscriptions();
        this.initRun();
    };

    componentWillUnmount() {
        this.clearSubscriptions();
    };

    render() {
        return (
            <ScreenBlockComponent
                fullScreen={false}
                CustomStyle={this.props.CustomStyle}
                style={this.props.style}
            >
                {this.props.hidden !== 'hidden' && <ScreenHeaderBlockComponent
                    CustomStyle={this.props.CustomStyle}
                    onBackButtonPressed={this.props.onBackButtonPressed}
                    title={this.props.Language.getText('GROUP_HEADER_TITLE_TEXT')}
                />}
                <ScreenBodyBlockComponent
                    CustomStyle={this.props.CustomStyle}
                    style={this.props.contentContainerStyle}
                >
                    {
                        !this.state.user && <EmptyBlockComponent
                            CustomStyle={this.props.CustomStyle}
                            emptyText={this.props.Language.getText('GROUP_EMPTY_TEXT')}
                        />
                    }
                    <ConnectionBlockComponent
                        Language={this.props.Language}
                        CustomStyle={this.props.CustomStyle}
                        eventConstants={this.props.eventConstants}
                        AZStackCore={this.props.AZStackCore}
                        EventEmitter={this.props.EventEmitter}
                    />
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    };
};

export default GroupComponent;