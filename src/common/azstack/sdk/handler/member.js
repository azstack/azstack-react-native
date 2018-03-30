class Member {
    constructor(options) { };

    getInitialMembers(options) {
        return new Promise((resolve, reject) => {
            resolve([]);
        });
    };
    getMoreMembers(options) {
        return new Promise((resolve, reject) => {
            resolve(false);
        });
    };
};

export default Member;