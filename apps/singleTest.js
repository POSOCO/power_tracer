"use strict";

document.onreadystatechange = function () {
    if (document.readyState == "interactive") {
        //onDomReady();
    } else if (document.readyState == "complete") {
        //DOM load initialization function
        onDomComplete();

    }
};

var line2;
var linesArray = [];
var tracer;

function onDomComplete() {
    var lineCanvas = document.getElementById("myCanvas");
    var line = new PowerLine({
        "ends": [[10, 100], [10, 100]],
        "power": 350,
        "nominal": 200,
        "levels": [0, 200, 400],
        "voltage": 220,
        "address": "",
        "name": "220KV Line"
    }); //(10,10);(100,100)
    var line1 = new PowerLine({
        "ends": [[200, 250], [200, 250]],
        "power": 50,
        "nominal": 600,
        "levels": [0, 600, 800],
        "voltage": 400,
        "address": "",
        "name": "400KV Line"
    });//(20,20);(110,110)
    line2 = new PowerLine({
        "ends": [[300, 250, 280], [200, 450, 470]],
        "power": 900,
        "nominal": 1200,
        "levels": [0, 1200, 2000],
        "voltage": 765,
        "address": "",
        "name": "765KV Line"
    });//(20,20);(110,110)
    linesArray = [line, line1, line2];
    tracer = new LineTracer({
        "canvas": lineCanvas,
        "lines": linesArray,
        "colors": ["#6495ED", "#FF69B4", "#FF0000"],
        "thickness_per_mw": 0.01,
        "thickness_per_unit": 6,
        "thickness_threshold": 15,
        "mode": 0
    });
    doPlotting();
}

function showValue(newVal) {
    document.getElementById("power_input_label").innerHTML = newVal;
    linesArray[2].set_line_power(newVal);
    doPlotting();
}

// assign function to onclick property of checkbox
document.getElementById('isPerUnitMode').onclick = function () {
    // access properties using this keyword
    if (this.checked) {
        // if checked ...
        tracer.set_plot_mode(1);
    } else {
        // if not checked ...
        tracer.set_plot_mode(0);
    }
    doPlotting();
};

function doPlotting() {
    tracer.plot_lines();
    angular.element(document.getElementById('lineSortController')).scope().updateLines(linesArray);
}

angular.module('lineSortApp', ['angularUtils.directives.dirPagination'])

    .controller('lineSortController', function ($scope) {
        $scope.sortType = 'power'; // set the default sort type
        $scope.sortReverse = true;  // set the default sort order
        $scope.searchLine = '';     // set the default search/filter term
        $scope.lines = [{name: '', nominal_power: '', power: ''}];

        $scope.updateLines = function (linesArray) {
            $scope.lines = [];
            for (var i = 0; i < linesArray.length; i++) {
                var line = linesArray[i];
                $scope.lines.push({
                    name: line.get_line_name(),
                    nominal_power: line.get_line_nominal_flow(),
                    power: line.get_line_power()
                });
            }
            $scope.$apply();
        };

        //set page size
        $scope.pageSize = 3;
    });

$('.sort-clicker').click(function(e) {
    e.preventDefault();
});