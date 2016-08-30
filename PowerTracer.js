"use strict";

function PowerLine(initializer) {
  this.line_ends = [];
  this.line_power = 0;
  this.line_emergency_flow_levels = [];
  this.line_colors = ["#0000ff", "#00ff00", "#ff0000"];
  this.line_color_function = line_color_function.bind(this);
  this.line_thickness_function = line_thickness_function.bind(this);

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
