import * as enTexts from './text/en';

class Language {
    constructor(options) {
        this.codes = ['EN'];
        this.texts = {
            EN: enTexts
        };
        this.selectedCode = this.codes.indexOf(options.languageCode) > -1 ? options.languageCode : 'EN';
    };

    getText(key) {
        return this.texts[this.selectedCode][key];
    };
};

export default Language;