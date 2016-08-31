"use strict";

function PowerLine(opt_options) {
    //initial values
    this.line_ends = [];
    this.line_power = 0;
    this.line_emergency_flow_levels = [0, 600];
    this.line_colors = ["#6495ED", "#FF69B4", "#FF0000"];
    this.line_min_width = 0.1;
    this.line_max_width = 10;
    this.line_voltage_level = 400;
    //setters
    this.line_color_function = line_color_function.bind(this);
    this.line_thickness_function = line_thickness_function.bind(this);
    this.set_line_end_points = set_line_end_points.bind(this);
    this.set_line_power = set_line_power.bind(this);
    //getters
    this.get_line_voltage = get_line_voltage.bind(this);
    this.get_line_end_points = get_line_end_points.bind(this);
    this.get_line_power = get_line_power.bind(this);
    this.get_line_voltage = get_line_voltage.bind(this);
  
  // set provided options, if any
    if (opt_options) {
        setOptions(opt_options);
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
    };

    function set_line_end_points(endPoints){
        //TODO check if all values are numbers etc
        this.line_ends = endPoints;
    }
    
    function set_line_power(power){
        if(!isNaN(power)){
            this.line_power = power;
        }
    }
    
    function set_line_voltage(voltage){
        if(!isNaN(voltage)){
            this.line_voltage_level = voltage;
        }
    }
    
    function get_line_end_points(endPoints){
        //TODO check if all values are numbers etc
        return this.line_ends;
    }
    
    function get_line_power(power){
        return this.line_power;
    }
    
    function get_line_voltage(voltage){
        return this.line_voltage_level;
    }

    function line_color_function(power) {
        var level = 0;
        for (var i = 0; i < line_emergency_flow_levels.length; i++) {
            if (power >= line_emergency_flow_levels[i]) {
            level = i;
            }
        }
        return this.colors[level];
    };
    
    function line_thickness_function(power) {
        var thickness = 1;
        if (line_emergency_flow_levels.length > 1 && line_emergency_flow_levels[1] > 1) {
            thickness = line_power / line_emergency_flow_levels[1];
        }
        return thickness;
    };

}
