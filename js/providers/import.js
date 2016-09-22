angular.module('Insta.importCSV', []).factory('removeEmptyRows', ["$document", "$compile", "$rootScope", function ($document, $compile, rootScope) {

    return function (data, errors) {
        var newData = [];
        var newErrors = [];

        angular.forEach(data, function (obj, key) {
            var fields = Object.keys(obj);

            if (fields.length > 2) {
                newData.push(obj);
            }
        });
        angular.forEach(errors, function (obj, key) {
            if (obj['code'] != 'TooFewFields') {
                newErrors.push(obj);
            }
        });
        return {
            'data': newData,
            'errors': newErrors
        };
    };

}]).constant('IMPORT_TYPES', {
    'units': 'units',
    'buildings': 'buildings'
}).service('importFields', ['translate', 'globalStorage', 'IMPORT_TYPES', function (translate, globalStorage, IMPORT_TYPES,$rootScope) {

    var fields;
    var baseFields = [
        {
            field: 'roomNumber',
            label: translate.getTranslation('_unit_number')
        },
        {
            field: 'description',
            label: translate.getTranslation('_description')
        },
        {
            field: 'storey',
            label: translate.getTranslation('_building_storey')
        },
        {
            field: 'unitSize',
            label: translate.getTranslation('_unit_size')
        },
        {
            field: 'usedArea',
            label: translate.getTranslation('_unit_used_area'),
            optional: true
        },
        {
            field: 'qualityProfile',
            label: translate.getTranslation('_quality_profile'),
            depend:true
        },
        {
            field: 'hygieneCode',
            label: translate.getTranslation('_hygiene_code'),
            depend:true
        },
        {
            field: 'keyFigureCode',
            label: translate.getTranslation('_keyfigures'),
            depend:true
        },
        {
            field: 'cleaningFrequency',
            label: translate.getTranslation('_unit_cleaning_frequency'),
            optional: true
        },
        {
            field: 'tagID',
            label: translate.getTranslation('_tag_id'),
            optional: true
        },
        {
            field: 'Attributes',
            label: translate.getTranslation('_attribute'),
            optional: true
        }
    ];

    this.init = function () {
        var type = globalStorage.get('type');

        if (type == IMPORT_TYPES['buildings']) {

            fields = baseFields.concat(
                [
                    {
                        field: 'buildingName',
                        label: translate.getTranslation('_building')
                    },
                    {
                        field: 'buildingAddress',
                        label: translate.getTranslation('_address')
                    }
                ]
            );
        } else {
            fields = baseFields.slice();
        }
    };

    this.get = function () {
        return fields;
    };

    this.remove = function (key) {
        var res = fields.splice(key, 1);
    };
}
]).factory('parseCSVData', ["$rootScope", 'translate', function (rootScope, translate) {
    return function (results, minCountFields) {

        var errors = [];
        var exportedRows = [];

        var errCount = results.errors.length;
        var fields = results.meta.fields;

        if (errCount) {
            if (errCount > 3) {
                errors.push({'msg': translate.getTranslation('_err_invalid_file'), 'row': 0});
            } else {
                angular.forEach(results.errors, function (obj, key) {
                    errors.push({'msg': obj.message, 'row': obj.row + 1});
                });
            }
        } else if (fields.length < minCountFields) {
            errors.push({'msg': translate.getTranslation('_err_invalid_file'), 'row': 0});
        } else {
            exportedRows.push(fields);

            angular.forEach(results.data, function (obj, key) {
                var record = [];

                angular.forEach(obj, function (value, key) {
                    record.push(value);
                });

                var string = record.join('').trim();

                if (string.length > 0) {
                    exportedRows.push(record);
                }
            });
        }

        return {
            'fields': fields,
            'errors': errors,
            'exportedRows': exportedRows
        };

    };
}]).service('validationService', ["$rootScope", "QUALITY_PROFILES_IDS","$filter", function ($rootScope, QUALITY_PROFILES_IDS,$filter) {

    this.validateQualityProfile = function (val) {
        var found = false;
        angular.forEach($rootScope.qualityProfiles,function(value,index){
            angular.forEach(value,function(v,k){

                if( v==val || index==val){
                    found=index;
                }
            });

        })
        return found?true:false;
    };

    this.validatehygieneProfile = function (val) {
        return $rootScope.hygieneCodes.indexOf(val) != -1;
    };

    this.validateUnitSize = function (val) {
        val = val.replace(',', '.')

        var isNumber = function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        };
        return isNumber(val);
    };

    this.validatecleaningFrequency = function (val) {
        val = val.replace(',', '.')

        var isNumber = function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        };
        return isNumber(val) &&  val>=0 && val<=100 || '';
    };

    this.validateusedArea = function (val) {
        val = val.replace(',', '.')
        var isNumber = function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        };
        return isNumber(val);
    };

    this.validateKeyFigureCode = function (val) {
        var res = $filter('filter')( $rootScope.keyfigures, {code: val});

        return val && res.length>0 && res[0]['code'];
    };

}]).service('buildingService', ['$rootScope', 'requests', '$q', 'translate', 'helpers', function ($rootScope, requests, $q, translate, helpers) {


    this.generateBuildingOptions = function (current_customer_buildings, exportedRows, fieldPos) {
        var buildingOptions = {};
        angular.forEach(current_customer_buildings, function (existsBuilding) {
            buildingOptions[existsBuilding['buildingID']] = {
                'name': existsBuilding['name'],
                'address': existsBuilding['address'],
                'value': existsBuilding['name'] + ' - ' + existsBuilding['address'],
                'hash': helpers.getStrHash(existsBuilding['name'], existsBuilding['address'])
            };
        });

        buildingOptions[0] = {
            'name': '',
            'address': '',
            'value': '[--' + translate.getTranslation('_create_new') + '--]',
            'hash': ''
        };

        var buildingList = {};

        angular.forEach(exportedRows, function (record, index) {
            if (index > 0) {
                var buildingName;
                var buildingAddress

                angular.forEach(fieldPos,function(val,key){
                    if(val.field == 'buildingName'){
                        buildingName = record[key];
                    }
                    if(val.field == 'buildingAddress'){
                        buildingAddress = record[key];
                    }
                })


                var isFoundBuilding = false;

                var hash = helpers.getStrHash(buildingName, buildingAddress);
                record.push(hash);

                if (buildingList[hash] == undefined) {
                    buildingList[hash] = {
                        'name': buildingName,
                        'address': buildingAddress,
                        'options': buildingOptions,
                        'selected': "0"
                    };

                    var buildingId, optionBuilding;
                    for (buildingId in buildingOptions) {
                        optionBuilding = buildingOptions[buildingId];
                        if (hash == optionBuilding['hash']) {
                            buildingList[hash]['selected'] = buildingId;
                            isFoundBuilding = true;
                            break;
                        }
                    }

                    if (!isFoundBuilding) {
                        for (buildingId in buildingOptions) {
                            optionBuilding = buildingOptions[buildingId];
                            if (buildingName == optionBuilding['name']) {
                                buildingList[hash]['selected'] = buildingId;
                                break;
                            }
                        }
                    }

                }
            }
        });

        return buildingList;
    };


    this.getBuildingSelection = function (buildingList, currentSelected) {
        var buildingSelected = {};
        angular.forEach(buildingList, function (item) {
            if (item.selected != "0") {
                var key = item.selected;
                var isDeleteOldUnits = false;
                if (currentSelected[key] != undefined) {
                    isDeleteOldUnits = currentSelected[key]['isDeleteOldUnits'];
                }
                buildingSelected[key] = {
                    'name': item.options[key]['name'],
                    'address': item.options[key]['address'],
                    isDeleteOldUnits: isDeleteOldUnits
                };
            }
        });

        return buildingSelected;
    };

    this.importBuildings = function ($scope, cb) {

        return function () {
            var l = Ladda.create($('#next_btn').get(0));
            l.start();
            $scope.result = '';
            var promises = [];

            //Create non-existing buildings
            angular.forEach($scope.buildingList, function (building) {
                if (building.selected == 0) {
                    building.customerID = $rootScope.customerID;
                    delete building.options;
                    delete building.selected;
                    var requestParams = {
                        entity: 'building',
                        data: building
                    };
                    requestParams.method = 'create';
                    requestParams.successFn = function (response) {
                        building.selected = response.id;
                        promises.push(building.selected);
                    };
                    promises.push(requests.make(requestParams, true));
                }
            });
            $q.all(promises).then(function (v) {
                var importData = {};
                var req = {
                    "import": []
                };

                angular.forEach($scope.buildingList, function (building) {

                    var buildingId = building.selected;
                    if (importData[buildingId] == undefined) {
                        importData[buildingId] = [];
                    }
                    var hash = helpers.getStrHash(building.name, building.address);
                    angular.forEach($scope.exportedRows, function (record) {
                        if (record[record.length - 1] == hash) {
                            importData[buildingId].push(record);
                        }
                    });
                });
                var isNumber = function (n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                };

                function getIndex(key){
                    var x;
                    angular.forEach($scope.mappedFields, function(vals, index){
                        if(key==vals.field) {
                            x = index;
                        }
                    })
                    return x!== "undefined"?x:-1;
                }


                angular.forEach(importData, function (unitData, buildingID) {

                    var isDeleteOldUnits = ($scope.buildingSelected[buildingID] != undefined)
                        ? $scope.buildingSelected[buildingID].isDeleteOldUnits
                        : false;
                    var obj = {
                        "buildingID": buildingID,
                        "deleteOldUnits": isDeleteOldUnits,
                        "units": []
                    };
                    angular.forEach(unitData, function (unit) {
                        var importUnit = {};

                        var qualityProfile = unit[getIndex('qualityProfile')];

                        var fieldName = (!isNaN(parseFloat(qualityProfile)) && isFinite(qualityProfile))
                            ? 'hygieneCode'
                            : 'qualityProfile';


                        importUnit['roomNumber'] = unit[getIndex('roomNumber')];
                        importUnit['description'] = unit[getIndex('description')];
                        importUnit['keyFigureCode'] = unit[getIndex('keyFigureCode')];
                        importUnit['usedArea'] = unit[getIndex('usedArea')];
                        importUnit['cleaningFrequency'] = unit[getIndex('cleaningFrequency')];
                        importUnit['storey'] = unit[getIndex('storey')];
                        importUnit['unitSize'] = unit[getIndex('unitSize')];
                        importUnit['qualityProfile'] = unit[getIndex('qualityProfile')];
                        importUnit['hygieneCode'] = unit[getIndex('hygieneCode')];
                        if (getIndex('tagID') != -1) {
                            importUnit['tagID'] = unit[getIndex('tagID')];

                        }

                        importUnit['attributes']=[];
                        angular.forEach($scope.tempMappedFields, function(val, index){
                            if(val.field=='Attributes') {
                                var value = unit[index].trim();

                                if (value.length > 0) {
                                  importUnit['attributes'].push({name:val.label,value:unit[index]});
                                }
                            }
                        })


                        obj.units.push(importUnit);
                    });

                    req.import.push(obj);
                });

                requests.make({
                    method: 'update',
                    entity: 'units',
                    data: req,
                    successFn: function (response) {
                        Ladda.stopAll();
                        $scope.$modalClose();
                        if (cb) {
                            cb(response);
                        }
                    }
                });
            });

        };
    };
}]).factory('removeErrorRecords', ['translate', function (translate) {

    return function ($scope) {

        var rowsToRemove = [];
        $scope.errorRecordsData = angular.copy($scope.errorRecordsData.splice(1));
        angular.forEach($scope.errorRecordsData, function (item) {

            var rowNum = item.shift();
            var isFixedRow = $scope.errorInfo[rowNum] == undefined;

            var index = rowNum - 1;
            if (isFixedRow) {
                $scope.exportedRows[index] = item.slice();
            } else {
                rowsToRemove.push(index);
            }
        });
        if (rowsToRemove.length == $scope.exportedRows.length) {
            $scope.isFailed = true;
            $scope.nextButtonLabel = translate.getTranslation('_close');
        } else {
            $scope.nextButtonLabel = translate.getTranslation('_finish');
        }

        rowsToRemove.sort().reverse();

        angular.forEach(rowsToRemove, function (val) {
            $scope.exportedRows.splice(val, 1);
        });
    }
}]).factory('validateRow', ['$rootScope', 'validationService', 'importFields', function ($rootScope, validationService, importFields) {

    var notValidatedFields = ['tagID','Attributes'];

    return function (row, rowNum, filed, fieldsPos, errorInfo, colError) {

        if (errorInfo[rowNum]){
            if(errorInfo[rowNum][fieldsPos]){
                delete  errorInfo[rowNum][fieldsPos];
            }
        }
        if (colError[fieldsPos]){
            if(colError[fieldsPos][rowNum]){
                delete  colError[fieldsPos][rowNum];
            }
        }

        var putError = function (fieldName) {
            var rowKey = rowNum ;
            var colKey =   fieldsPos;

            if (errorInfo[rowKey] == undefined) {
                errorInfo[rowKey] = {};
            }
            errorInfo[rowKey][colKey] = true;

            if (colError[colKey] == undefined) {
                colError[colKey] = {};
            }
            colError[colKey][rowKey] = true;
        };

        row = row.slice();
        var isErr = false;
        var validation = {};

        angular.forEach(importFields.get(), function (obj) {
            if(obj['field'] == filed['field']) {
                validation[obj['field']] = row[fieldsPos];
            }
        });

        angular.forEach(validation, function (obj, fieldName) {
            if (notValidatedFields.indexOf(fieldName) == -1 && !obj) {
                putError(fieldName);
                isErr = true;
            }
        });

        if (filed['field'] =='unitSize' && !validationService.validateUnitSize(validation['unitSize'])) {
            putError('unitSize');
            isErr = true;
        }

        if (filed['field'] =='usedArea' && !validationService.validateusedArea(validation['usedArea'])) {
            putError('usedArea');
            isErr = true;
        }

        if (filed['field'] =='cleaningFrequency' && !validationService.validatecleaningFrequency(validation['cleaningFrequency'])) {
            putError('usedArea');
            isErr = true;
        }

        if (filed['field'] =='qualityProfile' && !validationService.validateQualityProfile(validation['qualityProfile'])) {
            putError('qualityProfile');
            isErr = true;
        }

        if (filed['field'] =='hygieneCode' && !validationService.validatehygieneProfile(validation['hygieneCode'])) {
            putError('hygieneCode');
            isErr = true;
        }

        if (filed['field'] =='keyFigureCode' && !validationService.validateKeyFigureCode(validation['keyFigureCode'])) {
            putError('keyFigureCode');
            isErr = true;
        }

        if (isErr) {
            row.unshift(rowNum + 1);
            return row;
        } else {
            return true;
        }
    }

}]).service('globalStorage', [function () {

    this.vars = [];

    this.set = function (key, val) {
        this.vars[key] = val;
    };

    this.get = function (key) {
        return this.vars[key];
    };

}]).service('disabledFields', function () {

    var fields = [];

    this.add = function (field) {
        fields.push(field);
    };

    this.remove = function (field) {
        fields.splice(disabledFields.indexOf(field), 1);
    };

    this.has = function (field) {
        return fields.indexOf(field) != -1;
    };

    this.init = function () {
        fields = [];
    }

}).factory('adaptRows', function () {

    return function (exportedRows) {
        var actualCountOfRows = 0;
        angular.forEach(exportedRows, function (v) {
            if (v.length > actualCountOfRows) {
                actualCountOfRows = v.length;
            }
        });
        angular.forEach(exportedRows, function (v) {
            var diff = actualCountOfRows - v.length;
            for (var i = 0; i < diff; i++) {
                v.push("");
            }
        });


    };

}).factory(
    'importCtrl',
    [
        'translate', 'helpers', 'validateRow', '$q', 'requests', 'validationService', 'importFields', 'removeErrorRecords',  'buildingService', 'IMPORT_TYPES', 'globalStorage', 'disabledFields', 'adaptRows','$filter','uiGridConstants',
        function (translate, helpers, validateRow, $q, requests, validationService, importFields, removeErrorRecords, buildingService, IMPORT_TYPES, globalStorage, disabledFields, adaptRows, $filter,uiGridConstants) {
            return function (type, $scope, $rootScope, errors, exportedRows, fields, current_customer_buildings, cb, selectedBuildingId, keyfigures, qualityProfiles) {
                globalStorage.set('type', type);
                //Review
                adaptRows(exportedRows);

                importFields.init();
                disabledFields.init();
                $rootScope.hygieneCodes = [];
                $rootScope.keyfigures = keyfigures;
                $rootScope.qualityProfiles = qualityProfiles;
                requests.make({
                    entity: 'hygieneProfiles',
                    method: 'get',
                    successFn: function (response) {
                        angular.forEach(response.hygieneProfiles, function (element) {
                            $rootScope.hygieneCodes.push(element['code']);
                        });
                    }
                },true);

                $scope.mappedFields = [];
                $scope.tempMappedFields = [];

                var STEP_GENERAL_ERRORS = 0;
                var STEP_PREVIEW = 1;
                var STEP_BUILDINGS = 2;

                var stepCount = 2;
                $scope.currentStep = STEP_PREVIEW;

                $scope.nextClass = 'disabled pull-right';

                (function setCurrentStep($scope) {

                    if (errors.length) {
                        $scope.currentStep = STEP_GENERAL_ERRORS;
                    } else if (exportedRows.length) {
                        $scope.currentStep = STEP_PREVIEW;
                    }
                })($scope);

                $scope.selectionError = [];
                $scope.mandatoryError = [];
                $scope.errorInfo = [];
                $scope.errorColInfo = [];
                $scope.errorRecordsData =[];

                $scope.validateSelection  = function(mappedFields,key){
                    var current = $scope.mappedFields[key];
                    var err = current?$filter('filter')($scope.tempMappedFields, {field: current.field})[0]:null;

                    if( err && current && current.field!="Attributes"){
                        $scope.mappedFields.splice(key);
                        $scope.tempMappedFields.splice(key);
                        $scope.selectionError[key] = null;
                        $scope.errorColInfo.splice(key);
                    }else if(current){
                        $scope.tempMappedFields[key] = angular.copy(current);
                        if(current.field=="Attributes"){
                            $scope.tempMappedFields[key].label = $scope.exportedRows[0][key];
                        }
                        $scope.validateRowCol($scope.mappedFields[key],key);
                    }else if (!current){
                        $scope.mappedFields.splice(key);
                        $scope.tempMappedFields.splice(key);
                        $scope.selectionError[key] = null;
                        $scope.errorColInfo.splice(key);
                        angular.forEach($scope.exportedRows, function (obj, rowIndex) {

                            if(rowIndex>0 && $scope.errorInfo[rowIndex]) delete $scope.errorInfo[rowIndex][key];
                        });

                    }

                    $scope.gridExportRecordsApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
                    $scope.gridExportRecordsApi.core.refresh();
                }


                $scope.validateRowCol = function (filed, columIndex) {
                    $scope.errorRecordsData = [];

                    angular.forEach($scope.exportedRows, function (obj, rowNum) {
                        var res;
                        if(rowNum > 0) {
                            res = validateRow(obj, rowNum, filed, columIndex, $scope.errorInfo, $scope.errorColInfo);
                            if (Object.keys(res).length) {
                                $scope.errorRecordsData.push(res);
                            }
                        }
                    });

                    if($scope.errorColInfo[columIndex] && Object.keys($scope.errorColInfo[columIndex]).length > 0){
                        $scope.selectionError[columIndex] = true;
                    }else{
                        $scope.selectionError[columIndex] = null;
                    }

                }

                $scope.validateStep  = function(){
                    var y = [];
                    var dependent = [];
                    angular.forEach($scope.importedFields,function(value,key){
                        if(value['optional']==undefined){
                            var x = $filter('filter')($scope.mappedFields,{field:value.field});
                            if(x[0]==undefined){
                                if(value['depend']){
                                    dependent.push(true);
                                }else{
                                    y.push(true);
                                }
                            }
                        }
                    })

                    if(y.length>0){
                       return false;
                    }
                    else{
                       return dependent.length==3?false:true;
                    }
                }


                function switchStep(step) {
                    var title = translate.getTranslation('_preview_import');
                    $scope.nextButtonLabel = translate.getTranslation('_next');

                    if (step != undefined) {
                        $scope.currentStep = step;
                    }
                    if ($scope.currentStep == STEP_GENERAL_ERRORS) {
                        $scope.errors = errors;
                    } else if ($scope.currentStep == STEP_PREVIEW) {

                        $scope.$title = title + ' - ' + translate.getTranslation('_step') + ' 1/' + stepCount;
                        $scope.nextClass = 'pull-right';
                        $scope.exportedRows = exportedRows.slice();
                        $scope.exportedRowsCount = exportedRows.length;


                        var cellTemplate = "<div class=\"ngCellText\" ng-class=\"{header: row.rowIndex == 0} \"><span ng-cell-text>{{row.entity[col.field]}}</span></div>";
                        var gridExportRecordsColDef = [];
                        var record;
                        var importedFields = importFields.get();
                        $scope.importedFields = importedFields;

                        $scope.selectTemplate = "<div ng-class=\"{err: grid.appScope.selectionError[col.field]!=undefined, custom:grid.appScope.mappedFields[col.field].field=='Attributes'," +
                                                    "assigned:(grid.appScope.mappedFields[col.field] && grid.appScope.mappedFields[col.field].field!='Attributes'), ngCellText:true }\">" +
                                                    "<select  class=\"header-select ng-scope\"  ng-model='grid.appScope.mappedFields[col.field]' " +
                                                    "ng-options='k as k.label for k in grid.appScope.importedFields' " +
                                                    "ng-change='grid.appScope.validateSelection(this,col.field)'>"+
                                                    "<option value=''>" + translate.getTranslation("_none") + "</option>"+
                                                 "</select></div>"

                        function getClassName(grid, row, col, rowRenderIndex, colRenderIndex) {
                            var realRow = $scope.exportedRows.indexOf(row['entity']);
                            if(realRow == 0){
                                return 'header-first-row';
                            }
                            return  $scope.errorInfo.length > 0 && ($scope.errorInfo[realRow] && $scope.errorInfo[realRow][col.field]==true)? 'err':'';
                        }

                        angular.forEach(importedFields, function (obj, key) {
                            if(key>=fields.length){
                                return;
                            }
                            record = {
                                displayName: obj['label'],
                                field: key + "",
                                cellClass: obj['field'],
                                headerCellTemplate: $scope.selectTemplate,
                                cellTemplate: cellTemplate,
                                cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                                    return ' ' + getClassName(grid, row, col, rowRenderIndex, colRenderIndex);
                                },
                                width:150,
                                cellEditableCondition: function($scope) {
                                    return true;
                                },
                                /*editableCellTemplate: 'ui-grid/dropdownEditor',
                                editDropdownValueLabel: obj['label'],
                                editDropdownOptionsArray: [
                                    { id: 1, gender: 'male' },
                                    { id: 2, gender: 'female' }
                                ]
                                */
                            };
                            gridExportRecordsColDef.push(record);
                        });


                        var rest = fields.length - gridExportRecordsColDef.length;
                        var num = gridExportRecordsColDef.length;
                        for (var i = 0; i<rest; i++) {
                            var val = (num+i).toString();
                            if(fields[val].length>0) {
                                gridExportRecordsColDef.push({
                                    field: val+"",
                                    headerCellTemplate: $scope.selectTemplate,
                                    cellTemplate: cellTemplate,
                                    cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                                        return ' ' + getClassName(grid, row, col, rowRenderIndex, colRenderIndex);
                                    },
                                    width: 150,
                                });
                            }
                        }

                        $scope.gridExportRecords = {
                            data: 'exportedRows',

                            enableCellEditOnFocus: true,
                            columnDefs: gridExportRecordsColDef,
                            importedFields: importedFields,
                            headerRowTemplate: '<div ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngHeaderCell"><div ng-header-cell></div></div>',
                            onRegisterApi: function (gridApi) {
                                $scope.gridExportRecordsApi = gridApi;

                                gridApi.edit.on.afterCellEdit($scope, function(rowEntity, colDef, newValue, oldValue){
                                    if($scope.tempMappedFields[colDef.field])
                                    $scope.validateRowCol($scope.tempMappedFields[colDef.field],colDef.field);
                                    $scope.gridExportRecordsApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
                                    $scope.gridExportRecordsApi.core.refresh();
                                });

                            },
                            enableHorizontalScrollbar: 1,

                        };

                    }  else if ($scope.currentStep == STEP_BUILDINGS) {
                        $scope.lblDeleteOldUnits = translate.getTranslation('_delete_old_units');

                        $scope.isFailed = false;
                        removeErrorRecords($scope);

                        $scope.type = type;

                        $scope.import = function (){
                            if(type == IMPORT_TYPES['units']){
                                $scope.importUnits();
                            }
                            if(type == IMPORT_TYPES['buildings']){
                                $scope.importBuildings();
                            }
                        }


                        $scope.lblNoImportData = translate.getTranslation('_no_import_data');

                        if (type == IMPORT_TYPES['buildings']) {
                            $scope.lblImportedBuildings = translate.getTranslation('_imported_buildings');
                            $scope.$title = title + ' - ' + translate.getTranslation('_step') + ' 2/' + stepCount;


                            $scope.buildingList = buildingService.generateBuildingOptions(current_customer_buildings, $scope.exportedRows, $scope.mappedFields);
                            $scope.buildingSelected = {};
                            $scope.changeBuildingSelection = function () {
                                $scope.buildingSelected = buildingService.getBuildingSelection($scope.buildingList, $scope.buildingSelected);
                                $scope.buildingSelectedLength = Object.keys($scope.buildingSelected).length;
                            };
                            $scope.changeBuildingSelection();
                            $scope.importBuildings = buildingService.importBuildings($scope, cb);

                        } else if (type == IMPORT_TYPES['units']) {

                            $scope.exportedRowsCount = $scope.exportedRows.length-1;
                            $scope.lblRowsToImport = translate.getTranslation('_rows_to_import');
                            $scope.lblRowsWithErrorsToSkip = translate.getTranslation('_rows_with_errors_to_skip');
                            $scope.lblErrors = translate.getTranslation('_errors');


                            $rootScope.isDeleteOldUnits = false;
                            $scope.isDeleteUnits = function () {
                                $rootScope.isDeleteOldUnits = !$rootScope.isDeleteOldUnits;
                            };

                            function getIndex(key){
                                var x;
                                angular.forEach($scope.tempMappedFields, function(val, index){
                                    if(key==val.field) {
                                        x = index;
                                    }
                                })
                                return x!== "undefined"?x:-1;
                            }



                            $scope.importUnits = function () {
                                var req = {
                                    "deleteOldUnits": $rootScope.isDeleteOldUnits,
                                    "import": [
                                        {
                                            "buildingID": selectedBuildingId,
                                            "units": []
                                        }
                                    ]
                                };
                                $scope.exportedRows = $scope.exportedRows.slice(1);

                                angular.forEach($scope.exportedRows, function (record) {
                                    var qualityProfile = record[getIndex('qualityProfile')];

                                    var fieldName = (!isNaN(parseFloat(qualityProfile)) && isFinite(qualityProfile))
                                        ? 'hygieneCode'
                                        : 'qualityProfile';

                                    var obj = {};
                                    obj['roomNumber'] = record[getIndex('roomNumber')];
                                    obj['description'] = record[getIndex('description')];
                                    obj['keyFigureCode'] = record[getIndex('keyFigureCode')];
                                    obj['usedArea'] = record[getIndex('usedArea')];
                                    obj['cleaningFrequency'] = record[getIndex('cleaningFrequency')];
                                    obj['storey'] = record[getIndex('storey')];
                                    obj['unitSize'] = record[getIndex('unitSize')];
                                    obj['qualityProfile'] = record[getIndex('qualityProfile')];
                                    obj['hygieneCode'] = record[getIndex('hygieneCode')];
                                    if (getIndex('tagID') != -1) {
                                        obj['tagID'] = record[getIndex('tagID')];

                                    }
                                    obj['attributes']=[];
                                    angular.forEach($scope.tempMappedFields, function(val, index){
                                        if(val.field=='Attributes' && (record[index].trim().length() > 0)) {
                                            obj['attributes'].push({name:val.label,value:record[index]});
                                        }
                                    })

                                    req.import[0].units.push(obj);
                                });

                                requests.make({
                                    method: 'update',
                                    entity: 'units',
                                    data: req,
                                    successFn: function (response) {
                                        cb(response, req.deleteOldUnits);
                                        Ladda.stopAll();
                                        $scope.$modalClose();
                                    }
                                });
                            }
                        }
                    }
                }

                switchStep();

                $scope.nextStep = function () {
                    if ($scope.currentStep == STEP_PREVIEW) {
                        if(!$scope.validateStep()){
                            confirm(translate.getTranslation('_notice_import_mandatory'));
                            return
                        }
                        var collErrorLeft = false;
                        angular.forEach($scope.errorColInfo,function(val,key){
                            if(Object.keys(val).length>0)
                            {
                                collErrorLeft = true;
                            }
                        });

                        if (collErrorLeft && !confirm(translate.getTranslation('_notice_not_fixed'))) {
                            return;
                        }
                    }


                    $scope.currentStep++;
                    switchStep();
                };

                $scope.prevStep = function () {
                    $scope.currentStep--;
                    switchStep();

                };

            }
        }]);