module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: false,
    autoPk: true,
    attributes: {
        name: {
            type: 'string'
        },
        weight: {
            type: 'integer',
            defaultsTo: 0
        },
        combos: {
            type: 'array'
        }
    }
};
