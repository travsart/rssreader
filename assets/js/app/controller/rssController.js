rssApp
    .controller(
        'rssController',
        function ($scope, $http, dialogs, toaster, rssService, userService, uiGridConstants) {
            $scope.rssData = [];
            $scope.appName = "Rss Reader";
            $scope.lang = 'en-US';
            $scope.language = 'English';
            $scope.username = document.getElementById("username").value;

            if($scope.username == ''){
                $scope.login();
            }
            $scope.linkTemplate = '<a href ="{{COL_FIELD}}">{{COL_FIELD.trim().length == 0  ? COL_FIELD : "Link"}}</a>';

            $scope.highlightFilteredHeader = function (row, rowRenderIndex, col, colRenderIndex) {
                if (col.filters[0].term) {
                    return 'header-filtered';
                } else {
                    return '';
                }
            };

            $scope.gridOptions = {
                enableFiltering: true,
                enableColumnResizing: true,
                enableGridMenu: true,
                columnDefs: [
                    {
                        name: 'name',
                        displayName: 'Name',
                        headerCellClass: $scope.highlightFilteredHeader
                    },
                    {
                        name: 'start',
                        displayName: 'Ch/Ep',
                        width: 95,
                        type: 'number'
                    }, {
                        name: 'rank',
                        displayName: 'Rank',
                        type: 'number',
                        width: 95
                    }, {
                        name: 'description',
                        displayName: 'Description'
                    },
                    {
                        name: 'updatedAt',
                        displayName: 'Last Updated',
                        type: 'date',
                        cellFilter: 'date:"MM-dd-yyyy HH:mm"',
                        width: '140'
                    },
                    {
                        name: 'updateUrl',
                        displayName: 'Updated Url',
                        cellTemplate: $scope.linkTemplate,
                        sort: {
                            direction: uiGridConstants.ASC,
                            priority: 1
                        },
                        width: 100
                    },
                    {
                        name: 'type',
                        displayName: 'Type',
                        editableCellTemplate: 'ui-grid/dropdownEditor',
                        cellFilter: 'mapType',
                        editDropdownValueLabel: 'type',
                        editDropdownOptionsArray: [{
                            id: 'Manga',
                            type: 'Manga'
                        }, {
                            id: 'Anime',
                            type: 'Anime'
                        }],
                        width: '80',
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: [{value: 'Manga', label: 'Manga'}, {value: 'Anime', label: 'Anime'}],
                        headerCellClass: $scope.highlightFilteredHeader
                    },
                    {
                        name: 'check',
                        displayName: 'Check',
                        width: '90',
                        enableCellEdit: false,
                        cellTemplate: '<div class="col-sm-2 text-center"><button type="button" class="btn btn-primary btn-xs" ng-click="grid.appScope.checkManga(grid, row)">{{COL_FIELD  ? "Uncheck" : "Check"}}</button></div>'

                    },
                    {
                        name: 'Delete',
                        enableCellEdit: false,
                        cellTemplate: '<div class="glyphicon glyphicon-remove" ng-click="grid.appScope.removeRow(grid, row)" style="display:block;text-align:center"></div>'
                    }],
                data: 'rssData'
            };

            $scope.msg = {};

            $scope.checkManga = function (grid, row) {
                var obj = row.entity;

                if (obj.check == false) {
                    obj.updateUrl = '';
                    obj.check = true;
                }
                else {
                    obj.check = false;
                }

                var index = $scope
                    .findIndex(obj.$$hashKey);

                rssService
                    .updateOrAddRss(obj)
                    .then(
                        function (data) {
                            toaster
                                .pop(
                                    'success',
                                    "Success",
                                    "Successfully changed a record.");
                            $scope.rssData[index]['id'] = data.data.id;
                        },
                        function (error) {
                            toaster
                                .pop({
                                    type: 'error',
                                    title: 'Error',
                                    body: 'Error occured: '
                                    + error
                                });
                        });
            };

            $scope.gridOptions.onRegisterApi = function (gridApi) {

                $scope.gridApi = gridApi;
                gridApi.edit.on
                    .afterCellEdit(
                        $scope,
                        function (rowEntity, colDef, newValue,
                                  oldValue) {
                            var index = $scope
                                .findIndex(rowEntity.$$hashKey);

                            rowEntity.updateUrl = rowEntity.updateUrl.trim();
                            rssService
                                .updateOrAddRss(rowEntity)
                                .then(
                                    function (data) {
                                        toaster
                                            .pop(
                                                'success',
                                                "Success",
                                                "Successfully added/changed a record.");
                                        $scope.rssData[index]['id'] = data.data.id;
                                    },
                                    function (error) {
                                        toaster
                                            .pop({
                                                type: 'error',
                                                title: 'Error',
                                                body: 'Error occured: '
                                                + error
                                            });
                                    });
                            $scope.$apply();
                        });
            };

            rssService.getRss($scope.username).then(function (data) {
                $scope.rssData = data.data;
            }, function (error) {
                toaster.pop({
                    type: 'error',
                    title: 'Error',
                    body: 'Error occured: ' + error
                });
            });

            $scope.addData = function () {
                $scope.rssData.unshift({
                    name: "Name",
                    updateUrl: ' ',
                    start: 1,
                    lastChecked: new Date(),
                    type: 'Manga',
                    check: true,
                    viewed: true,
                    user: $scope.username
                });
            };

            $scope.findIndex = function (hash) {
                var rowIndex = -1;
                var data = $scope.rssData; // original rows of data
                for (var ndx = 0; ndx < data.length; ndx++) {
                    if (data[ndx].$$hashKey == hash) {
                        rowIndex = ndx;
                        break;
                    }
                }
                return rowIndex;
            };

            $scope.removeRow = function (grid, row) {
                var index = $scope.findIndex(row.entity.$$hashKey);
                dlg = dialogs.confirm('Confirm Delete',
                    'Are you sure you want to delete this record?');
                dlg.result
                    .then(function (btn) {
                        rssService
                            .deleteRss($scope.rssData[index].id)
                            .then(
                                function () {
                                    $scope.rssData.splice(
                                        index, 1);
                                    toaster
                                        .pop(
                                            'success',
                                            "Success",
                                            "Successfully deleted the row.");
                                },
                                function (error) {
                                    toaster
                                        .pop({
                                            type: 'error',
                                            title: 'Error',
                                            body: 'Error occured: '
                                            + error
                                        });
                                });
                    });

            };

            $scope.setViewed = function (grid, row) {
                var index = $scope.findIndex(row.entity.$$hashKey);
                var rowEntity = $scope.rssData[index];
                rowEntity.view = true;
                rssService.updateOrAddRss(rowEntity)
            };

            $scope.runCheck = function () {
                rssService.runCheck().then(function (data) {
                    data = data.data;
                    if (data.success) {
                        toaster.pop({
                            type: 'success',
                            title: 'Success',
                            body: data.msg
                        });
                    }
                    else {
                        toaster.pop({
                            type: 'success',
                            title: 'Success',
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
            }

            $scope.refreshList = function () {
                rssService.getRss($scope.username).then(function (data) {
                    $scope.rssData = data.data;
                }, function (error) {
                    toaster.pop({
                        type: 'error',
                        title: 'Error',
                        body: 'Error occured: ' + error
                    });
                });
            }

            $scope.logout = function () {
                rssService.logout().then(function () {
                    window.location = '/login';
                });
            };
            $scope.login = function () {
                window.location = '/login';
            };

        }).filter('mapType', function () {
    var typeHash = {
        'Manga': 'Manga',
        'Anime': 'Anime'
    };

    return function (input) {
        if (!input) {
            return '';
        } else {
            return typeHash[input];
        }
    };
}).config(
    ['dialogsProvider', '$translateProvider',
        function (dialogsProvider, $translateProvider) {
            dialogsProvider.useBackdrop('static');
            dialogsProvider.useEscClose(false);
            dialogsProvider.useCopy(false);
            dialogsProvider.setSize('sm');

            $translateProvider.preferredLanguage('en-US');
        }]);