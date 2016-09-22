angular.module('Insta').controller('DamageAssessmentController', function ($scope, translate, Restangular, $filter, requests,
                                                                           helpers, $rootScope, localStorageService, QUALITY_PROFILES_IDS, PRICE_TYPE, $modal, $timeout, uiGridConstants, uiGridValidateService) {
    $scope.page_state = 'initial';
    $scope.page_name = translate.getTranslation('_damage_assessment');

    $scope.customers = Restangular.all('customers').getList().$object;
    $scope.objects = [];

    $scope.translate = translate;

    $scope.profiles = localStorageService.get('profiles');
    $scope.selected_objects = null;
    $scope.is_new_entity = false;


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
                        $scope.object = null;
                        $scope.selectedItem = row.entity;
                        $scope.customer = row.entity;
                        $scope.customer_id = row.entity['customerID'];
                        $scope.getCustomerObjects();
                    }
                }.bind(this)
            );
        },
        enableHorizontalScrollbar: 0,
    };


    $scope.gridObjects = {
        columnDefs: [
            {field: 'group_name', displayName: translate.getTranslation('_object_group_name'), width: '45%'},
            {field: 'description', displayName: translate.getTranslation('_object_group_description')},
        ],
        enableGridMenu: false,
        enableRowSelection: true,
        enableSelectAll: false,
        enableRowHeaderSelection: false,
        multiSelect: false,
        noUnselect: true,
        rowTemplate: "<div ng-dblclick=\"grid.appScope.objectForm('lg',false)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>",
        modifierKeysToMultiSelect: false,
        onRegisterApi: function (gridApi) {
            $scope.gridObjectsApi = gridApi;
            $scope.gridObjectsApi.selection.on.rowSelectionChanged($scope,
                function (row) {
                    if (row.isSelected) {
                        $scope.object = angular.copy(row.entity);
                        $scope.getObjectsTasks(row.entity['object_group_id']);

                    } else {
                        // $scope.selectedItem = [];
                        row.isSelected = false;
                    }
                }.bind(this)
            );
        },
        enableHorizontalScrollbar: 0,
    };


    $scope.gridObjectsTasks = {
        columnDefs: [
            {field: 'task_name', displayName: translate.getTranslation('_object_task_name'), width: '45%'},
            {
                field: 'description', displayName: translate.getTranslation('_object_task_description'),
                cellTemplate: '<div class="ngCellText"><div ng-bind-html="row.entity.description"></div>'
            },

        ],
        enableRowSelection: true,
        enableSelectAll: false,
        enableRowHeaderSelection: false,
        multiSelect: false,
        noUnselect: true,
        modifierKeysToMultiSelect: false,
        showTreeExpandNoChildren: true,
        rowTemplate: "<div ng-dblclick=\"grid.appScope.taskForm('lg',false)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>",
        onRegisterApi: function (gridApi) {
            $scope.gridObjectsTasksApi = gridApi;
            $scope.gridObjectsTasksApi.selection.on.rowSelectionChanged($scope,
                function (row) {
                    if (row.isSelected) {
                        $scope.task = angular.copy(row.entity);
                    } else {
                        //$scope.selectedItem = [];
                        row.isSelected = false;
                    }
                }.bind(this)
            );
        },
        enableHorizontalScrollbar: 0,
    };


    $scope.getCustomerObjects = function () {
        var requestParams = {
            entity: 'customerObjectGroups',
            method: 'get',
            id: $scope.customer_id,
            successFn: function (response) {
                var data = response['objects_groups'];
                $scope.gridObjects.data = data;
            }
        }
        requests.make(requestParams, false);
    }

    $scope.getObjectsTasks = function (id) {
        var requestParams = {
            entity: 'objectsGroupTasks',
            method: 'get',
            id: id,
            successFn: function (response) {
                var data = response['objects_tasks'];
                $scope.gridObjectsTasks.data = data;
            }
        }
        requests.make(requestParams, false);
    }


    $scope.objectForm = function (size, isNew) {

        if (isNew) {
            $scope.isNew = true;
            $scope.object = {};
        }
        else {
            $scope.isNew = false;
        }

        $scope.modalInstance = $modal.open({
            templateUrl: 'views/damage/modalObjectsGroupCreate.tpl',
            size: size,
            scope: $scope,
        });

        $scope.modalInstance.result.finally(function () {

        });

    }


    $scope.taskForm = function (size, isNew) {
        if (isNew) {
            $scope.isNew = true;
            $scope.task = {}
        }
        else {
            $scope.isNew = false;
        }

        $scope.modalInstance = $modal.open({
            templateUrl: 'views/damage/modalObjectsTaskCreate.tpl',
            size: size,
            scope: $scope,
        });

        $scope.modalInstance.result.finally(function () {

        });

    }


    $scope.saveObject = function (object_form) {
        if (object_form.$valid) {
            var object = angular.copy($scope.object);
            var method = 'create';
            var entity = 'customerObjectGroups';
            var id = $scope.customer_id;

            if (!$scope.isNew) {
                method = 'update';
                id = object.object_group_id;
            }

            var requestParams = {
                entity: entity,
                method: method,
                id: id,
                data: object,
                successFn: function (response) {
                    $scope.is_new_entity = true;
                    $scope.getCustomerObjects();
                    $scope.cancel();
                },
                errorFn: function (response) {
                    object_form.submitted = true;
                }
            }
            requests.make(requestParams, true);

        } else {
            object_form.submitted = true;
        }
    }

    $scope.saveTask = function (object_task) {
        if (object_task.$valid) {
            var task = angular.copy($scope.task);
            var method = 'create';
            var entity = 'objectsGroupTasks';

            var id = $scope.object.object_group_id;

            if (!$scope.isNew) {
                method = 'update';
                id = task.object_task_id;
            }

            var requestParams = {
                entity: entity,
                method: method,
                id: id,
                data: task,
                successFn: function (response) {
                    $scope.is_new_entity = true;
                    $scope.getObjectsTasks($scope.object.object_group_id);
                    $scope.cancel();
                },
                errorFn: function (response) {
                    object_task.submitted = true;
                }
            }
            requests.make(requestParams, true);

        } else {
            object_task.submitted = true;
        }
    }

    $scope.deleteObject = function () {
        if ($scope.object && window.confirm(translate.getTranslation('_are_you_sure_to_delete_object?'))) {
            Restangular.one('objects-groups', $scope.object.object_group_id).remove().then(function (response) {
                $scope.getCustomerObjects();
            });
            $scope.object = null;
        }
    }

    $scope.deleteTask = function () {
        if ($scope.task && window.confirm(translate.getTranslation('_are_you_sure_to_delete_task?'))) {
            Restangular.one('objects-tasks', $scope.task.object_task_id).remove().then(function (response) {
                $scope.getObjectsTasks($scope.object.object_group_id);
            });
            $scope.task = null;
        }
    }

    $scope.cancel = function () {
        $scope.modalInstance.dismiss('cancel');
    };

});
