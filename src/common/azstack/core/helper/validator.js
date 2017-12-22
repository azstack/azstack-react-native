class Validator {

    constructor(options) {
        this.dataTypes = options.dataTypes;
    };

    isNoValue(testTarget) {
        return testTarget !== 0 && testTarget !== false && !testTarget;
    };
    isString(testTarget) {
        return typeof testTarget === 'string';
    };
    isNumber(testTarget) {
        return typeof testTarget === 'number';
    };
    isBoolean(testTarget) {
        return typeof testTarget === 'boolean';
    };
    isPhoneNumber(testTarget) {
        if (!testTarget) {
            return false;
        }
        if (typeof testTarget !== 'string') {
            return false;
        }
        return /^\+?\d+$/.test(testTarget);
    };
    isUrl(testTarget) {
        if (!testTarget) {
            return false;
        }
        if (typeof testTarget !== 'string') {
            return false;
        }
        return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(testTarget);
    };
    isArray(testTarget) {
        return Array.isArray(testTarget);
    };
    isObject(testTarget) {
        return typeof testTarget === 'object';
    };

    check(targetArray) {
        for (let i = 0; i < targetArray.length; i++) {
            let targetItem = targetArray[i];

            if (targetItem.required && this.isNoValue(targetItem.data)) {
                return `${targetItem.name} is required`;
            }

            if (this.isNoValue(targetItem.data)) {
                continue;
            }

            if (targetItem.notEqual !== undefined && targetItem.data === targetItem.notEqual) {
                return `${targetItem.name} cannot has value ${targetItem.notEqual}`;
            }

            if (targetItem.in !== undefined && targetItem.in.indexOf(targetItem.data) === -1) {
                return `${targetItem.name} must be only ${targetItem.in.join(', ')}`;
            }

            if (targetItem.notEmpty) {
                if (targetItem.dataType === this.dataTypes.DATA_TYPE_ARRAY) {
                    if (!targetItem.data.length) {
                        return `${targetItem.name} cannot be empty`;
                    }
                }
            }

            switch (targetItem.dataType) {
                case this.dataTypes.DATA_TYPE_STRING:
                    if (!this.isString(targetItem.data)) {
                        return `${targetItem.name} must be string`;
                    }
                    break;
                case this.dataTypes.DATA_TYPE_NUMBER:
                    if (!this.isNumber(targetItem.data)) {
                        return `${targetItem.name} must be number`;
                    }
                    break;
                case this.dataTypes.DATA_TYPE_BOOLEAN:
                    if (!this.isBoolean(targetItem.data)) {
                        return `${targetItem.name} must be boolean`;
                    }
                    break;
                case this.dataTypes.DATA_TYPE_PHONE_NUMBER:
                    if (!this.isPhoneNumber(targetItem.data)) {
                        return `${targetItem.name} must be phone number string`;
                    }
                    break;
                case this.dataTypes.DATA_TYPE_URL:
                    if (!this.isUrl(targetItem.data)) {
                        return `${targetItem.name} must be url`;
                    }
                    break;
                case this.dataTypes.DATA_TYPE_ARRAY:
                    if (!this.isArray(targetItem.data)) {
                        return `${targetItem.name} must be an array`;
                    }
                    break;
                case this.dataTypes.DATA_TYPE_OBJECT:
                    if (!this.isObject(targetItem.data)) {
                        return `${targetItem.name} must be an object`;
                    }
                    break;
                default:
                    return 'Unkown data type';
            }
        }
        return '';
    };
};

export default Validator;