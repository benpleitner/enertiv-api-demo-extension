// This file provided by Enertiv is for non-commercial testing and evaluation purposes only.
// Enertiv reserves all rights not expressly granted.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// ENERTIV BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



var today = moment(),
	yesterday = today - 24*60*60*1000,
	fromTime = moment(yesterday).format('YYYY-MM-DD 05:00:00') + "Z",
	toTime = moment(today).format('YYYY-MM-DD 05:00:00') + "Z",
	interval = "15min",
	// declare in the global scope to follow it around
	client_name = "",
	client_data_obj = {},    
	location_data_obj = {};

function readableDate(dateString){
	return moment(dateString).format('MMMM Do YYYY')
}

function generateURI(location_uuid){
	return "/location/data?location_uuid=" + location_uuid + "&q_string=fromTime%3D" + fromTime +"%26toTime%3D" + toTime +"%26interval%3D" + interval +"%26aggregate%3dfalse%26data_format%3Drickshaw";
}

d3.select("#fromTime").text(readableDate(fromTime));
d3.select("#toTime").text(readableDate(toTime));

function parseClients(clients){
	clients = clients.reverse();
	var client_obj = {},
		dropdown = d3.select("#client-dropdown")
	for (var i = clients.length - 1; i >= 0; i--) {
		var client = clients[i],
			name = client["name"];
			client_obj[name] = client;
		dropdown.append("li")
			.text(name);
	};
	return client_obj
}

function parseLocation(locations){
	d3.selectAll(".location-li").remove()
	var location_obj = {},
		dropdown = d3.select("#location-dropdown");
	for (var i = locations.length - 1; i >= 0; i--) {
		var location = locations[i],
			name = location["name"];
			location_obj[name] = location;
		// console.log(name);
		dropdown.append("li")
			.attr("class", "location-li")
			.text(name);
	};
	return location_obj
}
	
function generateSun(location_data) {
	var start = moment(),
		location_name = location_data["name"],
		location_uuid = location_data["uuid"],
		deagg_uri = generateURI(location_uuid)
			// ,
			// agg_uri = "/location/data?location_uuid=" + location_uuid + "&q_string=fromTime%3D" + fromTime +"%26toTime%3D" + toTime +"%26interval%3D" + interval +"%26aggregate%3dtrue%26data_format%3Drickshaw"
			;
	d3.selectAll("#locationName").text(location_name)  // Set the location name dynamically
	d3Magic.generateFromURI(deagg_uri, client_name, location_name);
}


function postLocation(client_data){
	var client_uuid = client_data.uuid;			// capture the client uuid
		client_name = client_data["name"];

	d3.selectAll("#clientName").text(client_name)  // Set the client name dynamically

	d3.json("/client/location?uuid=" + client_uuid , function (location_data) {  // Make an AJAX request to capture the metadata based off the location uuid
		console.log("Location Information")  
		console.log(location_data);												// location information
		location_data_obj = parseLocation(location_data);
		generateSun(location_data[0]);
		// Sunburst Chart with location data
	});
}

d3.json("/client", function (clients) {    // Make an AJAX request to pull the list of available clients
	console.log("Location Metadata")
	console.log(clients);   								 // location data
	var client_data = clients[0];					// default client

	client_data_obj = parseClients(clients);
	// console.log(client_obj);
	postLocation(client_data);
})

// $(document.body).on( 'click', '#client-dropdown li', function( event ) {
// 	console.log(this);
// 	d3.select("#test").text(this.textContent)
// 	// var $target = $( event.currentTarget );

// 	// $target.closest( '.btn-group' )
// 	//    .find( '[data-bind="label"]' ).text( $target.text() )
// 	//       .end()
// 	//    .children( '.dropdown-toggle' ).dropdown( 'toggle' );

// 	return false;

// });

$(document.body).on( 'click', '#client-dropdown li', function( event ) {
	$("#locationDrop")
		.text("Change Location");
	$("#clientDrop")
		.text(this.textContent)
		.closest('.dropdown').removeClass("open");
		postLocation(client_data_obj[this.textContent]);
	return false;
});

$(document.body).on( 'click', '#location-dropdown li', function( event ) {
	$("#locationDrop")
		.text(this.textContent)
		.closest('.dropdown').removeClass("open");
	var update_location = location_data_obj[this.textContent]
		generateSun(update_location);
	return false;
});