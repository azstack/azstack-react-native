import { AZStackCore } from '../core/';

import Language from './language/';
import CustomStyle from './style/';

export class AZStackSdk {
    constructor(options) {

        this.Language = new Language({ languageCode: options.languageCode });
        this.CustomStyle = new CustomStyle({ themeName: options.themeName });

        this.AZStackCore = new AZStackCore(options.azstackConfig);
    };
};