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
        authors: {
            type: 'array'
        },
        artists: {
            type: 'array'
        },
        genres: {
            type: 'array'
        },
        authorshash: {
            type: 'string'
        },
        artistshash: {
            type: 'string'
        },
        genreshash: {
            type: 'string'
        },
        summary: {
            type: 'string'
        },
        type: {
            type: 'string'
        }
    }
};
