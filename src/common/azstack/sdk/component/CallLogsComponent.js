import React from 'react';
import {
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

import CallLogItem from './part/call/CallLogItem';


class CallLogsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.coreInstances = props.getCoreInstances();
        this.pagination = {
            done: 0,
            page: 1,
            lastCreated: new Date().getTime()
        }
        this.state = {
            logs: [

            ],
            loading: false,
            showItemActions: null,
        };
    }

    componentWillMount() {
        this.getCallLogs({ reload: true });
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    renderItem(item, index) {
        return (
            <CallLogItem
                callLog={item}
                onPress={() => this.onItemPress(item, index)}
                showActions={this.state.showItemActions === index}
                onVideoCall={(options) => {
                    this.props.onVideoCall(options);
                }}
                onAudioCall={(options) => {
                    this.props.onAudioCall(options);
                }}
                onCallout={(options) => {
                    this.props.onCallout(options);
                }}
            />
        );
    }

    renderContent() {
        if (this.state.loading === true) {
            return (
                <EmptyBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    emptyText={"Loading"}
                />
            );
        }

        if (this.state.logs.length === 0) {
            return (
                <EmptyBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    emptyText={"No recently call"}
                />
            );
        }

        return (
            <FlatList
                data={this.state.logs}
                keyExtractor={(item, index) => index}
                renderItem={({ item, index }) => this.renderItem(item, index)}
                onEndReached={() => this.onEndReached()}
                onEndReachedThreshold={0.2}
                onRefresh={() => this.onRefresh()}
                refreshing={this.state.loading}
                onMomentumScrollBegin={() => { console.log('begin'); this.onEndReachedCalledDuringMomentum = false; }}
                onMomentumScrollEnd={() => { console.log('end'); this.onEndReachedCalledDuringMomentum = true; }}
                contentContainerStyle={{ paddingBottom: 15 }}
                keyboardDismissMode={Platform.select({ ios: 'interactive', android: 'on-drag' })}
                centerContent={true}
            />
        );
    }

    render() {
        return (
            <ScreenBlockComponent
                fullScreen={false}
                getCoreInstances={this.props.getCoreInstances}
                style={this.props.style}
                statusbar={this.props.statusbar}
                willAnimate={this.props.willAnimate}
            >
                {this.props.header !== 'hidden' && <ScreenHeaderBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    onBackButtonPressed={() => this.props.onBackButtonPressed()}
                    title={'Call Logs'}
                />}
                <ScreenBodyBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    style={this.props.contentContainerStyle}
                >
                    {this.renderContent()}
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    }

    getCallLogs({ reload }) {
        this.setState({ loading: true });
        this.coreInstances.AZStackCore.getPaidCallLogs({
            page: this.pagination.page,
            lastCreated: this.pagination.lastCreated
        }).then((result) => {
            this.setState({ loading: false });
            this.pagination.page += 1;
            this.pagination.done = result.done;
            if (reload) {
                this.setState({ logs: result.list });
            } else {
                this.setState({ logs: this.state.logs.concat(result.list) });
            }
        }).catch((error) => {
            this.setState({ loading: false });
        });
    }

    onEndReached() {
        if (this.pagination.done === this.coreInstances.AZStackCore.listConstants.GET_LIST_DONE) {
            return;
        }

        if (this.state.loading === true) {
            return;
        }
        if (this.onEndReachedCalledDuringMomentum) { // mean scrolling
            return;
        }

        this.getCallLogs({});
        this.onEndReachedCalledDuringMomentum = true;
    }

    onRefresh() {
        this.getCallLogs({ reload: true });
    }

    onItemPress(contact, index) {
        if (this.state.showItemActions === index) {
            this.setState({ showItemActions: null });
        } else {
            this.setState({ showItemActions: index });
        }

    }
};

export default CallLogsComponent;