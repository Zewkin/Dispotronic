angular.module('Insta').controller('FrequencyController', function ($scope, translate, Restangular, $filter, requests,
                                                                    helpers, $rootScope, localStorageService, QUALITY_PROFILES_IDS, PRICE_TYPE, $modal, $timeout, uiGridConstants, uiGridValidateService) {
    $scope.page_state = 'initial';
    $scope.page_name = translate.getTranslation('_frequency');

    $scope.customers = Restangular.all('customers').getList().$object;
    $scope.keyfigures = [];

    $scope.translate = translate;

    $scope.profiles = localStorageService.get('profiles');
    $scope.selected_keyfigure = null;
    $scope.is_new_entity = false;

    $scope.weekday_long =[];
    $scope.weekday_short =[];


    var day = new Date();
    var daynumber = day.getDay();
    var daymonth = day.getDate();

    for(var i=1;  i<=7; i++){
        day.setDate(daymonth-daynumber+i);
        $scope.weekday_long[i]= $filter('date')(day,'EEEE');
        $scope.weekday_short[i]= $filter('date')(day,'EEE');
    }

    $scope.weektype= {
        1:{type:translate.getTranslation('_frequency_alldays'),type_id:1},
        2:{type:translate.getTranslation('_frequency_particularday'),type_id:2}};
    $scope.frequency_type = {
         200701:{type:translate.getTranslation('_frequency_week'),type_id:200701},
        '200702':{type:translate.getTranslation('_frequency_month'),type_id:200702},
        '200703':{type:translate.getTranslation('_frequency_quater'),type_id:200703},
        '200704':{type:translate.getTranslation('_frequency_year'),type_id:200704}
    };


    $scope.gridFrequency = {
        columnDefs: [
            {field: 'frequency', displayName: translate.getTranslation('_frequency_value'), width: 150},
            {
                field: 'overview',
                displayName: translate.getTranslation('_frequency_overview'),
                cellTemplate:'<div class="ui-grid-cell-contents" ng-bind-html="row.entity.overview"></div>',
                show: false
            },
        ],
        rowTemplate: "<div ng-dblclick=\"grid.appScope.frequencyForm('lg',false)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>",
        enableGridMenu: true,
        enableRowSelection: true,
        enableSelectAll: false,
        enableRowHeaderSelection: false,
        multiSelect: false,
        noUnselect: true,
        modifierKeysToMultiSelect: false,
        onRegisterApi: function (gridApi) {
            $scope.gridFrequencyApi = gridApi;
            $scope.gridFrequencyApi.selection.on.rowSelectionChanged($scope,
                function (row) {
                    if (row.isSelected) {
                        $scope.frequency = angular.copy(row.entity);
                    } else {
                        $scope.selectedItem = [];
                        row.isSelected = false;
                    }
                }.bind(this)
            );
        },
        enableHorizontalScrollbar: 0,
    };


    $scope.gridCustomers = {
        data: 'customers',
        columnDefs: [
            {field: 'name', displayName: translate.getTranslation('_name')}
        ],
        noUnselect: true,
        enableRowSelection: true,
        modifierKeysToMultiSelectCells: false,
        enableSelectAll: false,
        multiSelect: false,
        enableRowHeaderSelection: false,
        onRegisterApi: function (gridApi) {
            $scope.gridCustomersApi = gridApi;

            $scope.gridCustomersApi.selection.on.rowSelectionChanged($scope,
                function (row) {
                    if (row.isSelected) {
                        $scope.frequncy = null;
                        $scope.selectedItem = row.entity;
                        $scope.customer = row.entity;
                        $scope.customer_id = row.entity['customerID'];
                        $scope.getCustomerFrequincies();
                    }
                }.bind(this)
            );
        },
        enableHorizontalScrollbar: 0,
    };

    $scope.getCustomerFrequincies = function () {
        var requestParams = {
            entity: 'customerFrequency',
            method: 'get',
            id: $scope.customer_id,
            successFn: function (response) {
                var data = [];
                angular.forEach(response.frequencies, function (val, key) {
                    var overview_type = [];
                    var meta_data2 = [];
                    if (val.type_id == 200701) {
                        var day_items_count = val.meta_data.length;

                        angular.forEach(val.meta_data, function (value, key) {
                            if (day_items_count == 1 && value.day == 0) {
                                if (val.meta_data[0]['repeats'] == 1) {
                                    overview_type.push(translate.getTranslation("_frequency_weekly"));
                                }
                                else {
                                    overview_type.push($scope.sprintf(translate.getTranslation("_frequency_weekly_repeats"), val.meta_data[0]['repeats'], val.meta_data[0]['interval']));
                                }
                            } else {
                                var str_res = (value.interval > 0)
                                    ? $scope.sprintf(translate.getTranslation("_frequency_hourly_repeats"), value.interval)
                                    : translate.getTranslation("_frequency_hourly_repeats_no_interval");

                                overview_type.push('<b>' + $scope.weekday_short[value.day] + '</b>' + ' ' + value.repeats + str_res);
                            }

                            meta_data2[value['day']] = value;

                        })
                    }
                    else if(val.type_id == 200702) {
                        meta_data2[0] = val.meta_data[0];
                        if (val.meta_data[0]['repeats'] == 1) {
                            overview_type.push(translate.getTranslation("_frequency_monthly"));
                        } else {
                            overview_type.push($scope.sprintf(translate.getTranslation("_frequency_monthly_repeats"), val.meta_data[0]['interval']));
                        }

                    }
                    else if(val.type_id == 200703) {
                        meta_data2[0] = val.meta_data[0];
                        if (val.meta_data[0]['repeats'] == 1) {
                            overview_type.push(translate.getTranslation("_frequency_quaterly"));
                        } else {
                            overview_type.push($scope.sprintf(translate.getTranslation("_frequency_quaterly_repeats"), val.meta_data[0]['interval']));
                        }

                    }
                    else if(val.type_id == 200704) {
                        meta_data2[0] = val.meta_data[0];
                        if (val.meta_data[0]['repeats'] == 1) {
                            overview_type.push(translate.getTranslation("_frequency_yearly"));
                        } else {
                            overview_type.push($scope.sprintf(translate.getTranslation("_frequency_yearly_repeats"), val.meta_data[0]['repeats'], val.meta_data[0]['interval']));
                        }

                    }


                    val['meta_data'] = meta_data2;
                    val.overview = overview_type.join(', ');
                    data[key] = val
                })
                $scope.gridFrequency.data = data;
                $scope.gridFrequencyApi.grid.refresh();
            }
        }
        requests.make(requestParams, false);
    }

    $scope.frequencyForm = function (size, isNew) {
        $scope.selected_frequency = angular.copy($scope.frequency);

        $scope.msg = false;

        if (isNew) {
            $scope.isNew = true;
            $scope.frequency = Restangular.one('customer', $scope.customer['customerID']).one('frequencies');
            $scope.frequency.meta_data = [];
        }
        else {
            $scope.isNew = false;
        }

        $scope.modalInstance = $modal.open({
            templateUrl: 'views/modalFrequencyCreate.html',
            size: size,
            scope: $scope,
        });

        $scope.modalInstance.result.finally(function () {
            if ($scope.is_new_entity) {
                $scope.frequency = null;
                $scope.selected_frequency = null;
            } else {
                $scope.frequency = $scope.selected_frequency;
            }

            $scope.is_new_entity = false;
        });
    }

    $scope.saveFrequency = function (frequency_form) {
        if (frequency_form.$valid) {


            var frequency = angular.copy($scope.frequency);

            //if(frequency.meta_data[0]['day'] == 0){
            //    console.log(frequency.meta_data.splice(0,1));
            //    frequency.meta_data = frequency.meta_data.splice(0,1);
            //    console.log(frequency);
            //}

            var method = 'create';
            var entity = 'customerFrequency';
            var id = $scope.customer_id;

            if (!$scope.isNew) {
                method = 'update';
                entity = 'customerFrequency';
                id = frequency.frequency_id;
            }

            var requestParams = {
                entity: entity,
                method: method,
                id: id,
                data: Restangular.stripRestangular(frequency),
                successFn: function (response) {
                    $scope.is_new_entity = true;
                    $scope.getCustomerFrequincies();
                    $scope.cancel();
                },
                errorFn: function (response) {
                    $scope.frequency = frequency;
                    frequency_form.submitted = true;
                    $scope.msg = translate.getTranslation('_frequency_duplicate');
                }
            }

            requests.make(requestParams, true);

        } else {
            frequency_form.submitted = true;
        }
    }

    $scope.deleteFrequency = function () {
        if ($scope.frequency && window.confirm(translate.getTranslation('_are_you_sure_to_delete_frequency?'))) {
            Restangular.one('frequencies', $scope.frequency.frequency_id).remove().then(function (response) {
                $scope.getCustomerFrequincies();
            });
            $scope.frequency = null;
        }
    }

    $scope.cancel = function () {
        $scope.modalInstance.dismiss('cancel');
    };

    $scope.Range = function (start, end) {
        var result = [];
        for (var i = start; i <= end; i++) {
            result.push(i);
        }
        return result;
    };

    $scope.rangeN = function (repeat, max) {
        var interval = [];
        interval[1] = 0;
        interval[2] = max - 1;

        for (var i = 3; i <= Math.ceil(max / 2); i++) {
            interval[i] = Math.floor(max / i);
        }

        return interval[repeat] == 0 ? $scope.Range(0, interval[repeat]) : $scope.Range(1, interval[repeat]);
    }


    $scope.sprintf = function (format) {
        for (var i = 1; i < arguments.length; i++) {
            format = format.replace(/%s/, arguments[i]);
        }
        return format;
    }

});
