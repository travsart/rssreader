module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: false,
    autoPk: true,
    attributes: {
        manga: {
            model: 'manga'
        },
        similarCosine: {
            type: 'array'
        },
        similarWeight: {
            type: 'array'
        }
    }
};
