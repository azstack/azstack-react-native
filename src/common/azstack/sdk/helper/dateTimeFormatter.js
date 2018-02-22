class DateTimeFormatter {
    constructor() { };

    pad(d) {
        return (d < 10) ? '0' + d.toString() : d.toString();
    };

    currentDatetimeString(spliter) {
        let handleDate = new Date();
        let year = handleDate.getFullYear();
        let month = handleDate.getMonth() + 1;
        let day = handleDate.getDate();
        let hour = handleDate.getHours();
        let minute = handleDate.getMinutes();
        let second = handleDate.getSeconds();
        return `${year}${spliter}${month > 9 ? month : '0' + month}${spliter}${day > 9 ? day : '0' + day}${spliter}${hour > 9 ? hour : '0' + hour}${spliter}${minute > 9 ? minute : '0' + minute}${spliter}${second > 9 ? second : '0' + second}`;
    };

    toTimeString(date) {
        if (!date) {
            return '';
        }
        if (new Date(date) === 'Invalid Date' || isNaN(new Date(date))) {
            return '';
        }
        let handleDate = new Date(date);
        let hour = handleDate.getHours();
        let minute = handleDate.getMinutes();
        return `${hour > 9 ? hour : '0' + hour}:${minute > 9 ? minute : '0' + minute}`;
    };

    toDayString(date) {
        if (!date) {
            return '';
        }
        if (new Date(date) === 'Invalid Date' || isNaN(new Date(date))) {
            return '';
        }
        let handleDate = new Date(date);
        let year = handleDate.getFullYear();
        let month = handleDate.getMonth() + 1;
        let day = handleDate.getDate();
        return `${year}/${month > 9 ? month : '0' + month}/${day > 9 ? day : '0' + day}`;
    };

    formatDate(date, format) {
        if (!date) {
            return '';
        }
        if (new Date(date) === 'Invalid Date' || isNaN(new Date(date))) {
            return '';
        }

        let handleDate = new Date(date);

        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var formatedDate = format;

        formatedDate = formatedDate.replace('YYYY', handleDate.getFullYear());
        formatedDate = formatedDate.replace('YY', handleDate.getFullYear().toString().substring(3, 4));
        formatedDate = formatedDate.replace('Y', handleDate.getYear());
        formatedDate = formatedDate.replace('MM', this.pad(handleDate.getMonth() + 1));
        formatedDate = formatedDate.replace('M', handleDate.getMonth() + 1);
        formatedDate = formatedDate.replace('DD', handleDate.getDate());
        formatedDate = formatedDate.replace('D', handleDate.getDate());


        formatedDate = formatedDate.replace('HH', this.pad(handleDate.getHours()));
        formatedDate = formatedDate.replace('H', handleDate.getHours());
        formatedDate = formatedDate.replace('mm', this.pad(handleDate.getMinutes()));
        formatedDate = formatedDate.replace('m', handleDate.getMinutes());
        formatedDate = formatedDate.replace('ss', this.pad(handleDate.getSeconds()));
        formatedDate = formatedDate.replace('s', handleDate.getSeconds());

        return formatedDate;
    };
};

export default DateTimeFormatter;