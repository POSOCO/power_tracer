"use strict";

function PowerLine(opt_options) {
    //initial values
    var line_ends_g = [];
    var line_power_g = 0;
    var line_color_g = "6495ED";
    var line_thickness_g = 1;
    var line_emergency_flow_levels_g = [0, 600];
    var line_nominal_flow_g = 600;
    var line_voltage_level_g = 400;
    var line_address_g = "";
    var line_name_g = "Not Assigned";

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
        if (options.address !== undefined) {
            set_line_address(options.address);
        }
        if (options.nominal !== undefined) {
            set_line_nominal_flow(options.nominal);
        }
        if (options.name !== undefined) {
            set_line_name(options.name);
        }
    }

    //setters
    this.set_line_end_points = set_line_end_points;
    this.set_line_power = set_line_power;
    this.set_line_voltage = set_line_voltage;
    this.set_line_emergency_flow_levels = set_line_emergency_flow_levels;
    this.set_line_address = set_line_address;
    this.set_line_nominal_flow = set_line_nominal_flow;
    this.set_line_name = set_line_name;
    this.set_line_color = set_line_color;
    this.set_line_thickness = set_line_thickness;

    //getters
    this.get_line_end_points = get_line_end_points;
    this.get_line_power = get_line_power;
    this.get_line_voltage = get_line_voltage;
    this.get_line_emergency_flow_levels = get_line_emergency_flow_levels;
    this.get_line_address = get_line_address;
    this.get_line_nominal_flow = get_line_nominal_flow;
    this.get_line_name = get_line_name;
    this.get_line_color = get_line_color;
    this.get_line_thickness = get_line_thickness;

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

    function set_line_address(address) {
        line_address_g = address;
    }

    function set_line_nominal_flow(nominalFlow) {
        line_nominal_flow_g = nominalFlow;
    }

    function set_line_name(name) {
        line_name_g = name;
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

    function get_line_address() {
        return line_address_g;
    }

    function get_line_nominal_flow() {
        return line_nominal_flow_g;
    }

    function get_line_name() {
        return line_name_g;
    }
}
