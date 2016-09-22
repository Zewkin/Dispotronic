angular.module('Insta.plans', [])

.factory('PlanService', function($http, API_CONFIG) {

        return {
            getPlans: function(id) {
                return $http.get(API_CONFIG.api_prefix + '/building/' + id + '/plans').then(function(response) {
                    return response;
                })
            },
            addPlan: function(id, plan) {
                return $http.post(API_CONFIG.api_prefix + '/building/' + id + '/plan', plan).then(function(response) {
                    return response;
                })
            },
            cropPlan: function(id, plan) {
                return $http.put(API_CONFIG.api_prefix + '/plan/' + id, plan).then(function(response) {
                    return response;
                })
            },
            deletePlan: function(id) {
                return $http.delete(API_CONFIG.api_prefix + '/plan/' + id).then(function(response) {
                    return response;
                })
            },
            getUnits: function(id) {
                return $http.get(API_CONFIG.api_prefix + '/building/' + id + '/units').then(function(response) {
                    return response;
                })
            },
        }
    })
    // angular.module('Insta').factory(
    //     "plansManageCtrl",
    //     ['translate', 'helpers', '$q', 'requests',
    //         function (translate, helpers, $q, requests) {
    //             return function(
    //                 $rootScope, $scope, localStorageService, selectedBuilding, $window, $http, IMAGES_URL_ROOT, API_CONFIG, API_ERRORS, $tooltip, alerts
    //             ) {
    //                 var headers_defaults = {
    //                     'Content-Type': 'application/json',
    //                     "x-auth-token": localStorageService.get('token')
    //                 };
    //
    //                 // captions
    //                 $scope.btnAddPlan = translate.getTranslation('_add_plan');
    //                 $scope.ttDeleteAlert = translate.getTranslation('_are_you_sure_to_delete_plan?')
    //                 $scope.ttpManageMarkers = translate.getTranslation('_manage_markers');
    //                 $scope.ttpDeletePlan = translate.getTranslation('_delete_plan');
    //                 $scope.ttpRenamePlan = translate.getTranslation('_rename_plan');
    //                 $scope.ttpDeleteMarker = translate.getTranslation('_delete_marker');
    //                 $scope.lblPlanName = translate.getTranslation('_name');
    //                 $scope.lblPlanFile = translate.getTranslation('_file');
    //                 $scope.btnSave = translate.getTranslation('_save');
    //                 $scope.ttpSearchUnits = translate.getTranslation('_search_units');
    //
    //                 $scope.stateAddPlan = false;
    //                 $scope.stateCropPlan = false;
    //                 $scope.stateManageMarkers = false;
    //                 $scope.stateRenamePlan = false;
    //                 $scope.formIsValid = false;
    //                 $scope.plan = {};
    //                 $scope.markers = {};
    //                 $scope.draggedAssignedMarker = null;
    //                 $scope.propeller = null;
    //                 $scope.map = null;
    //                 $scope.map_layer = null;
    //                 $scope.map_markers = null;
    //
    //                 $scope.addPlan = function() {
    //                     $scope.plan.name = null;
    //                     $("#planFileName").val('');
    //
    //                     $scope.stateAddPlan = true;
    //                     $scope.stateCropPlan = false;
    //                     $scope.stateManageMarkers = false;
    //                 };
    //
    //                 $scope.fileSelected = function(el) {
    //                     var reader = new FileReader();
    //
    //                     reader.onload = function (e) {
    //                         $scope.plan.file = reader.result.match(/,(.*)$/)[1];
    //                         $scope.plan.ext = el.files[0]["name"].split('.')[1].toLowerCase();
    //                         $scope.$apply();
    //                     };
    //
    //                     reader.readAsDataURL(el.files[0]);
    //                 };
    //
    //                 $scope.errorHandler = function(response, status) {
    //                     var messages = alerts.main;
    //
    //                     if ([500, 404].indexOf(status) !== -1 ) {
    //                         if (messages.hasOwnProperty(500)) {
    //                             $rootScope.addAlert(messages[500].text, true);
    //                         }
    //                     } else if ((typeof response.status != 'undefined') &&
    //                         [API_ERRORS.TOKEN_INVALID,API_ERRORS.TOKEN_EXPIRED].indexOf(response.status.code) !== -1
    //                     ) {
    //                         /* wrong/expired token */
    //                         localStorageService.clearAll ();
    //                         $window.location = '/signin.html';
    //                     } else {
    //                         if (messages.hasOwnProperty(response.status.code)) {
    //                             $rootScope.addAlert(messages[response.status.code].text, true);
    //                         }
    //
    //                         console.log(response);
    //                     }
    //                 }
    //
    //                 $scope.getPlans = function(callback) {
    //                     $http({
    //                         method: 'GET',
    //                         url: API_CONFIG.api_prefix + '/building/' + selectedBuilding["buildingID"] + '/plans',
    //                         headers: headers_defaults
    //                     }).success(function (response) {
    //                         if (response.status.code == 0) {
    //                             $scope.plans = response.plans;
    //
    //                            if (callback) {
    //                                callback();
    //                            }
    //                         }
    //
    //                     }).error(function(response, status) {
    //                         $scope.errorHandler(response, status);
    //                     });
    //                 };
    //
    //                 $scope.getUnits = function(callback) {
    //                     $http({
    //                         method: 'GET',
    //                         url: API_CONFIG.api_prefix + '/building/' + selectedBuilding["buildingID"] + '/units',
    //                         headers: headers_defaults
    //                     }).success(function (response) {
    //                         if (response.status.code == 0) {
    //                             $scope.units = response.units;
    //
    //                             if (typeof callback != 'undefined') {
    //                                 callback();
    //                             }
    //                         }
    //                     }).error(function(response, status) {
    //                         $scope.errorHandler(response, status);
    //                     });
    //                 };
    //
    //                 $scope.initRenamePlan = function(plan, $event) {
    //                     $event.stopPropagation();
    //
    //                     $scope.makeActive(
    //                         $event.target.parentElement.parentElement
    //                     );
    //
    //                     $scope.selectedPlanId = plan.planID;
    //                     $scope.plan.name = plan.planName;
    //                     $scope.stateAddPlan = false;
    //                     $scope.stateManageMarkers = false;
    //                     $scope.stateRenamePlan = true;
    //                 };
    //
    //                 $scope.deletePlan = function(planID, $event) {
    //                     $event.stopPropagation();
    //
    //                     if (window.confirm($scope.ttDeleteAlert)) {
    //                         $http({
    //                             method: 'DELETE',
    //                             url: API_CONFIG.api_prefix + '/plan/' + planID,
    //                             headers: headers_defaults
    //                         }).success(function (response) {
    //                             if (response.status.code == 0) {
    //                                 $scope.stateManageMarkers = false;
    //                                 $scope.stateAddPlan = false;
    //                                 $scope.stateRenamePlan = false;
    //                                 $scope.getPlans();
    //                             }
    //                         }).error(function(response, status) {
    //                             $scope.errorHandler(response, status);
    //                         });
    //                     }
    //                 };
    //
    //                 $scope.savePlan = function() {
    //                     $http({
    //                         method: 'POST',
    //                         url: API_CONFIG.api_prefix + '/building/' + selectedBuilding["buildingID"] + '/plan',
    //                         headers: headers_defaults,
    //                         data: angular.toJson({
    //                             planName: $scope.plan.name,
    //                             planFile: $scope.plan.file,
    //                             planFileExt: $scope.plan.ext
    //                         })
    //                     }).success(function (response) {
    //                         if (response.status.code == 0) {
    //                             $scope.stateAddPlan = false;
    //                             $scope.selectedPlanId = response.plan.planID;
    //                             $scope.planFileSize = response.plan.planWidth;
    //                             $scope.initCropPlan(response.plan);
    //                         }
    //                     }).error(function(response, status) {
    //                         $scope.errorHandler(response, status);
    //                     });
    //                 };
    //
    //                 $scope.renamePlan = function () {
    //                     $http({
    //                         method: 'PUT',
    //                         url: API_CONFIG.api_prefix + '/plan/' + $scope.selectedPlanId,
    //                         headers: headers_defaults,
    //                         data: angular.toJson({
    //                             planName: $scope.plan.name
    //                         })
    //                     }).success(function (response) {
    //                         $scope.stateRenamePlan = false;
    //                         $scope.getPlans();
    //                     }).error(function(response, status) {
    //                         $scope.errorHandler(response, status);
    //                     });
    //                 };
    //
    //                 $scope.updateCroppedImage = function(dataURI) {
    //                     $scope.planCroppedImage = dataURI;
    //                 };
    //
    //                 $scope.saveCropPlan = function(selectedPlanId) {
    //                     $http({
    //                         method: 'PUT',
    //                         url: API_CONFIG.api_prefix + '/plan/' + selectedPlanId,
    //                         headers: headers_defaults,
    //                         data: angular.toJson({
    //                             planFile: $scope.planCroppedImage.match(/,(.*)$/)[1]
    //                         })
    //                     }).success(function (response) {
    //                         $scope.stateAddPlan = false;
    //                         $scope.stateCropPlan = false;
    //                         $scope.getPlans();
    //                     }).error(function(response, status) {
    //                         $scope.errorHandler(response, status);
    //                     });
    //                 };
    //
    //                 $scope.initCropPlan = function(planObj) {
    //                     $scope.stateCropPlan = true;
    //                     $scope.planCroppedImage = '';
    //                     f(IMAGES_URL_ROOT + planObj.src, function(base64Img){
    //                         $scope.$apply(function($scope) {
    //                             $scope.planImage = base64Img;
    //                         });
    //                     });
    //                 };
    //
    //                 $scope.getIcon = function (is_active) {
    //                     var iconUrl = is_active
    //                         ? 'css/images/marker-icon.png'
    //                         : 'css/images/marker-icon-disabled.png';
    //
    //                     return L.icon({
    //                         iconUrl: iconUrl,
    //                         shadowUrl: 'css/images/marker-shadow.png',
    //                         iconSize: [25, 41],
    //                         iconAnchor: [12, 41],
    //                         popupAnchor: [1, -34],
    //                         shadowSize: [41, 41]
    //                     });
    //                 };
    //
    //                 $scope.openMarkerPopup = function (marker) {
    //                     var unit = marker.options.unit;
    //
    //                     if (typeof marker.getPopup() != 'undefined') {
    //                         marker.unbindPopup();
    //                     }
    //
    //                     marker.bindPopup(
    //                         unit.storey + ' / ' + unit.roomNumber + ' (' + unit.unitSize + 'm<sup style="font-size:0.5em;">2</sup>)<br/><strong>' + unit.description + '</strong>'
    //                     );
    //                     marker.openPopup()
    //                     ;
    //                 }
    //
    //                 $scope.drawUnitMarker = function(unit, coords, is_active) {
    //                     var latlng;
    //
    //                     if ((coords.lat != undefined) && (coords.lng != undefined)) {
    //                         latlng = coords;
    //                     } else {
    //                         latlng = $scope.map.unproject(
    //                             new L.Point(coords.x, coords.y), $scope.map.getMaxZoom()
    //                         );
    //                     }
    //
    //                     if (is_active) {
    //                         $scope.currentMarker = $.extend({}, marker);
    //                     }
    //
    //                     var iconUrl = is_active
    //                         ? 'css/images/marker-icon.png'
    //                         : 'css/images/marker-icon-disabled.png';
    //
    //                     var marker = L.marker(latlng, {
    //                         unit: unit,
    //                         draggable: true,
    //                         zIndexOffset: 1000,
    //                         icon: $scope.getIcon(is_active),
    //                         contextmenu: true,
    //                         contextmenuItems: [{
    //                             text: $scope.ttpDeleteMarker,
    //                             index: 0,
    //                             callback: function() {
    //                                 $http({
    //                                     method: 'PUT',
    //                                     url: API_CONFIG.api_prefix + '/unit/' + unit.unitID,
    //                                     headers: headers_defaults,
    //                                     data: angular.toJson({
    //                                         planID: null
    //                                     })
    //                                 }).success(function() {
    //                                     $scope.getUnits(initDraggableMarkers());
    //                                     $scope.map.removeLayer(marker);
    //                                     delete($scope.markers[unit.unitID]);
    //                                 }).error(function(response, status) {
    //                                     $scope.errorHandler(response, status);
    //                                 });
    //                             }
    //                         }]
    //                     }).addTo($scope.map_markers);
    //
    //                     marker.on('click', function ($e) {
    //                         $scope.openMarkerPopup(this);
    //                         $scope.highlightUnitMarker(marker.options.unit, $e);
    //                     });
    //
    //                     marker.on('dragstart', function ($e) {
    //                         $scope.highlightUnitMarker(marker.options.unit, $e);
    //                         this.old_position = this.getLatLng();
    //                     });
    //
    //                     marker.on('contextmenu', function ($e) {
    //                         $scope.highlightUnitMarker(marker.options.unit, $e);
    //                     });
    //
    //                     $scope.markers[unit.unitID] = marker;
    //
    //                     marker.on('dragend', function (e) {
    //                         var unitID = e.target.options.unit.unitID;
    //                         var point = $scope.map.project(e.target._latlng, $scope.map.getMaxZoom());
    //
    //                         $("#units-list-container .unit-marker[data-unit-id=" + unitID + "]").addClass("assigned");
    //
    //                         if ((point.x < 0) || (point.x > $scope.currentPlan.planWidth)
    //                             || (point.y < 0) || (point.y > $scope.currentPlan.planHeight)
    //                         ) {
    //                             this.setLatLng(this.old_position);
    //                         } else {
    //                             $http({
    //                                 method: 'PUT',
    //                                 url: API_CONFIG.api_prefix + '/unit/' + unitID,
    //                                 headers: headers_defaults,
    //                                 data: angular.toJson({
    //                                     planID: $scope.currentPlan.planID,
    //                                     planCoordinates: {
    //                                         x: point.x,
    //                                         y: point.y
    //                                     }
    //                                 })
    //                             }).success(function() {
    //                                 setTimeout(function() {
    //                                    $(".units-list-container .unit-item[data-unit-id=" + unitID + "]").addClass("active");
    //                                 }, 100);
    //                             }).error(function(response, status) {
    //                                 $scope.errorHandler(response, status);
    //                             });
    //                         }
    //                     });
    //                 };
    //
    //                 $scope.drawUnitsMarkers = function(plan) {
    //                     $scope.units.map(function(unit) {
    //                         if (unit.planID == plan.planID) {
    //                             $scope.drawUnitMarker(unit, unit.planCoordinates);
    //                         }
    //                     });
    //                 };
    //
    //                 $scope.makeActive = function (target) {
    //                     $(".plans-list-container .plan-item").removeClass("active");
    //                     $(target).addClass("active");
    //                 };
    //
    //                 $scope.openPlanMarkers = function(plan, $event) {
    //                     var src = IMAGES_URL_ROOT + plan.src;
    //
    //                     $scope.makeActive($event.target);
    //
    //                     $scope.stateManageMarkers = true;
    //                     $scope.stateAddPlan = false;
    //                     $scope.stateRenamePlan = false;
    //                     $scope.currentPlan = $.extend({}, plan);
    //                     $scope.currentPlan["src"] =  src;
    //                     $scope.markers = {};
    //
    //                     $scope.getUnits(function() {
    //                         var maxHeight = parseInt($(".modal-content").css("max-height")) - $(".modal-header").height() - 160;
    //                         $(".plan-viewport").css("height", maxHeight + 'px');
    //
    //                         maxHeight = maxHeight - $(".plans-list-header").height() - $(".plans-list-container").height() - 100;
    //
    //                         $("#units-list-container .list-group").css("max-height", maxHeight + 'px');
    //
    //                         if ($scope.map == null) {
    //                             $scope.map = L.map('plan-viewport', {
    //                                 minZoom: 1,
    //                                 maxZoom: 5,
    //                                 center: [0, 0],
    //                                 contextmenu: true,
    //                                 zoom: 1,
    //                                 crs: L.CRS.Simple
    //                             });
    //                         }
    //
    //                         var controlLoader = L.control.loader().addTo($scope.map);
    //
    //                         controlLoader.show();
    //
    //                         if ($scope.map_layer != null) {
    //                             $scope.map.removeLayer($scope.map_layer);
    //                             $scope.map.removeLayer($scope.map_markers);
    //                             $scope.map.setZoom(1);
    //                         }
    //
    //                         var southWest = $scope.map.unproject([0, $scope.currentPlan.planHeight], $scope.map.getMaxZoom());
    //                         var northEast = $scope.map.unproject([$scope.currentPlan.planWidth, 0], $scope.map.getMaxZoom());
    //                         var bounds = new L.LatLngBounds(southWest, northEast);
    //
    //                         $scope.map.setMaxBounds(bounds);
    //
    //                         $scope.map_layer = L.imageOverlay($scope.currentPlan.src, bounds);
    //
    //                         $scope.map_layer.on('load', function (event) {
    //                             $scope.map_markers = new L.FeatureGroup();
    //                             $scope.map.addLayer($scope.map_markers);
    //
    //                             $scope.drawUnitsMarkers(plan);
    //                             initDraggableMarkers();
    //                             $scope.initCompass($(".compass"), plan.northAngle);
    //
    //                             controlLoader.hide();
    //                         });
    //
    //                         $scope.map_layer.addTo($scope.map);
    //                     });
    //                 };
    //
    //                 $scope.onUnitListItemSelected = function(unit, $event) {
    //                     $scope.scrollToMarker = true;
    //                     $scope.highlightUnitMarker(unit, $event);
    //
    //                     if (typeof $scope.markers[unit.unitID] != 'undefined') {
    //                         $scope.openMarkerPopup(
    //                             $scope.markers[unit.unitID]
    //                         );
    //                     }
    //                 };
    //
    //                 $scope.highlightUnitMarker = function(unit, $event) {
    //                     if (typeof $scope.markers[unit.unitID] == 'undefined') {
    //                         return false;
    //                     }
    //
    //                     $.each($scope.markers, function(unitID, marker) {
    //                         var is_active = (marker.options.unit.unitID == unit.unitID);
    //
    //                         marker.setIcon(
    //                             $scope.getIcon(is_active)
    //                         );
    //
    //                         if (is_active && $scope.scrollToMarker) {
    //                             $scope.scrollToMarker = false;
    //
    //                             $scope.map.panTo(
    //                                 marker.getLatLng({
    //                                     animate: true,
    //                                     duration: 0.30
    //                                 })
    //                             );
    //                         }
    //                     });
    //
    //                     $("#units-list-container .unit-item").removeClass("active");
    //                     $("#units-list-container .unit-item[data-unit-id=" + unit.unitID + "]").addClass("active");
    //                 };
    //
    //                 $scope.initCompass = function(el, initialAngle) {
    //                     if ($scope.propeller == null) {
    //                         $scope.propeller = new Propeller(el, {
    //                             onDragStop: function() {
    //                                 var angle = Math.round(this.angle);
    //
    //                                 $http({
    //                                     method: 'PUT',
    //                                     url: API_CONFIG.api_prefix + '/plan/' + $scope.currentPlan.planID,
    //                                     headers: headers_defaults,
    //                                     data: angular.toJson({
    //                                         northAngle: angle
    //                                     })
    //                                 }).success(function() {
    //                                     $scope.getPlans();
    //                                 }).error(function(response, status) {
    //                                     $scope.errorHandler(response, status);
    //                                 });
    //                             }
    //                         });
    //                     }
    //
    //                     $scope.propeller.angle = (initialAngle || 0);
    //                 };
    //
    //                 $scope.getPlanName = function(planID) {
    //                     var plan_name = '';
    //
    //                     for (var i = 0; i < $scope.plans.length; i++) {
    //                         if ($scope.plans[i].planID == planID) {
    //                             plan_name = $scope.plans[i].planName;
    //                             break;
    //                         }
    //                     };
    //
    //                     return plan_name;
    //                 };
    //
    //                 function convertToDataURLviaCanvas(url, callback, outputFormat) {
    //                     var img = new Image();
    //                     img.crossOrigin = 'Anonymous';
    //                     img.onload = function(){
    //                         var canvas = document.createElement('CANVAS');
    //                         var ctx = canvas.getContext('2d');
    //                         var dataURL;
    //                         canvas.height = this.height;
    //                         canvas.width = this.width;
    //                         ctx.drawImage(this, 0, 0);
    //                         dataURL = canvas.toDataURL(outputFormat);
    //                         callback(dataURL);
    //                         canvas = null;
    //                     };
    //                     img.src = url;
    //                 }
    //
    //                 function initDraggableMarkers() {
    //                     setTimeout(function () {
    //                         $(".unit-marker").each(function() {
    //                             var marker = $(this)[0];
    //                             var marker_el_parent;
    //                             var marker_el;
    //                             var unit;
    //
    //                             L.DomUtil.setPosition(marker, new L.Point(0, 0));
    //
    //                             var draggable = new L.Draggable(marker);
    //                             draggable.enable();
    //
    //                             draggable.on('drag', function (e) {
    //                                 $('.tooltip').removeClass('in');
    //                             });
    //
    //                             draggable.on('dragstart', function (e) {
    //                                 var modal_offset = $(".modal-body").offset();
    //                                 var marker_el_offset = $(e.target._element).offset();
    //                                 var original_event = e.target._originalEvent;
    //
    //                                 $('.tooltip').removeClass('in');
    //                                 marker_el_parent = $(e.target._element).parent();
    //                                 marker_el = $(e.target._element).detach();
    //                                 unit = $(marker_el).data("unit");
    //
    //
    //                                 marker_el.addClass("dragged");
    //                                 marker_el.css({
    //                                     left: marker_el_offset.left - modal_offset.left + 'px',
    //                                     top: original_event.clientY - modal_offset.top + 'px'
    //                                 });
    //
    //                                 $(".modal-body").append(marker_el);
    //                             });
    //
    //                             draggable.on('dragend', function (e) {
    //                                 var offset = marker_el.offset();
    //                                 var viewport_offset = $('.plan-viewport').offset();
    //
    //                                 var latlng = $scope.map.containerPointToLatLng(
    //                                     new L.Point(
    //                                         offset.left - viewport_offset.left + 12,
    //                                         offset.top - viewport_offset.top + 40
    //                                     )
    //                                 );
    //
    //                                 var point = $scope.map.project(latlng, $scope.map.getMaxZoom());
    //
    //                                 if ((point.x >= 0) && (point.x <= $scope.currentPlan.planWidth)
    //                                     && (point.y >= 0) && (point.y <= $scope.currentPlan.planHeight)
    //                                 ) {
    //                                     $http({
    //                                         method: 'PUT',
    //                                         url: API_CONFIG.api_prefix + '/unit/' + unit.unitID,
    //                                         headers: headers_defaults,
    //                                         data: angular.toJson({
    //                                             planID: $scope.currentPlan.planID,
    //                                             planCoordinates: {
    //                                                 x: point.x,
    //                                                 y: point.y
    //                                             }
    //                                         })
    //                                     }).success(function() {
    //                                         if (typeof $scope.markers[unit.unitID] != 'undefined') {
    //                                             $scope.currentMarker = $.extend({}, marker);
    //                                             $scope.markers[unit.unitID].setLatLng(latlng);
    //                                             $scope.highlightUnitMarker(unit, e);
    //                                         } else {
    //                                             $scope.drawUnitMarker(unit, latlng, false);
    //                                             $scope.highlightUnitMarker(unit, e);
    //                                         }
    //
    //                                         setTimeout(function() {
    //                                             $(".units-list-container .unit-item[data-unit-id=" + unit.unitID + "]").addClass("active");
    //                                         }, 100);
    //
    //                                         $scope.getUnits(initDraggableMarkers);
    //                                     }).error(function(response, status) {
    //                                         $scope.errorHandler(response, status);
    //                                     });
    //                                 }
    //
    //                                 marker_el.removeClass("dragged");
    //                                 marker_el_parent.append(marker_el);
    //
    //                                 L.DomUtil.setPosition(marker, new L.Point(0, 0));
    //                             });
    //                         });
    //                     }, 300);
    //                 }
    //
    //                 $scope.getPlans(function() {
    //                     $scope.getUnits();
    //                 });
    //
    //                 $scope.searchUnitsScope = function(){
    //                     initDraggableMarkers();
    //                 }
    //
    //             }
    //         }
    //     ]).filter('searchUnits', function($rootScope) {
    //         return function(units, searchString) {
    //             var result = {};
    //             var searchProps = ['description', 'roomNumber', 'storey'];
    //
    //             if (!searchString) {
    //                 return units;
    //             }
    //
    //
    //             for (var unitIndex in units) {
    //                 for (var propIndex in searchProps) {
    //                     var propValue = units[unitIndex][searchProps[propIndex]];
    //
    //                     if (propValue && (propValue.toLowerCase().search(searchString.toLowerCase()) != -1)) {
    //                         result[units[unitIndex]["unitID"]] = units[unitIndex];
    //                     }
    //                 }
    //             }
    //             return result;
    //         }
    //
    // });
