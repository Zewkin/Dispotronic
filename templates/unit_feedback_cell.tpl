<div class="ngCellText">
    <i class="fa fa-fw fa-tags pull-left icons" ng-show="row.entity.invokedByTag"></i>

    <i  class="fa fa-fw fa-comments pull-left icons"
        ng-show="getUnitFeedBack(row.entity.feedback)"
        tooltip-placement="left"
        tooltip="{{getUnitFeedBack(row.entity.feedback)}}">
    </i>

    <a ng-hide="!row.entity.feedback.images.length" class="pull-left" style="line-height: 0">
        <i class="fa fa-fw fa-picture-o icons"
           ng-click="showPics(row.entity.feedback.images)"
           style="padding: 0;">
        </i>
    </a>

    <!--href=" ng-show="row.entity.invokedByTag"  {{imagesUrlRoot}}/{{img.src}}-->
</div>