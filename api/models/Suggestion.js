module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: false,
    autoPk: true,
    attributes: {
        manga: {
            type: 'manga'
        },
        score: {
            type: 'float',
            defaultsTo: 0
        },
        similar: {
            type: 'string',
            defaultsTo: 'N/A'
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
