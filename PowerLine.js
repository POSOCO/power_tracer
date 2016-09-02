"use strict";

function PowerLine(opt_options) {
    //initial values
    var line_ends_g = [];
    var line_power_g = 0;
    var line_color_g = "6495ED";
    var line_thickness_g = 1;
    var line_emergency_flow_levels_g = [0, 600];
    var line_voltage_level_g = 400;

    // set provided options, if any
    if (opt_options) {
        setOptions(opt_options);
    }

    function setOptions(options) {
        if (options.ends !== undefined) {
            set_line_end_points(options.ends);
        }
        if (options.power !== undefined) {
            set_line_power(options.power);
        }
        if (options.voltage !== undefined) {
            set_line_voltage(options.voltage);
        }
        if (options.levels !== undefined) {
            set_line_emergency_flow_levels(options.levels);
        }
    }

    //setters
    this.set_line_end_points = set_line_end_points;
    this.set_line_power = set_line_power;
    this.set_line_color = set_line_color;
    this.set_line_thickness = set_line_thickness;
    this.set_line_emergency_flow_levels = set_line_emergency_flow_levels;
    this.set_line_voltage = set_line_voltage;

    //getters
    this.get_line_end_points = get_line_end_points;
    this.get_line_power = get_line_power;
    this.get_line_color = get_line_color;
    this.get_line_thickness = get_line_thickness;
    this.get_line_emergency_flow_levels = get_line_emergency_flow_levels;
    this.get_line_voltage = get_line_voltage;

    /**Setters**/
    function set_line_end_points(endPoints) {
        line_ends_g = endPoints;
    }

    function set_line_power(power) {
        line_power_g = power;
    }

    function set_line_color(color) {
        line_color_g = color;
    }

    function set_line_thickness(thickness) {
        line_thickness_g = thickness;
    }

    function set_line_emergency_flow_levels(levels) {
        line_emergency_flow_levels_g = levels;
    }

    function set_line_voltage(voltage) {
        if (!isNaN(voltage)) {
            line_voltage_level_g = voltage;
        }
    }

    /**Getters**/
    function get_line_end_points() {
        //TODO check if all values are numbers etc
        return line_ends_g;
    }

    function get_line_power() {
        return line_power_g;
    }

    function get_line_color() {
        return line_color_g;
    }

    function get_line_thickness() {
        return line_thickness_g;
    }

    function get_line_emergency_flow_levels() {
        return line_emergency_flow_levels_g;
    }

    function get_line_voltage() {
        return line_voltage_level_g;
    }
}
