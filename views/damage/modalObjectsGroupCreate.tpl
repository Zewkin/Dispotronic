<div class="inmodal" role="dialog">
    <form role="form" name="objectgroup_form" class="form-horizontal" novalidate ng-submit="saveObject(objectgroup_form)">
        <div class="modal-body">
            <div class="row">
                <div class="form-group">
                    <div class="col-xs-12">
                        <label class="pull-left text-left">{{_object_group_name}}</label>
                        <input type="text" class="form-control" maxlength="255" ng-model="object.group_name" name="group_name" required>
                        <div class="m-t-xs" ng-show="objectgroup_form.group_name.$invalid && objectgroup_form.submitted">
                            <small class="text-danger" ng-show="objectgroup_form.group_name.$error.required">
                                {{_required}}
                            </small>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <div class="col-xs-12">
                        <label class="pull-left text-left">{{_object_group_description}}</label>
                        <input type="text" class="form-control" maxlength="255" ng-model="object.description" name="description">
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="row">
                    <div class="col-xs-12">
                        <div class="pull-right">
                            <button type="button" class="btn btn-white" data-dismiss="modal" ng-click="cancel()">{{_close}}</button>
                            <button class="btn btn-primary" type="submit">{{_save}}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>
