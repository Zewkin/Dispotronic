angular.module('Insta').factory('permissions', function () {
    var accessible_permissions = [];

    var pages_permissions = {
        'users': ['GetUsersHandler'],
        'subscribers': ['GetSubscribersHandler'],
        'customers': ['GetCustomersHandler'],
        'contracts': ['GetCustomerContractsHandler'],
        'inspections': ['GetCustomerInspectionsHandler'],
        'keyfigures': ['GetCustomerKeyfiguresHandler']
    };

//    var pages_denied_for_superadmin = [
//        'customers', 'contracts', 'inspections'
//    ];

    return {
        isPageAccessAllowed: function (pagename) {
            self = this;
            var accessible = true;

            // rule exception:
//            if (self.hasPermission('CanGrantAnyRole')) {
//                return pages_denied_for_superadmin.indexOf(pagename) === -1;
//            }

            angular.forEach(pages_permissions[pagename], function(permission) {
                if (!self.hasPermission(permission)) {
                    accessible = false;
                }
            });

            return accessible;
        },
        hasPermission: function (permission) {
            //console.log('permission ' + permission + ' ' + accessible_permissions.indexOf(permission)+'');
            return accessible_permissions.indexOf(permission) !== -1;
        },
        setPermissions: function(permissions) {
            angular.extend(accessible_permissions, permissions);
        },
        getPermissions: function() {
            return accessible_permissions;
        }
    };
});
