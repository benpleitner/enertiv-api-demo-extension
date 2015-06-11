d3.json("/location/data?location_uuid=8639f0e6-1623-4e60-8164-a853fb807917&q_string=fromTime%3D2015-06-03%2004:00:00Z%26toTime%3D2015-06-10%2004:00:00Z%26interval%3Dhour%26aggregate%3dfalse%26data_format%3Drickshaw",
	function(error, rawData) {
var a = document.createElement("div");

var parents = $("span").parent("div");
$("span").remove();
  //Store the day of the week for each data point
  rawData.forEach(function(d) {
    d.data.forEach(function (d, i) {
      var d_date = moment(d.x * 1000).format("dddd");
      d.day = d_date
    });
  });

  //Declare variables for data calculations
  var weekdayUsage = {},
  	  weekdayCost = {},
      weekendUsage = {},
      weekendCost = {},
      forGraphWeekdays = [];

  var mondayUsage = {},
  	  tuesdayUsage = {},
  	  wednesdayUsage = {},
  	  thursdayUsage = {},
  	  fridayUsage = {},
  	  saturdayUsage = {},
  	  sundayUsage = {};

  rawData.forEach(function(d) {
  	var roomName = d.sublocation_name;
  	var equipmentName = d.equipment_type;

    d.data.forEach(function (d, i) {
      var day = d.day,
          output = d.y,
          cost = d.total_cost;

      //Build the days of the week data
	  if (day == "Monday") {
	      if (Object.keys(mondayUsage).indexOf("" + roomName) != -1) {
	        mondayUsage[roomName] += output;
	      } else {
	        mondayUsage[roomName] = output;
	      }
	  }
	  else if (day == "Tuesday") {
	      if (Object.keys(tuesdayUsage).indexOf("" + roomName) != -1) {
	        tuesdayUsage[roomName] += output;
	      } else {
	        tuesdayUsage[roomName] = output;
	      }
	  }
	  else if (day == "Wednesday") {
	      if (Object.keys(wednesdayUsage).indexOf("" + roomName) != -1) {
	        wednesdayUsage[roomName] += output;
	      } else {
	        wednesdayUsage[roomName] = output;
	      }
	  }
	  else if (day == "Thursday") {
	      if (Object.keys(thursdayUsage).indexOf("" + roomName) != -1) {
	        thursdayUsage[roomName] += output;
	      } else {
	        thursdayUsage[roomName] = output;
	      }
	  }
	  else if (day == "Friday") {
	      if (Object.keys(fridayUsage).indexOf("" + roomName) != -1) {
	        fridayUsage[roomName] += output;
	      } else {
	        fridayUsage[roomName] = output;
	      }
	  }
	  else if (day == "Saturday") {
	      if (Object.keys(saturdayUsage).indexOf("" + roomName) != -1) {
	        saturdayUsage[roomName] += output;
	      } else {
	        saturdayUsage[roomName] = output;
	      }
	  }
	  else {
	      if (Object.keys(sundayUsage).indexOf("" + roomName) != -1) {
	        sundayUsage[roomName] += output;
	      } else {
	        sundayUsage[roomName] = output;
	      }
	  }

    });
  });

  var roomsArr = Object.keys(sundayUsage);
  for (var i = 0; i < roomsArr.length; i++) {
    forGraphWeekdays.push({  room: roomsArr[i],
    						 index: i,
			               	 value: sundayUsage[roomsArr[i]],
			                 day: 1,
			                 weekday: 0
			              });
  }
  roomsArr = Object.keys(mondayUsage);
  for (var i = 0; i < roomsArr.length; i++) {
    forGraphWeekdays.push({  room: roomsArr[i],
    						 index: i,
			               	 value: mondayUsage[roomsArr[i]],
			                 day: 2,
			                 weekday: 1
			              });
  }
  roomsArr = Object.keys(tuesdayUsage);
  for (var i = 0; i < roomsArr.length; i++) {
    forGraphWeekdays.push({  room: roomsArr[i],
    						 index: i,
			               	 value: tuesdayUsage[roomsArr[i]],
			                 day: 3,
			                 weekday: 1
			              });
  }
  roomsArr = Object.keys(wednesdayUsage);
  for (var i = 0; i < roomsArr.length; i++) {
    forGraphWeekdays.push({  room: roomsArr[i],
    						 index: i,
			               	 value: wednesdayUsage[roomsArr[i]],
			                 day: 4,
			                 weekday: 1
			              });
  }
  roomsArr = Object.keys(thursdayUsage);
  for (var i = 0; i < roomsArr.length; i++) {
    forGraphWeekdays.push({  room: roomsArr[i],
    						 index: i,
			               	 value: thursdayUsage[roomsArr[i]],
			                 day: 5,
			                 weekday: 1
			              });
  }
  roomsArr = Object.keys(fridayUsage);
  for (var i = 0; i < roomsArr.length; i++) {
    forGraphWeekdays.push({  room: roomsArr[i],
    						 index: i,
			               	 value: fridayUsage[roomsArr[i]],
			                 day: 6,
			                 weekday: 1
			              });
  }
  roomsArr = Object.keys(saturdayUsage);
  for (var i = 0; i < roomsArr.length; i++) {
    forGraphWeekdays.push({  room: roomsArr[i],
    						 index: i,
			               	 value: saturdayUsage[roomsArr[i]],
			                 day: 7,
			                 weekday: 0
			              });
  }

  //Crossfilters
  var roomArray = [];
  forGraphWeekdays.forEach(function(d) {
  	roomArray[d.index] = d.room;
  });

  var data = forGraphWeekdays

  var ndx = crossfilter(data);

  var rooms = ndx.dimension(function(d) {
  	return d.index;
  });

  var kW = rooms.group().reduceSum(function(d) {
    return d.value;
  });

  //Bar Chart
  barChart = dc.barChart("#graph");
  
  barChart.width(800)
        .height(350)
        .margins({top: 10, right: 50, bottom: 30, left: 40})
        .dimension(rooms)
        .group(kW)
        .elasticY(true)
        .centerBar(true)
        .gap(1)
        .x(d3.scale.linear().domain([-1, roomArray.length]))
        .yAxisLabel("kWh")
        .xAxisLabel("Room")
        .renderHorizontalGridLines(true)
        .transitionDuration(700);

  barChart.xAxis().tickFormat(function (v) {
    if (v == -1 || v == maxIndex + 1) {
      return "";
    }
    return roomArray[v];
  });
});