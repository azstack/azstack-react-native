class ChatAvatar {
    constructor(options) {
        this.chatColors = options.chatColors;
    };

    getColor(options) {
        if (!options.text) {
            return this.chatColors[0];
        }
        return this.chatColors[options.text.charCodeAt(0) % this.chatColors.length];
    };
    getFirstLetters(options) {
        if (!options.text) {
            return '-';
        }
        if ([1, 2].indexOf(options.getNumber) === -1 || options.getNumber === 1) {
            return options.text[0].toUpperCase();
        }
        let textParts = options.text.split(' ');
        for (let i = textParts.length - 1; i >= 0; i--) {
            if (!textParts[i]) {
                textParts.splice(i, 1);
            }
        }
        if (textParts.length === 0) {
            return '--'.toUpperCase();
        }
        if (textParts.length === 1) {
            return (textParts[0][1] + (textParts[0].length === 1 ? '-' : textParts[0][1])).toUpperCase();
        }
        return (textParts[0][0] + textParts[1][0]).toUpperCase();
    };
};

export default ChatAvatar;