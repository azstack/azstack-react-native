import React from 'react';
import {
    BackHandler,
    View,
    FlatList,
    Platform,
    TextInput,
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';
import SearchBlockComponent from './part/common/SearchBlockComponent';
import ConnectionBlockComponent from './part/common/ConnectionBlockComponent';

import CallLogItem from './part/call/CallLogItem';


class CallLogsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.coreInstances = props.getCoreInstances();
        this.subscriptions = {};
        this.pagination = {
            done: false,
            page: 1,
            lastCreated: new Date().getTime(),
            loading: false
        }
        this.state = {
            callLogs: [],
            searchText: ''
        };

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);

        this.onSearchTextChanged = this.onSearchTextChanged.bind(this);
        this.onSearchTextCleared = this.onSearchTextCleared.bind(this);
    };

    addSubscriptions() {
        this.subscriptions.onConnected = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_CONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
        this.subscriptions.onAutoReconnected = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_AUTO_RECONNECTED, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
        this.subscriptions.onReconnected = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_ON_RECONNECT_RETURN, ({ error, result }) => {
            if (error) {
                return;
            }
            this.initRun();
        });
        this.subscriptions.onPaidCallLogReturn = this.coreInstances.EventEmitter.addListener(this.coreInstances.eventConstants.EVENT_NAME_PAID_CALL_LOG_RETURN, ({ error, result }) => {
            let newCallLogs = this.state.callLogs;
            newCallLogs.unshift(result);
            this.setState({ callLogs: newCallLogs });
        });
    };
    clearSubscriptions() {
        for (let subscriptionName in this.subscriptions) {
            this.subscriptions[subscriptionName].remove();
        }
    };

    onHardBackButtonPressed() {
        this.props.onBackButtonPressed();
        return true;
    };

    onSearchTextChanged(newText) {
        this.setState({ searchText: newText });
    };
    onSearchTextCleared() {
        this.setState({ searchText: '' });
    };
    getFilteredCallLogs() {
        if (!this.state.searchText) {
            return this.state.callLogs;
        }
        return this.state.callLogs.filter((callLog) => {
            return (callLog.callType === this.coreInstances.AZStackCore.callConstants.CALL_PAID_LOG_CALL_TYPE_CALLOUT ? callLog.toPhoneNumber : callLog.fromPhoneNumber).indexOf(this.state.searchText) > -1;
        });
    };

    initRun() {
        this.state.callLogs = [];
        this.pagination.done = false;
        this.pagination.page = 1;
        this.pagination.lastCreated = new Date().getTime();
        this.getCallLogs();
    };

    getCallLogs() {

        if (!this.coreInstances.AZStackCore.slaveSocketConnected) {
            return;
        }

        if (this.pagination.done) {
            return;
        }

        if (this.pagination.loading) {
            return;
        }

        this.pagination.loading = true;
        this.coreInstances.AZStackCore.getPaidCallLogs({
            page: this.pagination.page,
            lastCreated: this.pagination.lastCreated
        }).then((result) => {
            if (result.done === this.coreInstances.AZStackCore.listConstants.GET_LIST_DONE) {
                this.pagination.done = true;
            } else {
                this.pagination.page += 1;
            }
            this.pagination.loading = false;
            this.setState({
                callLogs: this.state.callLogs.concat(result.list)
            });
        }).catch((error) => {
            this.pagination.loading = false;
        });
    };
    onEndReached() {
        this.getCallLogs();
    };

    componentDidMount() {
        this.addSubscriptions();
        if (this.props.withBackButtonHandler) {
            BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
        }
        this.initRun();
    };
    componentWillUnmount() {
        this.clearSubscriptions();
        if (this.props.withBackButtonHandler) {
            BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
        }
    };

    render() {
        let filteredCallLogs = this.getFilteredCallLogs();
        return (
            <ScreenBlockComponent
                fullScreen={false}
                withStatusbar={this.props.withStatusbar}
                screenStyle={this.props.screenStyle}
                statusbarStyle={this.props.statusbarStyle}
                getCoreInstances={this.props.getCoreInstances}
            >
                {
                    (this.props.withHeader || (this.props.withHeader === undefined && this.coreInstances.defaultLayout.withHeader)) && (
                        <ScreenHeaderBlockComponent
                            getCoreInstances={this.props.getCoreInstances}
                            onBackButtonPressed={() => this.props.onBackButtonPressed()}
                            title={this.coreInstances.Language.getText('CALL_LOGS_HEADER_TITLE_TEXT')}
                        />
                    )
                }
                <ScreenBodyBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                >
                    <SearchBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                        containerStyle={this.coreInstances.CustomStyle.getStyle('CALL_LOGS_SEARCH_BLOCK_STYLE')}
                        onSearchTextChanged={this.onSearchTextChanged}
                        onSearchTextCleared={this.onSearchTextCleared}
                        placeholder={this.coreInstances.Language.getText('CALL_LOGS_SEARCH_PLACEHOLDER_TEXT')}
                    />
                    {
                        !filteredCallLogs.length && (
                            <EmptyBlockComponent
                                getCoreInstances={this.props.getCoreInstances}
                                emptyText={this.coreInstances.Language.getText('CALL_LOGS_LIST_EMPTY_TEXT')}
                            />
                        )
                    }
                    {
                        !!filteredCallLogs.length && (
                            <FlatList
                                style={this.coreInstances.CustomStyle.getStyle('CALL_LOGS_LIST_STYLE')}
                                data={filteredCallLogs}
                                keyExtractor={(item, index) => (`call_log_${index}`)}
                                renderItem={({ item, index }) => {
                                    return (
                                        <CallLogItem
                                            getCoreInstances={this.props.getCoreInstances}
                                            callLog={item}
                                            onCallLogItemPressed={this.props.onCallLogItemPressed}
                                        />
                                    );
                                }}
                                onEndReached={() => this.onEndReached()}
                                onEndReachedThreshold={0.1}
                                contentContainerStyle={this.coreInstances.CustomStyle.getStyle('CALL_LOGS_LIST_CONTAINER_STYLE')}
                                keyboardDismissMode={Platform.select({ ios: 'interactive', android: 'on-drag' })}
                            />
                        )
                    }
                    <ConnectionBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                    />
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    };
};

export default CallLogsComponent;