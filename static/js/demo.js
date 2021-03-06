// This file provided by Enertiv is for non-commercial testing and evaluation purposes only.
// Enertiv reserves all rights not expressly granted.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// ENERTIV BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

console.log("Start at the client level metadata");
d3.json("/client", function (clients) {    //Make an AJAX request to pull the list of available clients
	console.log("Location Metadata")
	console.log(clients);   								 //Location data
	var client_data = clients[0];					//Default client

	client_data_obj = parseClients(clients);
	postLocation(client_data);
})

console.log("Carry that information to access the location level metadata");
function postLocation(client_data){
	var client_uuid = client_data.uuid;			//Capture the client uuid
		client_name = client_data["name"];

	d3.selectAll("#clientName").text(client_name)  //Set the client name dynamically

	d3.json("/client/location?uuid=" + client_uuid , function (location_data) {  //Make an AJAX request to capture the metadata based off the location uuid
		console.log("Location Information")  
		console.log(location_data);												//Location information
		location_data_obj = parseLocation(location_data);
		generateSun(location_data[0]);
	});
}

console.log("Finally pass that information to the location metadata query to retrieve that data and display the visualization")
function generateSun(location_data) {
	var start = moment(),
		location_name = location_data["name"],
		location_uuid = location_data["uuid"],
		deagg_uri = generateURI(location_uuid),
		occupancy_uri = generateOccupancyURI(location_uuid);

	setGlobalLocationU(location_uuid);
	setGLName(location_name);
	setGOUri(occupancy_uri);

	d3.selectAll("#locationName").text(location_name)  //Set the location name dynamically
	crossfilterMagic.generateFromOccupancyURI(occupancy_uri);
	crossfilterMagic.generateFromURI(deagg_uri, client_name, location_name);
}

var today = moment(),
	weekAgo = today - 7*24*60*60*1000,
	fromTime = moment(weekAgo).format('YYYY-MM-DD 04:00:00') + "Z",
	toTime = moment(today).format('YYYY-MM-DD 04:00:00') + "Z",
	interval = "hour",

	//Declare in the global scope to follow it around
	client_name = "",
	client_data_obj = {},
	location_data_obj = {};

var globalLocationU;
function setGlobalLocationU (location_uuid) {
	globalLocationU = location_uuid;
	return;
}

var gLName;
function setGLName (location_name) {
	gLName = location_name;
	return;
}

var gOUri;
function setGOUri (occupancy_uri) {
	gOUri = occupancy_uri;
	return;
}

function readableDate(dateString){
	return moment(dateString).format('MMMM Do YYYY')
}

function generateURI(location_uuid){
	return "/location/data?location_uuid=" + location_uuid + "&q_string=fromTime%3D" + fromTime +"%26toTime%3D" + toTime +"%26interval%3D" + interval +"%26aggregate%3dfalse%26data_format%3Drickshaw";
}

function generateOccupancyURI(location_uuid) {
	return "/location/occupancy?location_uuid=" + location_uuid;
}

d3.select("#fromTime").text(readableDate(fromTime) + " to ");
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
		dropdown.append("li")
			.attr("class", "location-li")
			.text(name);
	};
	return location_obj
}


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

//Get the date range for the date range picker
$(function() { $("#e1").daterangepicker({
	datepickerOptions: {
		numberOfMonths: 2,
     },
     onChange: function() {
     	var range = $("#e1").daterangepicker("getRange");
     	var today = moment(today).format("YYYY-MM-DD");
		var endArr = ("" + range.end).split(" ");
		var endDate = endArr[0] + " " + endArr[1] + " " + (range.end.getDate() + 1) + " " + endArr[3] + " " + endArr[4] + " " + endArr[5] + " " + endArr[6];
     	var start = moment(range.start).format("YYYY-MM-DD 04:00:00") + "Z";
     	var end = moment(endDate).format("YYYY-MM-DD 04:00:00") + "Z";
     	var uri = "/location/data?location_uuid=" + globalLocationU + "&q_string=fromTime%3D" + start +"%26toTime%3D" + end +"%26interval%3D" + interval +"%26aggregate%3dfalse%26data_format%3Drickshaw";

     	fromTime = start;
     	toTime = end;

		d3.select("#fromTime").text("");
		d3.select("#toTime").text("");
		crossfilterMagic.generateFromURI(uri, client_name, gLName);
     }
})});