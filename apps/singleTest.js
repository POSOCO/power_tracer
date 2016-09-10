"use strict";

document.onreadystatechange = function () {
    if (document.readyState == "interactive") {
        //onDomReady();
    } else if (document.readyState == "complete") {
        //DOM load initialization function
        onDomComplete();

    }
};

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
    var line2 = new PowerLine({
        "ends": [[300, 250, 280], [200, 450, 470]],
        "power": 900,
        "nominal": 1200,
        "levels": [0, 1200, 2000],
        "voltage": 765,
        "address": "",
        "name": "765KV Line"
    });//(20,20);(110,110)
    var line3 = new PowerLine({
        "ends": [[400, 450, 450, 400, 400], [200, 200, 290, 290, 250]],
        "power": 850,
        "nominal": 600,
        "levels": [0, 600, 800],
        "voltage": 400,
        "address": "",
        "name": "400KV Line2"
    });
    linesArray = [line, line1, line2, line3];
    //setCaretParams();
    tracer = new LineTracer({
        "caret_canvas": caretCanvas,
        "canvas": lineCanvas,
        "lines": linesArray,
        "colors": ["#6495ED", "#FF69B4", "#FF0000"],
        "thickness_per_mw": 0.01,
        "thickness_per_unit": 6,
        "thickness_threshold": 15,
        "mode": 0,
        "arrow_delay": 100,
        "caret_size": 10

    });
    doPlotting();
    tracer.plot_arrows();
}

function showValue(newVal) {
    document.getElementById("power_input_label").innerHTML = newVal;
    tracer.get_lines()[2].set_line_power(newVal);
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

//Assign function to onclick property of checkbox for arrow animation toggling
document.getElementById('isArrowAnimation').onclick = function () {
    tracer.stop_and_clear_arrows();
    // access properties using this keyword
    if (this.checked) {
        tracer.plot_arrows();
    }
};

//Assign function to onclick property of checkbox for arrow animation toggling
document.getElementById('arrowSpeedInput').onchange = function () {
    // access properties using this keyword
    var newDelay = 1000 / this.value;
    if (newDelay != tracer.get_arrow_delay()) {
        tracer.set_arrow_delay(newDelay);
        tracer.plot_arrows();
    }
};

function doPlotting() {
    tracer.plot_lines();
    angular.element(document.getElementById('lineSortController')).scope().updateLines(tracer.get_lines());
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

        $scope.sortFunction = function (line) {
            return line.power;
        };

        //set page size
        $scope.pageSize = 3;
    });

$('.sort-clicker').click(function (e) {
    e.preventDefault();
});