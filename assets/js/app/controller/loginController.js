rssApp
    .controller(
        'loginController',
        function ($scope, $http, dialogs, loginService, toaster) {
            $scope.appName = "Rss Reader";
            $scope.lang = 'en-US';
            $scope.language = 'English';

            $scope.loginUser = function (user) {
                loginService.login(user).then(function (data) {
                    console.log(data);
                    data = data.data;
                    if (data.success) {
                        toaster.pop({
                            type: 'success',
                            title: 'Success',
                            body: data.msg
                        });
                        $scope.USERNAME = user.username;
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