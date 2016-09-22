<div style="padding-top: 5px;"><span style="cursor: pointer; margin: 0 0 2px 4px; min-width: 57px;" ng-click="grid.appScope.switchStatus(row.entity)"
             ng-class="grid.appScope.buttonClasses[ row.entity['statusID'] ] + (grid.appScope.hasPermission('UpdateUserHandler') ? ' ' : ' disabled')">
    {{ grid.appScope.translate(grid.appScope.user_statuses[row.entity["statusID"]]) }}
</span>
    <i tooltip="{{grid.appScope._edit}}" ng-hide="!grid.appScope.hasPermission('UpdateUserHandler')" ng-click="grid.appScope.editUser(row.entity);" class="fa fa-fw fa-edit" style="float: right; padding: 6px 18px 5px 5px;" ></i>
    <i tooltip="{{grid.appScope._delete}}" class="fa fa-fw fa-trash-o" ng-hide="!grid.appScope.hasPermission('DeleteUserHandler') || (grid.appScope.user_data.userID == row.entity['userID'])" ng-click="grid.appScope.deleteUser(row.entity)" style="float: right; padding: 6px 18px 5px 5px;"></i>
</div>
