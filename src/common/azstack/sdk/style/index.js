import { StyleSheet } from 'react-native';

import * as classicTheme from './theme/classic';

class CustomStyle {
    constructor(options) {
        this.themeNames = ['classic'];
        this.themes = {
            classic: classicTheme
        };
        this.selectedTheme = this.themeNames.indexOf(options.themeName) > -1 ? options.themeName : 'classic';
    };

    getStyle(key) {
        return StyleSheet.create({
            style: this.themes[this.selectedTheme][key]
        }).style;
    };
};

export default CustomStyle;