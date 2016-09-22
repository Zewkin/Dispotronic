/**
 * INSPINIA - Responsive Admin Theme
 * Copyright 2015 Webapplayers.com
 *
 * Inspinia theme use AngularUI Router to manage routing and views
 * Each view are defined as state.
 * Initial there are written state for all view in theme.
 *
 */
function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {
    $urlRouterProvider.otherwise("/index/customers");

    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: false
    });

    $stateProvider
        .state('index', {
            abstract: true,
            url: "/index",
            templateUrl: "views/common/content.html",
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: 'ui.grid',
                            files: ['js/plugins/uigrid/ui-grid-unstable.js']
                        },
                        {
                            name: 'ui.grid.pagination',
                            files: ['js/plugins/uigrid/ui-grid-unstable.js']
                        },
                        {
                            name: 'ui.grid.autoResize',
                            files: ['js/plugins/uigrid/ui-grid-unstable.js']
                        },
                        {
                            insertBefore: '#loadBefore',
                            files: ['js/plugins/uigrid/ui-grid-unstable.css'],
                        },
                        {
                            insertBefore: '#loadBefore',
                            name: 'localytics.directives',
                            files: ['css/plugins/chosen/chosen.css','js/plugins/chosen/chosen.jquery.js','js/plugins/chosen/chosen.js']

                        },
                    ]);
                }
            }
        })
        .state('index.main', {
            url: "/main",
            templateUrl: "views/main.html",
            data: {pageTitle: 'Global Dashboard'},
        })
        .state('index.subscribers', {
            url: "/subscribers",
            templateUrl: 'views/subscribers.html',
            controller: 'SubscribersController'
        })
        .state('index.users', {
            url: "/users",
            templateUrl: 'views/users.html',
            controller: 'UsersController'
        })
        .state('index.keyfigures', {
            url: "/keyfigures",
            templateUrl: 'views/keyfigures.html',
            controller: 'KeyFiguresController',
        })
        .state('index.frequency', {
            url: "/frequency",
            templateUrl: 'views/frequency.html',
            controller: 'FrequencyController',
        })
        .state('index.damage_assessment', {
            url: "/damage_assessment",
            templateUrl: 'views/damage/damageAssessment.html',
            controller: 'DamageAssessmentController',
        })
        .state('index.contracts', {
            url: "/contracts",
            templateUrl: 'views/contracts.html',
            controller: 'ContractsController',
            resolve: {
                customerID: function ( $stateParams) {
                    return null
                }
            }
        })
        .state('index.unitView', {
            url: "/unitView",
            templateUrl: 'views/unitView.html',
            controller: 'UnitViewController',

        })
        .state('index.inspections', {
            url: "/inspections",
            templateUrl: 'views/inspections.html',
            controller: 'InspectionsController'
        })
        .state('index.profile', {
            url: "/profile",
            templateUrl: 'views/profile.html',
            controller: 'ProfileController'
        })
        .state('index.customers', {
            url: "/customers",
            templateUrl: 'views/customers.html',
            controller: 'CustomersController'
        })

}
angular
    .module('Insta')
    .config(config)
    .run(function ($rootScope, $state, localStorageService) {
        $rootScope.$state = $state;
    });
