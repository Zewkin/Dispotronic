<div class="inmodal" role="dialog">
    <form role="form" name="objectstask_form" class="form-horizontal" novalidate ng-submit="saveTask(objectstask_form)">
        <div class="modal-body">
            <div class="row">
                <div class="form-group">
                    <div class="col-xs-12">
                        <label class="pull-left text-left">{{_object_task_name}}</label>
                        <input type="text" class="form-control" maxlength="255" ng-model="task.task_name" name="task_name" required>
                        <div class="m-t-xs" ng-show="objectstask_form.task_name.$invalid && objectstask_form.submitted">
                            <small class="text-danger" ng-show="objectstask_form.task_name.$error.required">
                                {{_required}}
                            </small>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <div class="col-xs-12">
                        <label class="pull-left text-left">{{_object_task_description}}</label>
                        <textarea type="text" class="form-control" rows="6" ng-model="task.description" name="description">{{task.description}}</textarea>
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
