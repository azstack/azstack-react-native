class Member {
    constructor(options) {
        this.AZStackCore = options.AZStackCore;
    };

    prepareMembers(options) {
        return new Promise((resolve, reject) => {
            let preparedMembers = [];
            if (!options.rawMembers || !Array.isArray(options.rawMembers) || options.rawMembers.length === 0) {
                return resolve(preparedMembers);
            }
            let validatedMembers = options.rawMembers.filter((member) => {
                return typeof member === 'string';
            });
            if (validatedMembers.length === 0) {
                return resolve(preparedMembers);
            }
            this.AZStackCore.getUsersInformation({
                azStackUserIds: validatedMembers
            }).then((result) => {
                preparedMembers = result.list;
                return resolve(preparedMembers);
            }).catch((error) => {
                return resolve(preparedMembers);
            });
        });
    };
};

export default Member;