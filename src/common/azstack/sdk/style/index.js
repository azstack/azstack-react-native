import * as classicTheme from './classic';

class CustomStyle {
    constructor(options) {
        this.themeNames = ['classic'];
        this.themes = {
            classic: classicTheme
        };
        this.selectedTheme = this.themeNames.indexOf(options.themeName) > -1 ? options.themeName : 'classic';
    };

    getStyle(key) {
        return this.themes[this.selectedTheme][key];
    };

    getImage(key) {
        return this.themes[this.selectedTheme][key];
    };
};

export default CustomStyle;