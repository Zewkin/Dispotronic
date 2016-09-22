<div>
    <button class="btn btn-xs btn-white" ng-click="grid.appScope.unassignBuilding(row.entity['buildingID'])" style="display: inline-block; margin: 4px;">
        <i tooltip="{{_unassign_building}}" class="fa fa-minus-square-o"></i>
    </button>
    {{row.entity['name']}}
</div>
