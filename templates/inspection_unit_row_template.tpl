<div
    ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid"
    ng-style="grid.appScope.getInspectionUnitRowStyle(row.entity)"
    class="ui-grid-cell"
    ui-grid-cell>
</div>
