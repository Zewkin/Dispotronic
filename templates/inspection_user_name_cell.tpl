<div><i ng-hide="!(grid.appScope.hasPermission('CreateInspectionUsersHandler') && grid.appScope.hasPermission('UpdateInspectionUsersHandler'))"
        ng-click="grid.appScope.checkEligibility(row.entity.attributes) && grid.appScope.assignUser(row.entity['userID'])"
        ng-class="grid.appScope.checkEligibility(row.entity.attributes) ? 'smallIconButton' : 'btn_disabled'"
        class="fa fa-fw fa-arrow-circle-o-left " style="padding: 6px 18px 5px 5px;"></i>
    {{row.entity['firstName']}}
</div>
