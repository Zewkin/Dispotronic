<div style="padding-top: 5px;">
    <span ng-repeat="roleID in row.entity['roles']" class="label label-primary"
        style="margin: 0 0 2px 4px;">
        {{grid.appScope.translate(grid.appScope.roles[roleID])}}
    </span>
</div>
