"use strict";

function LineTracer(opt_options) {
    //initial values
    this.lines = [];
    this.plotting_canvas = null;

    this.setOptions = setOptions.bind(this);
    this.line_color_function = line_color_function.bind(this);
    this.line_thickness_function = line_thickness_function.bind(this);
    this.line_colors = ["#6495ED", "#FF69B4", "#FF0000"];
    //setters
    this.set_lines = set_lines.bind(this);
    this.set_canvas = set_canvas.bind(this);
    //getters
    this.get_lines = get_lines.bind(this);
    this.get_canvas = get_canvas.bind(this);

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
    }

    /**Setters**/
    function set_lines(lines) {
        //TODO check if all values are numbers etc
        this.lines = lines;
    }

    function set_canvas(canvas) {
            this.plotting_canvas = canvas;
    }

    /**Getters**/
    function get_lines() {
        //TODO check if all values are numbers etc
        return this.lines;
    }

    function get_canvas() {
        return this.plotting_canvas;
    }

    function line_color_function(power, line_emergency_flow_levels) {
        var level = 0;
        for (var i = 0; i < line_emergency_flow_levels.length; i++) {
            if (power >= line_emergency_flow_levels[i]) {
                level = i;
            }
        }
        return this.line_colors[level];
    }

    function line_thickness_function(power, line_emergency_flow_levels) {
        var thickness = 1;
        if (line_emergency_flow_levels.length > 1 && line_emergency_flow_levels[1] > 1) {
            thickness = power / line_emergency_flow_levels[1];
        }
        return thickness;
    }
}
