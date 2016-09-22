<div><i ng-hide="!hasPermission('DeleteInspectionUsersHandler')"
        ng-click="unassignUser(row.entity['userID'])"
        class="fa fa-fw fa-arrow-circle-o-right smallIconButton" style="padding: 6px 18px 5px 5px;"></i>
    {{row.entity['statusID']}}
</div>