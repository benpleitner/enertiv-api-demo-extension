// This file provided by Enertiv is for non-commercial testing and evaluation purposes only.
// Enertiv reserves all rights not expressly granted.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// ENERTIV BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



var d3Magic = d3Magic || {};


// Keep track of the node that is currently being displayed as the root.
d3Magic.node;

d3Magic.generateFromURI = function (uri, client_name, location_name) {
  d3.json(uri, function(error, rawData) {
    //Totals
    var totals = {},
        costs = {},
        maxTotal = 0,
        forGraphTotal = [];

    rawData.forEach(function(d) {
      var name = d.sublocation_name,
          data = d.data;

      var total = 0;
      var totalC = 0;
      for (var k = 0; k < data.length; k++) {
        total += data[k].y;
        totalC += data[k].total_cost;
      }

      if (Object.keys(totals).indexOf(name) != -1) {
        totals[name] += total;
        if (totals[name] > maxTotal) {
          maxTotal = totals[name];
        }
      } else {
        totals[name] = total;
        if (totals[name] > maxTotal) {
          maxTotal = totals[name];
        }
      }

      if (Object.keys(costs).indexOf("" + name) != -1) {
        costs[name] += totalC;
      } else {
        costs[name] = totalC;
      }
    });

    var maxIndex = 0;

    var arr = Object.keys(totals);
    for (var i = 0; i < arr.length; i++) {
      maxIndex = arr.length - 1;

      forGraphTotal.push({ name: arr[i],
                      index: i,
                      value: totals[arr[i]],
                      cost: costs[arr[i]]});   
    }










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

    var daysOfWeek = ndx.dimension(function(d) {
      return d.day;
    });

    var kW2 = daysOfWeek.group().reduceSum(function(d) {
      return d.value;
    });

    var weekdays = ndx.dimension(function(d) {
      return d.weekday;
    });

    var kW1 = weekdays.group().reduceSum(function(d) {
      return d.value;
    });

    var rooms = ndx.dimension(function(d) {
      return d.index;
    });

    var kW = rooms.group().reduceSum(function(d) {
      return d.value;
    });

    // var cost = rooms.group().reduceSum(function(d) {
    //   return d.cost;
    // });

    //Bar Chart
    barChart = dc.barChart("#roomBarChart");
    
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

    //Pie Chart - weekdays and weekends
    pieChart = dc.pieChart("#weekdayPieChart");
    
    pieChart.width(600)
        .height(300)
        .dimension(weekdays)
        .group(kW1)
        .innerRadius(80)
        .colors(["#9CC706"])
        .label(function (d) {
          if (d.key == 1) {
            return "Weekday";
          } else {
            return "Weekend";
          }
        })
        .transitionDuration(700);

    //Row Chart - Days of the week
    rowChart = dc.rowChart("#dayRowChart");

    rowChart.width(600)
          .height(300)
          .margins({top: 10, right: 50, bottom: 30, left: 40})
          .dimension(daysOfWeek)
          .group(kW2)
          .elasticX(true)
          .gap(1)
          .x(d3.scale.linear().domain([-1, 8]))
          .label(function(d) {
            var day = d.key;
          switch (day) {
            case 1:
              return "Sunday";
            case 2:
              return "Monday";
            case 3:
              return "Tuesday";
            case 4:
              return "Wednesday";
            case 5:
              return "Thursday";
            case 6:
              return "Friday";
            case 7:
              return "Saturday";
          }
          })
          .transitionDuration(700);
          dc.renderAll();
  });
  dc.renderAll();
};