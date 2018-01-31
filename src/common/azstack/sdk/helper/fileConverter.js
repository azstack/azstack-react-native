class FileConverter {
    constructor() { };

    sizeAsString(bytes, si) {
        var thresh = si ? 1000 : 1024;
        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }
        var units = si
            ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        var u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while (Math.abs(bytes) >= thresh && u < units.length - 1);
        return bytes.toFixed(1) + ' ' + units[u];
    };

    ajustImageSizes(file, maxSize) {
        if (!file.width || !file.height) {
            return {};
        }
        let returnSizes = {
            width: 0,
            height: 0
        };
        if (file.width > file.height) {
            if (file.width > maxSize.width) {
                returnSizes.width = maxSize.width;
                returnSizes.height = maxSize.width / file.width * file.height;
            } else {
                returnSizes.width = file.width;
                returnSizes.height = file.height;
            }
        } else {
            if (file.height > maxSize.height) {
                returnSizes.width = maxSize.height / file.height * file.width;
                returnSizes.height = maxSize.height;
            } else {
                returnSizes.width = file.width;
                returnSizes.height = file.height;
            }
        }
        return returnSizes;
    };
};

export default FileConverter;