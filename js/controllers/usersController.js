angular.module('Insta').controller('UsersController', function ($scope, translate, requests,
                                                                helpers, permissions, USER_STATUSES,
                                                                PASSWORD_MIN_LENGTH, $rootScope, localStorageService,$filter,$timeout) {

    var base_roles = [
        {name: '_role_sysadmin', selected: false, id: 100301},
        {name: '_role_subscriber_super_admin', selected: false, id: 100302},
        {name: '_role_subscriber_admin', selected: false, id: 100303},
        {name: '_role_inspector', selected: false, id: 100304},
        {name: '_role_inspector_hygiene', selected: false, id: 100305},
        {name: '_role_employer', selected: false, id: 100306}
    ];

    var granted_on_roles = localStorageService.get('user').grantedOnRoles;
    var to_select_roles = [];

    $scope.roles = {};
    $scope.sysadmin_role_selected = false;
    $scope.is_sysadmin_user = false;

    angular.forEach(base_roles, function(role){
        $scope.roles[role.id] = role.name;

        if (granted_on_roles.indexOf (role.id) != -1) {
          to_select_roles.push (role);

          if (role.name == '_role_sysadmin') {
            $scope.is_sysadmin_user = true;
          }
        }
    });

    $scope.roleClick = function(role) {
        if (role.name == '_role_sysadmin') {
            $scope.sysadmin_role_selected = !role.selected;
        }
        role.selected = !role.selected;
    };

    $scope.page_state = 'initial';
    $scope.user_statuses = {
        100101: '_active',
        100102: '_inactive'
    };

    $scope.page_name = translate.getTranslation('_users');
    $scope.state_add_new_user = false;
    $scope.state_edit_user = false;
    $scope.save_continue = false;

    //@todo: filter roles by permissions
    $scope.roles_to_select = to_select_roles;

    var defaultUser = {};

    $scope.savableUser = {};
    $scope.atLeastOneRoleSelected = function(){
        return to_select_roles.filter(function (item) {return(item.selected);}).length;
    };

    $scope.RoleSelected = function(){
     //   console.log($filter('filter')(to_select_roles, {selected: true}));
        if($filter('filter')(to_select_roles, {selected: true})[0])
        return $filter('filter')(to_select_roles, {selected: true})[0]['id'];

    }


    $scope.switchStatus = function(user) {
        user.statusID = user.statusID == USER_STATUSES.active ? USER_STATUSES.inactive : USER_STATUSES.active;
        //send ajax query
        var requestParams = {
            entity: 'user',
            method: 'update',
            id: user.userID,
            data: {statusID: user.statusID}
        };
        requests.make(requestParams);
    };

    $scope.deleteUser = function(user) {
        //send ajax query
        var msg = translate.getTranslation('_are_you_sure_to_delete_user?');
        if (confirm(msg)) {
            for (var index in $scope.gridUsersData) {
                if ($scope.gridUsersData[index].userID == user.userID) {
                    $scope.gridUsersData.splice(index, 1);
                    break;
                }
            }

            var requestParams = {
                entity: 'user',
                method: 'delete',
                id: user.userID
            };

            requests.make(requestParams);
        }
    };
    $scope.showUserAddForm = function(){
        $scope.savableUser = angular.copy(defaultUser);
        $scope.state_add_new_user = true;
        $scope.state_edit_user = false;
        $scope.user = null;
    };

    $scope.editUser = function(user) {
        $scope.state_edit_user = true;
        $scope.state_add_new_user = false;
        $scope.user = angular.copy(user);

        $scope.savableUser = angular.copy(user);

        for (var attr in user) {
            $scope.savableUser[attr] = user[attr];
        }

        angular.forEach(to_select_roles, function(role) {
            if (user.roles.indexOf(role.id) !== -1) {
                if (role.selected == false) {
                    $scope.roleClick(role);
                }
            } else {
              role.selected = false;
            }
        });

        $scope.customerUpdate($scope.savableUser.subscriberID, false);
    };

    $scope.savePerformer = function() {
        if ($scope.savableUser.hasOwnProperty('password') &&
            $scope.savableUser.password != $scope.savableUser.passwordRepeat
        ) {
            $scope.page_state = 'passwords_mismatch';
            $rootScope.addAlert(translate.getTranslation('_passwords_mismatch'), true);
            return;
        } else if ( $scope.savableUser.hasOwnProperty('password') &&
                    $scope.savableUser.password.length < PASSWORD_MIN_LENGTH
        ) {
            $scope.page_state = 'password_too_short';
            $scope.min_password_length = PASSWORD_MIN_LENGTH;

            $rootScope.addAlert(
                translate.getTranslation('_password_too_short')
                    .replace('{length}', PASSWORD_MIN_LENGTH),
                true);
            return;
        } else {
            if ($scope.state_add_new_user) {
                $scope.page_state = 'add_success';
            } else {
                $scope.page_state = 'edit_success';
            }

            var new_roles = [];
            //an exception for the sysadmin_role (can't have another roles)
            if ($scope.sysadmin_role_selected) {
                new_roles.push(100301);
            } else {
                angular.forEach(to_select_roles, function (role, key) {
                    if (role.selected) {
                        new_roles.push(role.id);
                    }
                });
            }

            if(new_roles.indexOf(100306)==-1){
                $scope.savableUser.customers = [];
            }
            var newUser = {
                "login": $scope.savableUser.login,
                "roles": new_roles,
                "firstName": $scope.savableUser.firstName,
                "lastName": $scope.savableUser.lastName,
                "customers": $scope.savableUser.customers,
            };

            if ($scope.savableUser.password) {
                newUser.password = $scope.savableUser.password;
            }

            if ($scope.savableUser.hasOwnProperty('subscriberID')) {
                newUser.subscriberID = $scope.savableUser.subscriberID;
            }

            //@todo add subscriberId if needed (superadmin only feature)

            var requestParams = {
                entity: 'user',
                data: newUser
            };

            if ($scope.state_add_new_user) {
                requestParams.method = 'create';
                requestParams.successFn = function(response) {
                    newUser.userID = response.id;
                    newUser.statusID = USER_STATUSES.active;
                    $scope.gridUsersData.push(newUser);
                    $scope.state_add_new_user = $scope.save_continue;
                    //$scope.getUsersData();
                }
            } else {
                requestParams.method = 'update';
                requestParams.id = $scope.savableUser.userID;
                requestParams.successFn = function() {
                    var user = helpers.getByField($scope.gridUsersData, 'userID', $scope.savableUser.userID);
                    var attr;
                    for (attr in newUser) {
                        user[attr] = newUser[attr];
                    }
                    $scope.state_edit_user = $scope.save_continue;


                    //$scope.gridUsers.$gridServices.DomUtilityService.RebuildGrid($scope.gridUsers.$gridScope, $scope.gridUsers.ngGrid);
                    //$scope.getUsersData();
                };
            }

            requests.make(requestParams);

        }
    };



    $scope.showRoles = function(rolesString) {
        var roles = rolesString.split(',');
        roles = roles.sort();
        return roles.map(function(role){
            return translate.getTranslation($scope.roles[role]);
        }).join(',');
    };

    $scope.getRowStyle = function(col, row) {
        var style = 'table_row';
        style += ' ' + col.colIndex();

        if ($scope.user_data.userID == row.entity['userID']) {
          style += ' current-user';
        }

        return style;
    };

    $scope.buttonClasses = {'100101': 'label label-success', '100102': 'label label-danger'};

    $scope.gridUsersData = [];

    $scope.gridUsers = {
        data: 'gridUsersData',
        enableCellSelection: false,
        multiSelect: false,
        enableColumnResize: true,
        enableColumnReordering: true,
        excludeProperties: ['id'],
        columnDefs: [
            {field:'firstName', displayName: translate.getTranslation('_name'), width:200},
            {field:'lastName', displayName: translate.getTranslation('_surname'),},
            {field:'login', displayName: translate.getTranslation('_login')},
            {field:'roles', displayName: translate.getTranslation('_roles'), cellTemplate: "templates/user_roles_cell.tpl"},
            {field:'customers', displayName: translate.getTranslation('_customer'), width:100, cellTemplate: "templates/user_roles_customer_cell.tpl" },
            {field:'statusID', displayName: translate.getTranslation('_status'), cellTemplate: "templates/user_status_cell.tpl", width: 150}
        ],
        // rowTemplate: 'templates/row_template.tpl',
        sortInfo: {fields:['firstName'], directions:['asc']},
        selectedItems: [],
        plugins: [new ngGridFlexibleHeightPlugin({})]
    };

    if (permissions.hasPermission('GetSubscribersHandler')) {
        requests.make({
            entity: 'subscribers',
            method: 'get',
            successFn: function(response) {
                $scope.subscribersData = response.subscribers.sort(helpers.stringSortFunc);
            }
        });
    }

    if (permissions.hasPermission('CanGrantAnyRole')) {
        $scope.getByField = helpers.getByField;
        $scope.performersColDef.splice(3,0, {
            field: 'subscriberID',
            displayName: translate.getTranslation('_subscriber'),
            cellTemplate: "<div style=\"padding: 5px;\">{{getByField(subscribersData, 'subscriberID', row.entity['subscriberID']).name}}</div>",
            width: "150px",
            sortFn: function(a,b) {
                return helpers.stringSortFunc(
                    helpers.getByField($scope.subscribersData, 'subscriberID', a),
                    helpers.getByField($scope.subscribersData, 'subscriberID', b)
                );
            }
        });
        $scope.gridUsers.showGroupPanel = true;
        $scope.gridUsers.groups = ['subscriberID'];
        $scope.gridUsers.aggregateTemplate = 'templates/subscriber_aggregate.tpl';
    }

    requests.make({
        entity: 'users',
        method: 'get',
        successFn: function(response) {
            $scope.gridUsersData = response.users;
            console.log($scope.gridUsersData);
        }
    });

    $scope.customersData = [];
    $scope.getUsersData = function () {
        requests.make({
            entity: 'customers',
            method: 'get',
            successFn: function (response) {
                $scope.customersData = response.customers;
                $scope.customers = response.customers;
            }
        });
    };

    $scope.getUsersData();

    $scope.getCustomers = function (customers){
        var data = [];
        angular.forEach($scope.customersData,function(value){

            if(customers && customers.indexOf(value.customerID)!=-1) {
                data.push (value);
            }
        })
        return data;
    }
    $scope.customerUpdate =function(subscriberID, clear_assigned_customers){
        $scope.customersData = [];
        var customersIDs = [];

        if (clear_assigned_customers
            && ($scope.user != null)
            && (typeof $scope.user.customers != 'undefined')
        ) {
            $scope.savableUser.customers = angular.copy($scope.user.customers);
        }

        angular.forEach($scope.customers,function(value){
            if(value.subscriberID == subscriberID){
                $scope.customersData.push(value);
                customersIDs.push(value.customerID)
            }
        })

        if (clear_assigned_customers) {

            if (($scope.user != null)
                && (typeof $scope.user.customers != 'undefined')
            ) {
                $scope.savableUser.customers = $scope.getIntersectionOfArray(
                    $scope.savableUser.customers,
                    customersIDs
                )
            } else {
                $scope.savableUser.customers = [];
            }
        }
    }

    $scope.getIntersectionOfArray = function(array1,array2){
        var array3 = [];

        angular.forEach(array1, function(value1,index){
            angular.forEach(array2, function(value2,index1){
                if(value1 == value2){
                    array3.push(value1)
                }
            })
        });

        return array3;
    }
});
