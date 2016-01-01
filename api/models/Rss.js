/**
 * Rss.js
 *
 * @description :: TODO: You might write a short summary of how this model works
 *              and what it represents here.
 * @docs :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: false,
    autoPk: true,
    attributes: {
        name: {
            type: 'string'
        },
        updateUrl: {
            type: 'string'
        },
        start: {
            type: 'float',
            defaultsTo: '1'
        },
        lastChecked: {
            type: 'datetime',
            defaultsTo: function () {
                return new Date();
            }
        },
        type: {
            type: 'string',
            enum: ['Anime', 'Manga'],
            defaultsTo: 'Manga'
        },
        check: {
            type: 'boolean',
            defaultsTo: false
        },
        viewed: {
            type: 'boolean',
            defaultsTo: false
        },
        user: {
            type: 'string'
        }
    }
};
