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

        this.state = {
            logs: [

            ],
            done: 0,
            loading: false,
            showItemActions: null,
        };
    }

    componentWillMount() {
        this.getCallLogs();
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
        if(this.state.loading === true) {
            return (
                <EmptyBlockComponent
                    CustomStyle={this.props.CustomStyle}
                    emptyText={"Loading"}
                />
            );
        }

        if(this.state.logs.length === 0) {
            return (
                <EmptyBlockComponent
                    CustomStyle={this.props.CustomStyle}
                    emptyText={"No recently call"}
                />
            );
        }

        return (
            <FlatList
                data={this.state.logs}
                keyExtractor={(item, index) => index}
                renderItem={({ item, index}) => this.renderItem(item, index)}
                onEndReached={() => this.onEndReached()}
                onEndReachedThreshold={0.2}
                onRefresh={() => this.onRefresh()}
                refreshing={this.state.loading}
                onMomentumScrollBegin={() => { console.log('begin'); this.onEndReachedCalledDuringMomentum = false; }}
                onMomentumScrollEnd={() => { console.log('end'); this.onEndReachedCalledDuringMomentum = true; }}
                contentContainerStyle={{paddingBottom: 15}}
                keyboardDismissMode={Platform.select({ios: 'interactive', android: 'on-drag'})}
                centerContent={true}
            />
        );
    }

    render() {
        return (
            <ScreenBlockComponent
                fullScreen={false}
                CustomStyle={this.props.CustomStyle}
            >
                <ScreenHeaderBlockComponent
                    CustomStyle={this.props.CustomStyle}
                    onBackButtonPressed={() => this.props.onBackButtonPressed()}
                    title={'Call Logs'}
                />
                <ScreenBodyBlockComponent
                    CustomStyle={this.props.CustomStyle}
                >
                    {this.renderContent()}
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    }

    getCallLogs() {
        this.setState({loading: true});
        this.props.AZStackCore.getPaidCallLogs({}).then((result) => {
            this.setState({loading: false});
            this.setState({logs: this.state.logs.concat(result.list), done: result.done});
        }).catch((error) => {
            this.setState({loading: false});
            console.log(error);
        });
    }

    onEndReached() {
		if(this.state.done === this.props.AZStackCore.listConstants.GET_LIST_DONE) {
			return;
		}

		if(this.state.loading === true) {
			return;
		}
        if (this.onEndReachedCalledDuringMomentum) { // mean scrolling
			return;
        }
        
        this.getCallLogs();
		this.onEndReachedCalledDuringMomentum = true;
    }

    onRefresh() {
        this.getCallLogs();
    }

    onItemPress(contact, index) {
        if(this.state.showItemActions === index) {
            this.setState({showItemActions: null});
        } else {
            this.setState({showItemActions: index});
        }
        
    }
};

export default CallLogsComponent;