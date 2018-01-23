import React from 'react';
import {
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
    }

    componentDidMount() {
        console.log(this.props);
    }

    componentWillUnmount() {
    }

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
    }

    renderContent() {
        if(this.state.contact.length === 0) {
            return (
                <EmptyBlockComponent
                    CustomStyle={this.props.CustomStyle}
                    emptyText={"No contact"}
                />
            );
        }

        return (
            <FlatList
                data={this.state.contact}
                keyExtractor={(item, index) => index}
                renderItem={({ item, index}) => this.renderItem(item, index)}
                onEndReached={() => this.onEndReached()}
                onEndReachedThreshold={0.2}
            />
        );
    }

    render() {
        return (
            <ScreenBlockComponent
                fullScreen={false}
                CustomStyle={this.props.CustomStyle}
                style={this.props.style}
            >
                {this.props.header !== 'hidden' && <ScreenHeaderBlockComponent
                    CustomStyle={this.props.CustomStyle}
                    onBackButtonPressed={() => this.props.onBackButtonPressed()}
                    title={'Contact'}
                />}
                <ScreenBodyBlockComponent
                    CustomStyle={this.props.CustomStyle}
                    style={this.props.contentContainerStyle}
                >
                    <View
                        style={this.props.CustomStyle.getStyle('CONVERSATIONS_LIST_SEARCH_BLOCK_STYLE')}
                    >
                        <SearchBlockComponent
                            CustomStyle={this.props.CustomStyle}
                            onSearchTextChanged={this.onSearchTextChanged}
                            onSearchTextCleared={this.onSearchTextCleared}
                            placeholder={this.props.Language.getText('CONVERSATIONS_LIST_SEARCH_PLACEHOLDER_TEXT')}
                        />
                    </View>
                    {this.renderContent()}
                </ScreenBodyBlockComponent>
            </ScreenBlockComponent>
        );
    }

    onEndReached() {

    }

    onItemPress(contact, index) {
        if(this.state.showItemActions === index) {
            this.setState({showItemActions: null});
        } else {
            this.setState({showItemActions: index});
        }
        
    }
};

export default ContactComponent;