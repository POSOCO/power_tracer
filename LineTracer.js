"use strict";

function LineTracer(opt_options) {
    //initial values
    var lines_g = [];
    var plotting_canvas_g = null;
    var line_colors_g = ["#6495ED", "#FF69B4", "#FF0000"];
    var thickness_per_MW_g = 0.01; //1 pixels per 100 MW

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
    }
	
	//setters
    this.set_lines = set_lines;
    this.set_canvas = set_canvas;
    this.set_line_colors = set_line_colors;
    this.set_thickness_per_MW = set_thickness_per_MW;
	
    //getters
    this.get_lines = get_lines;
    this.get_canvas = get_canvas;
    this.get_line_colors = get_line_colors;
    this.get_thickness_per_MW = get_thickness_per_MW;
	
	//Public Methods
	this.plot_lines = plot_lines;

    /**Setters**/
    function set_lines(linesInput) {
        //TODO check if all values are numbers etc
        lines_g = linesInput;
    }

    function set_canvas(canvas) {
        plotting_canvas_g = canvas;
    }

    function set_line_colors(colors) {
        line_colors_g = colors;
    }

    function set_thickness_per_MW(thickness_per_mw) {
        thickness_per_MW_g = thickness_per_mw;
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

    function line_color_function(line_power, line_emergency_flow_levels) {
        var level = 0;
        for (var i = 0; i < line_emergency_flow_levels.length; i++) {
            if (line_power >= line_emergency_flow_levels[i]) {
                level = i;
            }
        }
        return line_colors_g[level];
    }

    function line_thickness_function(line_power, line_emergency_flow_levels, is_PU) {
        var thickness = 1;
        if (is_PU) {
            //thickness based on PU flow
            if (line_emergency_flow_levels.length > 1 && line_emergency_flow_levels[1] > 1) {
                thickness = line_power / line_emergency_flow_levels[1];
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
        setCanvasParams(canvas);

        /*console.log("canvas width is " + canvas.width);
        console.log("canvas height is " + canvas.height);*/

        //clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //get all the lines
        var lines = lines_g;
        for (var i = 0; i < lines.length; i++) {
            //fetch a line
            var line = lines[i];

            //determine the line thickness
            var thickness = line_thickness_function(line.get_line_power());
            ctx.lineWidth = thickness;

            //determine the line color
            var color = line_color_function(line.get_line_power(), line.get_line_emergency_flow_levels());
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

    function setCanvasParams(canvas) {
        var ctx = canvas.getContext("2d");
        var xp = getComputedStyle(canvas, null).getPropertyValue('width');
        xp = xp.substring(0, xp.length - 2);
        ctx.canvas.width = xp;
        var yp = getComputedStyle(canvas, null).getPropertyValue('height');
        yp = yp.substring(0, yp.length - 2);
        ctx.canvas.height = yp;
    }
}
