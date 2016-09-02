"use strict";

function PowerLine(opt_options) {
    //initial values
    this.line_ends = [];
    this.line_power = 0;
    this.line_color = "6495ED";
    this.line_thickness = 1;
    this.line_emergency_flow_levels = [0, 600];
    this.line_voltage_level = 400;

    this.setOptions = setOptions.bind(this);

    //setters
    this.set_line_end_points = set_line_end_points.bind(this);
    this.set_line_power = set_line_power.bind(this);
    this.set_line_color = set_line_color.bind(this);
    this.set_line_thickness = set_line_thickness.bind(this);
    this.set_line_emergency_flow_levels = set_line_emergency_flow_levels.bind(this);
    this.set_line_voltage = set_line_voltage.bind(this);
    //getters
    this.get_line_end_points = get_line_end_points.bind(this);
    this.get_line_power = get_line_power.bind(this);
    this.get_line_color = get_line_color.bind(this);
    this.get_line_thickness = get_line_thickness.bind(this);
    this.get_line_emergency_flow_levels = get_line_emergency_flow_levels.bind(this);
    this.get_line_voltage = get_line_voltage.bind(this);

    // set provided options, if any
    if (opt_options) {
        this.setOptions(opt_options);
    }

    function setOptions(options) {
        if (options.ends !== undefined) {
            this.set_line_end_points(options.ends);
        }
        if (options.power !== undefined) {
            this.set_line_power(options.power);
        }
        if (options.voltage !== undefined) {
            this.set_line_voltage(options.voltage);
        }
        if (options.levels !== undefined) {
            this.set_line_emergency_flow_levels(options.levels);
        }
    }

    /**Setters**/
    function set_line_end_points(endPoints) {
        this.line_ends = endPoints;
    }

    function set_line_power(power) {
        this.line_power = power;
    }

    function set_line_color(color) {
        this.line_color = color;
    }

    function set_line_thickness(thickness) {
        this.line_thickness = thickness;
    }

    function set_line_emergency_flow_levels(levels) {
        this.line_emergency_flow_levels = levels;
    }

    function set_line_voltage(voltage) {
        if (!isNaN(voltage)) {
            this.line_voltage_level = voltage;
        }
    }

    /**Getters**/
    function get_line_end_points() {
        //TODO check if all values are numbers etc
        return this.line_ends;
    }

    function get_line_power() {
        return this.line_power;
    }

    function get_line_color() {
        return this.line_color;
    }

    function get_line_thickness() {
        return this.line_thickness;
    }

    function get_line_emergency_flow_levels() {
        return this.line_emergency_flow_levels;
    }

    function get_line_voltage() {
        return this.line_voltage_level;
    }
}
