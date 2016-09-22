<div
     ng-class="getRowStyle(col,row)"
     ng-repeat="col in renderedColumns"
     ng-style="{ 'cursor': row.cursor }">
        <div ng-cell>
        </div>
</div>