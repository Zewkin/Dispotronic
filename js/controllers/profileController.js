angular.module('Insta').controller('ProfileController', function ($scope, $http, translate,
                                                                  requests, localStorageService) {

    $scope.page_name = translate.getTranslation('_profile');

    $scope.errors = {
        main: {
            1: {error: true, text: translate.getTranslation('_connection_issues')},
            500: {error: true, text: translate.getTranslation('_server_error')}
        }
    };

    $scope.errorStates = {
        main: {state: -1}
    };

    $scope.roles = {};
    var roles = [
        {name: '_role_subscriber_admin', selected: false, id: 100303},
        {name: '_role_inspector', selected: false, id: 100304},
        {name: '_role_sysadmin', selected: false, id: 100301},
        {name: '_role_subscriber_super_admin', selected: false, id: 100302},
        {name: '_role_inspector_hygiene', selected: false, id: 100305}
    ];

    angular.forEach(roles, function(role){
        $scope.roles[role.id] = role.name;
    });

    var user = localStorageService.get('user');
    $scope.user = user;
});