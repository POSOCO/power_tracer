"use strict";

function LineTracer(opt_options) {
    //initial values
    var lines_g = [];
    var plotting_canvas_g = null;
    var line_colors_g = ["#6495ED", "#FF69B4", "#FF0000"];
    var thickness_per_MW_g = 0.01; //1 pixels per 100 MW
    var thickness_per_unit_g = 6; //6 pixels per nominal MW
    var thickness_threshold_g = 15; //max line width is 15 pixels
    var plot_mode_g = 0; //0 => plot absolute power; 1 => plot absolute/nominal power

    //caret variables
    var caretCanvas;
    var caretCtx;
    var caretPositionPercentage = 0;
    var caretSize = 10;
    var arrowHandler = null;
    var arrowFrameDelay = 100;

    // set provided options, if any
    if (opt_options) {
        setOptions(opt_options);
    }

    function setOptions(options) {
        if (options.lines !== undefined) {
            set_lines(options.lines);
        }
        if (options.canvas !== undefined) {
            set_canvas(options.canvas);
        }
        if (options.caret_canvas !== undefined) {
            set_caret_canvas(options.caret_canvas);
        }
        if (options.colors !== undefined) {
            set_line_colors(options.colors);
        }
        if (options.thickness_per_mw !== undefined) {
            set_thickness_per_MW(options.thickness_per_mw);
        }
        if (options.thickness_per_unit !== undefined) {
            set_thickness_per_unit(options.thickness_per_unit);
        }
        if (options.thickness_threshold !== undefined) {
            set_thickness_threshold(options.thickness_threshold);
        }
        if (options.mode !== undefined && !isNaN(options.mode) && options.mode >= 0 && options.mode <= 1) {
            set_plot_mode(options.mode);
        }
        if (options.arrow_delay != undefined) {
            set_arrow_delay(options.arrow_delay);
        }
        if (options.caret_size != undefined) {
            set_caret_size(options.caret_size);
        }
    }

    //setters
    this.set_lines = set_lines;
    this.push_line = push_line;
    this.set_canvas = set_canvas;
    this.set_line_colors = set_line_colors;
    this.set_thickness_per_MW = set_thickness_per_MW;
    this.set_thickness_per_unit = set_thickness_per_unit;
    this.set_thickness_threshold = set_thickness_threshold;
    this.set_plot_mode = set_plot_mode;
    this.set_arrow_delay = set_arrow_delay;
    this.set_caret_size = set_caret_size;

    //getters
    this.get_lines = get_lines;
    this.get_canvas = get_canvas;
    this.get_line_colors = get_line_colors;
    this.get_thickness_per_MW = get_thickness_per_MW;
    this.get_thickness_per_unit = get_thickness_per_unit;
    this.get_thickness_threshold = get_thickness_threshold;
    this.get_plot_mode = get_plot_mode;
    this.get_arrow_delay = get_arrow_delay;
    this.get_caret_size = get_caret_size;

    //Public Methods
    this.plot_lines = plot_lines;
    this.plot_arrows = plot_arrows;
    this.stop_and_clear_arrows = stop_and_clear_arrows;
    this.set_canvas_params = set_line_canvas_params;
    this.server_fetch = server_fetch;

    /**Setters**/
    function set_lines(linesInput) {
        //TODO check if all values are numbers etc
        lines_g = linesInput;
        setCaretParams();
    }

    function push_line(lineInput) {
        //TODO check if line input is an instance of PowerLine
        lines_g.push(lineInput);
    }

    function set_canvas(canvas) {
        plotting_canvas_g = canvas;
        set_line_canvas_params();
    }

    function set_caret_canvas(canvas) {
        caretCanvas = canvas;
        set_caret_canvas_params();
    }

    function set_line_colors(colors) {
        line_colors_g = colors;
    }

    function set_thickness_per_MW(thickness_per_mw) {
        thickness_per_MW_g = thickness_per_mw;
    }

    function set_thickness_per_unit(thickness_per_unit) {
        thickness_per_unit_g = thickness_per_unit;
    }

    function set_thickness_threshold(threshold) {
        thickness_threshold_g = threshold;
    }

    function set_plot_mode(mode) {
        plot_mode_g = mode;
    }

    function set_arrow_delay(delay) {
        arrowFrameDelay = delay;
    }

    function set_caret_size(size) {
        caretSize = size;
    }

    /**Getters**/
    function get_lines() {
        //TODO check if all values are numbers etc
        return lines_g;
    }

    function get_canvas() {
        return plotting_canvas_g;
    }

    function get_line_colors(colors) {
        return line_colors_g;
    }

    function get_thickness_per_MW() {
        return thickness_per_MW_g;
    }

    function get_thickness_per_unit() {
        return thickness_per_unit_g;
    }

    function get_thickness_threshold() {
        return thickness_threshold_g;
    }

    function get_plot_mode() {
        return plot_mode_g;
    }

    function get_arrow_delay() {
        return arrowFrameDelay;
    }

    function get_caret_size() {
        return caretSize;
    }

    function line_color_function(line_power, line_emergency_flow_levels) {
        var level = 0;
        for (var i = 0; i < line_emergency_flow_levels.length; i++) {
            if (line_power >= line_emergency_flow_levels[i]) {
                level = i;
            }
        }
        return line_colors_g[level];
    }

    function line_thickness_function(line_power, nominal_power, is_PU) {
        var thickness = 1;
        if (is_PU) {
            //thickness based on PU flow
            if (nominal_power > 0) {
                thickness = line_power * thickness_per_unit_g / nominal_power;
            }
        }
        else {
            //thickness **NOT** based on PU flow
            return line_power * thickness_per_MW_g;
        }
        return thickness;
    }

    function plot_lines() {
        var canvas = plotting_canvas_g;

        //get the canvas context for drawing
        var ctx = canvas.getContext("2d");

        /*console.log("canvas width is " + canvas.width);
         console.log("canvas height is " + canvas.height);*/

        //clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //get all the lines
        var lines = lines_g;
        for (var i = 0; i < lines.length; i++) {
            //fetch a line
            var line = lines[i];

            //determine the line thickness and line power direction
            //here we are accommodating the line plotter mode
            var thickness = line_thickness_function(line.get_line_power(), line.get_line_nominal_flow(), plot_mode_g);
            var lineDirection = (thickness == Math.abs(thickness)) ? 1 : -1;
            var thicknessThreshold = get_thickness_threshold();
            ctx.lineWidth = (Math.abs(thickness) > thicknessThreshold) ? thicknessThreshold : Math.abs(thickness);

            //determine the line color
            var color = line_color_function(Math.abs(line.get_line_power()), line.get_line_emergency_flow_levels());
            ctx.strokeStyle = color;

            //determine the line end points
            var ends = line.get_line_end_points();

            //plot the line
            ctx.beginPath();
            ctx.moveTo(ends[0][0], ends[1][0]);
            for (var k = 1; k < ends[0].length; k++) {
                ctx.lineTo(ends[0][k], ends[1][k]);
            }
            ctx.stroke();
        }
    }

    function plot_arrows() {
        stop_and_clear_arrows();
        arrowHandler = window.requestInterval(drawLinesCarets, arrowFrameDelay);
    }

    function stop_and_clear_arrows() {
        if (arrowHandler != null) {
            window.clearRequestInterval(arrowHandler);
        }
        clearCarets();
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

    function set_line_canvas_params() {
        var canvas = plotting_canvas_g;
        set_canvas_params(canvas);
    }

    function set_caret_canvas_params() {
        var canvas = caretCanvas;
        set_canvas_params(canvas);
        caretCtx = caretCanvas.getContext("2d");
        caretCtx.strokeStyle = "#FFFFFF";
    }

    function setCaretParams() {
        for (var i = 0; i < lines_g.length; i++) {
            var line = lines_g[i];
            var ends = line.get_line_end_points();
            var lineSectionsParamsObjects = [];
            for (var k = 0; k < ends[0].length - 1; k++) {
                lineSectionsParamsObjects.push(getLineSectionParams(ends[0][k], ends[1][k], ends[0][k + 1], ends[1][k + 1]));
            }
            lines_g[i].sectionsParams = lineSectionsParamsObjects;
        }
    }

    function getLineSectionParams(x1, y1, x2, y2) {
        if (x2 == x1) {
            //Infinity slope case to be handled by the tracer as x = x1 and y = min(y1, y2) + l
            var d12 = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
            var m12 = null;
            var c12 = null;
            var oneByRootOnePlusMSquare = null;
        } else {
            m12 = (y2 - y1) / (x2 - x1);
            c12 = y1 - m12 * x1;

            var RootOnePlusMSquare = Math.sqrt(1 + m12 * m12);

            d12 = Math.abs(x2 - x1) * RootOnePlusMSquare;
            oneByRootOnePlusMSquare = 1 / RootOnePlusMSquare;
        }
        return {
            m: m12,
            c: c12,
            d: d12,
            oneByRootOnePlusMSquare: oneByRootOnePlusMSquare
        };
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
        var lines = lines_g;

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
                var caretHeadPosition = calculateCaretPosition((lineDirection > 0 ? 1 : -1) * caretSize, sectionParams.m, sectionParams.oneByRootOnePlusMSquare, sectionParams.c, caretTailPosition.x, caretTailPosition.y, ends[0][k + 1], ends[1][k + 1]);
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
        var canvas = caretCanvas;

        //get the canvas context for drawing
        var ctx = canvas.getContext("2d");

        //clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }


    function server_fetch(point_address, done) {
        //fetch from server using the point id
        $.ajax({
                //get line power data using ajax GET request from the address
                url: point_address,
                type: "GET",
                dataType: "json",
                success: (function (point_address) {
                    return function (data) {
                        //console.log(data);
                        if (data["Error"] != null) {
                            WriteLineConsole("The point address value " + point_address + "couldn't be found, Error ==> " + JSON.stringify(data.Error));
                            done(data.Error);
                        } else {
                            if (data.val == null) {
                                done("Null value returned from server for point address " + point_address);
                            } else if (isNaN(data.val)) {
                                done("Non Number value returned from server for point address " + point_address);
                            }
                            else {
                                done(null, data.val);
                            }
                        }
                    };
                })(point_address),
                error: (function (point_address) {
                    return function (jqXHR, textStatus, errorThrown) {
                        //console.log(textStatus, errorThrown);
                        WriteLineConsole("The power from the point address " + point_address + " is not found :-(");
                        done("The point address value " + point_address + " couldn't be found, Error ==> " + errorThrown);
                    };
                })(point_address)
            }
        );
    }
}
