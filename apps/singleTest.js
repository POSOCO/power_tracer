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
    var layers220 = ["220_NEW", "220_LINES"];
    var layersBorder = ["REGIONAL_BORDER"];
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
        } else if (layers220.indexOf(layer.name) != -1) {
            line_voltage = 220;
            line_alert_levels = [0, 200, 400];
            line_nominal_power = 200;
        } else if (layersBorder.indexOf(layer.name) != -1) {
            line_voltage = null;
            line_alert_levels = [];
            line_nominal_power = null;
        } else {
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
            var lineId = layerLine.ednaId;
            var linePower = null;
            if (line_voltage != null) {
                if (lineId != null) {
                    linePower = line_nominal_power * (0.5 + Math.random());
                }
            }
            linesArray.push(new PowerLine({
                "ends": ends,
                "power": linePower,
                "nominal": line_nominal_power,
                "levels": line_alert_levels,
                "voltage": line_voltage,
                "address": lineId,
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
    var getSelectVal = function (idStr) {
        return document.getElementById(idStr).options[document.getElementById(idStr).selectedIndex].value;
    };
    var lineCanvas = document.getElementById("myCanvas");
    linesArray = [];
    var plot_only = [];
    if (get("plot765Input").checked) {
        plot_only.push(765);
    }
    if (get("plot765Input").checked) {
        plot_only.push(765);
    }
    if (get("plot400Input").checked) {
        plot_only.push(400);
    }
    if (get("plot220Input").checked) {
        plot_only.push(220);
    }
    if (get("plotBorderInput").checked) {
        plot_only.push("border");
    }
    if (get("plotAddressLessInput").checked) {
        plot_only.push("address_less");
    }
    if (get("plotNullPowerInput").checked) {
        plot_only.push("null_power");
    }
    tracer = new LineTracer({
        "caret_canvas": caretCanvas,
        "canvas": lineCanvas,
        "lines": linesArray,
        "colors": ["#6495ED", "#FF69B4", "#FF0000"],
        "thickness_per_mw": getVal("thicknessPerMWInput"),
        "thickness_per_unit": getVal("thicknessPerPUInput"),
        "thickness_threshold": 15,
        "line_color_mode": getSelectVal("lineColorModeSelectInput"),
        "mode": get("isPerUnitMode").checked == true ? 1 : 0,
        "plot_only": plot_only
    });
    tracer.set_arrow_delay(1000 / getVal("arrowSpeedInput"));
    tracer.set_caret_size(getVal("arrowSizeInput"));
    tracer.set_caret_mode(getSelectVal("caretModeSelectInput"));
    tracer.set_caret_fill(getSelectVal("caretFillInput"));
    doPlotting();
    tracer.plot_arrows();
    linesArray = getLinesFromDDLObj(lines_ddl_g);
    tracer.set_lines(linesArray);
    // saving memory Start
    lines_ddl_g = null;
    linesArray = [];
    // saving memory End
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
document.getElementById('plotBorderInput').onclick = function () {
    tracer.set_plot_border(this.checked);
    doPlotting();
};

//Assign function to onclick property of checkbox for arrow animation toggling
document.getElementById('plotAddressLessInput').onclick = function () {
    tracer.set_plot_address_less_lines(this.checked);
    doPlotting();
};

//Assign function to onclick property of checkbox for arrow animation toggling
document.getElementById('plotNullPowerInput').onclick = function () {
    tracer.set_plot_null_power_lines(this.checked);
    doPlotting();
};

//Assign function to onclick property of checkbox for arrow animation toggling
document.getElementById('arrowSpeedInput').onchange = function () {
    // access properties using this keyword
    var newDelay = 1000 / this.value;
    if (newDelay != tracer.get_arrow_delay()) {
        tracer.set_arrow_delay(newDelay);
        //tracer.plot_arrows();
    }
};

//Assign function to onclick property of checkbox for arrow size change
document.getElementById('arrowSizeInput').onchange = function () {
    // access properties using this keyword
    var newSize = this.value;
    tracer.set_caret_size(newSize);
    //tracer.plot_arrows();
};

//Assign function to onclick property of checkbox for arrow size change
document.getElementById('thicknessPerMWInput').onchange = function () {
    // access properties using this keyword
    tracer.set_thickness_per_MW(this.value);
    doPlotting();
};

//Assign function to onclick property of checkbox for arrow size change
document.getElementById('thicknessPerPUInput').onchange = function () {
    // access properties using this keyword
    tracer.set_thickness_per_unit(this.value);
    doPlotting();
};

//Assign function to onclick property of checkbox for arrow size change
document.getElementById('lineColorModeSelectInput').onchange = function () {
    tracer.set_line_color_mode(this.options[this.selectedIndex].value);
    doPlotting();
};

function doPlotting() {
    tracer.plot_lines();
    //tracer.setCaretParams();
    angular.element(document.getElementById('lineSortController')).scope().updateLines(tracer.get_lines());
}

var isFetchingInProgress_g = false;
var scadaFetchTimerId_g = null;
var monitoringInterval_g = 5000;

function startScadaFetching() {
    stopScadaFetching();
    updateLineFlows();
    scadaFetchTimerId_g = setInterval(updateLineFlows, monitoringInterval_g);
}

function stopScadaFetching() {
    clearInterval(scadaFetchTimerId_g);
}


function updateLineFlows() {
    if (isFetchingInProgress_g) {
        return;
    }
    isFetchingInProgress_g = true;
    var processStartTime = new Date();

    function processArray(array, fn) {
        var index = 0;

        function next() {
            if (index < array.length) {
                //console.log(index);
                fn(array[index++], function (err, result) {
                    // process error here
                    if (err) {
                        console.log(err);
                    }
                    // process result here
                    //console.log(result);
                    setTimeout(next, 0);
                });
            }
            else {
                var processEndTime = new Date();
                document.getElementById("lastUpdatedText").innerHTML = processEndTime.getDate() + "/" + (processEndTime.getMonth() + 1) + "/" + processEndTime.getFullYear() + " " + processEndTime.getHours() + ":" + processEndTime.getMinutes() + ":" + processEndTime.getSeconds();
                document.getElementById("processTimeText").innerHTML = "" + (processEndTime.getTime() - processStartTime.getTime()) / 1000;
                doPlotting();
                isFetchingInProgress_g = false;
            }
        }

        next();
    }

    processArray(tracer.get_lines(), fetchAndSetScadaValue);
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
