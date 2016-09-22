<div style="padding-top: 3px;" >
    <a ng-if="row.entity['customers'] && row.entity['customers'].length>0" href="#"  tooltip-placement="top" uib-tooltip-template="'/views/myTooltipTemplate.html'">
        {{_view}}
    </a>
    <div ng-if="row.entity['customers'].length == 0 && row.entity['roles'].indexOf(100306)!=-1">
        {{_all_customers}}
    </div>
</div>