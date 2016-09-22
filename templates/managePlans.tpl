<style>
    img-crop {
        display: block;
        width: 100%;
        height: 100%;
        canvas {
            margin: 0!important;
        }
    }
</style>
<div class="inmodal" role="dialog">
    <div class="modal-body" style="overflow: hidden;">
        <div class="row">
            <div class="col-lg-4">
                <ul class="list-group">
                    <li ng-repeat="plan in plans" ng-click="selectPlan(plan.planName, plan.src)" class="list-group-item" style="overflow: hidden; cursor: pointer;">
                        {{plan.planName}}
                        <div class="pull-right">
                            <div class="btn-group">
                                <button class="btn btn-xs btn-white"><i class="fa fa-pencil-square-o"></i></button>
                                <button class="btn btn-xs btn-white" data-id="{{plan.planID}}" ng-click="$event.stopPropagation(); deletePlan()"><i class="fa fa-trash-o"></i></button>
                            </div>
                        </div>
                    </li>
                </ul>
                <ul class="list-group">
                  <li ng-repeat="unit in units" class="list-group-item" style="overflow: hidden;">
                      {{unit.description}}
                  </li>
                </ul>
            </div>
            <div ng-show="map" class="col-lg-8">
                <leaflet layers="layers" width="100%" height="480px"></leaflet>
            </div>
            <div ng-show="crop" class="col-lg-8" style="height: 480px; overflow: hidden;">
                <img-crop image="image.toCrop" result-image="image.cropped" area-type="rectangle" canvas-scalemode="full-width" result-image-format="image/jpeg"></img-crop>
            </div>
        </div>

        <button style="float: left;" class="btn btn-primary" ng-click="showForm = true;">{{_add_plan}}</button>
        <button ng-show="crop" class="btn btn-white" ng-click="doCrop();">Crop!</button>
        <form class="form-inline" ng-show="showForm">
            <input class="form-control" style="float: left; margin: 0 2px 0 10px;" type="text" ng-model="formUpload.filename" required>
            <input class="form-control" style="float: left; margin: 0 10px 0 2px;" type="file" ng-model="formUpload.picFile" base-sixty-four-input required>
            <button class="btn btn-primary" ng-click="showForm = false; uploadPlan(formUpload.picFile)"><i class="fa fa-check"></i></button>
        </form>
    </div>
</div>
