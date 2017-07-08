"use strict";

document.onreadystatechange = function () {
    if (document.readyState == "interactive") {
        //onDomReady();
    } else if (document.readyState == "complete") {
        //DOM load initialization function
        onDomComplete();
        document.getElementById('canvasWrapper').onmousedown = function (e) {
            var self = this;
            var xPrev = e.clientX;
            var yPrev = e.clientY;
            document.onmousemove = function (e) {
                e = e || event;
                var clientX = e.clientX;
                var clientY = e.clientY;
                tracer.addXOffset((clientX - xPrev) * 5);
                tracer.addYOffset((clientY - yPrev) * 5);
                xPrev = clientX;
                yPrev = clientY;
                doPlotting();
            };
            this.onmouseup = function () {
                document.onmousemove = null
            }
        };
    }
};

function addZoom(val) {
    tracer.addZoom(val);
    doPlotting();
}

function changeCaretMode(selEl) {
    tracer.set_caret_mode(selEl.options[selEl.selectedIndex].value);
    doPlotting();
}

function changeCaretFill(selEl) {
    tracer.set_caret_fill(selEl.options[selEl.selectedIndex].value);
    doPlotting();
}

function getLinesFromDDLObj(ddlObj) {
    var linesArray = [];
    var layers765 = ["765KV"];
    var layers400 = ["400KV"];
    var layers220 = [];
    for (var layerIter = 0; layerIter < ddlObj.layers.length; layerIter++) {
        // Find if layer is 765 KV
        var layer = ddlObj.layers[layerIter];
        var line_voltage = null;
        var line_alert_levels = [];
        var line_nominal_power = null;
        if (layers765.indexOf(layer.name) != -1) {
            line_voltage = 765;
            line_alert_levels = [0, 1200, 2000];
            line_nominal_power = 1200;
        } else if (layers400.indexOf(layer.name) != -1) {
            line_voltage = 400;
            line_alert_levels = [0, 600, 800];
            line_nominal_power = 600;
        }
        if (line_voltage == null) {
            continue;
        }
        // var layerLines = layer.polyLines;
        for (var lineIter = 0; lineIter < layer.polyLines.length; lineIter++) {
            var layerLine = layer.polyLines[lineIter];
            var origin = {x: +layerLine.points[1].x, y: +layerLine.points[1].y};
            var ends = [[origin.x], [origin.y]];
            for (var linePointIter = 2; linePointIter < layerLine.points.length; linePointIter++) {
                var newPointX = origin.x + (+layerLine.points[linePointIter].x);
                var newPointY = origin.y + (+layerLine.points[linePointIter].y);
                ends[0].push(newPointX);
                ends[1].push(newPointY);
                origin = {x: newPointX, y: newPointY};
            }
            var lineNameMetas = [];
            for (var lineMetaIter = 0; lineMetaIter < layerLine.meta.length; lineMetaIter++) {
                lineNameMetas.push(layerLine.meta[lineMetaIter].value);
            }
            linesArray.push(new PowerLine({
                "ends": ends,
                "power": line_nominal_power * (0.5 + Math.random()),
                "nominal": line_nominal_power,
                "levels": line_alert_levels,
                "voltage": line_voltage,
                "address": "",
                "name": lineNameMetas.join(".")
            }));
        }
    }
    return linesArray;
}

var linesArray = [];
var tracer;

function onDomComplete() {
    var get = function (idStr) {
        return document.getElementById(idStr);
    };
    var getVal = function (idStr) {
        return document.getElementById(idStr).value;
    };
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
    tracer = new LineTracer({
        "caret_canvas": caretCanvas,
        "canvas": lineCanvas,
        "lines": linesArray,
        "colors": ["#6495ED", "#FF69B4", "#FF0000"],
        "thickness_per_mw": 0.01,
        "thickness_per_unit": 6,
        "thickness_threshold": 15,
        "mode": 0,
        "plot_only": [765, 400]
    });
    get("plot765Input").onclick();
    get("plot400Input").onclick();
    get("plot220Input").onclick();
    get("arrowSpeedInput").onchange();
    get("arrowSizeInput").onchange();
    get("caretModeSelectInput").onchange();
    get("caretFillInput").onchange();
    get("thicknessPerMWInput").onchange();
    get("thicknessPerPUInput").onchange();
    get("isPerUnitMode").onclick();
    get("isArrowAnimation").onclick();
    doPlotting();
    tracer.plot_arrows();
    linesArray = getLinesFromDDLObj(lines_ddl_g);
    tracer.set_lines(linesArray);
    doPlotting();
}

function showValue(newVal) {
    document.getElementById("power_input_label").innerHTML = newVal;
    tracer.get_lines()[2].set_line_power(Number(newVal));
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
document.getElementById('plot765Input').onclick = function () {
    tracer.set_plot_765(this.checked);
    doPlotting();
};

//Assign function to onclick property of checkbox for arrow animation toggling
document.getElementById('plot400Input').onclick = function () {
    tracer.set_plot_400(this.checked);
    doPlotting();
};

//Assign function to onclick property of checkbox for arrow animation toggling
document.getElementById('plot220Input').onclick = function () {
    tracer.set_plot_220(this.checked);
    doPlotting();
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

//Assign function to onclick property of checkbox for arrow size change
document.getElementById('arrowSizeInput').onchange = function () {
    // access properties using this keyword
    var newSize = this.value;
    tracer.set_caret_size(newSize);
    tracer.plot_arrows();
};

//Assign function to onclick property of checkbox for arrow size change
document.getElementById('thicknessPerMWInput').onchange = function () {
    // access properties using this keyword
    tracer.set_thickness_per_MW(this.value);
    tracer.plot_arrows();
};

//Assign function to onclick property of checkbox for arrow size change
document.getElementById('thicknessPerPUInput').onchange = function () {
    // access properties using this keyword
    tracer.set_thickness_per_unit(this.value);
    tracer.plot_arrows();
};

function doPlotting() {
    tracer.plot_lines();
    //tracer.setCaretParams();
    angular.element(document.getElementById('lineSortController')).scope().updateLines(tracer.get_lines());
}

angular.module('lineSortApp', ['angularUtils.directives.dirPagination'])

    .controller('lineSortController', function ($scope) {
        $scope.sortType = 'power'; // set the default sort type
        $scope.sortReverse = true;  // set the default sort order
        $scope.searchLine = '';     // set the default search/filter term
        $scope.lines = [];

        $scope.updateLines = function (linesArray) {
            $scope.lines = [];
            for (var i = 0; i < linesArray.length; i++) {
                var line = linesArray[i];
                $scope.lines.push({
                    name: line.get_line_name(),
                    nominal_power: line.get_line_nominal_flow(),
                    power: Math.abs(line.get_line_power())
                });
            }
            $scope.$apply();
        };

        //set page size
        $scope.pageSize = 4;
    });
/*
 //implementing a custom filter
 .filter('orderObjectBy', function () {
 return function (items, field, reverse) {
 var filtered = [];
 angular.forEach(items, function (item) {
 filtered.push(item);
 });
 filtered.sort(function (a, b) {
 return (a[field] > b[field] ? 1 : -1);
 });
 if (reverse) filtered.reverse();
 return filtered;
 };
 });
 */
$('.sort-clicker').click(function (e) {
    e.preventDefault();
});
