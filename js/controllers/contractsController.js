angular.module('Insta').controller('ContractsController', function($scope, localStorageService, PlanService, translate, helpers,
    requests, DEFAULT_PROFILES_DATA,
    QUALITY_PROFILES_IDS,
    INSTA_SIZE_IDS, INSTA_SIZES_MAP,
    AQL_GRADES, $timeout, $rootScope,
    removeEmptyRows, parseCSVData, globalStorage, importCtrl,
    $filter, uiGridConstants, UNIT_STATUS, uiGridValidateService, $modal,
    customerID, uiGridTreeBaseService, uiGridTreeBaseConstants, $rootScope, $location, $window, IMAGES_URL_ROOT) {
    $scope.page_name = translate.getTranslation('_contracts');

    /* initial settings, vars etc */

    var current_customer_buildings = [];

    $scope.qualityProfileIdsFlipped = helpers.arrayFlip(QUALITY_PROFILES_IDS);
    $scope.QUALITY_PROFILES_IDS = QUALITY_PROFILES_IDS;
    $scope.INSTA_SIZE_IDS = INSTA_SIZE_IDS;
    $scope.INSTA_SIZES_MAP = INSTA_SIZES_MAP;

    //console.log(INSTA_SIZE_IDS['100701'])

    $scope.contractsCollapsed = false;
    $scope.buildingsCollapsed = false;
    $scope.unitsCollapsed = false;
    $scope.unitsTotallyHidden = true;

    $scope.contractsTab = 'general';
    $scope.select_customer_highlight_class = '';

    $scope.gridBuildingsData = [];
    $scope.gridContractsBuildingsData = [];
    $scope.selected_building = {};
    $scope.contractsBuildingsCollapsed = false;
    $scope.hideBuildings = false;
    //needed for directory to change parent scope
    var defaultUnit = {
        qualityProfileID: 0
    };
    $scope.unit = defaultUnit;

    $scope.hygieneProfile = '';

    $scope.hygieneDataByIds = {};
    $scope.gridHygieneData = [];
    $scope.hygieneCodes = [];

    $scope.hygiene_profile_enabled = false;
    $scope.selectedUnitIndex = null;

    $scope.AtrtributesSuggest = [];
    $scope.unitsAttributes = [];


    $scope.element_disabled = true;
    $scope.init = function() {
        $scope.element_disabled = false;
    };

    $scope.isCommonView = true;
    $scope.unitFilterData = [];
    $scope.filter = {};

    $timeout($scope.init, 1500);
    $scope.translate = translate;
    $scope.currency = localStorageService.get('user').currency;

    requests.make({
        entity: 'hygieneProfiles',
        method: 'get',
        successFn: function(response) {
            angular.forEach(response.hygieneProfiles, function(element) {
                $scope.hygieneDataByIds[element.hygieneProfileID] = element;
                $scope.gridHygieneData.push(element);
                $scope.hygieneCodes.push(element['code']);
            });
        }
    }, true);

    $scope.filterAttributes = [];
    $scope.gridFilterAttr = {
        columnDefs: [{
            field: "name",
            displayName: "Name",
            enableSorting: false,
            width: "230"
        }, {
            field: "value",
            displayName: "Value",
            enableSorting: false,
            cellTemplate: "<select chosen multiple  data-placeholder=' '  class='chosen-select' ng-model='grid.appScope.filter.attributes[row.entity[\"name\"]]' ng-options='value as value for (key,value) in row.entity[\"values\"]' style='width:100%'><option value=''>Select value</option></select>"
        }],
        enableColumnMenus: false,
        data: "filterAttributes",
        enableRowSelection: false,
        enableCellEditOnFocus: false,
        multiSelect: false,
        showHeader: false,
        enableRowHeaderSelection: false,
        rowTemplate: "<div ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>",
        selectedItems: [],
        onRegisterApi: function(gridApi) {
            $scope.gridFilterAttrApi = gridApi;
            $scope.gridFilterAttrApi.selection.on.rowSelectionChanged($scope,
                function(row) {
                    // console.log($scope.gridFilterAttrApi.selection.getSelectedRows());
                }.bind(this)
            );
        },
    }

    $scope.getUnitSearch = function() {
        requests.make({
            entity: 'customerSearchUnits',
            method: 'get',
            id: $scope.customerID,
            data: $scope.filter,
            successFn: function(response) {
                $scope.gridUnitsData = $scope.prepareUnitsData(response.units);
                $scope.unitsTotallyHidden = false;

                $timeout(function() {
                    if ($scope.unit_state == 'add') {
                        $scope.selectedUnitIndex = $scope.gridUnitsData.length - 1;
                    }

                    if ($scope.selectedUnitIndex != null) {
                        $scope.gridUnitsApi.selection.selectRow(
                            $scope.gridUnitsData[$scope.selectedUnitIndex],
                            true
                        );
                    }
                }, 100);
            }
        }, true);
    }

    $scope.getUnitFilters = function() {
        requests.make({
            entity: 'customerUnitFilters',
            method: 'get',
            id: $scope.customerID,
            successFn: function(response) {
                $scope.unitFilterData = response;

                $scope.unitFilterBuildingsTmp = $scope.unitFilterData['buildings'];
                //console.log($scope.unitFilterBuildingsTmp);
                $scope.unitFilterData['buildings'] = [];
                $scope.unitFilterData['contracts'].forEach(function(value) {
                    $scope.unitFilterData['buildings'][value.contractID] = [];
                    angular.forEach(value.buildings, function(building) {
                        var x = $filter('filter')($scope.unitFilterBuildingsTmp, {
                            buildingID: building
                        })[0];
                        if (x['buildingID']) {
                            $scope.unitFilterData['buildings'][value.contractID].push(x);
                        }
                    });
                });
                //console.log($scope.unitFilterData['buildings']);
                $scope.unitFilterData['buildings'][''] = $scope.unitFilterBuildingsTmp;
                $scope.filterAttributes = $scope.unitFilterData['attributes'];
            }
        }, true);
    }

    $scope.unitFilterBuildingsTmp = [];

    $scope.switchView = function() {
        $scope.isCommonView = !$scope.isCommonView;
        if (!$scope.isCommonView) {
            //$scope.getUnitSearch();
            $scope.showFilter = true;
            $scope.filter = {
                recalc_period: new Date()
            };

            $scope.getUnitFilters();

            $scope.gridUnits.columnDefs.splice(1, 0, {
                field: 'building',
                'displayName': translate.getTranslation('_building'),
                cellTemplate: "<div class='ngCellText'>{{row.entity['building'].name}}</div>"
            });
            $scope.gridUnits.columnDefs.splice(2, 0, {
                field: 'building',
                'displayName': translate.getTranslation('_address'),
                cellTemplate: "<div class='ngCellText'>{{row.entity['building'].address}}</div>"
            });

        } else {
            $scope.gridUnits.columnDefs.splice(1, 2);
            $scope.gridBuildings.selectAll(false);
            $scope.selected_building = null;
        }
        $scope.unitsTotallyHidden = true;
        $scope.gridUnitsData = [];
    }

    $scope.showFilter = true;
    $scope.dependFilterReset = function() {
        var x = [];
        if ($scope.filter.contract_id && $scope.filter.contract_id.length > 0) {
            $scope.filter.contract_id.forEach(function(selected) {
                $scope.unitFilterData['buildings'][selected].forEach(function(value) {
                    if (x.indexOf(value) < 0) {
                        x.push(value)
                    }
                })

            });
            $scope.unitFilterBuildingsTmp = x;
        } else {
            $scope.unitFilterBuildingsTmp = $scope.unitFilterData['buildings'][''];
        }
        $timeout(function() {
            angular.element(document).find('#building_id').trigger('chosen:updated')
        }, true);

        $scope.filter.building_id = '';
        $scope.filter.key_figure_id = '';
        $scope.filter.hygiene_profile_id = '';
        $scope.filter.quality_profile_id = '';
    }

    $scope.tempFilter = function() {

        $scope.doFilterUnits();
    }

    $scope.doFilterUnits = function(reset) {
        if (reset) {
            $scope.filter = {};
        }
        if ($scope.filter.tag_id_) {
            $scope.filter.tag_id = $scope.filter.tag_id_.map(function(tag) {
                return tag ? tag.text : null;
            });
        }
        if ($scope.filter.description_) {
            $scope.filter.description = $scope.filter.description_.map(function(tag) {
                return tag ? tag.text : null;
            });
        }
        if ($scope.filter.room_number_) {
            $scope.filter.room_number = $scope.filter.room_number_.map(function(tag) {
                return tag ? tag.text : null;
            });
        }
        if ($scope.filter.storey_) {
            $scope.filter.storey = $scope.filter.storey_.map(function(tag) {
                return tag ? tag.text : null;
            });
        }

        if (reset) {
            $scope.unitsTotallyHidden = true;
            $scope.gridUnitsData = [];
        } else {
            $scope.getUnitSearch();
        }

        $scope.showFilter = reset;

        return false;
    }
    $scope.doShowFilter = function() {
        $scope.showFilter = true;
    }

    $scope.setQualityProfile = function(hygieneProfileID) {
        $scope.unit.qualityProfileID = $filter('filter')($scope.gridHygieneData, {
            hygieneProfileID: hygieneProfileID
        })[0]['qualityProfileID']
    }

    $scope.setViewProfiles = function(keyFigureID) {

        if (keyFigureID) {
            var keyFigure = $filter('filter')($scope.customerKeyFigures, {
                key_figure_id: keyFigureID
            })[0];
            $scope.unit.hygieneProfileID = keyFigure.hygiene_profile_id;
            $scope.hygiene_profile_enabled = true;
            $scope.unit.qualityProfileID = keyFigure.quality_profile_id;
        } else {
            $scope.hygiene_profile_enabled = false;
        }
    }
    $scope.getHygieneCode = function(hygieneID) {
        return hygieneID ? ", " + translate.getTranslation('_keyfigure_hc') + ":" + $filter('filter')($scope.gridHygieneData, {
            hygieneProfileID: hygieneID
        })[0]['code'] : '';
    }

    /* private helper functions */
    {
        /* loading customers buildings */
        function loadBuildingsData() {
            requests.make({
                entity: 'customersBuildings',
                method: 'get',
                id: $scope.customerID,
                successFn: function(response) {
                    $scope.gridBuildingsData = response.buildings;
                    current_customer_buildings = response.buildings;
                }
            });
        }

        /* default data for new contracts*/
        function initEmptyContract() {
            $scope.quality_profiles_data = angular.copy(DEFAULT_PROFILES_DATA);
            $scope.contract = {
                aql: 4,
                inspections: 0
            };
            $scope.premises_data = {
                'A': '',
                'B': '',
                'C': '',
                'D': '',
                'E': '',
                'F': '',
                'G': '',
                'H': '',
                'I': '',
                'J': ''
            };
            $scope.quality_mapping = angular.copy($scope.premises_data);
        };
        initEmptyContract();


        function separateBuildings(allBuildings, assignedToContractIds) {
            assignedToContractIds = assignedToContractIds.map(function(el) {
                return parseInt(el);
            });

            var unassigned = [];
            var assigned = [];

            angular.forEach(allBuildings, function(building) {
                if (assignedToContractIds.indexOf(building.buildingID) !== -1) {
                    assigned.push(building);
                } else {
                    unassigned.push(building);
                }
            });
            return {
                'assigned': assigned,
                'unassigned': unassigned
            };
        };

        function loadBuildingUnits(data, buildings) {

            console.log('Fired!!!');

            $scope.gridUnits.selectedItems = [];

            // if ($scope[buildings].selectedItems.indexOf(data.entity) !== -1) {
            $scope.unitsTotallyHidden = false;

            if ($scope.selected_building != data.entity) {
                $scope.selected_building = data.entity;
                $scope.gridUnitsData = [];

                requests.make({
                    entity: 'buildingsUnits',
                    method: 'get',
                    id: data.entity.buildingID,
                    successFn: function(response) {
                        $scope.canEdit = $scope.canEditProfile = $scope.canEditHygiene = '';
                        $scope.gridUnitsData = $scope.prepareUnitsData(response.units);
                        $scope.refreshGrid();
                    }
                });
            }
            // } else {
            //     $scope.gridUnitsData = [];
            // }
        };

        function sizeToInstaSizeId(size) {
            var map = INSTA_SIZES_MAP;

            for (var index in map) {
                if (size < map[index][0]) {
                    return map[index][1];
                }
            };
        }
    }
    /* table columns definitions */
    {
        $scope.gridContractsColDef = [{
            field: 'name',
            displayName: translate.getTranslation('_name')
        }, {
            field: 'description',
            displayName: translate.getTranslation('_description')
        }];

        $scope.gridBuildingdsColDef = [{
            field: 'name',
            displayName: translate.getTranslation('_building'),
            cellTemplate: "templates/building_cell.tpl"
        }, {
            field: 'address',
            displayName: translate.getTranslation('_address')
        }];




    }
    /*end of table columns definitions*/

    $scope.getKeyFigureData = function(index, field) {
        var x = $filter('filter')($scope.customerKeyFigures, {
            key_figure_id: index
        })[0]
        return x ? x[field] : null;
    }

    /* tables definitions */
    {
        $scope.gridContracts = {
            data: 'gridContractsData',
            enableCellSelection: false,
            enableColumnResize: false,
            enableRowHeaderSelection: false,
            modifierKeysToMultiSelectCells: false,
            columnDefs: [{
                field: 'name',
                displayName: translate.getTranslation('_name')
            }, {
                field: 'description',
                displayName: translate.getTranslation('_description')
            }],
            multiSelect: false,
            selectedItems: [],
            // rowTemplate: 'templates/row_template.tpl',
            sortInfo: {
                fields: ['name'],
                directions: ['asc']
            },
            onRegisterApi: function(gridApi) {
                $scope.gridContractsApi = gridApi;
                $scope.gridContractsApi.selection.on.rowSelectionChanged($scope,
                    function(row) {
                        $scope.showBuildingList();
                        $scope.gridContractsBuildingsData = {};
                        var buildingsIds = [];
                        requests.make({
                            entity: 'contractBuildings',
                            method: 'get',
                            id: row.entity.contractID,
                            successFn: function(response) {
                                var assignedBuildingsIds = response.buildings.map(function(el) {
                                    return el.buildingID;
                                });
                                var buildingsSeparated = separateBuildings(current_customer_buildings, assignedBuildingsIds);
                                $scope.gridContractsBuildingsData = buildingsSeparated.assigned;
                                $scope.gridBuildingsData = buildingsSeparated.unassigned;
                                $scope.unitsTotallyHidden = true;
                                $scope.selectedUnitIndex = null;
                                // $scope.gridBuildings.selectAll(false);
                                // $scope.gridContractsBuildings.selectAll(false);
                                $scope.selected_building = {};
                            }
                        });
                    }.bind(this)
                );
            },
            // afterSelectionChange: function (data) {
            //     $scope.gridContracts.selectedItems[0] = data.entity;
            //     $scope.showBuildingList ();
            //     $scope.gridContractsBuildingsData = {};
            //
            //     if ($scope.gridContracts.selectedItems[0]) {
            //         var buildingsIds = [];
            //         requests.make({
            //             entity: 'contractBuildings',
            //             method: 'get',
            //             id: $scope.gridContracts.selectedItems[0].contractID,
            //             successFn: function (response) {
            //                 var assignedBuildingsIds = response.buildings.map(function (el) {
            //                     return el.buildingID;
            //                 });
            //                 var buildingsSeparated = separateBuildings(current_customer_buildings, assignedBuildingsIds);
            //                 $scope.gridContractsBuildingsData = buildingsSeparated.assigned;
            //                 $scope.gridBuildingsData = buildingsSeparated.unassigned;
            //                 $scope.unitsTotallyHidden = true;
            //                 $scope.selectedUnitIndex = null;
            //                 $scope.gridBuildings.selectAll(false);
            //                 $scope.gridContractsBuildings.selectAll(false);
            //                 $scope.selected_building = {};
            //             }
            //         });
            //     } else {
            //         $scope.gridBuildingsData = current_customer_buildings;
            //     }
            // }
        };

        $scope.gridContractsBuildings = {
            data: 'gridContractsBuildingsData',
            modifierKeysToMultiSelectCells: false,
            enableRowHeaderSelection: false,
            columnDefs: [{
                field: 'name',
                displayName: translate.getTranslation('_building'),
                cellTemplate: "templates/contract_building_cell.tpl"
            }, {
                field: 'address',
                displayName: translate.getTranslation('_address')
            }],
            multiSelect: false,
            selectedItems: [],
            // rowTemplate: 'templates/row_template.tpl',
            sortInfo: {
                fields: ['name'],
                directions: ['asc']
            },
            onRegisterApi: function(gridApi) {
                $scope.gridContractsBuildingsApi = gridApi;
                $scope.gridContractsBuildingsApi.selection.on.rowSelectionChanged($scope,
                    function(row, data) {
                        row.entity = data.entity;
                        loadBuildingUnits(data, 'gridContractsBuildings');
                    }.bind(this)
                );
            },
            // afterSelectionChange: function (data, event) {
            //     if (data.selected) {
            //         $scope.gridContractsBuildings.selectedItems[0] = data.entity;
            //     }
            //
            //     loadBuildingUnits(data, 'gridContractsBuildings');
            // }
        };


        $scope.gridBuildings = { // панелька справа
            data: 'gridBuildingsData',
            modifierKeysToMultiSelectCells: false,
            enableRowHeaderSelection: false,
            columnDefs: [{
                field: 'name',
                displayName: translate.getTranslation('_building'),
                cellTemplate: "templates/building_cell.tpl"
            }, {
                field: 'address',
                displayName: translate.getTranslation('_address')
            }],
            multiSelect: false,
            enableCellSelection: false,
            selectedItems: [],
            // rowTemplate: 'templates/row_template.tpl',
            sortInfo: {
                fields: ['name'],
                directions: ['asc']
            },
            onRegisterApi: function(gridApi) {
                $scope.gridContractsBuildingsApi = gridApi;
                $scope.gridContractsBuildingsApi.selection.on.rowSelectionChanged($scope,
                    function(row) {
                        console.log('Панелька справа');
                        loadBuildingUnits(row, 'gridBuildings');
                    }.bind(this)
                );
            },
            // afterSelectionChange: function (data) {
            //     if (data.selected) {
            //         $scope.gridBuildings.selectedItems[0] = data.entity;
            //     }
            //     loadBuildingUnits(data, 'gridBuildings');
            // }
        };

        var sum = function(a, b, c) {
            var result = 0;
            var values = [];
            var skip_status = (b.field == 'unitSize');

            a.forEach(function(value) {
                var cellValue = b.grid.getCellValue(value, b);
                var cellNumber = Number(cellValue);
                if (!isNaN(cellNumber) && ((value.entity['statusID'] == UNIT_STATUS['active']) || skip_status)) {
                    values.push(cellNumber);
                    result += cellNumber;
                }
            });
            return b.aggregationValue = result.toFixed(2);
        };
        $scope.resultActive = 0;
        var sumIncrement = function(a, b, c) {
            var result = 0;
            $scope.resultActive = 0;
            a.forEach(function(value) {
                if ((value.entity['statusID'] == UNIT_STATUS['active'])) {
                    $scope.resultActive += 1;
                }
                result += 1;
            });
            return result;
        };

        $scope.field = [];

        $scope.refreshGrid = function() {
            $scope.gridUnitsApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            $scope.gridUnitsApi.core.refresh();
        }

        $scope.UNIT_STATUS = UNIT_STATUS;

        $scope.updateUnitStatus = function($event, unit) {
            var new_status = (unit['statusID'] != UNIT_STATUS['active']) ?
                UNIT_STATUS['active'] :
                UNIT_STATUS['inactive'];

            var message = (new_status == UNIT_STATUS['inactive']) ?
                translate.getTranslation('_are_you_sure_to_inactivate_unit?') :
                translate.getTranslation('_are_you_sure_to_activate_unit?');

            if (!window.confirm(message)) {
                $event.preventDefault();
                return false;
            }

            $scope.unit = unit;
            $scope.unit['statusID'] = new_status;
            $scope.unit_state = 'edit'
            $scope.saveUnit();

            $scope.refreshGrid();
        }

        $scope.checkToggle = function($event) {
            var new_status = $scope.toggle ?
                UNIT_STATUS['active'] :
                UNIT_STATUS['inactive']

            var message = (new_status == UNIT_STATUS['inactive']) ?
                translate.getTranslation('_are_you_sure_to_inactivate_units?') :
                translate.getTranslation('_are_you_sure_to_activate_units?');

            if (!window.confirm(message)) {
                $event.preventDefault();
                return false;
            }
            if ($scope.isCommonView) {
                $scope.building = $scope.gridBuildings.selectedItems[0];
                $scope.building['unitStatusID'] = new_status;
                $scope.building_state = 'edit';
                $scope.saveBuilding();

                $scope.gridUnitsData.forEach(function(value) {
                    $scope.field[value.unitID] = $scope.toggle;
                    value.statusID = $scope.building['unitStatusID'];
                });
            } else {
                var data = {
                    units: [],
                    status_id: new_status
                };
                $scope.gridUnitsData.forEach(function(value) {
                    $scope.field[value.unitID] = $scope.toggle;
                    value.statusID = new_status;
                    data.units.push(value.unitID)
                });

                requests.make({
                    entity: 'customerUnitsStatus',
                    method: 'update',
                    id: $scope.customerID,
                    data: data,
                })
            }
            $scope.refreshGrid();

        }

        $scope.toggle = false;
        $scope.totalState = function() {
            var a;
            a = true;

            if ($scope.gridUnitsData)
                $scope.gridUnitsData.forEach(function(value, key) {
                    if (value['statusID'] != UNIT_STATUS['active']) {
                        a = false;
                    }
                })
            return a;
        }

        var x = new range();
        var b = [];
        var z = [];

        x(b, 5, 105, 5).forEach(function(val, key) {
            z.push({
                id: val,
                value: val + '%'
            });
        });

        $scope.canEdit = $scope.canEditProfile = $scope.canEditHygiene = '';

        var cntEdit = function() {
            $scope.canEdit = $scope.canEditProfile = $scope.canEditHygiene = '';
            return false;
        }

        $scope.gridUnits = {
            data: 'gridUnitsData',
            enableExpandableRowHeader: true,
            columnDefs: [{
                    field: 'unitID',
                    displayName: translate.getTranslation('_status'),
                    cellTemplate: '<input type="checkbox" ng-model="grid.appScope.field[row.entity[\'unitID\']]"  ng-click="grid.appScope.updateUnitStatus($event, row.entity)" ng-checked="row.entity[\'statusID\']==grid.appScope.UNIT_STATUS[\'active\']">',
                    width: 25,
                    headerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-header-cell-primary-focus"><input type="checkbox" ng-model="grid.appScope.toggle" ng-checked="grid.appScope.totalState()" ng-click="grid.appScope.checkToggle($event)"></div>',
                    cellEditableCondition: cntEdit
                }, {
                    field: 'dates',
                    cellTemplate: '<div class="ui-grid-cell-contents" style="text-align: center;" ng-click="showClosedDates(\'lg\', true,  row.entity)"><i class="glyphicon glyphicon-calendar" ng-click="grid.appScope.showClosedDates(\'lg\', true, row.entity)"></i></div>',
                    displayName: translate.getTranslation('_closed_dates'),
                    headerCellTemplate: '<div class="ui-grid-cell-contents ui-grid-header-cell-primary-focus"><i type="checkbox" class="glyphicon glyphicon-calendar" ng-click="grid.appScope.showClosedDates(\'lg\',false)"></i></div>',
                    cellEditableCondition: cntEdit,
                    width: 30
                }, {
                    field: 'roomNumber',
                    displayName: translate.getTranslation('_unit_number'),
                    type: 'string',
                    headerCellClass: function() {
                        return $scope.canEdit;
                    },
                    aggregationType: sumIncrement,
                    footerCellTemplate: '<div></div>',
                }, {
                    field: 'description',
                    displayName: translate.getTranslation('_description'),
                    type: 'string',
                    headerCellClass: function() {
                        return $scope.canEdit;
                    }
                }, {
                    field: 'unitSize',
                    displayName: translate.getTranslation('_unit_size'),
                    aggregationType: sum,
                    type: 'string',
                    headerCellClass: function() {
                        return $scope.canEdit;
                    },
                    cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity["unitSize"]?row.entity["unitSize"]+" "+ grid.appScope.translate.getTranslation("_square_meter"):""}}</div>',
                    footerCellTemplate: '<div class="ui-grid-cell-contents">{{col.getAggregationValue() | number: 2}} {{grid.appScope.translate.getTranslation("_square_meter")}}</div>',
                }, {
                    field: 'usedArea',
                    displayName: translate.getTranslation('_unit_used_area'),
                    cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity["usedArea"]?row.entity["usedArea"]+"%":"100%"}}</div>',
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownOptionsArray: z,
                    type: 'number',
                    headerCellClass: function() {
                        return $scope.canEdit;
                    }
                }, {
                    field: 'usedUnitSize',
                    aggregationType: sum,
                    displayName: translate.getTranslation('_unit_used_size_m'),
                    cellEditableCondition: cntEdit,
                    cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity["usedUnitSize"]?row.entity["usedUnitSize"]+" "+grid.appScope.translate.getTranslation("_square_meter"):""}}</div>',
                    footerCellTemplate: '<div class="ui-grid-cell-contents">{{col.getAggregationValue() | number: 2}} {{grid.appScope.translate.getTranslation("_square_meter")}}</div>',
                }, {
                    field: 'cleaningTime',
                    aggregationType: sum,
                    displayName: translate.getTranslation('_cleaning_time'),
                    cellEditableCondition: cntEdit
                }, {
                    field: 'unitSizeInsta',
                    displayName: translate.getTranslation('_insta_size'),
                    visible: false
                }, {
                    field: 'storey',
                    displayName: translate.getTranslation('_storey'),
                    headerCellClass: function() {
                        return $scope.canEdit;
                    }
                }, {
                    field: 'qualityProfile',
                    displayName: translate.getTranslation('_quality_profile'),
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownOptionsFunction: function() {
                        var x = []

                        angular.forEach($scope.customerQpTitles, function(val, key) {

                            x.push({
                                id: val.join(",  "),
                                value: val.join(",  ")
                            });
                        })
                        return x;
                    },
                    cellEditableCondition: function() {
                        var keyfigure = $scope.gridUnits.selectedItems[0].keyFigureID;
                        return !keyfigure;
                    },
                    headerCellClass: function() {
                        return $scope.canEditProfile;
                    }
                }, {
                    field: 'hygieneProfileID',
                    displayName: translate.getTranslation('_hygiene_code'),
                    cellTemplate: '<div class="ui-grid-cell-contents" ng-class="{\'redtext\':row.entity.feedback.hygiene.acceptance === false}">{{grid.appScope.hygieneDataByIds[row.entity.hygieneProfileID].code}}</div>',
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownOptionsFunction: function() {
                        var x = []
                        x.push({
                            id: '',
                            value: translate.getTranslation('_not_defined')
                        })
                        $scope.gridHygieneData.forEach(function(val) {
                            x.push({
                                id: val.hygieneProfileID,
                                value: val.code + ' - ' + val.description
                            });
                        })
                        return x;
                    },
                    cellEditableCondition: function() {
                        var keyfigure = $scope.gridUnits.selectedItems[0].keyFigureID;
                        return !keyfigure;
                    },
                    headerCellClass: function() {
                        return $scope.canEditHygiene;
                    }
                }, {
                    field: 'keyFigureID',
                    displayName: translate.getTranslation('_keyfigure'),
                    cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity["keyFigureID"]?grid.appScope.getKeyFigureData(row.entity["keyFigureID"],"code"):""}} </div>',
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownOptionsFunction: function() {
                        var x = []
                        x.push({
                            id: '',
                            value: translate.getTranslation('_not_defined')
                        })
                        $scope.customerKeyFigures.forEach(function(val) {
                            x.push({
                                id: val.key_figure_id,
                                value: val.code
                            });
                        })
                        return x;
                    },
                    headerCellClass: function() {
                        return $scope.canEdit;
                    }
                }, {
                    field: 'tagID',
                    displayName: translate.getTranslation('_tag_id'),
                    visible: false,
                    headerCellClass: function() {
                        return $scope.canEdit;
                    }
                }, {
                    field: 'cleaningFrequency',
                    displayName: translate.getTranslation('_unit_cleaning_frequency'),
                    type: 'number',
                    headerCellClass: function() {
                        return $scope.canEdit;
                    }
                }, {
                    field: 'costPerMonth',
                    cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity["costPerMonth"]?(row.entity["costPerMonth"] | number: 2) + " " + grid.appScope.currency : ""}}</div>',
                    footerCellTemplate: '<div class="ui-grid-cell-contents">{{col.getAggregationValue() | number: 2}} {{grid.appScope.currency}}</div>',
                    displayName: translate.getTranslation('_cost_per_month'),
                    aggregationType: sum,
                    type: 'number',
                    cellEditableCondition: cntEdit
                },

            ],
            multiSelect: false,
            enableGridMenu: true,
            noUnselect: true,
            enableSelectAll: false,
            enableRowHeaderSelection: false,
            enableRowSelection: true,
            expandableRowTemplate: 'templates/expandableRowTemplate.tpl',
            selectedItems: [],
            expandableRowHeight: 60,
            expandableRowHeaderWidth: 30,
            expandableRowScope: {
                subGridVariable: 'subGridScopeVariable'
            },
            showColumnFooter: true,
            enableFooterTotalSelected: true,
            onRegisterApi: function(gridApi) {
                $scope.gridUnitsApi = gridApi;

                $scope.gridUnitsApi.selection.on.rowSelectionChanged(
                    $scope,
                    function(row) {
                        $scope.selectedUnitIndex = $scope.gridUnitsData.indexOf(row.entity);
                        $scope.gridUnits.selectedItems[0] = row.entity;
                        $scope.gridUnitsApi.edit.raise.beginCellEdit($scope, row.entity);

                        if (typeof row.entity['attributes'] == 'undefined') {
                            $scope.getSingleUnit(row.entity['buildingID'], row.entity['unitID'], row.entity);
                        }
                    });

                gridApi.expandable.on.rowExpandedStateChanged($scope, function(row) {
                    if (row.isExpanded && (typeof row.entity['attributes'] == 'undefined')) {
                        $scope.getSingleUnit(row.entity['buildingID'], row.entity['unitID'], row.entity)
                    }
                });

                gridApi.edit.on.beginCellEdit($scope, function(rowEntity, colDef, newValue, oldValue) {
                    $scope.canEdit = 'cell-editable';
                    var keyfigure = $scope.gridUnits.selectedItems[0].keyFigureID;
                    $scope.canEditProfile = !keyfigure ? 'cell-editable' : '';
                    $scope.canEditHygiene = !keyfigure ? 'cell-editable' : '';

                    $scope.refreshGrid();
                });
                gridApi.edit.on.afterCellEdit($scope, function(rowEntity, colDef, newValue, oldValue) {
                    if (colDef.field == 'unitSize') {
                        rowEntity.unitSize = Number(rowEntity.unitSize);
                    }

                    if (newValue != oldValue) {
                        $scope.unit = rowEntity;
                        $scope.unit_state = 'edit'

                        if (colDef.field == 'qualityProfile') {
                            angular.forEach($scope.customerQpTitles, function(val, key) {
                                if (rowEntity.qualityProfile == val.join(",  ")) {

                                    rowEntity.qualityProfile = key;
                                }
                            });

                            $scope.unit.qualityProfileID = $scope.qualityProfileIdsFlipped[rowEntity.qualityProfile];
                        }
                        $scope.saveUnit();
                    }
                    $scope.canEdit = $scope.canEditProfile = $scope.canEditHygiene = '';
                    $scope.refreshGrid();
                });
            },


            enableHorizontalScrollbar: 0,
            expandableRowHeaderWidth: 30
        };
    }

    // $timeout(function () {
    //     var rowHeaderColumnDef = {
    //         name: 'expandableButtons',
    //         displayName: '',
    //         exporterSuppressExport: true,
    //         enableColumnResizing: false,
    //         enableColumnMenu: false,
    //         width: $scope.gridUnitsApi.grid.options.expandableRowHeaderWidth || 30
    //     };
    //     rowHeaderColumnDef.cellTemplate = 'ui-grid/expandableRowHeader';
    //     //rowHeaderColumnDef.headerCellTemplate = 'ui-grid/expandableTopRowHeader';
    //     $scope.gridUnitsApi.grid.addRowHeaderColumn(rowHeaderColumnDef);
    // })




    for (var i = 1; i <= 12; i++) {
        var cost_name = 'additionalCost' + i;

        $scope.gridUnits.columnDefs.push({
            field: cost_name,
            cellTemplate: '<div class="ngCellText">{{row.entity["' + cost_name + '"]?(row.entity["' + cost_name + '"] | number: 2) + " " + grid.appScope.currency : ""}}</div>',
            footerCellTemplate: '<div class="ui-grid-cell-contents" >{{col.getAggregationValue() | number: 2}} {{grid.appScope.currency}}</div>',
            displayName: translate.getTranslation('_additional_cost_' + i),
            visible: false,
            aggregationType: sum,
            enableCellEdit: false
        });
    }

    /*Get Single Unit Ajax for subgrid*/


    $scope.getSingleUnit = function(buildingID, UnitID, row) {
        requests.make({
            entity: 'BuildingsUnit',
            method: 'get',
            id: buildingID,
            id2: UnitID,
            successFn: function(response) {
                row.attributes = response.units[0].attributes;

                if (typeof row.attributes == 'undefined') {
                    row.attributes = [];
                }

                var bla;
                bla = response.units[0];
                if (bla.attributes) {
                    var tmp = {};
                    bla.attributes.forEach(function(val, key) {
                        var val_name = val.name;
                        row.subGridOptions.columnDefs.push({
                            name: "'" + key + "'",
                            displayName: val.name,
                            sort: false,
                            headerCellClass: "subgrid-header",
                            cellClass: "subgrid-cell"
                        });
                        val.name = val_name;
                        tmp["'" + key + "'"] = val.value;
                    })
                    row.subGridOptions.data.push(tmp);
                }
                $scope.refreshGrid();
            }
        }, true);

    }


    /* STOP DATES*/
    $scope.myVars = [];
    $scope.closedDateOptions = [];
    $scope.dates = [];
    $scope.unitsClosedDates = [];


    $scope.getDisabledDate = function(date, mode) {
        var today = $rootScope.newvar ? new Date($rootScope.newvar) : new Date();
        var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        var options = ($scope.myVars.length == 1) ?
            $scope.tempClosedDateOptions :
            $scope.myVars;

        if (mode != 'day') {
            return false;
        }

        if (date.getMonth() != lastDayOfMonth.getMonth() || options.indexOf(Date.parse(date)) > 0) {
            return true;
        }
    }

    $scope.showClosedDates = function(size, isSingleUnit, row) {

        $scope.closedDateOptions = [];
        $scope.myVars = [];
        $rootScope.newvar = new Date();
        $timeout(function() {}, 2000);
        $scope.isSingleUnit = isSingleUnit ? true : false;
        $scope.getExcludedDays(row);
        $scope.modalInstance = $modal.open({
            templateUrl: 'views/contracts/modalClosedDates.html',
            size: size,
            scope: $scope,
        });
    }


    $scope.gridClosedDates = {
        columnDefs: [{
            field: "day",
            displayName: translate.getTranslation('_calendar_form_day'),
            enableSorting: false,
            width: 75
        }, {
            field: "reason",
            displayName: translate.getTranslation('_calendar_form_reason'),
            enableSorting: false
        }],
        enableColumnMenus: true,
        data: "unitsClosedDates",
        enableRowSelection: true,
        multiSelect: true,
        enableRowHeaderSelection: false,
        noUnselect: false,
        selectedItems: [],
        onRegisterApi: function(gridApi) {
            $scope.gridClosedDatesApi = gridApi;
            $scope.gridClosedDatesApi.selection.on.rowSelectionChanged($scope,
                function(row) {
                    if (row.isSelected) {
                        $scope.gridClosedDates.selectedItems[0] = row.entity;
                    } else {
                        $scope.gridClosedDates.selectedItems[0] = [];
                    }
                }.bind(this)
            );
        },
    }


    $scope.equal = function(o1, o2) {
        return !angular.equals(o1, o2);
    }

    $scope.hasNewExcludedDay = function() {
        return $scope.myVars.length && $scope.equal($scope.closedDateOptions, $scope.myVars);
    }

    $scope.$on('myCustomEvent', function(event, calback) {
        $scope.getExcludedDays($scope.gridUnits.selectedItems[0]).then(function(reponse) {
            calback(true);
        });
    });

    $scope.getExcludedDays = function(row) {
        var month;
        var year;

        if ($rootScope.newvar) {
            var parsed_date = new Date(Date.parse($rootScope.newvar));

            month = parsed_date.getMonth();
            year = parsed_date.getFullYear();
        } else {
            month = new Date().getMonth();
            year = new Date().getFullYear();
        }

        var firstDay = new Date(year, month, 1);
        var lastDay = new Date(year, month + 1, 0);

        var data = {
            units: [],
            begin_date: $filter('date')(firstDay, "yyyy-MM-dd"),
            end_date: $filter('date')(lastDay, "yyyy-MM-dd")
        }

        if ($scope.isSingleUnit) {
            data.units = [row['unitID']];
        } else {
            angular.forEach($scope.gridUnitsData, function(value) {
                data.units.push(value['unitID']);
            });
        }
        var x = requests.make({
            entity: 'customerUnitExcludedDays',
            method: 'get',
            id: $scope.customerID,
            data: data,
            successFn: function(response) {
                $scope.tempClosedDateOptions = angular.copy(
                    $scope.closedDateOptions
                );

                $scope.closedDateOptions = [null];
                $scope.myVars = [null];

                $timeout(function() {
                    angular.forEach(response.excluded_days, function(value) {
                        var date_pars = value['day'].split('-');
                        var date = new Date(date_pars[0], date_pars[1] - 1, date_pars[2]);

                        $scope.closedDateOptions.push(date.getTime());
                        $scope.myVars.push(date.getTime());
                    });

                    $scope.dates.reason = '';
                    $scope.unitsClosedDates = response.excluded_days;

                    $scope.$broadcast('refreshDatepicker', firstDay);

                }, 50);
            }
        }, true);

        return x;
    }

    $scope.deleteExcludedDays = function() {

        $scope.myVars = [];
        data = {
            units: [],
            dates: []
        };

        if ($scope.isSingleUnit) {
            data.units.push($scope.gridUnits.selectedItems[0]['unitID']);
        } else {
            angular.forEach($scope.gridUnitsData, function(value) {
                data.units.push(value['unitID']);
            });
        }

        angular.forEach($scope.gridClosedDatesApi.selection.getSelectedRows(), function(value) {
            data.dates.push($filter('date')(value.day, "yyyy-MM-dd"));
        })

        requests.make({
            entity: 'customerUnitExcludedDays',
            method: 'delete',
            id: $scope.customerID,
            data: data,
            successFn: function(response) {
                $scope.getExcludedDays($scope.gridUnits.selectedItems[0]);
            }
        }, true);
    }

    $scope.createExcludedDays = function() {
        $scope.myVars = [];
        data = {
            units: [],
            dates: [],
            reason: $scope.dates.reason
        };

        if ($scope.isSingleUnit) {
            data.units.push($scope.gridUnits.selectedItems[0]['unitID']);
        } else {
            angular.forEach($scope.gridUnitsData, function(value) {
                data.units.push(value['unitID']);
            });
        }

        var diff = _.omit($scope.closedDateOptions, function(v, k) {
            return $scope.myVars[k] === v;
        });
        angular.forEach(diff, function(value) {
            data.dates.push($filter('date')(value, "yyyy-MM-dd"));
        })

        requests.make({
            entity: 'customerUnitExcludedDays',
            method: 'create',
            id: $scope.customerID,
            data: data,
            successFn: function(response) {
                $scope.getExcludedDays($scope.gridUnits.selectedItems[0]);
            }
        }, true);
    }

    /* UnitAttrs */

    $scope.gridUnitsAttributes = {
        columnDefs: [{
            field: "name",
            displayName: "Name",
            enableSorting: false
        }, {
            field: "value",
            displayName: "Value",
            enableSorting: false
        }],

        enableColumnMenus: false,
        data: "unitsAttributes",
        enableRowSelection: true,
        enableCellEditOnFocus: false,
        multiSelect: false,
        enableRowHeaderSelection: false,
        rowTemplate: "<div ng-dblclick=\"grid.appScope.unitAttrForm('sm',false)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>",
        selectedItems: [],
        onRegisterApi: function(gridApi) {
            $scope.gridUnitsAttributesApi = gridApi;
            $scope.gridUnitsAttributesApi.selection.on.rowSelectionChanged($scope,
                function(row) {
                    $scope.newAttr = row.entity;
                    $scope.gridUnitsAttributes.selectedItems[0] = row.entity;
                    row.isSelected = true;
                }.bind(this)
            );
        },
    }

    $scope.saveAttr = function(form) {
        angular.forEach($scope.unitsAttributes, function(value) {
            if (value.name == $scope.newAttr['name'] && $scope.isNew) {
                form.submitted = false;
                form.name.$error.duplicate = true;
                form.name.$invalid = true;
                form.$valid = false;
            }
        });

        if (form.$valid) {
            if ($scope.isNew) {

                $scope.unitsAttributes.push({
                    name: $scope.newAttr['name'],
                    value: $scope.newAttr['value']
                });
            }

            $timeout(function() {
                $scope.gridUnitsAttributesApi.selection.selectRow(
                    $scope.unitsAttributes[$scope.unitsAttributes.length - 1],
                    true
                );
            }, 100);

            form.submitted = false;
        } else {
            console.log('else :(')
            form.submitted = true;
        }

    }

    $scope.removeAttr = function() {
        var key = $scope.unitsAttributes.indexOf($scope.newAttr);
        $scope.unitsAttributes.splice(key, 1);
        $scope.gridUnitsAttributes.selectedItems = [];
    }

    $scope.cancel = function() {
        $scope.modalInstance.dismiss('cancel');
    };
    /* end of unitAttrs */



    /* end of tables definitions */

    /* scope methods */
    {
        $scope.editContract = function() {
            $scope.contractsTab = 'general';

            var contract = $scope.gridContractsApi.selection.getSelectedRows()[0];
            if (contract) {
                contract.aql = parseFloat(contract.aql);
                $scope.contract_state = 'edit';
                $scope.quality_profiles_data = contract.profilesMetaData;
                $scope.premises_data = contract.premissesMetaData;
                $scope.contract = contract;

                $scope.quality_mapping = contract.titlesMetaData ?
                    contract.titlesMetaData :
                    angular.copy($scope.premises_data);
            }
        };


        $scope.copyContract = function() {
            $scope.contractsTab = 'general';

            var contract = angular.copy($scope.gridContractsApi.selection.getSelectedRows()[0]);
            if (contract) {
                contract.inspections = 0;
                contract.aql = parseFloat(contract.aql);
                $scope.contract_state = 'add';
                $scope.quality_profiles_data = contract.profilesMetaData;
                $scope.premises_data = contract.premissesMetaData;
                $scope.contract = contract;

                contract.name = '';
                contract.description = '';
                contract.contractID = null;

                $scope.quality_mapping = contract.titlesMetaData ?
                    contract.titlesMetaData :
                    angular.copy($scope.premises_data);
            }
        };

        $scope.loadCustomersData = function() {

            $scope.getUnitFilters();
            $scope.filter.contract_id = '';


            // $scope.gridContracts.$gridScope.toggleSelectAll(false, true);
            $scope.unitsTotallyHidden = true;
            $rootScope.customerID = $scope.customerID;
            /* customer select form highlight off if wasn't (in case someone tried to add something
             without slecting a customer) */
            $scope.select_customer_highlight_class = '';

            /* loading customers contracts */
            requests.make({
                entity: 'customersContracts',
                method: 'get',
                id: $scope.customerID,
                successFn: function(response) {
                    console.log(response.contracts);
                    $scope.gridContractsData = response.contracts;
                }
            });

            $scope.loadKeyFigures();
            loadBuildingsData();
            $scope.gridContractsBuildingsData = [];
        };

        $scope.loadKeyFigures = function() {
            requests.make({
                entity: 'customerKeyFigures',
                method: 'get',
                id: $scope.customerID,
                successFn: function(response) {
                    $scope.customerKeyFigures = response.keyFigures;

                }
            }, true);

            var requestParams = {
                entity: 'customerQpTitles',
                method: 'get',
                id: $scope.customerID,
                successFn: function(response) {
                    $scope.customerQpTitles = response.titles;
                }
            }
            requests.make(requestParams, true);
        }



        $scope.unassignBuilding = function(id) {
            var building = (function() {
                for (var index in $scope.gridContractsBuildingsData) {
                    var el = $scope.gridContractsBuildingsData[index];
                    if (el.buildingID == id) {
                        $scope.gridContractsBuildingsData.splice(index, 1);
                        return el;
                    }
                }
            })();

            requests.make({
                entity: 'contractBuilding',
                method: 'delete',
                id: $scope.gridContractsApi.selection.getSelectedRows()[0].contractID,
                data: id
            });

            $scope.gridBuildingsData.push(building);
        };

        $scope.assignBuilding = function(id) {
            console.log(id);
            if ($scope.gridContractsApi.selection.getSelectedRows()[0]) {
                var building = (function() {
                    for (var index in $scope.gridBuildingsData) {
                        var el = $scope.gridBuildingsData[index];
                        if (el.buildingID == id) {
                            $scope.gridBuildingsData.splice(index, 1);
                            return el;
                        }
                    }
                })();
                $scope.gridContractsBuildingsData.push(building);

                var request = {
                    entity: 'contractsBuildings',
                    id: $scope.gridContractsApi.selection.getSelectedRows()[0].contractID,
                    data: [building.buildingID]
                };

                if ($scope.gridContractsBuildingsData.length > 1) {
                    request.method = 'update';
                } else {
                    request.method = 'create';
                }

                requests.make(request);
            }
        };


        $scope.decreaseAql = function() {
            var index = AQL_GRADES.indexOf($scope.contract.aql);
            if (index != 0) {
                $scope.contract.aql = AQL_GRADES[index - 1];
            }
        };

        $scope.increaseAql = function() {
            var index = AQL_GRADES.indexOf($scope.contract.aql);
            if (index != 3) {
                $scope.contract.aql = AQL_GRADES[index + 1];
            }
        };

        $scope.showContractAddForm = function() {
            if ($scope.customerID == undefined) {
                $scope.select_customer_highlight_class = 'select_customer_highlight';
                console.log('Test 2');
                return false;
            }
            console.log('Test 3');
            $scope.hideBuildings = true;
            $scope.contractsCollapsed = true;
            $scope.contract_state = 'add';
            initEmptyContract();
        };

        $scope.showContractList = function() {
            $scope.hideBuildings = false;
            $scope.unitsTotallyHidden = true;
            $scope.contractsCollapsed = false;
            $scope.contract_state = '';
        };

        $scope.showBuildingAddForm = function() {
            $scope.building = {};
            if ($scope.customerID == undefined) {
                $scope.select_customer_highlight_class = 'select_customer_highlight';
                return false;
            }
            $scope.building_state = 'add';
            $scope.buildingsCollapsed = true;
            //$scope.unitsTotallyHidden = true;
        };

        $scope.showBuildingList = function() {

            if ($scope.gridContractsBuildingsApi.selection.getSelectedRows()[0]) {
                $scope.unitsTotallyHidden = false;
            }
            $scope.buildingsCollapsed = false;
            $scope.building_state = '';
        };

        $scope.editBuilding = function() {
            var building = $scope.gridContractsBuildingsApi.selection.getSelectedRows()[0];
            if (building) {
                $scope.building = angular.copy(building);
                $scope.buildingsCollapsed = true;
                $scope.building_state = 'edit';
            }
        };
        $scope.toggleContractBuildings = function() {
            $scope.contractsBuildingsCollapsed = !$scope.contractsBuildingsCollapsed;
        };

        $scope.showUnitAddForm = function() {
            $scope.unit = angular.copy(defaultUnit);
            $scope.loadKeyFigures();

            $scope.hygiene_profile_enabled = false;
            $scope.unit_state = 'add';
            $scope.unitsCollapsed = true;

            $scope.getCustomerAttributes();
        };


        $scope.getCustomerAttributes = function() {

            requests.make({
                entity: 'customerUnitAttributes',
                method: 'get',
                id: $scope.customerID,
                successFn: function(response) {
                    for (var key in response.attributes) {
                        $scope.AtrtributesSuggest.push({
                            term: response.attributes[key]
                        });
                    }
                }
            });
        }


        $scope.showUnitList = function() {
            $scope.unitsCollapsed = false;
            $scope.unit_state = '';
        };

        $scope.saveContract = function() {
            var newContract = angular.copy($scope.contract);

            var flag = false;
            angular.forEach($scope.quality_mapping, function(value, key) {
                if (!value) {
                    $scope.quality_mapping[key] = key;
                } else {
                    flag = true;
                }
            });
            if (flag) {
                newContract.titlesMetaData = $scope.quality_mapping
            }


            newContract.premissesMetaData = angular.copy($scope.premises_data);
            newContract.customerID = $scope.customerID;
            newContract.profilesMetaData = angular.copy($scope.quality_profiles_data);
            delete newContract.insepctions;

            var requestParams = {
                entity: 'contract',
                data: newContract
            };

            if ($scope.contract_state == 'edit') {
                requestParams.method = 'update';;
                requestParams.id = newContract.contractID;
                requestParams.successFn = function(response) {
                    initEmptyContract();
                    var gridRef = $scope.gridContracts.selectedItems[0];
                    angular.forEach(gridRef, function(value, key) {
                        gridRef[key] = newContract[key];
                    });

                    $scope.unitsTotallyHidden = true;
                    $scope.hideBuildings = false;
                };
            } else {
                requestParams.method = 'create';
                requestParams.successFn = function(response) {
                    newContract.contractID = response.id;
                    $scope.gridContractsData.push(newContract);
                    initEmptyContract();

                    $scope.unitsTotallyHidden = true;
                    $scope.hideBuildings = false;
                };
            }
            requests.make(requestParams);
        };

        $scope.saveBuilding = function() {
            var newBuilding = angular.copy($scope.building);
            newBuilding.customerID = $scope.customerID;

            var requestParams = {
                entity: 'building',
                data: newBuilding
            };

            if ($scope.building_state == 'edit') {
                requestParams.method = 'update';
                requestParams.id = newBuilding.buildingID;
                requestParams.successFn = function(response) {
                    // empty the form
                    $scope.building = {};
                    //update view in the grid
                    var gridRef = $scope.gridBuildings.selectedItems[0];
                    angular.forEach(gridRef, function(value, key) {
                        gridRef[key] = newBuilding[key];
                    });
                    helpers.updateGridById(newBuilding.buildingID, 'buildingID', current_customer_buildings, newBuilding);
                    $scope.buildingsCollapsed = false;
                };
            } else {
                requestParams.method = 'create'
                requestParams.successFn = function(response) {
                    newBuilding.buildingID = response.id;
                    current_customer_buildings.push(newBuilding);
                    if ($scope.gridContracts.selectedItems[0]) {
                        $scope.gridBuildingsData.push(newBuilding);
                    }
                    $scope.building = {};
                    $scope.buildingsCollapsed = false;
                };
            }

            return requests.make(requestParams, true);
        };

        $scope.saveUnit = function(updata_data) {
            var newUnit = angular.copy($scope.unit);

            var updata_data = (typeof updata_data == 'undefined') ?
                true :
                updata_data;

            if (newUnit.tagID == undefined) {
                newUnit.tagID = '';
            }

            newUnit.unitSize = ("" + newUnit.unitSize).replace(',', '.');
            newUnit.unitSize = parseFloat(newUnit.unitSize);
            newUnit.qualityProfileID = parseInt(newUnit.qualityProfileID);

            var requestParams = {
                entity: 'unit',
                data: newUnit
            };

            newUnit.attributes = $scope.unitsAttributes;


            if (newUnit.hygieneProfileID == '') {
                newUnit.hygieneProfileID = null;
            }

            if (newUnit.keyFigureID == '') {
                newUnit.keyFigureID = null;
            }


            if ($scope.unit_state == 'edit') {
                requestParams.id = newUnit.unitID;
                requestParams.method = 'update';

                requestParams.successFn = function(response) {
                    if (updata_data) {
                        $scope.getUnitData();
                    }
                };
            } else {
                newUnit.buildingID = $scope.selected_building.buildingID;

                requestParams.method = 'create';
                requestParams.successFn = function(response) {
                    newUnit.unitID = response.id;
                    newUnit.unitSizeInsta = INSTA_SIZE_IDS[sizeToInstaSizeId(newUnit.unitSize)];
                    newUnit.qualityProfile = QUALITY_PROFILES_IDS[newUnit.qualityProfileID];
                    $scope.getUnitData();
                };

            }
            //console.log(newUnit);
            requests.make(requestParams, true);
            $scope.refreshGrid();
        };

        //$scope.$on("ngGridEventData", function (event, gridId) {
        //    if ($scope.gridUnits.gridId == gridId) {
        //        $scope.gridUnitsApi.selection.selectRow($scope.selectedUnitIndex, true);
        //    }
        //    //if ($scope.gridBuildings.gridId == gridId) {
        //    //    $scope.gridBuildings.selectRow(2, true);
        //    //}
        //});

        $scope.getUnitData = function() {
            if ($scope.isCommonView) {


                requests.make({
                    entity: 'buildingsUnits',
                    method: 'get',
                    id: $scope.gridContractsBuildingsApi.selection.getSelectedRows()[0]['buildingID'],
                    successFn: function(response) {
                        $scope.gridUnitsData = $scope.prepareUnitsData(response.units);

                        $timeout(function() {
                            if ($scope.unit_state == 'add') {
                                $scope.selectedUnitIndex = $scope.gridUnitsData.length - 1;
                            }

                            if ($scope.selectedUnitIndex != null) {
                                $scope.gridUnitsApi.selection.selectRow(
                                    $scope.gridUnitsData[$scope.selectedUnitIndex],
                                    true
                                );
                            }
                        }, 100);
                    }
                });
            } else {
                $scope.getUnitSearch();
            }
        }

        $scope.deleteEntity = function(type) {
            var entityTableName = type.charAt(0).toUpperCase() + type.slice(1) + 's';
            console.log('grid' + entityTableName + 'Api');
            var entity = $scope['grid' + entityTableName + 'Api'].selection.getSelectedRows()[0];
            if (entity && window.confirm(translate.getTranslation('_are_you_sure_to_delete_' + type + '?'))) {
                requests.make({
                    entity: type,
                    id: entity[type + 'ID'],
                    method: 'delete',
                    successFn: function(response) {
                        helpers.removeFromGridById(response.id, type + 'ID', $scope['grid' + entityTableName + 'Data']);
                        if (type == 'building') {
                            $scope.unitsTotallyHidden = true;
                            helpers.removeFromGridById(response.id, type + 'ID', current_customer_buildings, 1);
                        }

                        if (type == 'unit') {
                            $scope.canEdit = $scope.canEditProfile = $scope.canEditHygiene = '';
                            $scope.refreshGrid();
                        }
                    }
                }, true);
                $scope['grid' + entityTableName].selectedItems = [];

            }
        };
        $scope.openImportUnits = function() {
            angular.element('#importUnits').trigger('click');
        };
        $scope.openImportBuildings = function() {
            angular.element('#importBuildings').trigger('click');
        };

        $scope.exportToCSV = function() {
            var data = {};
            if ($scope.isCommonView) {
                data = {
                    building_id: $scope.selected_building['buildingID']
                };
            } else {
                data = $scope.filter;
            }
            var titles_array = {
                'status': 'status',
                'building': 'building',
                'address': 'address',
                'room_number': 'room_number',
                'description': 'description',
                'unit_size': 'unit_size',
                'used_area': 'unit_used_area',
                'used_unit_size': 'unit_used_size_m',
                'cleaning_time': 'cleaning_time',
                'storey': 'storey',
                'quality_profile': 'quality_profile',
                'hygiene_code': 'hygiene_code',
                'key_figure': 'keyfigure',
                'tag_id': 'tag_id',
                'cleaning_frequency': 'unit_cleaning_frequency',
                'cost_per_month': 'cost_per_month',
                'additional_cost_1': 'additional_cost_1',
                'additional_cost_2': 'additional_cost_2',
                'additional_cost_3': 'additional_cost_3',
                'additional_cost_4': 'additional_cost_4',
                'additional_cost_5': 'additional_cost_5',
                'additional_cost_6': 'additional_cost_6',
                'additional_cost_7': 'additional_cost_7',
                'additional_cost_8': 'additional_cost_8',
                'additional_cost_9': 'additional_cost_9',
                'additional_cost_10': 'additional_cost_10',
                'additional_cost_11': 'additional_cost_11',
                'additional_cost_12': 'additional_cost_12',

            };
            var titles = {
                titles: {}
            };
            angular.forEach(titles_array, function(val, key) {
                titles.titles[key] = translate.getTranslation('_' + val);
            })
            console.log(titles);
            data = angular.extend(data, titles);
            console.log(data);
            requests.make({
                entity: 'customerExportUnits',
                method: 'get',
                id: $scope.customerID,
                data: data,
                successFn: function(response) {
                    $scope.go(response.link);
                }
            }, true);
        }

        $scope.go = function(path) {
            $window.open(IMAGES_URL_ROOT + path, "_blank")
        };


        $scope.importUnits = function(results) {
            importItems(results, 'units');
        };

        $scope.importBuildings = function(results) {
            importItems(results, 'buildings');
        };

        var importItems = function(results, type) {
            var prepared = removeEmptyRows(results.data, results.errors);
            results.data = prepared.data;
            results.errors = prepared.errors;
            var minFields = type == 'units' ? 5 : 7;
            var data = parseCSVData(results, minFields);
            var errors = data.errors;
            var exportedRows = data.exportedRows;
            var fields = data.fields;
            var errHandler = function(units) {
                if (!units.length) {
                    $rootScope.addAlert(translate.getTranslation('_import_error'), true, 3000);
                    return false;
                }

                var isErr = false;
                var unitsToRemove = [];
                angular.forEach(units, function(obj, key) {
                    if (obj.err) {
                        isErr = true;
                        unitsToRemove.push(key);
                    }
                });
                unitsToRemove.reverse();
                for (var i in unitsToRemove) {
                    units.splice(unitsToRemove[i], 1);
                }

                if (isErr) {
                    var msg = translate.getTranslation('_err_import_not_all_records').replace(
                        '{count}', unitsToRemove.length
                    );
                    $rootScope.addAlert(
                        msg,
                        true,
                        3000
                    );
                } else {
                    $rootScope.addAlert(translate.getTranslation('_import_successfully_passed'), false);
                    return true;
                }
            };
            var extraData = {
                'type': type,
                '$rootScope': $rootScope,
                'errors': errors,
                'exportedRows': exportedRows,
                'fields': fields,
                'keyfigures': $scope.customerKeyFigures,
                'qualityProfiles': $scope.customerQpTitles,
                'current_customer_buildings': current_customer_buildings,
                'cb': function(response) { //BUILDINGS
                    errHandler(response.units);
                    loadBuildingsData();
                },
                'selectedBuildingId': null
            };

            if (type == 'units') {
                extraData['selectedBuildingId'] = $scope.selected_building.buildingID;

                extraData['cb'] = function(response, isDeleteOldUnits) {
                    errHandler(response.units);
                    if (isDeleteOldUnits) {
                        $scope.gridUnitsData = $scope.prepareUnitsData(response.units);
                    } else {
                        var data = $scope.prepareUnitsData(response.units);
                        for (var i in data) {
                            $scope.gridUnitsData.push(data[i]);
                        }
                    }
                };
            }

            var tpl = (type == 'units') ? 'importUnits' : 'importBuildings';
            globalStorage.set('type', type);
            $rootScope.importDialog(
                tpl,
                importCtrl,
                null,
                extraData
            );
        };
    }

    $scope.prepareUnitsData = function(data) {
        var contract = $scope.gridContracts.selectedItems[0];
        data = data.map(function(unit) {
            var i;
            if (unit['unitID'] == undefined) {
                unit['unitID'] = unit['id'];
                delete unit['id'];
            }
            unit.unitSizeInsta = INSTA_SIZE_IDS[unit.unitSizeID];

            if (contract && contract.titlesMetaData) {
                unit.qualityProfile = contract.titlesMetaData[QUALITY_PROFILES_IDS[unit.qualityProfileID]];
            } else {
                unit.qualityProfile = $scope.customerQpTitles[QUALITY_PROFILES_IDS[unit.qualityProfileID]].join(',  ');
            }

            if (!unit.keyFigureID) {
                unit.keyFigureID = '';
            }

            if (!unit.hygieneProfileID) {
                unit.hygieneProfileID = '';
            }

            if (!unit.usedArea) {
                unit.usedArea = 100;
            }


            unit.subGridOptions = {
                columnDefs: [],
                showHeader: true,
                data: [],
                enableVerticalScrollbar: 0,
                enableColumnMenus: false,
                enableSorting: false,
                onRegisterApi: function(gridApi) {
                    $scope.subGridOptionsApi = gridApi;
                    gridApi.edit.on.afterCellEdit($scope, function(rowEntity, colDef, newValue, oldValue) {
                        if (newValue != oldValue) {
                            $scope.unit = $scope.gridUnits.selectedItems[0];
                            $scope.unitsAttributes = $scope.unit.attributes;
                            $scope.unit_state = 'edit'
                            var tmp = {};
                            angular.forEach(unit.subGridOptions.data, function(value, key) {
                                tmp = {
                                    name: colDef.displayName,
                                    value: newValue
                                };
                            });
                            angular.forEach($scope.unitsAttributes, function(value, key) {
                                if (unescape(value.name) == tmp.name) {
                                    $scope.unitsAttributes[key] = tmp;
                                }
                            })
                            $scope.saveUnit(false);
                        }
                    });
                }
            }

            return unit;
        });
        return data;
    };

    /* end of contorllers methods*/

    requests.make({
        entity: 'customers',
        method: 'get',
        successFn: function(response) {
            $scope.customersData = response.customers.sort(helpers.stringSortFunc);
            if ($scope.customerID) {
                $scope.loadCustomersData()
            }
        }
    }, true);

    $scope.getLenght = function(obj) {
        return Object.keys(obj).length;
    }
    $scope.getProfilesKeys = function(obj) {
        if ($scope.gridContracts.selectedItems[0] && $scope.gridContracts.selectedItems[0].titlesMetaData) {
            return $scope.gridContracts.selectedItems[0].titlesMetaData
        } else {
            var profiles = {};
            angular.forEach($scope.customerQpTitles, function(value, key) {
                profiles[key] = value.join(", ");
            });

            return profiles;
        }

    }
    $scope.addContractForm = function(size, isNew) {


        $scope.modalInstance = $modal.open({
            templateUrl: 'views/addContract.html',
            size: size,
            scope: $scope,
        });

        $scope.modalInstance.result.finally(function() {

        });

        $scope.cancel = function() {
            $scope.modalInstance.dismiss('cancel');
        };
    }

    $scope.addUnit = function(size) {
        $scope.unit = defaultUnit;
        $scope.modalInstance = $modal.open({
            templateUrl: 'views/addUnit.html',
            size: size,
            scope: $scope,
        })
        $scope.modalInstance.result.finally(function() {

        });
        $scope.cancel = function() {
            $scope.modalInstance.dismiss('cancel');
        };
    }

    $scope.editUnit = function(size) {
        $scope.getCustomerAttributes();

        var unit = angular.copy($scope.gridUnitsApi.selection.getSelectedRows()[0]);
        unit.usedArea = unit.usedArea ? unit.usedArea : 100;

        if (unit.keyFigureID == '') {
            unit.keyFigureID = null;
        }

        $scope.unitsAttributes = unit.attributes ? unit.attributes : [];

        if (unit.keyFigureID) {
            //$scope.gridHygiene.ngGrid.config.enableRowSelection = false;
            $scope.hygiene_profile_enabled = true;
        }

        unit.unitSize = parseFloat(unit.unitSize);

        if (unit) {
            console.log('Test');
            $scope.unit = angular.copy(unit);
            $scope.modalInstance = $modal.open({
                templateUrl: 'views/addUnit.html',
                size: size,
                scope: $scope,
            })
            $scope.modalInstance.result.finally(function() {

            })
            $scope.cancel = function() {
                $scope.modalInstance.dismiss('cancel');
            };
        }
    };

    $scope.addOrEditAttr = function(isNew) {
        $scope.newAttrForm = true;
        $scope.isNew = isNew;
        isNew ? $scope.newAttr = {
            name: '',
            value: ''
        } : $scope.newAttr;
    }

    $scope.closeAttrForm = function() {
        $scope.newAttrForm = false;
    }

    $scope.managePlans = function() {

        var building = $scope.gridContractsBuildingsApi.selection.getSelectedRows()[0];

        $scope.plans = [];
        $scope.units = [];
        $scope.formUpload = {};

        $scope.modalInstance = $modal.open({
            templateUrl: 'templates/managePlans.tpl',
            size: 'lg',
            scope: $scope,
        })

        $scope.modalInstance.result.finally(function() {
            $scope.map = false;
        });

        PlanService.getPlans(building.buildingID).then(function(response) {
            $scope.plans = response.data.plans;
        })

        PlanService.getUnits(building.buildingID).then(function(response) {
            $scope.units = response.data.units;
        })

        $scope.map = false;
        $scope.crop = false;
        $scope.layers = {};
        $scope.image = {};

        $scope.selectPlan = function(name, url) {
            $scope.layers.baselayers = {};
            var plan = {};
            plan[name+Math.random(1,9)] = {name:name,type:'imageOverlay',url:url,bounds:[[-840, -560],[840, 560]]}; // о да, иначе если совпадают имена у планов, директива нихера не делает
            $scope.layers.baselayers = plan;
            $scope.map = true;
        }

        $scope.uploadPlan = function() {
            PlanService.addPlan(building.buildingID, angular.toJson({
                planName: $scope.formUpload.filename,
                planFile: $scope.formUpload.picFile.base64,
                planFileExt: 'jpg'
            })).then(function(response) {
                $scope.plans.unshift(response.data.plan);
                $scope.crop = true;
                $scope.image = {
                    toCrop: 'http://instatest.ksf.kiev.ua'+response.data.plan.src,
                    cropped: '',
                }
                $scope.doCrop = function() {
                    console.log($scope.image.cropped);
                    PlanService.cropPlan(response.data.plan.planID, {
                        planFile: $scope.image.cropped.match(/,(.*)$/)[1],
                    }).then(function(response) {
                        $scope.crop = false;
                        $scope.selectPlan(response.data.plan.planName, response.data.plan.src);
                    })
                }
            });
        }

        $scope.deletePlan = function() {
            var id = this.plan.planID;
            PlanService.deletePlan(id).then(function(response) {
                for (var i = 0; i < $scope.plans.length; i++) {
                    if ($scope.plans[i].planID == id) {
                        $scope.plans.splice(i, 1);
                        break;
                    }
                }
            })
        }

    };

});
