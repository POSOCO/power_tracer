"use strict";

function LineTracer(opt_options) {
    //initial values
    var lines_g = [];
    var plotting_canvas_g = null;
    var line_colors_g = ["#6495ED", "#FF69B4", "#FF0000"];
    var line_voltage_colors_g = {765: "#FFFF00", 400: "#FF0000", 220: "#00FF00", 132: "#0000FF"};
    var border_color_g = "#AAAAAA";
    var line_plain_color_g = "#DDDDDD";
    var thickness_per_MW_g = 0.01; //1 pixels per 100 MW
    var thickness_per_unit_g = 6; //6 pixels per nominal MW
    var thickness_threshold_g = 15; //max line width is 15 pixels
    var plot_mode_g = 0; //0 => plot absolute power; 1 => plot absolute/nominal power
    var plot_765 = false;
    var plot_400 = false;
    var plot_220 = false;
    var plot_border = false;
    var plot_address_less_lines = false;
    var plot_null_power_lines = false;
    var line_color_mode = "severity";
    var xOffset_ = 0;
    var yOffset_ = 0;
    var scale_ = 5;

    //caret variables
    var caretCanvas;
    var caretCtx;
    var caretPositionPercentage = 0;
    var caretSize = 5;
    var arrowHandler = null;
    var arrowFrameDelay = 100;
    var caret_mode_ = "rect";
    var caret_fill_ = "fill";

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
        if (options.caret_mode != undefined) {
            set_caret_mode(options.caret_mode);
        }
        if (options.caret_fill != undefined) {
            set_caret_mode(options.caret_fill);
        }
        if (options.line_color_mode != undefined) {
            set_line_color_mode(options.line_color_mode);
        }
        if (options.plot_only != undefined) {
            if (options.plot_only.indexOf(765) != -1) {
                set_plot_765(true);
            }
            if (options.plot_only.indexOf(400) != -1) {
                set_plot_400(true);
            }
            if (options.plot_only.indexOf(220) != -1) {
                set_plot_220(true);
            }
            if (options.plot_only.indexOf("border") != -1) {
                set_plot_border(true);
            }
            if (options.plot_only.indexOf("address_less") != -1) {
                set_plot_address_less_lines(true);
            }
            if (options.plot_only.indexOf("null_power") != -1) {
                set_plot_null_power_lines(true);
            }
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
    this.set_plot_765 = set_plot_765;
    this.set_plot_400 = set_plot_400;
    this.set_plot_220 = set_plot_220;
    this.set_plot_border = set_plot_border;
    this.set_plot_address_less_lines = set_plot_address_less_lines;
    this.set_plot_null_power_lines = set_plot_null_power_lines;
    this.set_arrow_delay = set_arrow_delay;
    this.set_caret_size = set_caret_size;
    this.set_caret_mode = set_caret_mode;
    this.set_line_color_mode = set_line_color_mode;
    this.set_caret_fill = set_caret_fill;
    this.set_xOffset = set_xOffset;
    this.set_yOffset = set_yOffset;
    this.set_scale = set_scale;


    //getters
    this.get_lines = get_lines;
    this.get_canvas = get_canvas;
    this.get_line_colors = get_line_colors;
    this.get_thickness_per_MW = get_thickness_per_MW;
    this.get_thickness_per_unit = get_thickness_per_unit;
    this.get_thickness_threshold = get_thickness_threshold;
    this.get_plot_mode = get_plot_mode;
    this.get_plot_765 = get_plot_765;
    this.get_plot_400 = get_plot_400;
    this.get_plot_220 = get_plot_220;
    this.get_plot_border = get_plot_border;
    this.get_plot_address_less_lines = get_plot_address_less_lines;
    this.get_plot_null_power_lines = get_plot_null_power_lines;
    this.get_arrow_delay = get_arrow_delay;
    this.get_caret_size = get_caret_size;
    this.get_caret_mode = get_caret_mode;
    this.get_line_color_mode = get_line_color_mode;
    this.get_caret_fill = get_caret_fill;
    this.get_xOffset = get_xOffset;
    this.get_yOffset = get_yOffset;
    this.get_scale = get_scale;

    //Public Methods
    this.plot_lines = plot_lines;
    this.plot_arrows = plot_arrows;
    this.stop_and_clear_arrows = stop_and_clear_arrows;
    this.set_canvas_params = set_line_canvas_params;
    this.server_fetch = server_fetch;
    this.addXOffset = addXOffset;
    this.addYOffset = addYOffset;
    this.addZoom = addZoom;
    this.setCaretParams = setCaretParams;

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

    function set_plot_765(bool) {
        plot_765 = bool;
    }

    function set_plot_400(bool) {
        plot_400 = bool;
    }

    function set_plot_220(bool) {
        plot_220 = bool;
    }

    function set_plot_border(bool) {
        plot_border = bool;
    }

    function set_plot_address_less_lines(bool) {
        plot_address_less_lines = bool;
    }

    function set_plot_null_power_lines(bool) {
        plot_null_power_lines = bool;
    }

    function set_arrow_delay(delay) {
        arrowFrameDelay = delay;
    }

    function set_caret_size(size) {
        caretSize = size;
    }

    function set_caret_mode(mode) {
        caret_mode_ = mode;
    }

    function set_line_color_mode(mode) {
        line_color_mode = mode;
    }

    function set_caret_fill(mode) {
        caret_fill_ = mode;
    }

    function set_xOffset(xOffset) {
        xOffset_ = xOffset;
    }

    function set_yOffset(yOffset) {
        yOffset_ = yOffset;
    }

    function set_scale(scale) {
        scale_ = scale;
    }

    /**Getters**/
    function get_lines() {
        //TODO check if all values are numbers etc
        return lines_g;
    }

    function get_canvas() {
        return plotting_canvas_g;
    }

    function get_line_colors() {
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

    function get_plot_765() {
        return plot_765;
    }

    function get_plot_400() {
        return plot_400;
    }

    function get_plot_220() {
        return plot_220;
    }

    function get_plot_border() {
        return plot_border;
    }

    function get_plot_address_less_lines() {
        return plot_address_less_lines;
    }

    function get_plot_null_power_lines() {
        return plot_null_power_lines;
    }

    function get_arrow_delay() {
        return arrowFrameDelay;
    }

    function get_caret_size() {
        return caretSize;
    }

    function get_caret_mode() {
        return caret_mode_;
    }

    function get_line_color_mode() {
        return line_color_mode;
    }

    function get_caret_fill() {
        return caret_fill_;
    }

    function get_xOffset() {
        return xOffset_;
    }

    function get_yOffset() {
        return yOffset_;
    }

    function get_scale() {
        return scale_;
    }

    function line_color_function(line_power, line_emergency_flow_levels, line_voltage) {
        if (line_power == null) {
            return border_color_g;
        }
        if (line_color_mode == "severity") {
            var level = 0;
            for (var i = 0; i < line_emergency_flow_levels.length; i++) {
                if (line_power >= line_emergency_flow_levels[i]) {
                    level = i;
                }
            }
            return line_colors_g[level];
        } else if (line_color_mode == "plain") {
            return line_plain_color_g;
        } else if (line_color_mode == "voltage") {
            var color = line_voltage_colors_g[line_voltage];
            return (color == undefined ? line_plain_color_g : color);
        }
        return border_color_g;
    }

    function line_thickness_function(line_power, nominal_power, is_PU) {
        var thickness = 1;
        if (line_power == null) {
            return thickness;
        }
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
            /* Find if to plot layer Start */
            if (line.get_line_voltage() == 765 && plot_765 == false) {
                continue;
            }
            if (line.get_line_voltage() == 400 && plot_400 == false) {
                continue;
            }
            if (line.get_line_voltage() == 220 && plot_220 == false) {
                continue;
            }
            if (line.get_line_voltage() == null && plot_border == false) {
                continue;
            }
            /* Find if to plot layer End */
            /* Don't plot if no edna Id*/
            if (line.get_line_voltage() != null && line.get_line_address() == null && plot_address_less_lines == false) {
                continue;
            }
            /* Don't plot if no power */
            if (line.get_line_voltage() != null && line.get_line_power() == null && plot_null_power_lines == false) {
                continue;
            }
            //determine the line thickness and line power direction
            //here we are accommodating the line plotter mode
            var thickness = line_thickness_function(line.get_line_power(), line.get_line_nominal_flow(), plot_mode_g);
            var lineDirection = (thickness == Math.abs(thickness)) ? 1 : -1;
            var thicknessThreshold = get_thickness_threshold();
            ctx.lineWidth = (Math.abs(thickness) > thicknessThreshold) ? thicknessThreshold : Math.abs(thickness);

            //determine the line color
            var lineColor = line_color_function(((line.get_line_power() != null) ? Math.abs(line.get_line_power()) : null), line.get_line_emergency_flow_levels(), line.get_line_voltage());
            ctx.strokeStyle = lineColor;

            //determine the line end points
            var ends = line.get_line_end_points();

            //plot the line
            ctx.beginPath();
            ctx.moveTo((ends[0][0] + xOffset_) / scale_, (ends[1][0] + yOffset_) / scale_);
            for (var k = 1; k < ends[0].length; k++) {
                ctx.lineTo((ends[0][k] + xOffset_) / scale_, (ends[1][k] + yOffset_) / scale_);
            }
            ctx.stroke();
        }
        setCaretParams();
    }

    function plot_arrows() {
        stop_arrows();
        arrowHandler = window.requestInterval(drawLinesCarets, arrowFrameDelay);
    }

    function stop_arrows() {
        if (arrowHandler != null) {
            window.clearRequestInterval(arrowHandler);
        }
    }

    function stop_and_clear_arrows() {
        stop_arrows();
        clearCarets();
    }

    function clearCarets() {
        var canvas = caretCanvas;
        var ctx = canvas.getContext("2d");
        //clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        caretCtx.fillStyle = "#FFFFFF";
    }

    function setCaretParams() {
        for (var i = 0; i < lines_g.length; i++) {
            var line = lines_g[i];
            if (line.get_line_voltage() == null) {
                continue;
            }
            var ends = line.get_line_end_points();
            var lineSectionsParamsObjects = [];
            for (var k = 0; k < ends[0].length - 1; k++) {
                lineSectionsParamsObjects.push(getLineSectionParams((ends[0][k] + xOffset_) / scale_, (ends[1][k] + yOffset_) / scale_, (ends[0][k + 1] + xOffset_) / scale_, (ends[1][k + 1] + yOffset_) / scale_));
            }
            lines_g[i].sectionsParams = lineSectionsParamsObjects;
        }
    }

    function getLineSectionParams(x1, y1, x2, y2) {
        // return cos theta and sin theta and line length
        var sinTheta = null;
        var cosTheta = null;
        var d12 = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
        sinTheta = (y2 - y1) / d12;
        cosTheta = (x2 - x1) / d12;
        return {
            d: d12,
            sin: sinTheta,
            cos: cosTheta
        };
    }

    function calculateNextCaretPosition(l, x1, y1, sinTheta, cosTheta) {
        //var l = d * percentageOfSection * 0.01;
        var x = x1 + l * cosTheta;
        var y = y1 + l * sinTheta;
        return {x: x, y: y};
    }

    function drawLinesCarets() {
        //increase the caretPositionPercentPosition by 10 and revert back to zero if >100
        caretPositionPercentage = caretPositionPercentage + 4;
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

            if (line.get_line_voltage() == null || line.get_line_power() == null || line.get_line_power() == 0) {
                continue;
            }
            /* Layer Masking Check Start */
            if (line.get_line_voltage() == 765 && plot_765 == false) {
                continue;
            }
            if (line.get_line_voltage() == 400 && plot_400 == false) {
                continue;
            }
            if (line.get_line_voltage() == 220 && plot_220 == false) {
                continue;
            }
            /* Layer Masking Check End */

            /* Don't plot if no edna Id*/
            if (line.get_line_voltage() != null && line.get_line_address() == null && plot_address_less_lines == false) {
                continue;
            }

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
                var caretTailPosition = calculateNextCaretPosition(sectionParams.d * localCaretPositionPercentage * 0.01, (ends[0][k] + xOffset_) / scale_, (ends[1][k] + yOffset_) / scale_, sectionParams.sin, sectionParams.cos);
                if (caret_mode_ == "arrow") {
                    //code to draw a perpendicular arrow at caretTailPosition.x, caretTailPosition.y
                    var caretHeadPosition = calculateNextCaretPosition((lineDirection > 0 ? 1 : -1) * caretSize * 2, caretTailPosition.x, caretTailPosition.y, sectionParams.sin, sectionParams.cos);
                    var caretFin1Position = calculateNextCaretPosition(caretSize * 2, caretTailPosition.x, caretTailPosition.y, sectionParams.cos, -sectionParams.sin);
                    var caretFin2Position = calculateNextCaretPosition(-caretSize * 2, caretTailPosition.x, caretTailPosition.y, sectionParams.cos, -sectionParams.sin);
                    caretCtx.beginPath();
                    caretCtx.moveTo(caretFin1Position.x, caretFin1Position.y);
                    caretCtx.lineTo(caretHeadPosition.x, caretHeadPosition.y);
                    caretCtx.lineTo(caretFin2Position.x, caretFin2Position.y);
                    caretCtx.closePath();
                }
                else if (caret_mode_ == "circle") {
                    //code to draw a circle/square at caretTailPosition.x, caretTailPosition.y
                    caretCtx.beginPath();
                    caretCtx.arc(caretTailPosition.x, caretTailPosition.y, caretSize, 0, 2 * Math.PI);
                    //caretCtx.rect(caretTailPosition.x - caretSize, caretTailPosition.y - caretSize, caretSize * 2, caretSize * 2);
                }
                else {
                    //code to draw a circle/square at caretTailPosition.x, caretTailPosition.y
                    caretCtx.beginPath();
                    caretCtx.rect(caretTailPosition.x - caretSize, caretTailPosition.y - caretSize, caretSize * 2, caretSize * 2);
                }
                if (caret_fill_ == "arc") {
                    caretCtx.stroke();
                }
                else {
                    caretCtx.fill();
                }
            }
        }
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

    // canvas offset changing function
    function addXOffset(val) {
        xOffset_ += val;
    }

    // canvas offset changing function
    function addYOffset(val) {
        yOffset_ += val;
    }

    // plotting scaling changing function
    function addZoom(val) {
        var tempZoom = scale_ + val;
        if (tempZoom < 1) {
            tempZoom = 1;
        }
        scale_ = tempZoom;
    }
}
