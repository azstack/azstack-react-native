class Sticker {
    constructor(options) {
        this.logLevelConstants = options.logLevelConstants;
        this.serviceTypes = options.serviceTypes;
        this.errorCodes = options.errorCodes;
        this.listConstants = options.listConstants;
        this.stickerConstants = options.stickerConstants;
        this.Logger = options.Logger;
        this.sendPacketFunction = options.sendPacketFunction;
    };

    sendGetStickersList(options, callback) {

        return new Promise((resolve, reject) => {

            const getStickersListPacket = {
                service: this.serviceTypes.STICKER_GET_LIST,
                body: JSON.stringify({
                    default: options.isDefault ? this.stickerConstants.STICKER_TYPE_DEFAULT : this.stickerConstants.STICKER_TYPE_NOT_DEFAULT
                })
            };
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Send get stickers list packet'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Get stickers list packet',
                payload: getStickersListPacket
            });
            this.sendPacketFunction(getStickersListPacket).then(() => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                    message: 'Send get stickers list packet successfully'
                });
                resolve();
            }).catch((error) => {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot send get stickers list data, get stickers list fail'
                });
                reject({
                    code: error.code,
                    message: 'Cannot send get stickers list data, get stickers list fail'
                });
            });
        });
    };
    receiveStickersList(body) {
        return new Promise((resolve, reject) => {
            if (!body) {
                this.Logger.log(this.logLevelConstants.LOG_LEVEL_ERROR, {
                    message: 'Cannot detect stickers list, ignored'
                });
                reject({
                    code: this.errorCodes.ERR_UNEXPECTED_RECEIVED_DATA,
                    message: 'Cannot detect stickers list, get stickers fail'
                });
                return;
            }

            this.Logger.log(this.logLevelConstants.LOG_LEVEL_INFO, {
                message: 'Got stickers list'
            });
            this.Logger.log(this.logLevelConstants.LOG_LEVEL_DEBUG, {
                message: 'Stickers list data',
                payload: body
            });

            resolve({
                done: this.listConstants.GET_LIST_DONE,
                list: body.packets.map((packet) => {
                    let catId = 0;
                    switch (packet.id) {
                        case this.stickerConstants.STICKER_DEFAULT_CATID_2_FAKE:
                            catId = this.stickerConstants.STICKER_DEFAULT_CATID_2_ORIGINAL;
                            break;
                        case this.stickerConstants.STICKER_DEFAULT_CATID_3_FAKE:
                            catId = this.stickerConstants.STICKER_DEFAULT_CATID_3_ORIGINAL;
                            break;
                        case this.stickerConstants.STICKER_DEFAULT_CATID_4_FAKE:
                            catId = this.stickerConstants.STICKER_DEFAULT_CATID_4_ORIGINAL;
                            break;
                        case this.stickerConstants.STICKER_DEFAULT_CATID_5_FAKE:
                            catId = this.stickerConstants.STICKER_DEFAULT_CATID_5_ORIGINAL;
                            break;
                        default:
                            catId = packet.id;
                            break;
                    }
                    return {
                        catId: catId,
                        name: packet.name,
                        urls: {
                            fullCover: packet.full_cover,
                            miniCover: packet.mini_cover,
                            download: packet.url
                        }
                    }
                })
            });
        });
    };
};

export default Sticker;