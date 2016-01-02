rssApp
    .controller(
        'loginController',
        function ($scope, $http, dialogs, loginService, userService, toaster) {
            $scope.appName = "Rss Reader";
            $scope.lang = 'en-US';
            $scope.language = 'English';

            $scope.loginUser = function (user) {
                loginService.login(user).then(function (data) {
                    data = data.data;
                    if (data.success == true) {
                        toaster.pop({
                            type: 'success',
                            title: 'Success',
                            body: data.msg
                        });
                        userService.setUser(user.username);
                        scope.$apply(function() { $location.path("/"); });
                    }
                    else {
                        toaster.pop({
                            type: 'error',
                            title: 'Error',
                            body: 'Error occured: ' + data.msg
                        });
                    }
                }, function (error) {
                    toaster.pop({
                        type: 'error',
                        title: 'Error',
                        body: 'Error occured: ' + error
                    });
                });
            };
        });