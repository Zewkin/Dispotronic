angular.module('Insta').provider('requests', function () {
    this.$get = function(localStorageService, $window, $http, API_CONFIG, API_ERRORS,
                         $rootScope, alerts, $q) {
        var build_options = function(url, method, data) {
            if (!method) {
                method = 'GET';
            }
            return {
                    'url': API_CONFIG.api_prefix + url,
                    'method': method,
                    'headers': {
                        'Content-Type': 'application/json; charset=UTF-8',
                        'x-auth-token': localStorageService.get('token')
                    },
                    'data': data
                };
        };
        return {
            make: function(requestData, isPromise) {

                var deferred = $q.defer();

                var entity = requestData.entity.charAt(0).toUpperCase() + requestData.entity.slice(1);
                var method = requestData.method;
                var data = requestData.data;
                var id = requestData.id;
                var id2 = requestData.id2;
                var messages;
                if (method == 'create' || method == 'update') {
                    var key = (entity + '_save').toLowerCase();
                    if (alerts.hasOwnProperty(key)) {
                        messages = alerts[key];
                    } else {
                        messages = alerts.main;
                    }
                } else {
                    messages = alerts.main;
                }

                var successFn = requestData.successFn;
                var errorFn = requestData.errorFn;

                var self = this;

                var arguments = [];
                if (id) {
                    arguments.push(id);
                }
                if (id2) {
                    arguments.push(id2);
                }
                if (data) {
                    arguments.push(data);
                }
                var res = $http(self[method + entity + 'Options'].apply(this, arguments))
                .success(
                    function(response) {
                        if (successFn) {
                            successFn(response);
                        }
                        if (requestData.hasOwnProperty('successAlert')) {
                            $rootScope.addAlert(requestData['successAlert'], false)
                        } else if (messages.hasOwnProperty(0)) {
                            $rootScope.addAlert(messages[0].text, false);
                        }
                        deferred.resolve(
                            {
                             title: response.status,
                             data: response
                            }
                        );
                    }
                ).error(
                    function(response, status) {
                        if (errorFn) {
                            errorFn(response);
                        }
                        if ([500, 404].indexOf(status) !== -1 ) {
                            if (messages.hasOwnProperty(500)) {
                                $rootScope.addAlert(messages[500].text, true);
                            }
                        } else if ([API_ERRORS.TOKEN_INVALID,
                                    API_ERRORS.TOKEN_EXPIRED].indexOf(response.status.code) !== -1
                        ) {
                            /* wrong/expired token */
                            localStorageService.clearAll ();
                            $window.location = '/signin.html';
                        } else {
                            if (messages.hasOwnProperty(response.status.code)) {
                                $rootScope.addAlert(messages[response.status.code].text, true);
                            }
                        }
                    }
                );
                return isPromise ? res : false;
            },


            /**
             * API Methods themselves
             */

            getUsersOptions: function(subscriberId) {
                var url = '/users';
                if (subscriberId) {
                    url += '/' + subscriberId;
                }
                return build_options(url);
            },
            createUserOptions: function(data) {
                return build_options('/user', 'POST', data);
            },
            updateUserOptions: function(id, data) {
                var url = '/user/' + id;
                return build_options(url, 'PUT', data);
            },
            deleteUserOptions: function(id) {
                var url = '/user/' + id;
                return build_options(url, 'DELETE');
            },
            getSubscribersOptions: function() {
                return build_options('/subscribers', 'GET');
            },
            createSubscriberOptions: function(data) {
                return build_options('/subscriber', 'POST', data);
            },
            updateSubscriberOptions: function(subscriberId, data) {
                var url = '/subscriber/' + subscriberId;
                return build_options(url, 'PUT', data);
            },
            deleteSubscriberOptions: function(subscriberId) {
                var url = '/subscriber/' + subscriberId;
                return build_options(url, 'DELETE');
            },
            getCustomersOptions: function() {
                return build_options('/customers', 'GET');
            },
            getThemesOptions: function() {
                return build_options('/themes', 'GET');
            },
            createCustomerOptions: function(data) {
                return build_options('/customer', 'POST', data);
            },
            updateCustomerOptions: function(id, data) {
                return build_options('/customer/' + id, 'PUT', data);
            },
            deleteCustomersOptions: function(id) {
                return build_options('/customer/' + id, 'DELETE');
            },
            getCustomersContractsOptions: function(customerId) {
                return build_options('/customer/' + customerId +'/contracts', 'GET');
            },
            getCustomersBuildingsOptions: function(customerId) {
                return build_options('/customer/' + customerId +'/buildings', 'GET');
            },
            getBuildingsUnitsOptions: function(buildingId) {
                return build_options('/building/' + buildingId +'/units', 'GET');
            },
            getBuildingsUnitOptions: function(buildingId,unitId) {
                return build_options('/building/' + buildingId +'/units/'+unitId, 'GET');
            },
            getContractBuildingsOptions: function(contractId) {
                return build_options('/contract/' + contractId + '/buildings', 'GET');
            },
            createContractOptions: function(data) {
                return build_options('/contract', 'POST', data);
            },
            updateContractOptions: function(contract_id, data) {
                return build_options('/contract/' + contract_id, 'PUT', data);
            },
            deleteContractOptions: function(contract_id) {
                return build_options('/contract/' + contract_id, 'DELETE');
            },
            createBuildingOptions: function(data) {
                return build_options('/building', 'POST', data);
            },
            updateBuildingOptions: function(buildingId, data) {
                return build_options('/building/' + buildingId, 'PUT', data);
            },
            updateUnitsOptions: function(data) {
                return build_options('/units/', 'PUT', data);
            },
            deleteBuildingOptions: function(buildingId) {
                return build_options('/building/' + buildingId, 'DELETE');
            },
            createUnitOptions: function(data) {
                return build_options('/unit', 'POST', data);
            },
            updateUnitOptions: function(unitID, data) {
                return build_options('/unit/' + unitID, 'PUT', data);
            },
            deleteUnitOptions: function(unitID) {
                return build_options('/unit/' + unitID, 'DELETE');
            },
            createContractsBuildingsOptions: function(contractId, buildingsIds) {
                return build_options('/contract/' + contractId + '/buildings', 'POST', buildingsIds);
            },
            updateContractsBuildingsOptions: function(contractId, buildingsIds) {
                return build_options('/contract/' + contractId + '/buildings', 'PUT', buildingsIds);
            },
            deleteContractBuildingOptions: function(contractId, buildingId) {
                return build_options('/contract/' + contractId + '/buildings/' + buildingId, 'DELETE');
            },
            getCustomersInspectionsOptions: function(customerId) {
                return build_options('/customer/' + customerId + '/inspections', 'GET');
            },
            getInspectionUsersOptions: function(inspectionId) {
                return build_options('/inspection/' + inspectionId +'/users', 'GET');
            },
            createInspectionUserOptions: function(inspectionId, userId) {
                return build_options('/inspection/' + inspectionId +'/users', 'POST', [userId]);
            },
            updateInspectionUserOptions: function(inspectionId, userId) {
                return build_options('/inspection/' + inspectionId +'/users', 'PUT', [userId]);
            },
            deleteInspectionUserOptions: function(inspectionId, userId) {
                return build_options('/inspection/' + inspectionId +'/users/' + userId, 'DELETE');
            },
            createInspectionOptions: function(data) {
                return build_options('/inspection', 'POST', data);
            },
            updateInspectionOptions: function(inspectionId, data) {
                return build_options('/inspection/' + inspectionId, 'PUT', data);
            },
            deleteInspectionOptions: function(inspectionId) {
                return build_options('/inspection/' + inspectionId, 'DELETE');
            },
            getInspectionFiltersOptions: function(inspectionId) {
                return build_options('/inspection/' + inspectionId + '/filters', 'GET');
            },
            getSampleDetailsOptions: function(inspectionId, data) {
                return build_options('/inspection/' + inspectionId + '/calculate-sample-details', 'POST', data);
            },
            getInspectionUnitsOptions: function(inspectionId) {
                return build_options('/inspection/' + inspectionId + '/units', 'GET');
            },
            createInspectionSamplingOptions: function(inspectionId) {
                return build_options('/inspection/' + inspectionId + '/sampling', 'POST');
            },
            getAssessmentOptions: function(inspectionId) {
                return build_options('/inspection/' + inspectionId + '/assessment', 'GET');
            },
            getUserOptions: function(userId) {
                return build_options('/user/' + userId, 'GET');
            },
            getHygieneProfilesOptions: function() {
                return build_options('/hygiene/profiles', 'GET');
            },
            createPlanFileOptions: function(buildingId) {
                return build_options('/building/' + buildingId + '/plan', 'POST');
            },
            getCustomerKeyFiguresOptions: function(customerID) {
                return build_options('/customer/' + customerID + '/keyfigures/', 'GET');
            },

            createCustomerKeyFiguresOptions: function(customerID, data) {
                return build_options('/customer/' + customerID + '/keyfigures/', 'POST', data);
            },

            getCustomerFrequencyOptions: function(customerID) {
                return build_options('/customer/' + customerID + '/frequencies/', 'GET');
            },

            createCustomerFrequencyOptions: function(customerID, data) {
                return build_options('/customer/' + customerID + '/frequencies/', 'POST', data);
            },
            updateCustomerFrequencyOptions: function(freqID, data) {
                return build_options('/frequencies/' + freqID, 'PUT', data);
            },
            //
            //  ObjectGroups
            //

            getCustomerObjectGroupsOptions: function(customerID) {
                return build_options('/customer/' + customerID + '/objects-groups/', 'GET');
            },

            createCustomerObjectGroupsOptions: function(customerID, data) {
                return build_options('/customer/' + customerID + '/objects-groups/', 'POST', data);
            },

            updateCustomerObjectGroupsOptions: function(objectID, data) {
                return build_options('/objects-groups/' + objectID, 'PUT', data);
            },
            //
            //  ObjectTasks
            //

            getObjectsGroupTasksOptions: function(objectID) {
                return build_options('/objects-groups/' + objectID + '/objects-tasks/', 'GET');
            },

            createObjectsGroupTasksOptions: function(objectID, data) {
                return build_options('/objects-groups/' + objectID + '/objects-tasks/', 'POST', data);
            },

            updateObjectsGroupTasksOptions: function(taskID, data) {
                return build_options('/objects-tasks/' + taskID, 'PUT', data);
            },

            //
            //  ObjectUnits Assigment Search
            //
            getObjectsSearchOptions: function(customerID,units) {
                return build_options('/customer/' + customerID + '/search-objects-groups/', 'POST', units);
            },

            //
            //  ObjectUnits Assigment Save
            //
            updateObjectsGroupsUnitSaveOptions: function(customerID, data) {
                return build_options('/customer/' + customerID + '/assign-objects-groups/', 'PUT', data);
            },



            //
            //  ObjectUnits Inventory Update
            //
            updateObjectsInventoryNumberUnitOptions: function(unitID,objectGroupID, data) {
                return build_options('/unit/' + unitID + '/object-group/'+objectGroupID, 'PUT', data);
            },


            getCustomerSearchUnitsOptions: function(customerID, data) {
                return build_options('/customer/' + customerID + '/search-units/', 'POST', data);
            },

            getCustomerSearchEventsOptions: function(customerID, data) {
                return build_options('/customer/' + customerID + '/search-events/', 'POST', data);
            },

            getCustomerUnitFiltersOptions: function(customerID) {
                return build_options('/customer/' + customerID + '/units-filters/', 'GET');
            },
            updateCustomerUnitsStatusOptions: function(customerID, data) {
                return build_options('/customer/' + customerID + '/set-units-status', 'PUT', data);
            },
            updateKeyFiguresOptions: function(keyfigureID, data) {
                return build_options('/keyfigures/' + keyfigureID, 'PUT', data);
            },
            getCustomerQpTitlesOptions: function(customerID) {
                return build_options('/customer/' + customerID + '/qp-titles/', 'GET');
            },
            getCustomerUnitAttributesOptions: function(customerID) {
                return build_options('/customer/' + customerID + '/units-attributes/', 'GET');
            },
            getCustomerUnitExcludedDaysOptions: function(customerID, data) {
                return build_options('/customer/' + customerID + '/search-excluded-days/', 'POST', data);
            },

            deleteCustomerUnitExcludedDaysOptions: function(customerID) {
                return build_options('/customer/' + customerID + '/delete-excluded-days/', 'POST', data);
            },

            createCustomerUnitExcludedDaysOptions: function(customerID) {
                return build_options('/customer/' + customerID + '/excluded-days/', 'POST', data);
            },

            getCustomerExportUnitsOptions: function(customerID, data) {
                return build_options('/customer/' + customerID + '/export-units/', 'POST', data);
            },

        }

    };
});
