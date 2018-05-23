import React from 'react';

class TimeoutCallComponent extends React.Component {
    constructor(props) {
        super(props);

        this.runner = null;
        this.time = 0;
    };

    componentDidMount() {
        this.runner = setInterval(() => {
            this.time += 1;
            if (this.time >= this.props.callTime) {
                this.props.callFunction();
                this.time = 0;
                clearInterval(this.runner);
                this.runner = null;
            }
        }, 1000);
    };
    componentWillUnmount() {
        clearInterval(this.runner);
    };

    render() {
        return null;
    };
};

export default TimeoutCallComponent;