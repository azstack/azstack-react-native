import * as enTexts from './en';

class Language {
    constructor(options) {
        this.codes = ['en'];
        this.texts = {
            en: enTexts
        };
        this.selectedCode = this.codes.indexOf(options.languageCode) > -1 ? options.languageCode : 'en';
    };

    getText(key) {
        return this.texts[this.selectedCode][key];
    };
};

export default Language;