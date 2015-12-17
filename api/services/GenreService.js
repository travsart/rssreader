/**
 * New node file
 */
var Promise = require('bluebird');

module.exports = {
    generateManga: function (mangaList, page, end, cb) {
        var url = 'http://mangapark.me/search?orderby=latest&st-ss=1&page=' + page;
        var request = require('request');
        var cheerio = require('cheerio');
        var userAgent = 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.89 Safari/537.36';
        var me = this;
        sails.log.info('page :' + page + ' end: ' + end );

        request({url: url, headers: {'User-agent': userAgent}}, function (error, response, body) {
            var chBody = cheerio(body);

            if (chBody.find('.no-match').length != 0 || page != end) {
               // sails.log.info(chBody.find('.no-match'));
                sails.log.info(chBody.find('.no-match').length);
                sails.log.info(typeof chBody.find('.no-match').length);
                cb(mangaList);
            }

            var manga = {name: '', url: '', summary: '', genres: [], year: -1, status: 'Ongoing'};
            chBody.find('.manga-list').find('.item').each(function (index, child) {
                manga = {name: '', url: '', summary: '', genres: [], year: -1, status: 'Ongoing'};
                cheerio(child).find('td').each(function (index1, child1) {
                    if (child1.children.length == 3) {
                        manga.url = 'http://mangapark.me/' + child1.children[1].attribs.href;
                        manga.name = child1.children[1].attribs.title;
                    }
                    else {
                        cheerio(child1).find('.info').each(function (index2, child2) {
                            if (child2.children.length == 7) {
                                var info1 = child2.children[3].children;
                                var info2 = child2.children[5].children;

                                for (var i = 0; i < info1.length; i++) {
                                    if (info1[i].children != null && info1[i].children.length > 0 && info1[i].children[0].data == 'Status:') {
                                        manga.status = info1[i + 1].children[0].data;
                                        manga.year = parseInt(info1[i + 4].children[0].data);

                                        break;
                                    }
                                }
                                var found = false;
                                for (var i = 0; i < info2.length; i++) {
                                    if (found && info2[i].children != null && info2[i].children.length > 0) {
                                        manga.genres.push(info2[i].children[0].data)
                                    }
                                    else if (info2[i].children != null && info2[i].children.length > 0 && info2[i].children[0].data == 'Genres:') {
                                        found = true;
                                    }
                                }
                            }
                            else if (child2.children.length == 5) {
                                var info1 = child2.children[1].children;
                                var info2 = child2.children[3].children;

                                for (var i = 0; i < info1.length; i++) {
                                    if (info1[i].children != null && info1[i].children.length > 0 && info1[i].children[0].data == 'Status:') {
                                        manga.status = info1[i + 1].children[0].data;
                                        manga.year = parseInt(info1[i + 4].children[0].data);
                                        break;
                                    }
                                }
                                var found = false;
                                for (var i = 0; i < info2.length; i++) {
                                    if (found && info2[i].children != null && info2[i].children.length > 0) {
                                        manga.genres.push(info2[i].children[0].data)
                                    }
                                    else if (info2[i].children != null && info2[i].children.length > 0 && info2[i].children[0].data == 'Genres:') {
                                        found = true;
                                    }
                                }
                            }
                            else {
                                manga.summary = cheerio(child2.children[3]).text();
                            }
                        });
                    }
                });

                if (manga.length != 0) {
                    if (isNaN(manga.year)) {
                        manga.year = 0;
                    }
                    mangaList.push(manga);
                }
            });

            sails.log.info('Finished page :' + page);
            if (mangaList.length > 1000) {
                Genre.create(mangaList).exec(function (err) {
                    if (err) {
                        sails.log.error('Error: ' + JSON.stringify(err));

                        for (var g = 0; g < mangaList.length; g++) {
                            var a = mangaList[g];
                            sails.log.error('name ' + typeof a.name);
                            sails.log.error('url ' + typeof a.url);
                            sails.log.error('year ' + a.year + ' ' + typeof a.year);
                            sails.log.error('summary ' + typeof a.summary);
                            sails.log.error('status ' + a.status + ' ' + typeof a.status);
                            sails.log.error('genres ' + typeof a.genres);
                        }

                        cb({error: true, msg: err.stack});
                    }
                    else {
                        sails.log.info('Created :' + mangaList.length);
                        me.generateManga([], page + 1, end, cb);
                    }
                });
            } else {
                me.generateManga(mangaList, page + 1, end, cb);
            }
        });
    },
    generate: function (page, end) {
        var me = this;
        sails.log.info('generate ' + page + ' ' + end);
        return new Promise(function (resolve, reject) {

            me.generateManga([], 0, end, function (mangaList) {
                if (mangaList.error) {
                    reject(mangaList);
                }

                sails.log.info('generate finished managList: ' + mangaList.length);
                if (mangaList.length > 0) {
                    Genre.create(mangaList).exec(function (err) {
                        if (err) {
                            sails.log.error('Error: ' + err.stack)
                            reject({error: true, msg: err.stack});
                        }
                        sails.log.info('Created :' + mangaList.length);
                    });
                }
                resolve();
            });
        });
    }
}
