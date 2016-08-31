"use strict";

function LineTracer(opt_options) {
    //initial values
    this.lines = [];
    this.plotting_canvas = null;
    this.line_colors = ["#6495ED", "#FF69B4", "#FF0000"];
    this.thickness_per_MW = 0.001; //1 pixel per 50 MW => 10 pixels per 1000 MW

    this.setOptions = setOptions.bind(this);

    this.line_color_function = line_color_function.bind(this);

    this.line_thickness_function = line_thickness_function.bind(this);


    //setters
    this.set_lines = set_lines.bind(this);
    this.set_canvas = set_canvas.bind(this);
    this.set_line_colors = set_line_colors.bind(this);
    this.set_thickness_per_MW = set_thickness_per_MW.bind(this);
    //getters
    this.get_lines = get_lines.bind(this);
    this.get_canvas = get_canvas.bind(this);
    this.get_line_colors = get_line_colors.bind(this);
    this.get_thickness_per_MW = get_thickness_per_MW.bind(this);

    this.plot_lines = plot_lines.bind(this);

    // set provided options, if any
    if (opt_options) {
        this.setOptions(opt_options);
    }

    function setOptions(options) {
        if (options.lines !== undefined) {
            this.set_lines(options.lines);
        }
        if (options.canvas !== undefined) {
            this.set_canvas(options.canvas);
        }
        if (options.colors !== undefined) {
            this.set_line_colors(options.colors);
        }
        if (options.thickness_per_mw !== undefined) {
            this.thickness_per_MW(options.thickness_per_mw);
        }
    }

    /**Setters**/
    function set_lines(lines) {
        //TODO check if all values are numbers etc
        this.lines = lines;
    }

    function set_canvas(canvas) {
        this.plotting_canvas = canvas;
    }

    function set_line_colors(colors) {
        this.line_colors = colors;
    }

    function set_thickness_per_MW(thickness_per_mw) {
        this.thickness_per_MW = thickness_per_mw;
    }

    /**Getters**/
    function get_lines() {
        //TODO check if all values are numbers etc
        return this.lines;
    }

    function get_canvas() {
        return this.plotting_canvas;
    }

    function get_line_colors(colors) {
        return this.line_colors;
    }

    function get_thickness_per_MW(thickness_per_mw) {
        return this.thickness_per_MW;
    }

    function line_color_function(line_power, line_emergency_flow_levels) {
        var level = 0;
        for (var i = 0; i < line_emergency_flow_levels.length; i++) {
            if (line_power >= line_emergency_flow_levels[i]) {
                level = i;
            }
        }
        return this.line_colors[level];
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
            return line_power * this.thickness_per_MW;
        }
        return thickness;
    }

    function plot_lines() {
        var canvas = this.plotting_canvas;
        //get the canvas context for drawing
        var ctx = canvas.getContext("2d");
        setCanvasParams(canvas);
        //clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var lines = this.lines;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            //determine the line thickness
            var thickness = this.line_thickness_function(line.get_line_power());
            ctx.lineWidth = thickness;
            //determine the line color
            var color = this.line_color_function(line.get_line_power(), line.get_line_emergency_flow_levels());
            ctx.strokeStyle = color;
            //determine the line end points
            var ends = line.get_line_end_points();
            //plot the line
            //TODO PLOT THE LINE
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
