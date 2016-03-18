module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: false,
    autoPk: true,
    attributes: {
        name: {
            type: 'string'
        },
        url: {
            type: 'string'
        },
        status: {
            type: 'string',
            enum: ['Ongoing', 'Completed']
        },
        year: {
            type: 'integer'
        },
        genres: {
            type: 'array'
        },
        genrehash: {
            type: 'string'
        },
        summary: {
            type: 'string'
        },
        lastReleased: {
            type: 'date',
            required:false
        }
    }
};
