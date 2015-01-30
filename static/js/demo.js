var 
		toTime = "2015-01-02 00:05:00.000Z",
		fromTime = "2015-01-01 00:05:00.000Z",
		interval = "15min";

function readableDate(dateString){
	return moment(dateString).format('MMMM Do YYYY, h:mm:ss a')
}

d3.select("#fromTime").text(readableDate(fromTime));
d3.select("#toTime").text(readableDate(toTime));

var client_info = {};
d3.json("/client", function (clients) {    // Make an AJAX request to pull the list of available clients
	console.log("Location Metadata")
	console.log(clients);   								 // location data
	var client_data = clients[0],
			client_uuid = client_data.uuid,        // capture the client uuid
			client_name = client_data["name"];

	d3.select("#clientName").text(client_name)  // Set the client name dynamically

	d3.json("/client/location?uuid=" + client_uuid , function (location_data) {  // Make an AJAX request to capture the metadata based off the location uuid
		console.log("Location Information")  
		console.log(location_data);												// location information
		var location_name = location_data[0]["name"],
				location_uuid = location_data[0]["uuid"],
				deagg_uri = "/location/data?location_uuid=" + location_uuid + "&q_string=fromTime%3D" + fromTime +"%26toTime%3D" + toTime +"%26interval%3D" + interval +"%26aggregate%3dfalse%26data_format%3Drickshaw",
				agg_uri = "/location/data?location_uuid=" + location_uuid + "&q_string=fromTime%3D" + fromTime +"%26toTime%3D" + toTime +"%26interval%3D" + interval +"%26aggregate%3dtrue%26data_format%3Drickshaw"
				;

		// Sunburst Chart with location data
		d3Magic.generateFromURI(deagg_uri, client_name, location_name);
	});
})


