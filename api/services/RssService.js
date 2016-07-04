/**
 * New node file
 */
var Promise = require('bluebird');

module.exports = {
    checkPage: function (rss, type, pageNum, preCount) {
        sails.log.debug('type: ' + type + ' pageNum: ' + pageNum + ' precount: ' + preCount);
        return new Promise(function (resolve, reject) {
            var url = (type == 'Anime') ? 'http://animefreak.tv/tracker?page=' + pageNum : 'http://mangapark.me/rss/latest.xml';
            var request = require('request');
            var cheerio = require('cheerio');
            var moment = require('moment');
            var userAgent = require('random-useragent').getRandom();
            var me = this;

            request({url: url, headers: {'User-agent': userAgent}}, function (error, response, body) {
                if (error) {
                    return {success: false, msg: error};
                } else {
                    var page = cheerio(body);
                    var updated = [];
                    var re;

                    if (type != 'Anime') {
                        re = /(.*) ch\.(\d+\.\d+|\d+)/;

                        page.find('item').each(function (index, child) {
                            var item = cheerio(cheerio(child).find('title'));
                            var updateUrl = item.next('link').next().text();

                            item = item.text();
                            updateUrl = updateUrl.substr(0, updateUrl.lastIndexOf('/')).trim();

                            var match = re.exec(item);

                            if (match != null) {
                                var name = match[1];
                                name = name.replace(/vol.\d+/g, '');
                                name = name.replace(/vol.TBD /g, '');
                                name = name.replace(/\(.*\)/g, '').trim();
                                var newStart = match[2].trim();

                                if (updated[name] == null) {
                                    updated[name] = {start: [newStart], updateUrl: [updateUrl]};
                                }
                                else {
                                    updated[name]['start'].push(newStart);
                                    updated[name]['updateUrl'].push(updateUrl);
                                }

                            }
                        });
                    } else {
                        re = /(.*?) Episode (\d+)/;

                        var anime = page.find('tbody')[0];
                        cheerio(anime).find('td').each(function (index, child) {
                            var item = cheerio(child).find('a');
                            var match = re.exec(item.text());

                            if (match != null) {
                                var name = match[1].trim();
                                var newStart = match[2].trim();
                                var updateUrl = 'http://animefreak.tv' + item.attr('href');

                                if (updated[name] == null) {
                                    updated[name] = {start: [newStart], updateUrl: [updateUrl]};
                                }
                                else {
                                    updated[name]['start'].push(newStart);
                                    updated[name]['updateUrl'].push(updateUrl);
                                }
                            }
                        });
                    }
                    var count = 0;
                    var updatedRss = [];

                    rss.forEach(function (r) {
                        if (updated[r.name] != null) {
                            var newItem = updated[r.name];
                            var index = -1;
                            for (var i = 0; i < newItem['start'].length; i++) {
                                if (r.start < newItem['start'][i]) {
                                    index = i;
                                }
                            }
                            if (index != -1) {
                                r.start = newItem['start'][index];
                                r.updateUrl = newItem['updateUrl'][index];
                                r.check = false;
                                r.save();
                                updatedRss.push(r);

                                count++;
                            }
                        }
                    });
                    sails.log.info(updatedRss);
                    sails.log.debug('type: ' + type + ' page: ' + pageNum + ' precount: ' + (count + preCount));
                    if (pageNum != 0) {
                        me.checkPage(rss, 'Anime', pageNum - 1, count + preCount);
                    }
                    else {
                        resolve({
                            success: true,
                            msg: 'Successfully updated count: ' + (preCount + count) + ' ' + type
                        });
                    }
                }
            });
        });
    },
    checkSite: function (type, page, preCount) {
        sails.log.debug('type: ' + type + ' page: ' + page);

        var me = this;
        return new Promise(function (resolve, reject) {
            Rss.find({
                check: true,
                type: type
            }).then(function (rss) {
                me.checkPage(rss, type, page, preCount).then(function (ret) {
                    resolve(ret);
                });
            }).catch(function (err) {
                reject({success: false, msg: '', err: err});
            });
        });
    },
    seed: function (items) {
        return new Promise(function (resolve, reject) {
            Rss.create(items, function (err) {
                resolve(err);
            });
        });
    },
    checkIp: function () {
        var me = this;
        return new Promise(function (resolve, reject) {
            return me.getIp(['http://geoip.hmageo.com/ip/', 'icanhazip.com', 'ipecho.net/plain'], function (ip) {
                resolve(ip);
            });
        });
    },
    getIp: function (urls, cb) {
        var me = this;
        var request = require('request');
        if (urls.length == 0) {
            cb();
        }
        else {
            request({
                url: urls.shift(),
                headers: {'User-agent': require('random-useragent').getRandom()}
            }, function (error, response, body) {
                if (body == null || body == '') {
                    me.getIp(urls, cb);
                }
                else {
                    cb(body);
                }
            });
        }

    },
    updateRssFromManga: function (rsses, cb) {
        var me = this;
        if (rsses.length == 0) {
            cb();
        }
        else {
            var rss = rsses.shift();
            Manga.find({
                name: rss.name,
            }).exec(function (err, manga) {
                if (err) {
                    sails.log.error(err);
                    me.updateRssFromManga(rsses, cb);
                }

                chs = manga.latestChapters;
                chs.sort(function (a, b) {
                    return a.ch - b.ch;
                });

                var i = 0;
                while (i < chs.length) {
                    var ch = chs[i];
                    if (rss.check == true && ch.ch > rss.start) {
                        rss.check = false;
                        rss.start = ch.ch;
                        rss.updateUrl = 'http://mangapark.me/' + ch.url;
                        r.save();
                        break;
                    }
                    else if (rss.check == false && ch.ch == rss.start) {
                        rss.start = ch.ch;
                        rss.updateUrl = 'http://mangapark.me/' + ch.url;
                        r.save();
                        break;
                    }
                }
                me.updateRssFromManga(rsses, cb);
            });
        }
    },
    updateAllRss: function () {
        var me = this;

        return new Promise(function (resolve, reject) {
            return Rss.find({
                updateUrl: '',
                type: 'Manga'
            }).then(function (rsses) {
                me.updateRssFromManga(rsses, function () {
                    resolve();
                });
            }).catch(function (err) {
                reject({success: false, msg: '', err: err});
            });
        });
    }
};