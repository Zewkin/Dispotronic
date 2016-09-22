<div>
    <button class="btn btn-xs btn-white"  ng-click="grid.appScope.assignBuilding(row.entity['buildingID'])" ng-class="{'disabled': grid.appScope.gridContractsApi.selection.getSelectedCount() < 1}" style="display: inline-block; margin: 4px;">
        <i tooltip="{{_assign_building}}" class="fa fa-plus-square-o"></i>
    </button>
    {{row.entity['name']}}
</div>
