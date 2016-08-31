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
var tracer;
function onDomComplete() {
    var lineCanvas = document.getElementById("myCanvas");
    var line = new PowerLine({
        "ends": [[10, 100], [10, 100]],
        "power": 650,
        "levels": [0, 600, 800]
    }); //(10,10);(100,100)
    var line1 = new PowerLine({
        "ends": [[200, 250], [200, 250]],
        "power": 50,
        "levels": [0, 600, 800]
    });//(20,20);(110,110)
    line2 = new PowerLine({
        "ends": [[300, 250], [200, 450]],
        "power": 900,
        "levels": [0, 600, 800]
    });//(20,20);(110,110)
    tracer = new LineTracer({
        "canvas": lineCanvas,
        "lines": [line, line1, line2]
    });
    tracer.plot_lines();
}

function showValue(newVal) {
    document.getElementById("power_input_label").innerHTML = newVal;
    line2.set_line_power(newVal);
    tracer.plot_lines();
}