<div style="padding: 5px">
    {{row.entity['description']}}
    <i tooltip="{{_edit}}"
       ng-hide="!grid.appScope.hasPermission('UpdateCustomerHandler')"
       ng-click="grid.appScope.editCustomer(row.entity);" class="fa fa-fw fa-edit pull-right"
       style="padding: 4px 10px 0px 0px;" ></i>
    <i tooltip="{{_delete}}"
       class="fa fa-fw fa-trash-o pull-right"
       ng-hide="!grid.appScope.hasPermission('DeleteCustomerHandler')"
       ng-click="grid.appScope.deleteCustomer(row.entity)"
       style="padding: 3px 10px 0px 0px;"></i>
</div>
