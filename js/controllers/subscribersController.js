angular.module('Insta').controller('SubscribersController', function ($scope, $http, translate,
                                                                      requests, helpers) {
    var defaultSubscriber = {
        "name": "",
        "description": ""
    };

    $scope.page_state = 'initial';

    $scope.state_edit_subscriber = false;
    $scope.state_add_new_subscriber = false;

    $scope.themesData = [];

    requests.make({
        method: 'get',
        entity: 'themes',
        successFn: function (response) {
            $scope.themesData = response.themes;
        }
    });

    $scope.subscriber_statuses = {
        100202: '_active',
        100201: '_inactive'
    };

    $scope.page_name = translate.getTranslation('_subscribers');
    $scope.buttonClasses = {'100202': 'btn-xs btn-success btn-active-inactive', '100201': 'btn-xs btn-danger btn-active-inactive'};

    $scope.showSubscriberAddForm = function(){
        $scope.subscriber = angular.copy(defaultSubscriber);
        $scope.state_add_new_subscriber = true;
        $scope.state_edit_subscriber = false;
    };
    $scope.editSubscriber = function(entity) {
        $scope.state_edit_subscriber = true;
        $scope.state_add_new_subscriber = false;
        $scope.subscriber = angular.copy(entity);
    };

    $scope.deleteSubscriber = function(subscriber) {
        var msg = translate.getTranslation('_are_you_sure_to_delete_subscriber?');
        if (confirm(msg)) {
            requests.make({
                entity: 'subscriber',
                method: 'delete',
                id: subscriber.subscriberID,
                successFn: function(response) {
                    helpers.removeFromGridById(subscriber.subscriberID, 'subscriberID' ,$scope.gridSubscribersData);
                }
            });
        }
    };

    $scope.switchStatus = function(subscriber, $event) {
        var newdata = subscriber.statusID == 100201 ? {statusID: 100202} : {statusID: 100201};

        requests.make({
            entity: 'subscriber',
            method: 'update',
            id: subscriber.subscriberID,
            data: newdata,
            successFn: function() {
                subscriber.statusID = newdata.statusID;
            }
        });
    };

    $scope.saveSubscriber = function() {

        $scope.page_state = 'add_success';

        var subscriber = {
            "name": $scope.subscriber.name,
            "description": $scope.subscriber.description,
            "themeFileName": $scope.subscriber.themeFileName
        };

        requests.make({
            entity: 'subscriber',
            method: $scope.state_add_new_subscriber ? 'create' : 'update',
            id: $scope.subscriber.subscriberID,
            data: subscriber,
            successFn: function(response) {
                if ($scope.state_add_new_subscriber) {
                    angular.extend(subscriber, {
                        "subscriberID": response.id,
                        "statusID": 100202
                    });
                    $scope.gridSubscribersData.push(subscriber);
                } else {
                    var field = helpers.getByField($scope.gridSubscribersData, 'subscriberID', response.id);
                    field.name = subscriber.name;
                    field.description = subscriber.description;
                    field.themeFileName = subscriber.themeFileName;
                }
                $scope.state_add_new_subscriber = false;
                $scope.state_edit_subscriber = false;

            }
        });

    };


    //@todo dynamic translation issue
    $scope.subscribersColDef = [
        {field:'name', displayName: translate.getTranslation('_name')},
        {field:'description', displayName: translate.getTranslation('_description')},
        {field:'themeFileName', displayName: translate.getTranslation('_theme')},        
        {field:'statusID', displayName: translate.getTranslation('_status'), cellTemplate: "templates/subscriber_status_cell.tpl"}
    ];

    $scope.gridSubscribers = {
        data: 'gridSubscribersData',
        enableCellSelection: false,
        enableColumnResize: true,
        enableColumnReordering: true,
        multiSelect: false,
        columnDefs: 'subscribersColDef',
        rowTemplate: 'templates/row_template.tpl',
        sortInfo: {fields:['name'], directions:['asc']},
        selectedItems: []
    };

    requests.make({
        entity: 'subscribers',
        method: 'get',
        successFn: function(response) {
            $scope.gridSubscribersData = response.subscribers;
        }
    });
});