angular.module('Insta').controller('KeyFiguresController', function ($scope, translate, Restangular, $filter, requests,
                                                                     helpers, $rootScope, localStorageService, QUALITY_PROFILES_IDS, PRICE_TYPE, $modal, $timeout, uiGridConstants,uiGridValidateService) {
    $scope.page_state = 'initial';
    $scope.page_name = translate.getTranslation('_keyfigures');

    $scope.customers = Restangular.all('customers').getList().$object;
    $scope.keyfigures = [];

    $scope.QUALITY_PROFILES_IDS = QUALITY_PROFILES_IDS;
    $scope.PRICE_TYPE = PRICE_TYPE;

    $scope.translate = translate;

    $scope.profiles = localStorageService.get('profiles');
    $scope.selected_keyfigure = null;
    $scope.is_new_entity = false;

    $scope.getProfile = function (id, code) {
        console.log(''+id+' '+code+'');
        return id ? $filter('filter')($scope.profiles, {hygieneProfileID: id})[0][code] : '';
    }

    $scope.customer_id;
    $scope.customerQpTitles;

    //aconsole$scope.customerQpTitles[a]

    $scope.gridKeyfigures = {
        columnDefs: [
            {field: 'code', displayName: translate.getTranslation('_keyfigure_code')},
            {
                field: 'quality_profile_id',
                displayName: translate.getTranslation('_quality_profile'),
                cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.customerQpTitles[grid.appScope.QUALITY_PROFILES_IDS[row.entity.quality_profile_id]].join(",&nbsp\; ")}}</div>',
                show: false
            },
            {
                field: 'hygiene_profile_id',
                displayName: translate.getTranslation('_hygiene_code'),
                cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.getProfile(row.entity.hygiene_profile_id,"code")}}</div>',
                show: false
            },
            {field: 'performance_per_hour', displayName: translate.getTranslation('_keyfigure_perfomance_per_hour')},
            {
                field: 'price',
                displayName: translate.getTranslation('_keyfigure_price'),
                cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.price}}</div>'
            },
            {
                field: 'price_type_id',
                displayName: translate.getTranslation('_keyfigure_price_type'),
                cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.translate.getTranslation(grid.appScope.PRICE_TYPE[row.entity.price_type_id])}}</div>',
                show: false
            },

        ],
        rowTemplate: "<div ng-dblclick=\"grid.appScope.keyFigureForm('lg',false)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>",
        enableGridMenu: true,
        enableRowSelection: true,
        enableSelectAll: false,
        enableRowHeaderSelection: false,
        multiSelect: false,
        noUnselect: true,
        modifierKeysToMultiSelect: false,
        onRegisterApi: function (gridApi) {
            $scope.gridKeyfiguresApi = gridApi;
            $scope.gridKeyfiguresApi.selection.on.rowSelectionChanged($scope,
                function (row) {
                    if (row.isSelected) {
                        row.entity.price_type_id = row.entity.price_type_id + '';
                        row.entity.quality_profile_id = row.entity.quality_profile_id + '';
                        $scope.keyfigure = angular.copy(row.entity);
                    } else {

                        $scope.selectedItem = [];
                        row.isSelected = false;
                    }
                }.bind(this)
            );
        },
        enableHorizontalScrollbar: 0,
    };

    for(var i=1; i<=12; i++){
        $scope.gridKeyfigures.columnDefs.push({field: 'additional_price_'+i, displayName: translate.getTranslation('_keyfigure_additional_price_' + i), visible:false});
    }

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
                        $scope.keyfigure = null;
                        $scope.selectedItem = row.entity;
                        $scope.customer = row.entity;
                        $scope.customer_id = row.entity['customerID'];
                        $scope.getCustomerKeyFigures();
                    }
                }.bind(this)
            );
        },
        enableHorizontalScrollbar: 0,
    };


    uiGridValidateService.setValidator('startWith',
        function(argument) {
            return function(newValue, oldValue, rowEntity, colDef) {
                if (!newValue) {
                    return true; // We should not test for existence here
                }
                else  {
                    return !isNaN(parseInt(newValue));
                };
            };
        },
        function(argument) {
            return 'Only int or double suported "' + argument + '"';
        }
    );



    $scope.gridKeyfigurePrices = {
        showHeader: false,
        columnDefs:[{field: 'name', displayName: translate.getTranslation('_keyfigure_additional price'), cellEditableCondition:false,width:'80%'},
                    {field: 'value', displayName: translate.getTranslation('_keyfigure_additional price'), validators: {startWith: 'M'}, cellTemplate: 'ui-grid/cellTitleValidator'}
        ],
        data:'additionalPrice',
        noUnselect: true,
        enableRowSelection: false,
        modifierKeysToMultiSelectCells: false,
        enableSelectAll: false,
        multiSelect: false,
        enableRowHeaderSelection: false,
        enableHorizontalScrollbar: 0,
        enableVerticalScrollbar: 0,
    };

    $scope.getCustomerKeyFigures = function () {
        var requestParams = {
            entity: 'customerKeyFigures',
            method: 'get',
            id: $scope.customer_id,
            successFn: function (response) {
                var data = [];
                angular.forEach(response.keyFigures, function (val, key) {
                    val.price = val.price ? val.price / 100 : '';

                    for(var i=1; i<=12; i++){
                        val['additional_price_'+i] =  val['additional_price_'+i] ?val['additional_price_'+i]/100:null;
                    }
                    data[key] = val
                })
                $scope.gridKeyfigures.data = data;
                $scope.gridKeyfiguresApi.grid.refresh();
                $scope.gridCustomersApi.grid.refresh();
            }
        }
        requests.make(requestParams, false);

        var requestParams = {
            entity: 'customerQpTitles',
            method: 'get',
            id: $scope.customer_id,
            successFn: function (response) {
                $scope.customerQpTitles = response.titles;

            }
        }
        requests.make(requestParams, true);
    }

    $scope.updateQualityProfile = function (hyeugineID) {
        $scope.keyfigure.quality_profile_id = hyeugineID?$scope.getProfile(hyeugineID, 'qualityProfileID') + '':$scope.keyfigure.quality_profile_id;
    }

    $scope.keyFigureForm = function (size, isNew) {
        $scope.additionalPrice = [];
        for(var i= 1; i<=12; i++){
            var tmp = 'additional_price_'+i;
            var val = null;

            if(($scope.keyfigure != null) && $scope.keyfigure[tmp]){
                val = $scope.keyfigure[tmp];
            }
            $scope.additionalPrice.push({name: translate.getTranslation('_keyfigure_additional_price_' + i), field: 'additional_price_'+i, value: val});
        }

        $scope.selected_keyfigure = angular.copy($scope.keyfigure);

        if (isNew) {
            $scope.isNew = true;
            $scope.keyfigure = Restangular.one('customer', $scope.customer['customerID']).one('keyFigures');
        }
        else {
            $scope.isNew = false;
        }

        $scope.modalInstance = $modal.open({
            templateUrl: 'views/modalkeyFigureCreate.html',
            size:size,
            scope: $scope,
        });

        $scope.modalInstance.result.finally(function () {
            if ($scope.is_new_entity) {
                $scope.keyfigure = null;
                $scope.selected_keyfigure = null;
            } else {
                $scope.keyfigure = $scope.selected_keyfigure;
            }

            $scope.is_new_entity = false;
        });
    }

    $scope.saveKeyFigure = function (keyfigure_form) {
        if (keyfigure_form.$valid) {

            $scope.additionalPrice.forEach(function(value,index){
                if(Number(value.value))
                $scope.keyfigure[value.field] = value.value;
            })

            var keyfigure = angular.copy($scope.keyfigure);

            for(var i=1; i<=12; i++){
                keyfigure['additional_price_'+i] = keyfigure['additional_price_'+i] ? Math.round(keyfigure['additional_price_'+i]*100):null;
            }

            if (keyfigure.price) {
                keyfigure.price = Math.round(keyfigure.price * 100);
            }

            var method = 'create';
            var entity = 'customerKeyFigures';
            var id = $scope.customer_id;

            if (!$scope.isNew) {
                method = 'update';
                entity = 'keyFigures';
                id = keyfigure.key_figure_id;
            }

            var requestParams = {
                entity: entity,
                method: method,
                id: id,
                data: Restangular.stripRestangular(keyfigure),
                successFn: function (response) {
                    $scope.is_new_entity = true;
                    $scope.getCustomerKeyFigures();
                    $scope.cancel();
                },
                errorFn: function(response){
                    //$scope.keyfigure = keyfigure;
                    keyfigure_form.submitted = true;
                    keyfigure_form.code.$invalid = true;
                    keyfigure_form.code.$error.duplicate = true;
                }
            }

            requests.make(requestParams, true);

        } else {
            keyfigure_form.submitted = true;
        }
    }

    $scope.deleteKeyFigure = function () {
        if($scope.keyfigure && window.confirm(translate.getTranslation('_are_you_sure_to_delete_keyfigure?'))){
            Restangular.one('keyFigures', $scope.keyfigure.key_figure_id).remove().then(function (response) {
                $scope.getCustomerKeyFigures();
            });
            $scope.keyfigure = null;
        }
    }

    $scope.cancel = function () {
        $scope.modalInstance.dismiss('cancel');
    };


});
