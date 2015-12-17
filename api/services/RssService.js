/**
 * New node file
 */
var Promise = require('bluebird');

module.exports = {

    addLogFile: function (date, start, end, files, base) {
        var moment = require('moment');
        var path = require('path');
        if (date.isBetween(start, end)) {
            files.push(path.resolve(process.env.LOG_PATH, base + date.format('YYYY-MM-DD') + '.log'));
            return this.addLogFile(date.subtract(1, 'days'), start, end, files, base)
        }
        else if (start.diff(start, 'minutes') > 0) {
            return this.addLogFile(date.subtract(1, 'days'), start, end, files, base)
        }

        return files;
    },

    readLog: function (options, files, msgs) {
        var moment = require('moment');
        var path = require('path');

        if (files.length > 0) {
            var file = files.shift();

            var rl = require('readline').createInterface({
                input: require('fs').createReadStream(file)
            });

            rl.on('line', function (line) {
                line = JSON.parse(line);

                if (line.level == options.level) {
                    if (moment(line.timestamp).isBetween(options.start, options.end)) {
                        msgs.push(line.timestamp + ' ' + line.level + ' ' + line.message);
                    }
                }
            });
            return this.readLog(options, files, msgs);
        }
        else {
            return msgs;
        }
    },
    //Open log file that would contain the dates if needed open multiple. Filter all of the lines that contain the desired level.
    // Then got to the line closest to the timestamp, and get all of the lines until limit, end, or end of file.
    getLog: function (options) {
        var me = this;
        var moment = require('moment');
        return new Promise(function (resolve, reject) {
            var base = 'log_' + options.level;
            var files = [];

            var date = moment(options.end).subtract(30, 'seconds');
            files = me.addLogFile(date, options.start, options.end, files, base);

            resolve(me.readLog(options, files, []));
        });

    },
    checkPage: function (rss, type, pageNum, preCount) {
        sails.log.debug('type: ' + type + ' pageNum: ' + pageNum + ' precount: ' + preCount);
        return new Promise(function (resolve, reject) {
            var url = (type == 'Anime') ? 'http://animefreak.tv/tracker?page=' + pageNum : 'http://mangapark.me/rss/latest.xml';
            var request = require('request');
            var cheerio = require('cheerio');
            var moment = require('moment');
            var userAgent = 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.89 Safari/537.36';
            var me = this;

            request({url: url, headers: {'User-agent': userAgent}}, function (error, response, body) {
                if (error) {
                    return {success: false, msg: error};
                } else {
                    var page = cheerio(body);
                    var updated = [];
                    var re;

                    if (type != 'Anime') {
                        re = /(.*?) ch\.(\d+)/;

                        page.find('item').each(function (index, child) {
                            var item = cheerio(cheerio(child).find('title'));
                            var updateUrl = item.next('link').next().text();

                            item = item.text();
                            updateUrl = updateUrl.substr(0, updateUrl.lastIndexOf('/')).trim();

                            var match = re.exec(item);

                            if (match != null) {
                                var name = match[1];
                                name = name.replace(/vol.\d+/g, '');
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
                                r.lastChecked = new Date();
                                r.viewed = false;
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
            }, function (err, rss) {
                me.checkPage(rss, type, page, preCount).then(function (ret) {
                    resolve(ret);
                });
            });
        });
    }
};
