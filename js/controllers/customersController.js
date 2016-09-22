angular.module('Insta').controller('CustomersController', function ($scope, translate, requests,
                                                                    permissions, helpers) {

    $scope.page_state = 'initial';

    $scope.page_name = translate.getTranslation('_customers');
    $scope.state_add_new_customer = false;
    $scope.state_edit_customer = false;
    var defaultCustomer = {};
    $scope.savableCustomer = {};

    $scope.deleteCustomer = function(customer) {
        var msg = translate.getTranslation('_are_you_sure_to_delete_customer?');
        if (confirm(msg)) {
            for (var index in $scope.gridCustomersData) {
                if ($scope.gridCustomersData[index].customerID == customer.customerID) {
                    $scope.gridCustomersData.splice(index, 1);
                    break;
                }
            }

            requests.make({
                entity: 'customers',
                method: 'delete',
                id: customer.customerID
            });
        }
    };

    $scope.showCustomerAddForm = function(){
        $scope.savableCustomer = angular.copy(defaultCustomer);
        $scope.state_add_new_customer = true;
        $scope.state_edit_customer = false;
    };
    $scope.editCustomer = function(customer) {
        $scope.state_edit_customer = true;
        $scope.state_add_new_customer = false;

        $scope.savableCustomer = angular.copy(customer);
    };

    $scope.saveCustomer = function() {
        var newCustomer = {
            'name': $scope.savableCustomer.name,
            'description': $scope.savableCustomer.description
        };

        requests.make({
            entity: 'customer',
            method: $scope.state_add_new_customer ? 'create' : 'update',
            id: $scope.savableCustomer.customerID,
            data: newCustomer,
            successFn: function(response) {
                var customer = angular.copy(newCustomer);
                $scope.savableCustomer = {};
                if ($scope.state_add_new_customer) {
                    customer.customerID = response.id;
                    $scope.gridCustomersData.push(customer);
                } else {
                    var field = helpers.getByField($scope.gridCustomersData, 'customerID', response.id);
                    field.name = customer.name;
                    field.description = customer.description;
                }
                $scope.state_add_new_customer = false;
                $scope.state_edit_customer = false;
            }
        });
    };

    $scope.buttonClasses = {'100101': 'btn-xs btn-success btn-active-inactive',
        '100102': 'btn-xs btn-danger btn-active-inactive'};

    $scope.gridCustomersData = [];

    $scope.gridCustomers = {
        data: 'gridCustomersData',
        enableCellSelection: false,
        enableColumnResize: false,
        excludeProperties: ['id'],
        multiSelect: false,
        columnDefs: [
            {field:'name', displayName: translate.getTranslation('_name')},
            {field:'description', displayName: translate.getTranslation('_description'), cellTemplate: "templates/customer_description_cell.tpl"}
        ],
        // rowTemplate: 'templates/row_template.tpl',
        sortInfo: {fields:['name'], directions:['asc']},
        selectedItems: [],
        plugins: [new ngGridFlexibleHeightPlugin({})]
    };

    requests.make({
        entity: 'customers',
        method: 'get',
        successFn: function(response) {
            $scope.gridCustomersData = response.customers;
        }
    });
})

.controller('translateCtrl', function($translate, $scope) {
    $scope.changeLanguage = function (langKey) {
        $translate.use(langKey);
    };
})
