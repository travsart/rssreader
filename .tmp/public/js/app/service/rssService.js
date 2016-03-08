rssApp.factory('rssService', function ($http) {
    var url = '/rss';

    return {
        getRss: function (user) {
            return $http.get(url + '?user=' + user);
        },
        getRssById: function (id) {
            return $http.get(url + id);
        },
        updateOrAddRss: function (data) {
            delete data.$$hashKey;
            if (data.id == null || data.id == '') {
                return $http.post(url + '/create', data);
            }
            return $http.put(url + '/update/' + data.id, data);
        },
        deleteRss: function (id) {
            return $http.delete(url + '/destroy/' + id);
        },
        runCheck: function () {
            return $http.get('/runcheck');
        },
        logout: function () {
            return $http.post('/logout');
        }
    };
});