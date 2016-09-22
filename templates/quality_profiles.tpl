<table class="table table-bordered quality_profiles" ng-class="contract.inspections ? 'no-edit':''">
    <tbody>
    <tr>
        <td colspan="1" style="text-align: center;">
            {{_aql}}
        </td>
        <td colspan="14">
            <i class="fa fa-fw fa-chevron-left qp_increase_decrease"
               ng-class="contract.aql == 2.5 ? 'disabled' : ''"
               ng-click="decreaseAql()"></i>

            <span style="display:inline-block; text-align: center; width: 15px;">{{contract.aql}}</span>

            <i class="fa fa-fw fa-chevron-right qp_increase_decrease"
               ng-class="contract.aql == 10 ? 'disabled' : ''"
               ng-click="increaseAql()"></i>
        </td>
    </tr>
    {{f = (getLenght(quality_profiles_data) ? getLenght(quality_profiles_data) : premises_data.length)+2; ""}}
    <tr class="qp_table_heading">
        <th rowspan="2"></th>
        <th rowspan="{{f}}"></th>
        <th colspan="2">{{_furniture_and_fixtures}}</th>
        <th rowspan="{{f}}"></th>
        <th colspan="2">{{_walls}}</th>
        <th rowspan="{{f}}"></th>
        <th colspan="2">{{_floors}}</th>
        <th rowspan="{{f}}"></th>
        <th colspan="2">{{_ceilings}}</th>
        <th rowspan="2">{{_room_types}}</th>
    </tr>
    <tr class="qp_table_heading">
        <th>{{_waste_loose_dirt}}</th>
        <th>{{_surface_soiling}}</th>
        <th>{{_waste_loose_dirt}}</th>
        <th>{{_surface_soiling}}</th>
        <th>{{_waste_loose_dirt}}</th>
        <th>{{_surface_soiling}}</th>
        <th>{{_waste_loose_dirt}}</th>
        <th>{{_surface_soiling}}</th>
    </tr>

    <tr ng-repeat="(pname, qp) in quality_profiles_data" class="qp_data">
        <td class="qp_table_subheading">
            <span ng-class="contract.inspections ? 'qulity_profile_title_no_edit':'qulity_profile_title'" ng-click="editorEnabled=!editorEnabled">
                <l ng-show="!quality_mapping[pname]">{{pname}}</l>{{quality_mapping[pname]}}
            </span>
            <div ng-show="editorEnabled && !contract.inspections">
                <input class="quality_input_name" ng-model="quality_mapping[pname]" maxlength="10" size="10" >
                <span class="quality_profile_save_btn" ng-click="editorEnabled=!editorEnabled">{{_save}}</span>
            </div>
        </td>

        <td ng-repeat="mark in [0,1,2,3,4,5,6,7]" class="qp_table_profile_value">
            <i class="fa fa-fw fa-chevron-left qp_increase_decrease"
               ng-class="qp[mark] == 1 ? 'disabled' : ''"
               ng-click="(qp[mark] != 1) ? (qp[mark] = qp[mark] - 1) : 0"></i>

            {{qp[mark]}}

            <i class="fa fa-fw fa-chevron-right qp_increase_decrease"
               ng-class="qp[mark] == 5 ? 'disabled' : ''"
               ng-click="(qp[mark] != 5) ? (qp[mark] = qp[mark] + 1) : 0"></i>
        </td>
        <td><textarea resizable="false" class="form-control" style="min-width: 150px; resize: none; border: none" ng-model="premises_data[pname]"></textarea></td>
    </tr>
    </tbody>
</table>