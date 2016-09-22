var Insta = angular.module('Insta', ['LocalStorageModule', 'Insta.config', 'Insta.uiconfig','Insta.translate',
    'ngRoute', 'Insta.alerts']);

Insta.config(function($routeProvider) {
    $routeProvider
        .when('/quality-profile/:inspectionId', {
            templateUrl: 'views/reports/quality_profiles.tpl',
            controller: 'QualityProfilesController'
        })
        .when('/inspection/:inspectionId', {
            templateUrl: 'views/reports/inspection_report.tpl',
            controller: 'InspectionController'
        })
        .when('/assessments/:inspectionId', {
            templateUrl: 'views/reports/assessment_hygiene.tpl',
            controller: 'AssessmentController'
        });
});

Insta.controller('AppController', function ($scope, $http, $window, $location, $routeParams, $sce,
                                            translate, localStorageService, permissions, requests,
                                            QUALITY_PROFILES_IDS, INSTA_SIZE_IDS, INSPECTION_METHOD_IDS, INSPECTION_TYPE_IDS, IMAGES_URL_ROOT) {


    function array_flip( trans ) {
        var key, tmp_ar = {};

        for ( key in trans )
        {
            if ( trans.hasOwnProperty( key ) )
            {
                tmp_ar[trans[key]] = key;
            }
        }

        return tmp_ar;
    }

    $scope.errorStates = {
        main: {state: -1}
    };

    $scope.helper = {
        getStatus: function(feedback, type, options){
            //var options = JSON.parse(options);
            var types = array_flip(INSPECTION_TYPE_IDS);
            var status;

            var res = types[type];
            if (feedback == undefined || feedback[res] == undefined || feedback[res]['acceptance'] == undefined) {
                status = translate.getTranslation('_not_inspected');
                return $sce.trustAsHtml (status);
            }
            status = feedback[res]['acceptance'] ? translate.getTranslation('_accepted') : translate.getTranslation('_not_accepted');

            if (type == INSPECTION_TYPE_IDS ['hygiene'] && feedback['hygiene'] != undefined) {
                var hygieneStatus = feedback['hygiene']['acceptance']
                    ? translate.getTranslation('_accepted')
                    : translate.getTranslation('_not_accepted');

                var instaStatus = translate.getTranslation('_not_inspected');

                if (feedback['insta'] != undefined) {
                  instaStatus = feedback['insta']['acceptance']
                      ? translate.getTranslation('_accepted')
                      : translate.getTranslation('_not_accepted');
                } else {
                    if (options.hygieneSensitive) {
                        instaStatus = hygieneStatus;
                    }
                }

                if (hygieneStatus != instaStatus) {
                  status = hygieneStatus + '<br>' + instaStatus;
                } else {
                  status = hygieneStatus;
                }
            }

            return $sce.trustAsHtml (status);
        },
        getStatusClass: function(feedback, type, options){
            //var options = JSON.parse(options);
            var types = array_flip(INSPECTION_TYPE_IDS);

            var res = types[type];
            if (feedback == undefined || feedback[res] == undefined || feedback[res]['acceptance'] == undefined) {
                return "not-inspected";
            }

            hygieneStatus = true;
            instaStatus   = true;

            if (type == INSPECTION_TYPE_IDS ['hygiene']) {
              hygieneStatus = (feedback ['hygiene'] != undefined) && feedback ['hygiene']['acceptance'];
            }

            instaStatus = (feedback ['insta'] != undefined) && feedback ['insta']['acceptance'];

            if (feedback ['insta'] == undefined) {
              if (options.hygieneSensitive) {
                  return hygieneStatus ? 'accepted' : 'not-accepted';
              } else {
                    return 'partly-inspected';
              }
            } else {
              return (hygieneStatus && instaStatus) ? 'accepted' : 'not-accepted';
            }
        },
        getField: function(feedback, field) {
            var res = '--';
            if (feedback == undefined || feedback[field] == undefined) {
                return res;
            }
            res = feedback[field];
            if (field == 'date') {
                res = res.substr(11, 5);
            }
            return res;
        },
        getFeedbackComments: function(feedback, inspectionType) {
            var res = '';
            var types = array_flip(INSPECTION_TYPE_IDS);

            if (feedback == undefined) {
                return $sce.trustAsHtml ('--');
            }

            if (inspectionType == INSPECTION_TYPE_IDS ['hygiene']) {
              if (feedback ['hygiene'] != undefined) {
                res = feedback ['hygiene']['comment'];
              }
            }

            if (feedback ['insta'] != undefined) {
              if (res != '') {
                res += '<br>';
              }

              res += feedback ['insta']['comment'];
            }

            return $sce.trustAsHtml (res);
        },
        getInvokedByTag: function(feedback, inspectionType) {
            var res = false;
            var types = array_flip(INSPECTION_TYPE_IDS);

            if (feedback == undefined) {
                return false;
            }

            if (inspectionType == INSPECTION_TYPE_IDS ['hygiene']) {
              if (feedback ['hygiene'] != undefined) {
                res |= feedback ['hygiene']['invokedByTag'];
              }
            }

            if (feedback ['insta'] != undefined) {
              res |= feedback ['insta']['invokedByTag'];
            }

            return res;
        },
        resetGlobalIndex: function () {
          $scope.globalIndex = 0;
        },
        getGlobalIndex: function () {
          return ++$scope.globalIndex;
        },
        getMarkerPosition: function (plan, unit) {
            var container = $('.plan-container').first();
            var container_width = container.width();
            var scale = container_width / plan.planWidth;

            return {
                'left': (unit.plan.coordinates.x * scale) - 12.5 + 'px',
                'top': (unit.plan.coordinates.y * scale) - 41 + 'px'
            }
        },
        getMarkerStatusName: function(feedback, type, options){
            var prefix = this.getStatusClass(feedback, type, options);

            return (prefix == 'not-inspected')
                ? 'disabled'
                : prefix;
        },
    };

    $scope.requestAssessments = function(inspectionId, callback) {
        requests.make({
            entity: 'assessment',
            method: 'get',
            id: inspectionId,
            errorScope: $scope.errorStates.main,
            successFn: function (response) {
                $scope.data = response.assessment;

                $scope.unitImages = [];
                $scope.unitsWithPlan = [];

                var unitImages = [];

                angular.forEach($scope.data.units, function(unit, key){
                    if (unit['images'] != undefined && unit['images'].length) {
                        angular.forEach(unit['images'], function(image, k){
                          unitImages.push(image);

                          if (unitImages.length == 6) {
                            $scope.unitImages.push (unitImages);
                            unitImages = [];
                          }
                        });
                    }

                    if (unit['plan'] != undefined) {
                        $scope.unitsWithPlan.push(unit);
                    }
                });

                if (unitImages.length) {
                  $scope.unitImages.push (unitImages);
                }

                $scope.qualityProfiles = {};
                $scope.isClustered = (response.assessment.clustered == 1);
                $scope.isTotalInspection = $scope.data.inspectionMethodID == INSPECTION_METHOD_IDS['total'];
                var a = translate.getTranslation('_a');
                var na = translate.getTranslation('_na');
                $scope.objectGroup = [a,na,a,na,a,na,a,na];

                var samplingData = $scope.isClustered ? response.assessment.samplingMetaData : [response.assessment.samplingMetaData];

                angular.forEach(samplingData, function(item){
                    item['acceptanceLabel'] = item['acceptance'] && !item['completed']
                        ? translate.getTranslation('_accepted_incomplete')
                        : (item['acceptance'] ? translate.getTranslation('_accepted') : translate.getTranslation('_not_accepted'));
                });
                angular.forEach($scope.data.units, function(unit) {
                    $scope.qualityProfiles[unit.qualityProfileID] = true;
                });

                $scope.getQPMatrixEntity = function (QP, y, value) {
                    if ($scope.data.contract.profilesMetaData.hasOwnProperty(QUALITY_PROFILES_IDS[QP])) {
                        if ($scope.qualityProfiles.hasOwnProperty(QP)) {
                            return ($scope.data.contract.profilesMetaData[QUALITY_PROFILES_IDS[QP]][y] == value) ?
                                'X' : '';
                        } else {
                            return '';
                        }
                    }
                };

                if (typeof (callback) !== 'undefined') {
                  callback ();
                }
            }
        });
    };

    var currentLang = localStorageService.get('language');

    if (!localStorageService.get('token')) {
        $window.location.href = '/signin.html';
    }

    permissions.setPermissions(localStorageService.get('user').permissions);

    if (!permissions.isPageAccessAllowed($location.path().substr(1))) {
        $window.location.href = '/signin.html';
    }

    translate.translateAll(currentLang, $scope);

    $scope.QUALITY_PROFILES_IDS = QUALITY_PROFILES_IDS;
    $scope.INSTA_SIZE_IDS = INSTA_SIZE_IDS;
    $scope.INSPECTION_TYPE_IDS = array_flip(INSPECTION_TYPE_IDS);
    $scope.QUALITY_PROFILES = Object.keys(QUALITY_PROFILES_IDS);
    $scope.IMAGES_URL_ROOT = IMAGES_URL_ROOT;

    $scope.translate = function(phrase) {return translate.getTranslation(phrase);};

    $scope.getCellStyle = function(profile) {
        return ((profile - 100800) % 2 == 1) ?
        {'background-color': '#EFEFEF'} :
        {'background-color': '#FFFFFF'};
    };

    $scope.showNonZero = function(val) {
            return val == 0 ? '' : val;
    };

}).controller('InspectionController', function($scope, $routeParams){
    var inspectionId = $routeParams.inspectionId;

    $scope.requestAssessments(inspectionId, function () {
      if ($scope.isClustered) {
        var qualityProfiles = [];
        var restQualityProfiles = [];

        angular.forEach ($scope.QUALITY_PROFILES, function (qp) {
            if ($scope.data.samplingMetaData [qp]) {
              qualityProfiles [qp] = $scope.QUALITY_PROFILES_IDS [qp];
            } else {
              restQualityProfiles [qp] = $scope.QUALITY_PROFILES_IDS [qp];
            }
        });

        //qualityProfiles = qualityProfiles.concat (restQualityProfiles);

        $scope.QUALITY_PROFILES_IDS = qualityProfiles;
        $scope.QUALITY_PROFILES = Object.keys($scope.QUALITY_PROFILES_IDS);
        $scope.profilesLength = $scope.QUALITY_PROFILES.length;
        $scope.colSpan = 6 / $scope.profilesLength;
      }
    });
}).controller('AssessmentController', function($scope, $routeParams, requests){

    var inspectionId = $routeParams.inspectionId;

    $scope.riskEntities = [
        'patient_light', 'bedside', 'sink_faucet', 'screen', 'other_sanitary', 'grip', 'table', 'stands',
        'tech_inst_patients', 'other_tech_inst'
    ];

    $scope.unitsTypes =
        {'_furniture_and_fixtures': 'furn_fixtures',
         '_walls': 'walls',
         '_floors': 'floors'};

    $scope.hygieneDataByIds = {};

    $scope.requestAssessments(inspectionId);

    requests.make({
        entity: 'hygieneProfiles',
        method: 'get',
        successFn: function(response) {
            angular.forEach(response.hygieneProfiles, function(element){
                $scope.hygieneDataByIds[element.hygieneProfileID] = element;
            });
        }
    });

}).controller('QualityProfilesController', function($scope, $routeParams, QUALITY_PROFILES_IDS){
    var inspectionId = $routeParams.inspectionId;
    $scope.requestAssessments(inspectionId);

    $scope.QPArray = Array.apply(null, Array(10))
        .map(function(x,y) {return [1,2,3,4,5]})
        .reduce(function(x,y){return x.concat(y);});

    $scope.qpMatrix = Object.keys(QUALITY_PROFILES_IDS).map(function(profile) {
        return [1,2,3,4,5].map(function(i){
            return {profile: profile, mark: i};
        });
    }).reduce(function(x,y) {return x.concat(y)});


});