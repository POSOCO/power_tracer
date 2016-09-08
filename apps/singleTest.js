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
    tracer = new LineTracer({
        "canvas": lineCanvas,
        "lines": [line, line1, line2],
        "colors": ["#6495ED", "#FF69B4", "#FF0000"],
        "thickness_per_mw": 0.01,
        "thickness_per_unit": 6,
        "thickness_threshold": 15,
        "mode": 0
    });
    tracer.plot_lines();
}

function showValue(newVal) {
    document.getElementById("power_input_label").innerHTML = newVal;
    line2.set_line_power(newVal);
    tracer.plot_lines();
}

// assign function to onclick property of checkbox
document.getElementById('isPerUnitMode').onclick = function() {
    // access properties using this keyword
    if ( this.checked ) {
        // if checked ...
        tracer.set_plot_mode(1);
    } else {
        // if not checked ...
        tracer.set_plot_mode(0);
    }
    tracer.plot_lines();
};