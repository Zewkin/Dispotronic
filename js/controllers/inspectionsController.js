angular.module('Insta').controller('InspectionsController', function ($scope, translate, helpers,
                                                                      requests, permissions,
                                                                      AQL_GRADES, INSPECTION_STATUSES,
                                                                      SAMPLING_PLAN_IDS,
                                                                      INSPECTION_TYPE_IDS,
                                                                      INSPECTION_METHOD_IDS,
                                                                      IMAGES_URL_ROOT,
                                                                      QUALITY_PROFILES_IDS,
                                                                      INSTA_SIZE_IDS, $window,
                                                                      $rootScope,
                                                                      $timeout,
                                                                      createDialog
    ) {

    $scope.page_name = translate.getTranslation('_inspections');

    $scope.samplingPlans = SAMPLING_PLAN_IDS;
    $scope.inspectionStatuses = INSPECTION_STATUSES;
    $scope.inspectionTypes = INSPECTION_TYPE_IDS;
    $scope.inspectionMethods = INSPECTION_METHOD_IDS;
    $scope.inspectionTypeIdsFlipped = helpers.arrayFlip(INSPECTION_TYPE_IDS);
    $scope.element_disabled = true;

    $scope.selectedInspection = {
        'inspectionID': 0
    }

    $scope.init = function(){
        $scope.element_disabled = false;
    };
    $timeout($scope.init, 1500);

    var defaultStrataGroups = {
        buildings: false,
        descriptions: false,
        profiles: false,
        sizes: false
    };

    $scope.sampling = angular.copy(defaultStrataGroups);

    var defaultSamplingData = [
        {}
    ];

    $scope.acceptanceData = {
        true: translate.getTranslation("_accepted"),
        false: translate.getTranslation("_not_accepted")
    };

    $scope.getProfilesNames = function(contract_id)
    {
        var profiles_names = angular.copy(QUALITY_PROFILES_IDS);

        angular.forEach($scope.contractsData, function(contract) {
            if ((contract.contractID == contract_id) &&
                contract.hasOwnProperty('titlesMetaData')
            ) {
                angular.forEach(profiles_names, function(profile_name, profile_id) {
                    profiles_names[profile_id] = contract.titlesMetaData[profile_name];
                });
            }
        });

        return profiles_names;

    };

    $scope.getAcceptance = function (inspection) {
        var acceptance;

        if (inspection.completion != "100%" && inspection.statusID == 200205 && inspection.acceptance) {
            acceptance  = translate.getTranslation("_accepted_incomplete");
        } else {
            acceptance = inspection.acceptance ? translate.getTranslation("_accepted") : translate.getTranslation("_not_accepted");
        }

        return acceptance;

    };

    $scope.getCompletion = function (inspection) {
        var completion = '';

        if (typeof (inspection.completion) != 'undefined') {
          if ((inspection.completion != '0%') && (inspection.completion != inspection.percentOfAccepted)) {
            completion = inspection.completion + ' (' + inspection.percentOfAccepted + ')'
          } else {
            completion = inspection.completion;
          }
        }

        return completion;
    };

    $scope.getUnitFeedBack = function (feedback) {
        var comment = '';
        if (feedback) {
            if (feedback['insta'] !=undefined) {
                comment = feedback['insta']['comment'];
            }
            if (feedback['hygiene'] !=undefined) {
                if (comment) {
                    comment += "\n";
                }
                comment += feedback['hygiene']['comment'];
            }
        }

        return comment;

    };



    $scope.setInitialState = function() {
        $scope.showUsers = false;
        $scope.showInspectionForm = false;
        $scope.showInspectionsList = true;
        $scope.showSamplingData = false;
        $scope.showCreateSampling = false;
        $scope.showInspectionUnits = false;

        $scope.openedFilter = '';
    };

    $scope.setInitialState();

    $scope.hygieneDataByIds = {};
    $scope.gridHygieneData = [];

    requests.make({
        entity: 'hygieneProfiles',
        method: 'get',
        successFn: function(response) {
            angular.forEach(response.hygieneProfiles, function(element){
                $scope.hygieneDataByIds[element.hygieneProfileID] = element;
                $scope.gridHygieneData.push(element);
            });
        }
    });

    var getSamplingInfoDefs = function() {
        var samplingDefs = [
            {field: 'lotSize', displayName: translate.getTranslation('_lot'),  width: "80"},
            {field: 'sampleSize', displayName: translate.getTranslation('_sample_size'), width: "100"},
            {field: 'acNumber', displayName: translate.getTranslation('_acceptance_number'), width: "140"},
            {field: 'reNumber', displayName: translate.getTranslation('_rejection_number'), width: "130"}
        ];
        if ($scope.selectedInspection) {
            if ($scope.selectedInspection.clustered == 1) {
                samplingDefs.splice(0,0,{field: 'profile', displayName: translate.getTranslation('_profile'), width: "90"});
            }
            if ($scope.selectedInspection.hasOwnProperty('samplingMetaData')) {
                if ($scope.selectedInspection.statusID >= 200203) {
                    if ($scope.selectedInspection.inspectionTypeID == INSPECTION_TYPE_IDS.hygiene) {
                        samplingDefs.push({
                            field: 'rejectedInsta',
                            displayName: translate.getTranslation('_rejected_insta')
                        });
                        samplingDefs.push({
                            field: 'rejectedHygiene',
                            displayName: translate.getTranslation('_rejected_hygiene')
                        });
                    } else {
                        samplingDefs.push({field: 'rejected', displayName: translate.getTranslation('_rejected')});
                    }
                }

                samplingDefs.push({field: 'accepted', displayName: translate.getTranslation('_accepted')});
            }
        }

        return samplingDefs;
    };

    var loadSamplingInfo = function() {
        var selectedInspection = $scope.selectedInspection;

        if (selectedInspection.inspectionID) {

            var filtersMetaData = {};
            if ($scope.gridQualityProfile.selectedItems.length > 0) {
                filtersMetaData.profiles = $scope.gridQualityProfile.selectedItems;
            }

            if ($scope.gridBuildingStorey.selectedItems.length > 0) {
                filtersMetaData.buildings = $scope.gridBuildingStorey.selectedItems;
            }

            if ($scope.gridUnitSize.selectedItems.length > 0) {
                filtersMetaData.sizes = $scope.gridUnitSize.selectedItems;
            }

            if ($scope.gridDescription.selectedItems.length > 0) {
                filtersMetaData.descriptions = $scope.gridDescription.selectedItems;
            }

            requests.make({
                entity: 'sampleDetails',
                method: 'get',
                data: {
                    "strataMetaData": $scope.sampling,
                    "filtersMetaData": filtersMetaData/* {"profiles":[{"id":100802,"count":3}]} */
                },
                id: selectedInspection.inspectionID,
                successFn: function (response) {
                    var metadata = response.samplingMetaData;
                    if (response.sampleSize == 0) {
                        $scope.gridSamplingInfoData = [];
                    } else if (selectedInspection.clustered == 0) {
                        $scope.gridSamplingInfoData = [metadata];
                    } else {
                        var table = [];

                        var profiles = $scope.getProfilesNames(
                            selectedInspection.contractID
                        );

                        angular.forEach(metadata, function (value, key) {
                            var toPush = angular.copy(value);
                            toPush.profile = profiles[key];
                            table.push(toPush);
                        });
                        $scope.gridSamplingInfoData = table;
                    }

                    $scope.gridSamplingInfoDef = getSamplingInfoDefs();

                }
            });
        }
    };

    var defaultInspection = {
        inspectionTypeID: INSPECTION_TYPE_IDS.insta,
        inspectionMethodID: 0,
        samplingPlanID: SAMPLING_PLAN_IDS.single, /*default while 'double sampling' is not implemented (0)*/
        clustered: false,
        strataMetaData: {
            buildings: false,
            descriptions: false,
            profiles: false,
            sizes: false
        },
        optionsMetaData: {
            hygieneSensitive: false,
            warningIfFailed: false,
            showAcceptance: false,
            nfcRestriction: false
        }
    };

    $scope.inspection = angular.copy(defaultInspection);

    $scope.aql = 4.0;

    var users = {
        assigned: [],
        unassigned: []
    };

    $scope.gridUsersData = users.unassigned;
    $scope.gridAssignedUsersData = users.assigned;

    /* scope methods */
    {
        /**
         * checks inspector eligibility for currently selected inspection to act as inspector
         */
        $scope.checkEligibility = function(attributes) {
            var selectedInspection = $scope.gridInspections.selectedItems[0];
            if (selectedInspection) {
                return ( selectedInspection.inspectionTypeID == INSPECTION_TYPE_IDS.hygiene &&
                            attributes.canActAsHygieneInspector ) ||
                        (
                            selectedInspection.inspectionTypeID == INSPECTION_TYPE_IDS.insta &&
                                attributes.canActAsInspector
                        );
            }
        };

        $scope.inspectionReadyToSave = function () {
            if ($scope.inspection.name &&
                $scope.inspection.contractID &&
                $scope.inspection.inspectionMethodID
            ) {
                if ($scope.inspection.inspectionMethodID == INSPECTION_METHOD_IDS.total) {
                    return true;
                } else if ($scope.inspection.samplingPlanID) {
                    return  true;
                }
            }
            return false;
        };

        $scope.updateAQL = function () {
            for (var index in $scope.contractsData) {
                if ($scope.contractsData[index].contractID == $scope.inspection.contractID) {
                    $scope.aql = parseFloat($scope.contractsData[index].aql);
                    return;
                }
            }
        };

        $scope.decreaseAql = function () {
            var index = AQL_GRADES.indexOf($scope.aql);
            if (index != 0) {
                $scope.aql = AQL_GRADES[index - 1];
            }
        };

        $scope.increaseAql = function () {
            var index = AQL_GRADES.indexOf($scope.aql);
            if (index != 3) {
                $scope.aql = AQL_GRADES[index + 1];
            }
        };

        $scope.loadCustomersData = function () {
            /* customer select form highlight off if wasn't (in case someone tried to add something
             without selecting a customer) */
            $scope.select_customer_highlight_class = '';
            $scope.selectedInspection = {
                'inspectionID': 0
            };

            $scope.gridInspections.selectedItems[0] = [];

            /* loading customers contracts */
            requests.make({
                method: 'get',
                entity: 'customersContracts',

                id: $scope.customerID,
                successFn: function (response) {
                    $scope.contractsData = response.contracts;
                }
            });

            /* loading customers inspections */
            requests.make({
                method: 'get',
                entity: 'customersInspections',

                id: $scope.customerID,
                successFn: function (response) {
                    $scope.gridInspectionsData = response.inspections;
                    $scope.showSamplingData = false;
                    $scope.showInspectionUnits = false;
                }
            });
        };

        $scope.showInspectionAddForm = function () {
            if (!$scope.customerID) {
                $scope.select_customer_highlight_class = 'select_customer_highlight';
                return false;
            }
            $scope.inspection = angular.copy(defaultInspection);
            $scope.inspectionState = 'add';
            $scope.showInspectionForm = true;
            $scope.showInspectionsList = false;
        };


        $scope.showInspectionList = function () {
            $scope.showInspectionForm = false;
            $scope.showInspectionsList = true;
            $scope.showSamplingData = true;
            $scope.showInspectionUnits = true;
            $scope.inspectionState = '';
        };

        $scope.editInspection = function() {
            var editableInspection = angular.copy($scope.gridInspections.selectedItems[0]);
            if (editableInspection) {
                $scope.showSamplingData = false;
                editableInspection.samplingPlanID = defaultInspection.samplingPlanID;
                editableInspection.strataMetaData = defaultInspection.strataMetaData;
                $scope.inspectionState = 'edit';
                $scope.inspection = editableInspection;
                $scope.showInspectionForm = true;
                $scope.showInspectionsList = false;
                $scope.showInspectionUnits = false;
            }
        };

        $scope.deleteInspection = function() {
            var selectedInspection = angular.copy($scope.gridInspections.selectedItems[0]);
            if (selectedInspection) {
                var msg = translate.getTranslation('_are_you_sure_to_delete_inspection?');
                if (confirm(msg)) {
                    requests.make({
                        entity: 'inspection',
                        method: 'delete',

                        id: selectedInspection.inspectionID,
                        successFn: function (response) {
                            helpers.removeFromGridById(selectedInspection.inspectionID, 'inspectionID',
                                $scope.gridInspectionsData);
                        }
                    });
                }
            }
        };

        $scope.generateSample = function() {
            var selectedInspection = $scope.selectedInspection;

            if (selectedInspection.inspectionID) {

                var profiles = angular.copy($scope.gridQualityProfile.selectedItems);
                angular.forEach(profiles, function(val){
                    delete val['name'];
                });

                var sizes = angular.copy($scope.gridUnitSize.selectedItems);
                angular.forEach(sizes, function(val){
                    delete val['size'];
                });

                var filtersData = {
                    profiles: profiles,
                    buildings: $scope.gridBuildingStorey.selectedItems,
                    sizes: sizes,
                    descriptions: $scope.gridDescription.selectedItems
                };

                requests.make({
                    entity: 'inspection',
                    method: 'update',

                    id: selectedInspection.inspectionID,
                    data: {
                        strataMetaData: $scope.sampling,
                        filtersMetaData: filtersData
                    },
                    successFn: function(response) {
                        requests.make({
                            entity: 'inspectionSampling',
                            method: 'create',

                            id: selectedInspection.inspectionID,
                            successFn: function(response) {
                                var profiles_names = $scope.getProfilesNames(selectedInspection.contractID);

                                angular.forEach(response.units, function(unit){
                                    unit.qualityProfileID = profiles_names[unit.qualityProfileID];
                                });
                                $scope.gridUnitsData = response.units;
                                $scope.showCreateSampling = false;
                                $scope.showSamplingData = true;
                                $scope.showInspectionUnits = true;
                                selectedInspection.statusID = 200202;

                                selectedInspection.samplingMetaData = response.samplingMetaData;

                                var metadata = [];
                                if (selectedInspection.clustered == 0) {
                                    metadata = [selectedInspection.samplingMetaData];
                                } else {
                                    for (var qpId in selectedInspection.samplingMetaData) {
                                        var current = {};
                                        current = angular.copy(selectedInspection.samplingMetaData[qpId]);
                                        current.profile = profiles_names[qpId];
                                        metadata.push(current);
                                    }
                                }

                                $scope.gridSamplingInfoData = metadata;

                                $scope.gridSamplingInfoDef = getSamplingInfoDefs();
                                if (response.sampleSize == 0) {
                                    $rootScope.addAlert(translate.getTranslation('_sampled_no_items'), true);
                                }
                            }
                        });
                    }
                });
            }
        };

        $scope.saveInspection = function() {
            var inspectionToSave = angular.copy($scope.inspection);
            var isSampled = (inspectionToSave['statusID'] == 200202);

            var isTotal = inspectionToSave.inspectionMethodID == INSPECTION_METHOD_IDS.total;

            if (isTotal) {
                delete inspectionToSave.samplingPlanID;
            }


            //exception, if clustered, profiles strata can't exist
            if ($scope.inspection.inspectionMethodID == INSPECTION_METHOD_IDS.sampling) {
                $scope.inspection.strataMetaData.profiles = $scope.inspection.strataMetaData.profiles && !$scope.inspection.clustered;
            }

            var requestOptions = {
                entity: 'inspection',
                data: inspectionToSave
            };

            if ($scope.inspectionState == 'add') {
                inspectionToSave.customerID = $scope.customerID;
                inspectionToSave.statusID = 200201;
                inspectionToSave.contract = helpers.getByField(
                    $scope.contractsData,
                    'contractID',
                    inspectionToSave.contractID
                );

                requestOptions.successFn = function(response) {
                    inspectionToSave.inspectionID = response.id;
                    $scope.gridInspectionsData.push(inspectionToSave);
                    $scope.selectedInspection = inspectionToSave;
                };
                requestOptions.method = 'create';
            } else {

                requestOptions.successFn = function(response) {

                    if (isSampled) {
                        var promise = sampling(inspectionToSave);
                    }
                    var updatedItems = angular.copy($scope.gridInspectionsData);

                    promise.then(function(payload){

                        requests.make({
                            method: 'get',
                            entity: 'customersInspections',

                            id: $scope.customerID,
                            successFn: function (response) {
                                $scope.gridInspectionsData = response.inspections;
                            }
                        });
                        $scope.showSamplingData = true;
                        $scope.showInspectionUnits = true;
                    });

                };
                requestOptions.method = 'update';
                requestOptions.id = inspectionToSave.inspectionID;
            }

            requests.make(requestOptions);
        };

        $scope.showInspectionUsers = function() {

            users.assigned.length = 0;
            users.unassigned.length = 0;

            var selectedInspection = $scope.gridInspections.selectedItems[0];
            if (selectedInspection) {
                requests.make({
                    entity: 'inspectionUsers',
                    method: 'get',
                    id: selectedInspection.inspectionID,

                    successFn: function(response) {
                        response.users.map(function(element){
                            element.statusID =
                                element.statusID == 100101 ? translate.getTranslation('_active') : translate.getTranslation('_inactive');
                        });
                        for (var index in response.users) {
                            if (response.users[index].attributes.assignedOnInspection) {
                                users.assigned.push(response.users[index]);
                            } else {
                                users.unassigned.push(response.users[index]);
                            }
                        }
                        $scope.showUsers = true;
                    }
                });
            }
        };

        $scope.assignUser = function(userId) {
            var requestParams = {
                entity: 'inspectionUser',
                method: 'create',
                id: $scope.gridInspections.selectedItems[0].inspectionID,
                data: userId,
                successFn: function() {
                    var movedUser = helpers.moveEntityByAttribute(users.unassigned, users.assigned, 'userID', userId);
                }
            };

            if (users.assigned.length > 0) {
                requestParams.method = 'update';
            }

            requests.make(requestParams);
        };

        $scope.unassignUser = function(userId) {
            requests.make({
                entity: 'inspectionUser',
                method: 'delete',
                id: $scope.gridInspections.selectedItems[0].inspectionID,
                data: userId,
                successFn: function() {
                    var movedUser = helpers.moveEntityByAttribute(users.assigned, users.unassigned, 'userID', userId);
                }
            });
        };

        $scope.showPics = function(data) {
            var galleryController = function($scope) {
                $scope.slides = [];
                angular.forEach(data, function(item){
                    $scope.slides.push({
                        image: IMAGES_URL_ROOT + item.src,
                        text: item.comment
                    });
                });
            };

            createDialog('templates/gallery.tpl', {
                id: 'galleryDialog',
                title: translate.getTranslation('_feedback_images'),
                backdrop: true,
                controller: galleryController,
                footerTemplate : '&nbsp;',
                css: {
                    top: '30px',
                    left: '30%',
                    margin: '0 auto',
                    bottom: 'auto',
                    right: 'auto',
                    overflowY: 'visible'
                }
            });
        };

        $scope.canEditSelectedInspection = function() {
            return permissions.hasPermission('UpdateInspectionHandler') && (
                ($scope.selectedInspection.inspectionID > 0) &&
                ($scope.gridInspections.selectedItems[0].inspectionTypeID == INSPECTION_TYPE_IDS.insta ||
                permissions.hasPermission('CanUseHygiene')) &&
                $scope.gridInspections.selectedItems[0].statusID != 200203
                )
        };

        $scope.canGenerateSample = function() {
            return permissions.hasPermission('GetInspectionUsersHandler') &&
                ($scope.selectedInspection.inspectionID > 0)
                //&& !$scope.gridInspections.selectedItems[0].hasOwnProperty('samplingMetaData')
        };

        $scope.canAssignUsers = function() {
            return permissions.hasPermission('GetInspectionUsersHandler') &&
                ($scope.selectedInspection.inspectionID > 0) &&
                [200201,200202,200203].indexOf(
                    $scope.gridInspections.selectedItems[0].statusID
                ) !== -1;
        };

        $scope.canStartInspection = function() {
            return permissions.hasPermission('UpdateInspectionHandler') &&
                ($scope.selectedInspection.inspectionID > 0) &&
                $scope.gridInspections.selectedItems[0].statusID == 200202;
        };

        $scope.canStopInspection = function() {
            return permissions.hasPermission('UpdateInspectionHandler') &&
                ($scope.selectedInspection.inspectionID > 0) &&
                $scope.gridInspections.selectedItems[0].statusID == 200203;
        };

        $scope.canFinishInspection = function() {
            return permissions.hasPermission('UpdateInspectionHandler') &&
                ($scope.selectedInspection.inspectionID > 0) &&
                $scope.gridInspections.selectedItems[0].statusID == 200204;
        };

        $scope.canDeleteInspection = function() {
            return permissions.hasPermission('DeleteInspectionHandler') &&
                ($scope.selectedInspection.inspectionID > 0);
        };

        $scope.canRequestAssessment = function() {
            return ($scope.selectedInspection.inspectionID > 0) &&
                $scope.gridInspections.selectedItems[0].statusID != 200201;
        };

        var changeInspectionStatus = function(status, successFn, successAlert) {
            var selectedInspection = $scope.gridInspections.selectedItems[0];
            if (selectedInspection) {
                var params = {
                    entity: 'inspection',
                    method: 'update',
                    id: selectedInspection.inspectionID,
                    data: {statusID: status},
                    successFn: successFn,
                };
                if (successAlert) {
                    params['successAlert'] = successAlert;
                }
                requests.make(params);
            }
        };

        $scope.
            startInspection = function() {
            changeInspectionStatus(200203, function() {
                var selectedInspection = $scope.gridInspections.selectedItems[0];
                selectedInspection.statusID = 200203;
                selectedInspection.completion = "0%";
                selectedInspection.acceptance = true;
            }, translate.getTranslation('_inspection_start_success'));

        };

        $scope.stopInspection = function() {
            changeInspectionStatus(200202, function() {
                var selectedInspection = $scope.gridInspections.selectedItems[0];
                selectedInspection.statusID = 200202;
                selectedInspection.completion = "0%";
                selectedInspection.acceptance = false;
            }, translate.getTranslation('_inspection_stop_success'));
        };

        $scope.finishInspection = function() {
            if (confirm(translate.getTranslation('_finish_inspection_confirm'))) {
                changeInspectionStatus(200205, function() {
                    var selectedInspection = $scope.gridInspections.selectedItems[0];
                    selectedInspection.statusID = 200205;
                });
            }
        };

        function sampling(selectedInspection) {
            return requests.make({
                entity: 'inspectionSampling',
                method: 'create',

                id: selectedInspection.inspectionID,
                successFn: function(response) {
                    var profiles = $scope.getProfilesNames(selectedInspection.contractID);

                    angular.forEach(response.units, function(unit){
                        unit.qualityProfileID = profiles[unit.qualityProfileID];
                    });
                    $scope.gridUnitsData = response.units;
                    $scope.showCreateSampling = false;
                    $scope.showInspectionUnits = true;
                    selectedInspection.statusID = 200202;

                    if (response.samplingMetaData.sampleSize > 0) {
                        selectedInspection.samplingMetaData = response.samplingMetaData;
                    }

                    var metadata = [];
                    if (selectedInspection.clustered == 0) {
                        metadata = [selectedInspection.samplingMetaData];
                    } else {
                        for (var qpId in selectedInspection.samplingMetaData) {
                            var current = {};
                            current = angular.copy(selectedInspection.samplingMetaData[qpId]);
                            current.profile = profiles[qpId];
                            metadata.push(current);
                        }
                    }

                    $scope.gridSamplingInfoData = metadata;
                    $scope.gridSamplingInfoDef = getSamplingInfoDefs();

                    if (response.sampleSize == 0) {
                        $rootScope.addAlert(translate.getTranslation('_sampled_no_items'), true);
                    }
                }
            },true);
        }

        $scope.createSamplePlan = function() {
            var selectedInspection = $scope.gridInspections.selectedItems[0];

            /* for total inspections sampling is created immediately */
            if (selectedInspection) {
                $scope.showSamplingData = false;
                $scope.showInspectionUnits = false;

                $scope.inspection = selectedInspection;
                requests.make({
                    entity: 'inspectionFilters',
                    method: 'get',
                    id: selectedInspection.inspectionID,
                    successFn: function(response) {
                        $scope.showCreateSampling = true;

                        var profiles = $scope.getProfilesNames(selectedInspection.contractID);

                        $scope.gridQualityProfileData = response.profiles.map(function(val){
                            val.name = profiles[val.id];
                            return val;
                        });
                        $scope.gridUnitSizeData = response.sizes.map(function(val){
                            val.size = INSTA_SIZE_IDS[val.id];
                            return val;
                        });
                        $scope.gridDescriptionData = response.descriptions;
                        $scope.gridBuildingStoreyData = response.buildings;
                    }
                });
            } /*else {
                sampling(selectedInspection);
            }*/
        };

        $scope.filterToggle = function(filter) {
            if ($scope.openedFilter == filter) {
                $scope.openedFilter = '';
            } else {
                $scope.openedFilter = filter;
            }
        };


        $scope.getInspectionUnitRowStyle = function(unit) {
            var style = {};

            if (unit.hasOwnProperty('feedback')) {
                var acceptance = unit.feedback.hasOwnProperty('hygiene') ?
                    unit.feedback.hygiene.acceptance : true;

                acceptance = acceptance && (unit.feedback.hasOwnProperty('insta') ?
                    unit.feedback.insta.acceptance : true);

                if (acceptance == true) {
                    style['background-color'] = '#E0FEC0';
                } else {
                    style['background-color'] = '#FFD7D7';
                }
            }
            style.cursor = 'pointer';

            return style;
        };

        $scope.getInspectionRowStyle = function(inspection, col) {
            var style = 'table_row';
            style += ' ' + col.colIndex;

            if (inspection.hasOwnProperty('acceptance') && inspection.statusID == 200205) {
                if (inspection.acceptance == true) {
                    style += ' i_accepted';
                } else {
                    style += ' i_rejected';
                }
            } else if (inspection.statusID == 200204){
                style += ' i_in_progress';
            } else if (inspection.statusID <= 200203 && inspection.statusID > 200201) {
                style += ' i_not_ready';
            }

//            style.cursor = 'pointer';
//            style['border'] = "1px #000 solid!important";

            return style;
        };

        $scope.getAssessment = function() {
            var selectedInspection = $scope.gridInspections.selectedItems[0];
            if (selectedInspection) {
                if (selectedInspection.statusID > 200203) {
                    $window.open('/reports.html#/assessments/' + selectedInspection.inspectionID, "_blank");
                };
                $window.open('/reports.html#/quality-profile/' + selectedInspection.inspectionID, "_blank");

                $window.open('/reports.html#/inspection/' + selectedInspection.inspectionID, "_blank");

            }
        };

        $scope.inspectionEditDisabled = function() {
            var style = false;
            var selectedInspection = $scope.gridInspections.selectedItems[0];
            if (selectedInspection && selectedInspection.statusID > 200203 && $scope.inspectionState == 'edit') {
                return 'disabled';
            }

            return style;
        }
    }

    /* columns */
    {

        $scope.gridUsersColDef = [
            {field: 'firstName', displayName: translate.getTranslation('_name'),
                cellTemplate: 'templates/inspection_user_name_cell.tpl'},
            {field: 'lastName', displayName: translate.getTranslation('_last_name')},
            {field: 'login', displayName: translate.getTranslation('_login')},
            {field: 'statusID', displayName: translate.getTranslation('_status')}
        ];

        $scope.gridAssignedUsersColDef =  [
            {field: 'firstName', displayName: translate.getTranslation('_name')},
            {field: 'lastName', displayName: translate.getTranslation('_last_name')},
            {field: 'login', displayName: translate.getTranslation('_login')},
            {field: 'statusID', displayName: translate.getTranslation('_status'),
                cellTemplate: 'templates/inspection_user_status_cell.tpl'}
        ];

        $scope.gridQualityProfileDef =  [
            {field: 'name', displayName: translate.getTranslation('_quality_profile')},
            {field: 'count', displayName: translate.getTranslation('_count')}
        ];

        $scope.gridBuildingStoreyDef =  [
            {field: 'name', displayName: translate.getTranslation('_name')},
            {field: 'storey', displayName: translate.getTranslation('_storey')},
            {field: 'count', displayName: translate.getTranslation('_count')}
        ];

        $scope.gridUnitSizeDef =  [
            {field: 'size', displayName: translate.getTranslation('_insta_size')},
            {field: 'count', displayName: translate.getTranslation('_count')}
        ];

        $scope.gridDescriptionDef =  [
            {field: 'id', displayName: translate.getTranslation('_description')},
            {field: 'count', displayName: translate.getTranslation('_count')}
        ];

        $scope.gridUnitsDef =  [
            {field: 'roomNumber', displayName: translate.getTranslation('_unit_number')},
            {field: 'description', displayName: translate.getTranslation('_description')},
            {field: 'unitSize', displayName: translate.getTranslation('_unit_size')},
            {field: 'qualityProfileID', displayName: translate.getTranslation('_quality_profile'),
                cellTemplate: 'templates/quality_profile_unit_cell.tpl'},
            {field: 'hygieneProfileId', displayName: translate.getTranslation('_hygiene_code'),
                cellTemplate:'templates/hygiene_code.tpl'},
            {field: 'feedback', displayName: translate.getTranslation('_feedback'),
                cellTemplate: 'templates/unit_feedback_cell.tpl',
                width: "100"
            }
        ];

        $scope.gridSamplingInfo = {
            data: 'gridSamplingInfoData',
            enableSelection: false,
            selectedItems: [],
            enableRowSelection: false,
            enableSorting: false,
            rowTemplate: 'templates/inspection_row_template.tpl',
        };

        $scope.getGridInfo = function(){
            console.log($scope.gridInspectionsData);
        }
        $scope.gridInspections = {
            data: 'gridInspectionsData',
            enableColumnResize: true,
            enableColumnReordering: true,
            columnDefs: [
                {field: 'name', displayName: translate.getTranslation('_name')},
                {field: 'contract.name', displayName: translate.getTranslation('_contract_name')},
                {field: 'completion', displayName: translate.getTranslation('_completion'), width: "90",
                      cellTemplate: '<div class=\"ngCellText\" ng-class=\"col.colIndex\">{{grid.appScope.getCompletion (row.entity)}}</div>'},
                {field: 'acceptance', displayName: translate.getTranslation('_acceptance'), width: "90",
                    cellTemplate:
                        "<div class=\"ngCellText\" ng-class=\"col.colIndex\">"+
                        "<span ng-cell-text>{{grid.appScope.getAcceptance(row.entity)}}</span></div>"
                    },
                {field: 'statusID', displayName: translate.getTranslation('_status'),
                    cellTemplate: 'templates/inspection_status_cell.tpl'},
                {field: 'startedAt', displayName: translate.getTranslation('_started_at'), width: "130"},
                {field: 'inspectionTypeID', displayName: translate.getTranslation('_type'),
                    cellTemplate: 'templates/inspection_type_cell.tpl', width: "70"}
            ],
            multiSelect: false,
            selectedItems: [],
            rowTemplate: 'templates/inspection_row_template.tpl',
            onRegisterApi: function(gridApi) {
                $scope.gridInspectionsApi = gridApi;
                $scope.gridInspectionsApi.selection.on.rowSelectionChanged($scope, function(row) {
                    if (row.entity.inspectionID == $scope.selectedInspection.inspectionID) {
                        return true;
                    }
                    $scope.selectedInspection = row.entity;
                    console.log($scope.selectedInspection);
                    $scope.sampling = angular.copy(defaultStrataGroups);
                    if (typeof $scope.selectedInspection.inspectionID == 'undefined') {
                        return true;
                    }
                    if ($scope.selectedInspection && $scope.selectedInspection.hasOwnProperty('samplingMetaData')) {
                        requests.make({
                            entity: 'inspectionUnits',
                            method: 'get',

                            id: $scope.selectedInspection.inspectionID,
                            successFn: function(response) {
                                $scope.showInspectionUnits = true;
                                var profiles = $scope.getProfilesNames($scope.selectedInspection.contractID);

                                angular.forEach(response.units, function(unit){
                                    unit.qualityProfileID = profiles[unit.qualityProfileID];
                                });
                                $scope.gridUnitsData = response.units;
                            }
                        });

                        var metadata = [];

                        if ($scope.selectedInspection.clustered == 0) {
                            metadata = [$scope.selectedInspection.samplingMetaData];
                        } else {
                            var profiles = $scope.getProfilesNames($scope.selectedInspection.contractID);

                            for (var qpId in $scope.selectedInspection.samplingMetaData) {
                                var current = {};
                                current = angular.copy($scope.selectedInspection.samplingMetaData[qpId]);
                                current.profile = profiles[qpId];
                                metadata.push(current);
                            }
                        }
                        $scope.gridSamplingInfoData = metadata;
                        $scope.showSamplingData = true;
                    } else {
                        loadSamplingInfo();
                        $scope.showSamplingData = true;
                    }
                    $scope.gridSamplingInfo.columnDefs = getSamplingInfoDefs();
                })
            },
        };

        $scope.gridSamplingInfoDef = getSamplingInfoDefs();

        $scope.$on("ngGridEventData", function (event, gridId) {
            if ($scope.gridInspections.gridId == gridId) {
                if (event.targetScope.renderedRows.length > 0) {
                    angular.forEach($scope.gridInspectionsData, function(data, key){
                        if(data.inspectionID == $scope.selectedInspection.inspectionID){
                            $scope.gridInspections.selectRow(key, true);
                        }
                    });
                }
            }
        });

        $scope.gridUsers = {
            data: 'gridUsersData',
            enableColumnResize: true,
            columnDefs: 'gridUsersColDef',
            rowTemplate: 'templates/row_template.tpl',
            multiSelect: false,
            enableRowSelection: false,
            selectedItems: []
        };

        $scope.gridAssignedUsers = {
            data: 'gridAssignedUsersData',
            enableColumnResize: true,
            columnDefs: 'gridAssignedUsersColDef',
            rowTemplate: 'templates/row_template.tpl',
            multiSelect: false,
            enableRowSelection: false,
            selectedItems: []
        };

        $scope.gridQualityProfile = {
            data: 'gridQualityProfileData',
            columnDefs: 'gridQualityProfileDef',
            rowTemplate: 'templates/row_template.tpl',
            multiSelect: true,
            afterSelectionChange: loadSamplingInfo,
            selectedItems: []
        };

        $scope.gridBuildingStorey = {
            data: 'gridBuildingStoreyData',
            columnDefs: 'gridBuildingStoreyDef',
            rowTemplate: 'templates/row_template.tpl',
            multiSelect: true,
            afterSelectionChange: loadSamplingInfo,
            selectedItems: []
        };

        $scope.gridUnitSize = {
            data: 'gridUnitSizeData',
            columnDefs: 'gridUnitSizeDef',
            rowTemplate: 'templates/row_template.tpl',
            multiSelect: true,
            afterSelectionChange: loadSamplingInfo,
            selectedItems: []
        };

        $scope.gridDescription = {
            data: 'gridDescriptionData',
            columnDefs: 'gridDescriptionDef',
            rowTemplate: 'templates/row_template.tpl',
            multiSelect: true,
            afterSelectionChange: loadSamplingInfo,
            selectedItems: []
        };

        $scope.gridUnits = {
            data: 'gridUnitsData',
            columnDefs: 'gridUnitsDef',
            multiSelect: false,
            rowTemplate: 'templates/inspection_unit_row_template.tpl',
            selectedItems: []
        };
    }

    requests.make({
        method: 'get',
        entity: 'customers',
        successFn: function(response) {
            $scope.customersData = response.customers.sort(helpers.stringSortFunc);
            if ($scope.customerID) {
                $scope.loadCustomersData()
            }
        }
    });
});
