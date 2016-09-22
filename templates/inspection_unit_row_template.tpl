<div
        ng-style="getInspectionUnitRowStyle(row.entity)"
        ng-repeat="col in renderedColumns"
        ng-class="getRowStyle(col)"
        class="ngCell {{col.cellClass}}">
    <div ng-cell>
    </div>
</div>