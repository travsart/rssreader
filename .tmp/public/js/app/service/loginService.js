rssApp.factory('loginService', function ($http) {
    var url = '/login';

    return {
        login: function (data) {
            return $http.post(url, data);
        }
    };
});