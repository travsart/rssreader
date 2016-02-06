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
        raw: {
            type: 'integer'
        },
        weighted: {
            type: 'float'
        },
        score: {
            type: 'float',
            defaultsTo: 0
        },
        similar: {
            type: 'string',
            defaultsTo: 'N/A'
        },
        lastReleased: {
            type: 'date'
        },
        rss: {
            type: 'boolean',
            defaultsTo: false
        },
        rank: {
            type: 'float',
            defaultsTo: 0
        },
        user: {
            type: 'string'
        }
    }
};
