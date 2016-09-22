<div
 ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid"
 ui-grid-one-bind-id-grid="rowRenderIndex + '-' + col.uid + '-cell'"
 class="ui-grid-cell"
 ng-class="grid.appScope.getInspectionRowStyle(row.entity, col)"
 role="{{col.isRowHeader ? 'rowheader' : 'gridcell'}}"
 ui-grid-cell>
</div>
