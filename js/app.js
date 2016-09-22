var Insta = angular.module('Insta',
    [
        'ngRoute',
        'ui.router',
        'LocalStorageModule',
        'ngGrid', 'ui.grid', 'ui.grid.pagination', 'ui.grid.selection','ui.grid.exporter', 'ui.grid.expandable', 'ui.grid.edit', 'ui.grid.grouping', 'ui.grid.cellNav', 'ui.grid.validate',
        'ui.bootstrap',
        'ngImgCrop',
        'leaflet-directive',
        'Insta.config',
        'Insta.alerts',
        'Insta.translate',
        'Insta.plans',
        'naif.base64',
        'fundoo.services',
        'Insta.uiconfig',
        'Insta.importCSV',
        'restangular',
        'oc.lazyLoad',
        'ngTagsInput',
        'ngIdle',
        'localytics.directives',
        'ngSanitize',
        'ui.bootstrap.datepicker',
        'gm.datepickerMultiSelect',
        'tmh.dynamicLocale',
        'pascalprecht.translate'
    ]);

/* converts complex identifiers - e.g. obj.prop1.prop12.prop123 into array - [scope, index],
 * where scope would be pointer to obj.prop1.prop12 and index - 'prop123'
 */
function stringToScope(string, scope) {
    var watched_index, watched_scope_var;
    string = string.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    string = string.replace(/^\./, '');           // strip a leading dot
    var a = string.split('.');
    if (a.length > 1) {
        while (a.length) {
            var n = a.shift();
            if (n in scope) {
                watched_scope_var = scope;
                watched_index = n;
                scope = scope[n];
            } else {
                //an exception for values that end on [] - i.e. something that is array
                if (n.substr(n.length - 2, 2) == '[]') {
                    watched_scope_var = scope;
                    n = n.substr(0, n.length - 2);
                    watched_index = n;
                    scope = scope[n];
                } else {
                }
            }
        }
    } else {
        watched_scope_var = scope;
        watched_index = string;
    }

    return [watched_scope_var, watched_index];
}

