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

    //getters
    this.get_lines = get_lines;
    this.get_canvas = get_canvas;
    this.get_line_colors = get_line_colors;
    this.get_thickness_per_MW = get_thickness_per_MW;
    this.get_thickness_per_unit = get_thickness_per_unit;
    this.get_thickness_threshold = get_thickness_threshold;
    this.get_plot_mode = get_plot_mode;

    //Public Methods
    this.plot_lines = plot_lines;
    this.set_canvas_params = set_canvas_params;
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
        set_canvas_params();
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

    function set_canvas_params() {
        var canvas = plotting_canvas_g;
        var ctx = canvas.getContext("2d");
        var xp = getComputedStyle(canvas, null).getPropertyValue('width');
        xp = xp.substring(0, xp.length - 2);
        ctx.canvas.width = xp;
        var yp = getComputedStyle(canvas, null).getPropertyValue('height');
        yp = yp.substring(0, yp.length - 2);
        ctx.canvas.height = yp;
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
