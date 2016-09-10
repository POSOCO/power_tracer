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
var caretCanvas;
var caretCtx;
var caretPositionPercentage = 0;
var caretSize = 10;
var arrowHandler = null;
var arrowFrameDelay = 100;

function onDomComplete() {
    var lineCanvas = document.getElementById("myCanvas");
    caretCanvas = document.getElementById("caretCanvas");
    set_canvas_params(caretCanvas);
    caretCtx = caretCanvas.getContext("2d");
    caretCtx.strokeStyle = "#FFFFFF";

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
        "canvas": lineCanvas,
        "lines": linesArray,
        "colors": ["#6495ED", "#FF69B4", "#FF0000"],
        "thickness_per_mw": 0.01,
        "thickness_per_unit": 6,
        "thickness_threshold": 15,
        "mode": 0
    });
    doPlotting();

    arrowHandler = window.requestInterval(drawLinesCarets, arrowFrameDelay);
}

function set_canvas_params(canvas) {
    var ctx = canvas.getContext("2d");
    var xp = getComputedStyle(canvas, null).getPropertyValue('width');
    xp = xp.substring(0, xp.length - 2);
    ctx.canvas.width = xp;
    var yp = getComputedStyle(canvas, null).getPropertyValue('height');
    yp = yp.substring(0, yp.length - 2);
    ctx.canvas.height = yp;
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

//Assign function to onclick property of checkbox for arrow animation toggling
document.getElementById('isArrowAnimation').onclick = function () {
    window.clearRequestInterval(arrowHandler);
    // access properties using this keyword
    if (this.checked) {
        // if checked ...
        arrowHandler = window.requestInterval(drawLinesCarets, arrowFrameDelay);

    } else {
        // if not checked ...
        clearCarets();
    }
};

//Assign function to onclick property of checkbox for arrow animation toggling
document.getElementById('arrowSpeedInput').onchange = function () {
    // access properties using this keyword
    var newDelay = 1000 / this.value;
    if (newDelay != arrowFrameDelay) {
        arrowFrameDelay = newDelay;
        window.clearRequestInterval(arrowHandler);
        arrowHandler = window.requestInterval(drawLinesCarets, arrowFrameDelay);
    }
};

function doPlotting() {
    tracer.plot_lines();
    drawLinesCarets();
    angular.element(document.getElementById('lineSortController')).scope().updateLines(linesArray);
}

function calculateCaretPosition(l, m, oneByRootOnePlusMSquare, c, x1, y1, x2, y2) {
    //var l = d * percentageOfSection * 0.01;
    if (m != null) {
        if (m != 0) {
            var x = (m > 0 ? 1 : -1) * l * oneByRootOnePlusMSquare + x1;
        } else {
            if (x2 == null) {
                x = x1 + l;
            } else {
                //x = Math.min(x1, x2) + l;
                x = x1 + l * (x2 > x1 ? 1 : -1);
            }
        }
        var y = m * x + c;
    } else {
        //slope = infnity
        x = x1;
        if (y2 != null) {
            y = y1 + l * (y2 > y1 ? 1 : -1);
        } else {
            y = y1 + l;
        }
    }
    return {x: x, y: y};
}

function drawLinesCarets() {
    //increase the caretPositionPercentPosition by 10 and revert back to zero if >100
    caretPositionPercentage = caretPositionPercentage + 10;
    if (caretPositionPercentage > 100) {
        caretPositionPercentage = 0;
    }

    //clear the caretCanvas
    caretCtx.clearRect(0, 0, caretCanvas.width, caretCanvas.height);

    //get all the lines
    var lines = tracer.get_lines();

    for (var i = 0; i < lines.length; i++) {
        //fetch a line
        var line = lines[i];

        //determine the line power direction
        var lineDirection = (line.get_line_power() > 0) ? 1 : -1;

        //set caret position according to direction
        if (lineDirection == -1) {
            var localCaretPositionPercentage = 100 - caretPositionPercentage;
        } else {
            localCaretPositionPercentage = caretPositionPercentage;
        }

        //determine the line end points
        var ends = line.get_line_end_points();

        //plot the carets
        for (var k = 0; k < ends[0].length - 1; k++) {
            //go to each section
            var sectionParams = line.sectionsParams[k];
            var caretTailPosition = calculateCaretPosition(sectionParams.d * localCaretPositionPercentage * 0.01, sectionParams.m, sectionParams.oneByRootOnePlusMSquare, sectionParams.c, ends[0][k], ends[1][k], ends[0][k + 1], ends[1][k + 1]);

            //code to draw a perpendicular arrow at caretTailPosition.x, caretTailPosition.y
            var caretHeadPosition = calculateCaretPosition((lineDirection > 0 ? 1 : -1) * caretSize, sectionParams.m, sectionParams.oneByRootOnePlusMSquare, sectionParams.c, caretTailPosition.x, caretTailPosition.y, ends[0][k + 1], ends[1][k + 1]
                )
                ;
            var caretPerpendicularSlope = null;
            if (sectionParams.m == null) {
                caretPerpendicularSlope = 0;
            } else if (sectionParams.m != 0) {
                caretPerpendicularSlope = -1 / sectionParams.m;
            }
            var caretPerpendicularYIntercept = null;
            if (caretPerpendicularSlope != null) {
                caretPerpendicularYIntercept = caretTailPosition.y - caretPerpendicularSlope * caretTailPosition.x;
            }
            var caretFin1Position = calculateCaretPosition(caretSize, caretPerpendicularSlope, Math.abs(sectionParams.m) * sectionParams.oneByRootOnePlusMSquare, caretPerpendicularYIntercept, caretTailPosition.x, caretTailPosition.y);
            var caretFin2Position = calculateCaretPosition(-caretSize, caretPerpendicularSlope, Math.abs(sectionParams.m) * sectionParams.oneByRootOnePlusMSquare, caretPerpendicularYIntercept, caretTailPosition.x, caretTailPosition.y);
            caretCtx.beginPath();
            caretCtx.moveTo(caretFin1Position.x, caretFin1Position.y);
            caretCtx.lineTo(caretHeadPosition.x, caretHeadPosition.y);
            caretCtx.lineTo(caretFin2Position.x, caretFin2Position.y);
            caretCtx.closePath();
            caretCtx.stroke();
            /**
             //code to draw a circle/square at caretTailPosition.x, caretTailPosition.y
             caretCtx.beginPath();
             //caretCtx.arc(caretTailPosition.x, caretTailPosition.y, caretSize, 0, 2 * Math.PI);
             caretCtx.rect(caretTailPosition.x - caretSize, caretTailPosition.y - caretSize, caretSize * 2, caretSize * 2);
             caretCtx.stroke();
             **/
        }
    }
}

function clearCarets() {
    var canvas = document.getElementById("caretCanvas");

    //get the canvas context for drawing
    var ctx = canvas.getContext("2d");

    //clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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