Insta.config(function ($routeProvider, $locationProvider, $tooltipProvider, $httpProvider) {
    $tooltipProvider.options({appendToBody: true});

    function hide(res) {
        if (res.config.url.search("api") != -1) {
            clearTimeout(res.config.loaderTimeout);
            $(".global-loading-indicator").hide();
        }
    }

    function loaderInterceptor($q) {
        var loaderTimeout = [];

        return {
            request: function (config) {
                if (config.url.search("api") != -1) {
                    loaderTimeout = setTimeout(function () {
                        $(".global-loading-indicator").show();
                    }, 300);

                    config.loaderTimeout = loaderTimeout;
                }
                return config;
            },

            response: function (res) {
                hide(res);
                return res;
            },

            responseError: function (res) {
                hide(res);
                return $q.reject(res);
            }
        }
    }

    $httpProvider.interceptors.push(loaderInterceptor);
}).config(function ($routeProvider, RestangularProvider, API_CONFIG) {

        RestangularProvider.setBaseUrl(API_CONFIG.api_prefix);
        RestangularProvider.setRequestInterceptor(function (elem, operation, what) {
            if (operation === 'put') {
                elem._id = undefined;
                return elem;
            }
            return elem;
        });
        RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response, deferred) {
            var extractedData;
            if (operation === "getList") {
                extractedData = data[what]
            } else {
                extractedData = data[what];
            }
            return extractedData;
        });
    })
    .config(function (tagsInputConfigProvider) {
        tagsInputConfigProvider
            .setDefaults('tagsInput', {
                placeholder: '',
                minLength: 1,
                addOnEnter: true
            })
            .setDefaults('autoComplete', {
                debounceDelay: 200,
                loadOnDownArrow: true,
                loadOnEmpty: true
            })
    }).config(function ($provide) {
        $provide.decorator('uibDaypickerDirective', function ($delegate,$rootScope) {
            var directive = $delegate[0],
                link = directive.link;


            //directive.controller = function($scope, $timeout) {
            //   // angular.extend(this, $controller(controllerName, {$scope: $scope}));
            //    $timeout(function() {
            //        //$scope.name = "from the decorator now";
            //    }, 0);
            //};

            directive.compile = function(rootScope) {
                return function(scope, element, attrs, ctrls) {
                    link.apply(this, arguments);



                    var ctrl = angular.isArray(ctrls) ? ctrls[0] : ctrls;
                    scope.move = function (direction){
                        var activeDate = angular.copy(ctrl.activeDate);
                        var year = activeDate.getFullYear();
                        var month = activeDate.getMonth() + direction;

                        activeDate.setFullYear(year, month, 1);

                        $rootScope.newvar = activeDate;
                        $rootScope.$broadcast('myCustomEvent', function(result) {
                            if(result) {
                                scope.$parent.move(0);
                                //ctrl.refreshView();
                            }
                        });
                    };

                    scope.select = function(date){
                        scope.$parent.select(date);
                    }


                    if (ctrls[1]) {
                        scope.$on('refreshDatepicker', function (event, date) {
                            ctrl.activeDate = date;
                            ctrl.refreshView();
                        });
                    }

                    if(!angular.isDefined(scope.$parent.selectedDates)) return;

                    scope.$parent.$watchCollection('selectedDates', update);

                    /*
                     Fires when date is selected or when month is changed.
                     UI bootstrap versions before 0.14.0 had just one controller DatepickerController,
                     now they have UibDatepickerController, UibDaypickerController and DatepickerController
                     see more on https://github.com/angular-ui/bootstrap/commit/44354f67e55c571df28b09e26a314a845a3b7397?diff=split#diff-6240fc17e068eaeef7095937a1d63eaeL251
                     and https://github.com/angular-ui/bootstrap/commit/44354f67e55c571df28b09e26a314a845a3b7397?diff=split#diff-6240fc17e068eaeef7095937a1d63eaeR462
                     */


                    scope.$watch(function () {
                        return ctrl.activeDate.getTime();
                    }, update);

                    function update() {
                        angular.forEach(scope.rows, function (row) {
                            angular.forEach(row, function (day) {
                                day.selected = scope.selectedDates.indexOf(day.date.setHours(0, 0, 0, 0)) > -1
                            });
                        });
                    }
                }
            };
            return $delegate;

        });
    })
    .config(function ($provide) {
        $provide.decorator('uibMonthpickerDirective', function ($delegate,$rootScope) {
            var directive = $delegate[0],
                link = directive.link;

            directive.compile = function(rootScope) {
                return function(scope, element, attrs, ctrls, rootScope) {
                    link.apply(this, arguments);

                    if (scope.$parent.minMode == 'day') {
                        var ctrl = angular.isArray(ctrls) ? ctrls[0] : ctrls;

                        scope.select = function (date) {
                            $rootScope.newvar = date;
                            $rootScope.$broadcast('myCustomEvent', function(result) {
                                if(result) {
                                    scope.$parent.select(date);
                                    //ctrl.refreshView();
                                }
                            });
                        }
                    }
                }
            }

            return $delegate;
        });
    }).config(function(tmhDynamicLocaleProvider) {
        tmhDynamicLocaleProvider.localeLocationPattern('/js/angular/i18n/angular-locale_{{locale}}.js');
    })
    .controller('AppController', function ($scope, $http, $modal, $window, $location, translate,
                                           localStorageService, permissions, IMAGES_URL_ROOT,
                                           $rootScope, $timeout, createDialog, ADDITIONAL_CSS_FILE, CUSTOM_FAVICON,
                                           APP_TITLE, DEFAULT_LANGUAGE, Restangular, helpers, requests, tmhDynamicLocale) {
        Restangular.setDefaultHeaders({
            'Content-Type': 'application/json; charset=UTF-8',
            'x-auth-token': localStorageService.get('token')
        });

        $scope.showSidebar = true;
        $scope.toggleSidebar = function () {
            $scope.showSidebar = !$scope.showSidebar;
        };

        $rootScope.$on ('$routeChangeStart', function () {
            console.log('Route change fired');
            if (!localStorageService.get ('token')) {
                $window.location.href = '/signin.html';
            }
        });

        $scope.changeRoute = function () {
                      console.log('Route change fired');
            /**
             * if some memory leak occurs - reload page (artificial limit - 500Mb)
             * reloading page
             */
            if (window.performance.memory.usedJSHeapSize > 500000000) {
                window.location.reload();
            }
        };

        var currentLang = localStorageService.get('language') || DEFAULT_LANGUAGE;

        if (ADDITIONAL_CSS_FILE) {
            var cssNode = $('<link rel="stylesheet" type="text/css" href="' + ADDITIONAL_CSS_FILE + '">');
            $('head').append(cssNode);
        }

        if (CUSTOM_FAVICON) {
            var faviconNode = '<link rel="shortcut icon" href="' + CUSTOM_FAVICON + '" type="image/x-icon"/>';
            $('head').append(faviconNode);
        }

        if (currentLang != 'en') {
            tmhDynamicLocale.set('sv-se');
        }

        var titleNode = $('<title>' + APP_TITLE + '</title>');
        $('head').append(titleNode);


        permissions.setPermissions(localStorageService.get('user').permissions);

        if (!permissions.isPageAccessAllowed($location.path().substr(1))) {
            $window.location.href = '/';
        }

        $scope.user_data = localStorageService.get('user');

        $scope.isCurrentPage = function (page) {
            return location.hash.indexOf(page) != -1;
        };

        $scope.changeLang = function (lang) {
            translate.translateAll(lang, $scope);
        };

        $scope.signout = function () {
            var lang = localStorageService.get('language');
            localStorageService.clearAll();
            localStorageService.set('language', lang);
            $window.location.href = '/signin.html';
        };

        $scope.imagesUrlRoot = IMAGES_URL_ROOT;

        $scope.hasPermission = permissions.hasPermission;
        $scope.isPageAccessAllowed = permissions.isPageAccessAllowed;

        translate.translateAll(currentLang, $scope);

        $scope.translate = function (phrase) {
            return translate.getTranslation(phrase);
        };


        // requests.make({
        //     entity: 'customers',
        //     method: 'get',
        //     successFn: function (response) {
        //         $scope.customers = response.customers.sort(helpers.stringSortFunc);
        //
        //     }
        // }, true);


        $scope.getRowStyle = function (col) {
            var style = 'table_row';
            style += ' ' + col.colIndex();
            return style;
        };
        /* test routine
         setTimeout(function() {
         $scope.changeLang('english');
         $scope.changeLang('german');
         console.log('translated');
         }, 4000); */

        $rootScope.erHidden = true;
        $rootScope.erFaded = false;

        $rootScope.addAlert = function (msg, error, timeoutToShow) {
            timeoutToShow = timeoutToShow || 2000;
            $rootScope.alertMessage = msg;
            $rootScope.error = error;
            $rootScope.erHidden = false;
            $rootScope.erFaded = false;

            $timeout(function () {
                $rootScope.erFaded = true;
            }, timeoutToShow / 2);

            $timeout(function () {
                $rootScope.erHidden = true;
            }, timeoutToShow);
        };

        $rootScope.importDialog = function (importTpl, controller, cb, extraData) {

            if (!extraData) {
                extraData = [];
            }

            createDialog(
                'templates/import.tpl?' + Math.random(),
                {
                    id: 'importUnitsDialog',
                    title: translate.getTranslation('_preview_import'),
                    backdrop: true,
                    controller: controller,
                    css: {
                        top: '10px',
                        bottom: 'auto',
                        overflowY: 'visible',
//                        width: '917px'
                        margin: '20px'
                    },
                    cancel: {
                        label: translate.getTranslation('_close')
                    }
                },
                extraData
            );
        };

        $rootScope.getValidationError = function (field, value, pos) {
            return translate.getTranslation('_row')
                + " '" + field + "':" + " "
                + translate.getTranslation('_incorrect_field') + ' ' + value + ' '
                + translate.getTranslation('_at_position') + ' ' + pos;
        };

        $scope.messages_number = 5;
        $scope.visible = true;
    })

    Insta.run(function($http, localStorageService) {
        $http.defaults.headers.common['x-auth-token'] = localStorageService.get('token');
    })

function onNumberKeyPress(event) {
    if (!((event.keyCode >= 48 && event.keyCode <= 58) ||
        (event.keyCode >= 96 && event.keyCode <= 105) ||
        (event.keyCode == 190 || event.keyCode <= 46))) {
        event.preventDefault();
    }
}
