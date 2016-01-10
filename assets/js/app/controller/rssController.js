rssApp
    .controller(
        'rssController',
        function ($scope, $http, dialogs, toaster, rssService, userService, uiGridConstants) {
            $scope.rssData = [];
            $scope.appName = "Rss Reader";
            $scope.lang = 'en-US';
            $scope.language = 'English';
            $scope.username = document.getElementById("username").value;

            $scope.linkTemplate = '<a href ="{{COL_FIELD}}">{{COL_FIELD.length == 0  ? COL_FIELD : "Link"}}</a>';

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
                        displayName: 'Chapter/Episode',
                    }, {
                        name: 'rank',
                        displayName: 'Rank',
                        type: 'number'
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
                        }
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
                        width: '75',
                        type: 'boolean'
                    },
                    {
                        name: 'viewed',
                        displayName: 'Viewed',
                        width: '75',
                        type: 'boolean'
                    }, {
                        name: 'description',
                        displayName: 'Description',
                        width: '150',
                        type: 'number'
                    },
                    {
                        name: 'Delete',
                        enableCellEdit: false,
                        width: '65',
                        cellTemplate: '<div class="glyphicon glyphicon-remove" ng-click="grid.appScope.removeRow(grid, row)"></div>'
                    }],
                data: 'rssData'
            };

            $scope.msg = {};

            $scope.gridOptions.onRegisterApi = function (gridApi) {

                $scope.gridApi = gridApi;
                gridApi.edit.on
                    .afterCellEdit(
                        $scope,
                        function (rowEntity, colDef, newValue,
                                  oldValue) {
                            var index = $scope
                                .findIndex(rowEntity.$$hashKey);
                            if (colDef.name == 'viewed') {
                                if (rowEntity.viewed == true) {
                                    rowEntity.updateUrl = '';
                                    rowEntity.check = true;
                                }
                            }
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