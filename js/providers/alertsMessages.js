angular.module('Insta.alerts', ['Insta.translate']).factory('alerts', function ($rootScope, translate){

    var main_errors = {
        1: {error: true, text: translate.getTranslation('_connection_issues')},
        5: {error: true, text: translate.getTranslation('_permission_denied')},
        10: {error: true, text: translate.getTranslation('_server_error')},
        500: {error: true, text: translate.getTranslation('_server_error')}
    };

    var inspection_save_errors = angular.copy(main_errors);
    var unit_save_errors = angular.copy(main_errors);
    var building_save_errors = angular.copy(main_errors);
    var contract_save_errors = angular.copy(main_errors);
    var user_save_errors = angular.copy(main_errors);
    var customers_save_errors = angular.copy(main_errors);
    var subscriber_save_errors = angular.copy(main_errors);

    angular.extend(inspection_save_errors, {
        0: {error: false, text: translate.getTranslation('_inspection_save_success')}
    });

    angular.extend(unit_save_errors, {
        0: {error: false, text: translate.getTranslation('_unit_saved_success')}
    });

    angular.extend(building_save_errors, {
        0: {error: false, text: translate.getTranslation('_building_saved_success')}
    });

    angular.extend(contract_save_errors, {
        0: {error: false, text: translate.getTranslation('_contract_saved_success')}
    });

    angular.extend(user_save_errors, {
        0: {error: false, text: translate.getTranslation('_user_saved_success')},
        11: {error: true, text: translate.getTranslation('_login_exist')}
    });

    angular.extend(customers_save_errors, {
        0: {error: false, text: translate.getTranslation('_customer_saved_success')}
    });

    angular.extend(subscriber_save_errors, {
        0: {error: false, text: translate.getTranslation('_subscriber_saved_success')}
    });

    return {
        main: main_errors,
        inspection_save: inspection_save_errors,
        unit_save: unit_save_errors,
        building_save: building_save_errors,
        contract_save: contract_save_errors,
        user_save: user_save_errors,
        customer_save: customers_save_errors,
        subscriber_save: subscriber_save_errors
    };
});