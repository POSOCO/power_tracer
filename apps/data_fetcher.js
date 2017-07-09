var apiServerBaseAddress_g = "http://localhost:62448";
function fetchAndSetScadaValue(scadaSourceObj, callback) {
    // check if  scadaSourceObj.ednaId is present
    if (!scadaSourceObj.ednaId) {
        return callback(null, {dval: null, ednaId: null});
    }
    $.ajax({
        url: apiServerBaseAddress_g + "/api/values/real?pnt=" + scadaSourceObj.ednaId,
        type: 'GET',
        success: function (result) {
            if (!result) {
                //console.log("Null result obtained for ", scadaSourceObj);
                result = {dval: null, ednaId: scadaSourceObj.ednaId};
                return callback(null, result);
            }
            //console.log(result);
            //toastr["info"]("Data received from server");
            result.ednaId = scadaSourceObj.ednaId;
            var val = result.dval;
            // Convert Numeric value to string if present
            if (typeof val != 'undefined' && val != null && !isNaN(val)) {
                result.dval = Number(val);
                // set the line power here itself
                scadaSourceObj.set_line_power(Number(val));
            } else {
                result.dval = null;
            }
            callback(null, result);
        },
        error: function (textStatus, errorThrown) {
            console.log(textStatus);
            //console.log(errorThrown);
            callback(null, {dval: null, ednaId: scadaSourceObj.ednaId, error: textStatus});
        }
    });
}