import React from 'react';
import {
    Text
} from 'react-native';

class TimeFromNowBlockComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTime: new Date().getTime()
        };
        this.intervalGetCurrentTime = null;

        this.calculateFromNow = this.calculateFromNow.bind(this);
    };

    calculateFromNow() {
        let timeDiff = 0;
        let mode = 'past';
        let fromNowText = '';
        if (this.props.time > this.state.currentTime) {
            mode = 'future';
            timeDiff = Math.round((this.props.time - this.state.currentTime) / 1000);
        } else {
            mode = 'past';
            timeDiff = Math.round((this.state.currentTime - this.props.time) / 1000);
        }
        if (mode === 'future') {
            fromNowText += ` ${this.props.Language.getText('FROM_NOW_FUTURE_TEXT')}`;
        }
        if (timeDiff < 60) {
            fromNowText += ` ${timeDiff}`;
            if (timeDiff > 1) {
                fromNowText += ` ${this.props.Language.getText('FROM_NOW_SECOND_MANY_TEXT')}`;
            } else {
                fromNowText += ` ${this.props.Language.getText('FROM_NOW_SECOND_TEXT')}`;
            }
        } else if (timeDiff < 60 * 60) {
            let minute = Math.round(timeDiff / 60);
            fromNowText += ` ${minute}`;
            if (minute > 1) {
                fromNowText += ` ${this.props.Language.getText('FROM_NOW_MINUTE_MANY_TEXT')}`;
            } else {
                fromNowText += ` ${this.props.Language.getText('FROM_NOW_MINUTE_TEXT')}`;
            }
        } else if (timeDiff < 60 * 60 * 24) {
            let hour = Math.round(timeDiff / 60 / 60);
            fromNowText += ` ${hour}`;
            if (hour > 1) {
                fromNowText += ` ${this.props.Language.getText('FROM_NOW_HOUR_MANY_TEXT')}`;
            } else {
                fromNowText += ` ${this.props.Language.getText('FROM_NOW_HOUR_TEXT')}`;
            }
        } else if (timeDiff < 60 * 60 * 24 * 30) {
            let day = Math.round(timeDiff / 60 / 60 / 24);
            fromNowText += ` ${day}`;
            if (day > 1) {
                fromNowText += ` ${this.props.Language.getText('FROM_NOW_DAY_MANY_TEXT')}`;
            } else {
                fromNowText += ` ${this.props.Language.getText('FROM_NOW_DAY_TEXT')}`;
            }
        } else if (timeDiff < 60 * 60 * 24 * 30 * 12) {
            let month = Math.round(timeDiff / 60 / 60 / 24 / 30);
            fromNowText += ` ${month}`;
            if (month > 1) {
                fromNowText += ` ${this.props.Language.getText('FROM_NOW_MONTH_MANY_TEXT')}`;
            } else {
                fromNowText += ` ${this.props.Language.getText('FROM_NOW_MONTH_TEXT')}`;
            }
        } else {
            let year = Math.round(timeDiff / 60 / 60 / 24 / 30 / 12);
            fromNowText += ` ${year}`;
            if (year > 1) {
                fromNowText += ` ${this.props.Language.getText('FROM_NOW_YEAR_MANY_TEXT')}`;
            } else {
                fromNowText += ` ${this.props.Language.getText('FROM_NOW_YEAR_TEXT')}`;
            }
        }
        if (mode === 'past') {
            fromNowText += ` ${this.props.Language.getText('FROM_NOW_PAST_TEXT')}`;
        }
        return fromNowText;
    };

    componentDidMount() {
        this.intervalGetCurrentTime = setInterval(() => {
            this.setState({
                currentTime: new Date().getTime()
            });
        }, 1000);
    };
    componentWillUnmount() {
        clearInterval(this.intervalGetCurrentTime);
    }

    render() {
        return (
            <Text
                style={[
                    this.props.CustomStyle.getStyle('FROM_NOW_TIME_TEXT_STYLE'),
                    (this.props.textStyle ? this.props.textStyle : {})
                ]}
            >
                {this.calculateFromNow()}
            </Text>
        );
    };
};

export default TimeFromNowBlockComponent;