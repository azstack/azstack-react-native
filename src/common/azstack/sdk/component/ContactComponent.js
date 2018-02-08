import React from 'react';
import {
    BackHandler,
    View,
    FlatList,
} from 'react-native';

import ScreenBlockComponent from './part/screen/ScreenBlockComponent';
import ScreenHeaderBlockComponent from './part/screen/ScreenHeaderBlockComponent';
import ScreenBodyBlockComponent from './part/screen/ScreenBodyBlockComponent';
import EmptyBlockComponent from './part/common/EmptyBlockComponent';
import SearchBlockComponent from './part/common/SearchBlockComponent';

import ContactItem from './part/contact/ContactItem';


class ContactComponent extends React.Component {
    constructor(props) {
        super(props);
        this.coreInstances = this.props.getCoreInstances();
        this.state = {
            contact: [
                {
                    name: "User 2",
                    userId: 387212,
                    phoneNumber: '01672848892'
                },
                {
                    name: "User 3",
                    userId: 387212,
                    phoneNumber: '01672848892'
                },
                {
                    name: "User 4",
                    userId: 387212,
                    phoneNumber: '01672848892'
                },
                {
                    name: "User 5",
                    userId: 387212,
                    phoneNumber: '01672848892'
                }
            ],
            showItemActions: null,
        };

        this.onHardBackButtonPressed = this.onHardBackButtonPressed.bind(this);
    };

    onHardBackButtonPressed() {
        this.props.onBackButtonPressed();
        return true;
    };

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onHardBackButtonPressed);
    };

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onHardBackButtonPressed);
    };

    renderItem(item, index) {
        return (
            <ContactItem
                contact={item}
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
    };

    renderContent() {
        if (this.state.contact.length === 0) {
            return (
                <EmptyBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    emptyText={"No contact"}
                />
            );
        }

        return (
            <FlatList
                data={this.state.contact}
                keyExtractor={(item, index) => index}
                renderItem={({ item, index }) => this.renderItem(item, index)}
                onEndReached={() => this.onEndReached()}
                onEndReachedThreshold={0.2}
            />
        );
    };

    render() {
        return (
            <ScreenBlockComponent
                fullScreen={false}
                getCoreInstances={this.props.getCoreInstances}
                statusbar={this.props.statusbar}
                style={this.props.style}
            >
                {this.props.header !== 'hidden' && <ScreenHeaderBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    onBackButtonPressed={() => this.props.onBackButtonPressed()}
                    title={'Contact'}
                />}
                <ScreenBodyBlockComponent
                    getCoreInstances={this.props.getCoreInstances}
                    style={this.props.contentContainerStyle}
                >
                    <SearchBlockComponent
                        getCoreInstances={this.props.getCoreInstances}
                        containerStyle={this.coreInstances.CustomStyle.getStyle('CONVERSATIONS_LIST_SEARCH_BLOCK_STYLE')}
                        onSearchTextChanged={this.onSearchTextChanged}
                        onSearchTextCleared={this.onSearchTextCleared}
                        placeholder={this.coreInstances.Language.getText('CONVERSATIONS_LIST_SEARCH_PLACEHOLDER_TEXT')}
                    />
                    {this.renderContent()}
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    };

    onEndReached() {

    };

    onItemPress(contact, index) {
        if (this.state.showItemActions === index) {
            this.setState({ showItemActions: null });
        } else {
            this.setState({ showItemActions: index });
        }

    };
};

export default ContactComponent;