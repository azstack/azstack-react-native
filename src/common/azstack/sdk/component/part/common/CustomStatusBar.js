import React from 'react';
import {
    Platform,
    StatusBar,
    View,
} from 'react-native';


const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;
const CustomStatusBar = ({backgroundColor, hidden, ...props}) => (
    <View style={[{height: hidden ? 0 : STATUSBAR_HEIGHT}, { backgroundColor }]}>
        <StatusBar translucent backgroundColor={backgroundColor} {...props} hidden={hidden} />
    </View>
);

export default CustomStatusBar;