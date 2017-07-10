var apiServerBaseAddress_g = "http://wmrm0mc1:62448";
function fetchAndSetScadaValue(scadaSourceObj, callback) {
    // check if  scadaSourceObj.ednaId is present
    if (!scadaSourceObj) {
        return callback(null, {dval: null, ednaId: null});
    }
    // check if  scadaSourceObj.ednaId is present
    if (!scadaSourceObj.get_line_address()) {
        // scadaSourceObj.set_line_power(null);
        return callback(null, {dval: null, ednaId: null});
    }
    if ((scadaSourceObj.get_line_voltage() == 765 && tracer.get_plot_765() == false)
        || (scadaSourceObj.get_line_voltage() == 400 && tracer.get_plot_400() == false)
        || (scadaSourceObj.get_line_voltage() == 220 && tracer.get_plot_220() == false)) {
        // dont fetch if layer is masked
        return callback(null, {dval: null, ednaId: null});
    }
    //console.log(scadaSourceObj.get_line_voltage());
    //console.log(scadaSourceObj.get_line_address());
    $.ajax({
        url: apiServerBaseAddress_g + "/api/values/real?pnt=" + scadaSourceObj.get_line_address(),
        type: 'GET',
        success: function (result) {
            if (!result) {
                //console.log("Null result obtained for ", scadaSourceObj);
                result = {dval: null, ednaId: scadaSourceObj.get_line_address()};
                return callback(null, result);
            }
            //console.log(result);
            //toastr["info"]("Data received from server");
            result.ednaId = scadaSourceObj.get_line_address();
            var val = result.dval;
            // Convert Numeric value to string if present
            if (typeof val != 'undefined' && val != null && !isNaN(val)) {
                result.dval = Number(val);
                // set the line power here itself
                scadaSourceObj.set_line_power(Number(val));
            } else {
                result.dval = null;
            }
            return callback(null, result);
        },
        error: function (textStatus, errorThrown) {
            //console.log(textStatus);
            //console.log(errorThrown);
            return callback(null, {
                dval: null,
                ednaId: scadaSourceObj.get_line_address(),
                error: textStatus.statusText
            });
        }
    });
    return;
}