// This file provided by Enertiv is for non-commercial testing and evaluation purposes only.
// Enertiv reserves all rights not expressly granted.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// ENERTIV BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/*

NOTE - room is equivalent to sublocation

*/

var crossfilterMagic = crossfilterMagic || {};

crossfilterMagic.arrayForOccupancy = [];

//Get the occupancy data
crossfilterMagic.generateFromOccupancyURI = function (uri) {
  d3.json(uri, function(error, rawData) {
    var WOStart = 0,    //Start of working hours
        WOEnd = 0,      //End of working hours
        PWOStart = 0,   //Semi-working hours start
        PWOEnd = 0,     //Semi-working hours end
        dayMin = 7,     //Keep track of the lowest day of the week
        dayMax = 0,     //Keep track of the highest day of week
        dayOfWeek = 0;  //Keep track of the current day of week

    rawData.forEach(function (d) {
      //Re-assign the days of the week
      if (d.day_of_week == 6) {
        dayOfWeek = 0;
      }
      else {
        dayOfWeek = d.day_of_week + 1;
      }

      //Keep track of max day of week
      if (dayOfWeek > dayMax) {
        dayMax = dayOfWeek;
      }
      //Keep track of min day of week
      if (dayOfWeek < dayMin) {
        dayMin = dayOfWeek;
      }

      //Get the working hours
      if (d.occupancy_type == 1) {
        WOStart = parseInt(d.start_time.split(":")[0]);
        WOEnd = parseInt(d.end_time.split(":")[0]);
      }
      //Get the partially working hours
      else if (d.occupancy_type == 2) {
        PWOStart = parseInt(d.start_time.split(":")[0]);
        PWOEnd = parseInt(d.end_time.split(":")[0]);
      }

      //Fill in the occupancy array
      crossfilterMagic.arrayForOccupancy.push({
        day: dayOfWeek,
        workingStart: WOStart,
        workingEnd: WOEnd,
        semiStart: PWOStart,
        semiEnd: PWOEnd
      });
    });

    var doubleCount = false;
    var dayRange = dayMax - dayMin + 1;

    //Check for double counting with working hours
    crossfilterMagic.arrayForOccupancy.forEach(function (d) {
      if (d.semiStart != 0) {
        doubleCount = true;
      }
    });

    var newArr = [];
    if (doubleCount) {
      for (var i = 1; i < dayRange + 1; i++) {
        newArr[i - 1] = crossfilterMagic.arrayForOccupancy[crossfilterMagic.arrayForOccupancy.length - i]
      }
    }
    crossfilterMagic.arrayForOccupancy = newArr;
  });
}

//Get the energy usage and cost data
crossfilterMagic.generateFromURI = function (uri, client_name, location_name) {
  d3.json(uri, function(error, rawData) {

    //Totals
    var totals = {},        //Keep track of the usage (kWh) per room
        roomData = [],      //Get room data in graph format (flattened)
        totalKWSum = 0,     //Store the total usage for the client
        totalCostSum = 0;   //Store the total cost for the client

    rawData.forEach(function(d) {
      var name = d.sublocation_name,
          data = d.data;

      var total = 0;  //Keep track of the usage of the current data point
      var totalC = 0; //Keep track of the cost of the current data point
      for (var k = 0; k < data.length; k++) {
        total += data[k].y;
        totalC += data[k].total_cost;
      }

      if (Object.keys(totals).indexOf(name) != -1) {
        totals[name] += total;
        totalKWSum += total;
        totalCostSum += totalC;
      } else {
        totals[name] = total;
        totalKWSum += total;
        totalCostSum += totalC;
      }
    });

    var arr = Object.keys(totals);    //Array of room names

    for (var i = 0; i < arr.length; i++) {
      roomData.push({ name: arr[i],
                      index: i,
                      value: totals[arr[i]]
                    });   
    }

    var smallDataArray = [];  //Store rooms that are insignificant so they are not included in the charts

    //If the data is insignificant, don't show it - special case for Eataly
    if (client_name == "Eataly") {
      for (var y = 0; y < roomData.length; y++) {
        //If the room contributes less than 4 percent to usage, don't include it
        if (roomData[y].value / totalKWSum < 0.04) {
          smallDataArray.push(roomData[y].name);
        }
      }
    } else {
      for (var y = 0; y < roomData.length; y++) {
        //If the room contributes less than 1.5 percent to usage, don't include it
        if (roomData[y].value / totalKWSum < 0.015) {
          smallDataArray.push(roomData[y].name);
        }
      }
    }

    //Store the day of the week for each data point
    rawData.forEach(function(d) {
      d.data.forEach(function (d, i) {
        var d_date = moment(d.x * 1000).day();
        d.day = d_date

        var d_date1 = moment(d.x * 1000).format("H:mm:ss");
        d.hour = d_date1;
      });
    });

    //Declare variables for data calculations
    var dataForGraphs = [],
        roomsForUsage = [],
        indexing = 0,
        equipForUsage = [],
        indexing1 = 0;

    //Assign each room and equipment type an index
    rawData.forEach(function(e) {
      var roomName = e.sublocation_name,
          equipmentName = e.equipment_type;

      if (Object.keys(roomsForUsage).indexOf("" + roomName) == -1) {
        roomsForUsage[roomName] = indexing;
        indexing++;
      }

      if (Object.keys(equipForUsage).indexOf("" + equipmentName) == -1) {
        equipForUsage[equipmentName] = indexing1;
        indexing1++;
      }
    });

    rawData.forEach(function(e) {
      var roomName = e.sublocation_name;
      var equipmentName = e.equipment_type;

      e.data.forEach(function (d) {
        var day = d.day,
            hour = d.hour,
            output = d.y,
            cost = d.total_cost;

        //Push the first piece of data into the array for dc graphs
        //Note - dc works best with flattened data
        if (dataForGraphs.length == 0) {
          if ($.inArray(roomName, smallDataArray) == -1) {
            dataForGraphs.push({  room: roomName,
                               index: roomsForUsage[roomName],
                               equip: equipmentName,
                               indexE: equipForUsage[equipmentName],
                               valueE: output,
                               value: output,
                               cost: cost,
                               costE: cost,
                               valueOcc: output,
                               valueSemi: 0,
                               valueOff: 0,
                               valueEOcc: output,
                               valueESemi: 0,
                               valueEOff: 0,
                               day: d.day,
                               hour: parseInt(d.hour.split(":")[0]),
                               occupancy: occupancy(parseInt(d.hour.split(":")[0]), d.day, crossfilterMagic.arrayForOccupancy)
                            });
          }
        } else {
          for (var z = 0; z < dataForGraphs.length; z++) {
            //Update values if already present in the array
            if (parseInt(d.hour.split(":")[0]) == dataForGraphs[z].hour && d.day == dataForGraphs[z].day && roomName == dataForGraphs[z].room &&
              equipmentName == dataForGraphs[z].equip) {

              //Check which type of hour the data is
              if (occupancy(parseInt(d.hour.split(":")[0]), d.day, crossfilterMagic.arrayForOccupancy) == 1) {
                dataForGraphs[z].valueEOcc += output;
                dataForGraphs[z].valueOcc += output;

              }
              else if (occupancy(parseInt(d.hour.split(":")[0]), d.day, crossfilterMagic.arrayForOccupancy) == 0.5) {
                dataForGraphs[z].valueESemi += output;
                dataForGraphs[z].valueSemi += output;
              }
              else {
                dataForGraphs[z].valueEOff += output;
                dataForGraphs[z].valueOff += output;
              }

              dataForGraphs[z].value += output;
              dataForGraphs[z].valueE += output;
              dataForGraphs[z].cost += cost;
              dataForGraphs[z].costE += cost;
              break;
            }
            //Push the rest of the data into the array for dc graphs
            else if (z == dataForGraphs.length - 1) {
                if ($.inArray(roomName, smallDataArray) == -1) {
                  fillInData(dataForGraphs, roomName, roomsForUsage, equipmentName, equipForUsage, output, d.day,
                    cost, parseInt(d.hour.split(":")[0]), crossfilterMagic.arrayForOccupancy)
                }
                break;
            }
            else {
            }
          }
        }
      }); 
    });
    
    //Watcher for the width of the page
    var width = document.getElementById("well").offsetWidth;

    //Variables for writing to html
    var sumCost = 0,
        sumKw = 0,
        ratio = 0,
        selectedCost = 0,
        selectedKw = 0;

    //Crossfilters
    var roomArray = [];
    dataForGraphs.forEach(function(d) {
        roomArray[d.index] = d.room;
    });

    var equipArray = [];
    dataForGraphs.forEach(function(d) {
        equipArray[d.indexE] = d.equip;
    });

    var data = dataForGraphs

    var ndx = crossfilter(data);

    //Days of the week row chart
    var daysOfWeek = ndx.dimension(function(d) {
      return d.day;
    });

    var kW2 = daysOfWeek.group().reduceSum(function(d) {
      return d.value;
    });

    //Rooms bar chart
    var rooms = ndx.dimension(function(d) {
      sumCost += d.cost;
      sumKw += d.value;
      ratio = sumKw / sumCost; //This assumes that the cost and usage are linear

      return d.index;
    });

    var kWOccupiedData = rooms.group().reduceSum(function(d) {
      return d.valueOcc;
    });

    var kWSemiData = rooms.group().reduceSum(function(d) {
      return d.valueSemi;
    });

    var kWOffHourData = rooms.group().reduceSum(function(d) {
      return d.valueOff;
    });

    //Equipment bart chart
    var roomsE = ndx.dimension(function(d) {
      return d.indexE;
    });

    var kWEOccupiedData = roomsE.group().reduceSum(function(d) {
      return d.valueEOcc;
    });

    var kWESemiData = roomsE.group().reduceSum(function(d) {
      return d.valueESemi;
    });

    var kWEOffHourData = roomsE.group().reduceSum(function(d) {
      return d.valueEOff;
    });

    //Bar Chart - rooms
    barChart = dc.barChart("#roomBarChart");
    
    barChart.width(width / 2)
          .height(0.4775 * (width / 2))
          .margins({top: 10, right: 40, bottom: 30, left: 40})
          .dimension(rooms)
          .group(kWOccupiedData, "Working hours")
          .stack(kWSemiData)
          .stack(kWOffHourData)
          .colors(function(d) {     //Colors based on type of hour
            if (d == 1) {
              return "#0092cc";
            } else if (d == 2) {
              return "#00b4b5";
            } else {
              return "#0b50c2";
            }
          })
          .elasticY(true)
          .gap(1)
          .x(d3.scale.ordinal().domain([0, roomArray.length - 1]))
          .xUnits(dc.units.ordinal)
          .yAxisLabel("kWh")
          .xAxisLabel("Room")
          .renderHorizontalGridLines(true)
          .transitionDuration(700);

    //Make the x-axis ticks display the room name
    barChart.xAxis().tickFormat(function (v) {
      return roomArray[v];
    });
    
    if ($(window).width() <= 992) {      
      barChart.width(width)
            .height(0.4775 * width)
    }
    
    //Bar Chart - equipment
    barChartE = dc.barChart("#equipBarChart");
    
    barChartE.width(width / 2)
          .height(0.4775 * (width / 2))
          .margins({top: 10, right: 40, bottom: 30, left: 40})
          .dimension(roomsE)
          .group(kWEOccupiedData)
          .stack(kWESemiData)
          .stack(kWEOffHourData)
          .colors(function(d) {
            if (d == 1) {         //Colors based on type of hour
              return "#0092cc";
            } else if (d == 2) {
              return "#00b4b5";
            } else {
              return "#0b50c2";
            }
          })
          .elasticY(true)
          .gap(1)
          .x(d3.scale.ordinal().domain([0, equipArray.length - 1]))
          .xUnits(dc.units.ordinal)
          .yAxisLabel("kWh")
          .xAxisLabel("Equipment Type")
          .renderHorizontalGridLines(true)
          .transitionDuration(700);

    //Make the x-axis ticks display the equipment type
    barChartE.xAxis().tickFormat(function (v) {
      return equipArray[v];
    });

    if ($(window).width() <= 992) {      
      barChartE.width(width)
            .height(0.4775 * width)
    }

    //Row Chart - Days of the week
    rowChart = dc.rowChart("#dayRowChart");

    rowChart.width(width / 2)
          .height(0.4775 * (width / 2))
          .margins({top: 10, right: 40, bottom: 30, left: 40})
          .dimension(daysOfWeek)
          .group(kW2)
          .colors(d3.scale.ordinal().domain(["weekday", "weekend"]).range(["#00a1e5", "#00a1e5"]))
          .colorAccessor(function(d) {
            if (d.key == 0 || d.key == 6) {
              return "weekend";
            }
            else {
              return "weekeday";
            }
          })
          .elasticX(true)
          .gap(1)
          .x(d3.scale.linear().domain([-1, 8]))
          .label(function(d) {
            var day = d.key;
            switch (day) {
              case 0:
                return "Sunday";
              case 1:
                return "Monday";
              case 2:
                return "Tuesday";
              case 3:
                return "Wednesday";
              case 4:
                return "Thursday";
              case 5:
                return "Friday";
              case 6:
                return "Saturday";
            }
          })
          .transitionDuration(700);

    if ($(window).width() <= 992) {      
      rowChart.width(width)
            .height(0.4775 * width)
    }

    dc.renderAll();

    /*

    Occupancy

    */
    var occupied = ndx.dimension(function(d) {
      return d.occupancy;
    });

    var kWOccupied = occupied.group().reduceSum(function(d) {
      return d.value;
    });

    var hour = ndx.dimension(function(d) {
      return d.hour;
    });

    var kWHour = hour.group().reduceSum(function(d) {
      return d.value;
    });

    var hourCalculate = ndx.dimension(function(d) {
      return d.hour;
    });

    var kWHourCalculate = hourCalculate.group().reduceSum(function(d) {
      return d.value;
    });

    var hoursDaysHeatmap = ndx.dimension(function(d) {
      return [d.hour, d.day];
    });

    var kWHeatmap = hoursDaysHeatmap.group().reduceSum(function(d) {
      return d.value;
    });

    //Pie Chart - different types of hours
    pieChart1 = dc.pieChart("#occupancyPieChart");
    
    pieChart1.width(width / 2)
        .height(width / 4.5)
        .dimension(occupied)
        .group(kWOccupied)
        .innerRadius(width / 16)
        .radius(width / 10)
        .colors(d3.scale.ordinal().domain(["occupied", "semi", "offHours"]).range(["#0b50c2", "#0092cc", "#00b4b5"]))
        .colorAccessor(function(d) {
          if (d.key == 1) {
            return "occupied";
          } else if (d.key == 0.5) {
            return "semi";
          } else {
            return "offHours";
          }
        })
        .label(function (d) {
          if (d.key == 1) {
            return "Working Hours";
          } else if (d.key == 0.5) {
            return "Semi-working Hours";
          } else {
            return "Off hours";
          }
        })
        .transitionDuration(700);

    //Change dimensions of pie chart if the screen is 992px or less
    if ($(window).width() <= 992) {      
      pieChart1.width(width)
                .height(width / 2.25)
                .innerRadius(width / 8)
                .radius(width / 5)
    }

    //Bar Chart - Hours of the week
    barChart2 = dc.barChart("#hourRowChart");
    
    barChart2.width(width)
          .height(200)
          .margins({top: 10, right: 50, bottom: 30, left: 40})
          .dimension(hour)
          .group(kWHour)
          .round(function(n) { return Math.floor(n) + 0.5 })
          .alwaysUseRounding(true)
          .elasticY(true)
          .centerBar(true)
          .gap(1)
          .x(d3.scale.linear().domain([-1, 24]))
          .yAxisLabel("kWh")
          .xAxisLabel("Time")
          .renderHorizontalGridLines(true)
          .transitionDuration(700);

    //Update x-axis ticks to display the hour
    barChart2.xAxis().tickFormat(function (v) {
      if (v == -1 || v == 24) {
        return "";
      }
      return moment().hour(v).format("h a");
    });

    //Bar Chart for Calculation and writing to html page
    barChartC = dc.barChart("#calculations");
    
    barChartC.width(1100)
          .height(200)
          .margins({top: 10, right: 50, bottom: 30, left: 40})
          .dimension(hourCalculate)
          .group(kWHourCalculate)
          .elasticY(true)
          .centerBar(true)
          .gap(1)
          .valueAccessor(function(p) {
            if (p.key == 0) {
              selectedKw = 0;
              selectedKw += p.value;
            } else {
              selectedKw += p.value;
            }
            if (p.key == 23) {
              if ((selectedKw / totalKWSum * 100).toFixed(2) != 100) {
                selectedCostText = "Selected cost: $" + (selectedKw / ratio).toFixed(2) + ",";
                document.getElementById("summaryText1").innerHTML = selectedCostText;

                selectedKWText = "Selected usage: " + selectedKw.toFixed(2) + " kWh" + " (" + (selectedKw / totalKWSum * 100).toFixed(2) + "%)";
                document.getElementById("summaryText2").innerHTML = selectedKWText;
              } else {
                document.getElementById("summaryText1").innerHTML = "Nothing selected";
                document.getElementById("summaryText2").innerHTML = "";
              }
            }
            return p.value;
          })
          .x(d3.scale.linear().domain([-1, 24]))
          .yAxisLabel("kWh")
          .xAxisLabel("Time")
          .renderHorizontalGridLines(true)
          .transitionDuration(700);

    barChartC.xAxis().tickFormat(function (v) {
      if (v == -1 || v == 24) {
        return "";
      }
      return moment().hour(v).format("h a");
    });

    /* Heatmap */
    var maxHeat = 0;
    var sumHeat = 0;
    var numPoints = 0;
    var minHeat = 10000;
    var bool = true;

    var heatmapChart = dc.heatMap("#heatmap");

    //Color domain for heatmap
    var heatColorMapping = function(d) {
      //If a value in the heatmap is insignificant, then don't show it
      if (d < 0.1) {
        return d3.scale.linear().domain([0, 0]).range(["rgba(235, 234, 237, 0.1)", "rgba(235, 234, 237, 0.1)"])(d);
      }
      else {
        return d3.scale.linear().domain([minHeat, maxHeat]).range(["blue", "red"])(d);
      }
    };

    heatColorMapping.domain = function() {
      return [minHeat, maxHeat];
    };

    heatmapChart.width(width)
            .height(27 * 10 + 40)
            .dimension(hoursDaysHeatmap)
            .group(kWHeatmap)
            .colorAccessor(function(d) {
              if (bool) {
                sumHeat += d.value;
                numPoints++;
                if (d.value > maxHeat) {
                  maxHeat = d.value;
                }
                if (d.value < minHeat) {
                  minHeat = d.value;
                }
                if (d.key[0] == 9 && d.key[1] == 6) {
                  bool = false
                }
              }
              return d.value;
            })
            .keyAccessor(function(d) { return d.key[0]; })
            .valueAccessor(function(d) { return d.key[1]; })
            .colsLabel(function(d){
              return moment().hour(d).format("h a");
            })
            .rowsLabel(function(d) {
              return moment().day(d).format("ddd")
            })
            .transitionDuration(0)
            .colors(heatColorMapping)
            .calculateColorDomain();

    //Make heatmap data points square instead of circular
    heatmapChart.xBorderRadius(0);
    heatmapChart.yBorderRadius(0);

    //Heatmap -- Key
    /*
    This is a hack, but I make an array of length 24 with the first element
    being the min value in the heatmap and the last element having the max value
    in the heatmap. The elements in between are spaced evenly. Through this array
    I will create a heatmap key.
    */
    var rangeHeat = maxHeat - minHeat;
    var heatArr = [];
    for (var h = 0; h < 24; h++) {
      heatArr.push({
        val: minHeat + h / 23 * rangeHeat,
        index: h
      });
    }

    var ndx1 = crossfilter(heatArr);

    var keyHeatmap = ndx1.dimension(function(d) {
      return [d.index, 1];
    });

    var keyHeatmapGroup = keyHeatmap.group().reduceSum(function(d) {
      return d.val;
    });

    var heatmapChart1 = dc.heatMap("#heatmapKey");

    var heatColorMapping1 = function(d) {
      if (d < 0.1) {
        return d3.scale.linear().domain([0, 0]).range(["rgba(235, 234, 237, 0.1)", "rgba(235, 234, 237, 0.1)"])(d);
      }
      else {
        return d3.scale.linear().domain([minHeat, maxHeat]).range(["blue", "red"])(d);
      }
    };

    heatColorMapping1.domain = function() {
      return [minHeat, maxHeat];
    };

    heatmapChart1.width(width)
            .height(80)
            .dimension(keyHeatmap)
            .group(keyHeatmapGroup)
            .colorAccessor(function(d) {
              return d.value;
            })
            .keyAccessor(function(d) { return d.key[0]; })
            .valueAccessor(function(d) { return d.key[1]; })
            .colsLabel(function(d){
              return heatArr[d].val.toFixed(0);
            })
            .rowsLabel(function(d) {
              return "Key";
            })
            .transitionDuration(0)
            .colors(heatColorMapping1)
            .calculateColorDomain();

    heatmapChart1.xBorderRadius(0);
    heatmapChart1.yBorderRadius(0);

    //Show less x-axis labels on the heat map if the screen is small
    if (window.innerWidth <= 760) {
      heatmapChart.colsLabel(function(d) {
        if (d % 2 == 0) {
          return moment().hour(d).format("h a");
        }
        else {
          return "";
        }
      })

      heatmapChart1.colsLabel(function(d, i) {
        if (d % 2 == 0) {
          return heatArr[d].val.toFixed(0);
        }
        else {
          return "";
        }
      })
    }

    /* Data table */
    dataTable1 = dc.dataTable("#a")

    dataTable1
        .dimension(rooms)
        .group(function(d) {
            return "";
        })
        .size([Infinity])
        .columns([
          function(d) { return roomArray[d.index] + " - " + equipArray[d.indexE]; },
          function(d) { return d.value.toFixed(2); },
          function(d) { return (d.value / sumKw * 100).toFixed(2); },
          function(d) { return d.cost.toFixed(2); },
          function(d) { return moment().hour(d.hour).format("h a"); },
          function(d) { return moment().day(d.day).format("dddd"); }
        ])
        .sortBy(function (d) {
          return d.value;
        })
        .order(d3.descending);

    /* 

    Calculations and writing to html

    */
    //Days of week
    var daysOfWeek1 = ndx.dimension(function(d) {
      return d.day;
    });

    var DOW1 = daysOfWeek1.group().reduceSum(function(d) {
      return d.day + 1;
    });

    //Rooms
    var roomsRC = ndx.dimension(function(d) {
      return d.index;
    });

    var roomsRCG = roomsRC.group().reduceSum(function(d) {
      return d.index + 1;
    });

    //Equipment
    var roomsEC = ndx.dimension(function(d) {
      return d.indexE;
    });

    var roomsECG = roomsEC.group().reduceSum(function(d) {
      return d.indexE + 1;
    });

    //Pie chart
    var occupiedC = ndx.dimension(function(d) {
      return d.occupancy;
    });

    var occupiedCG = occupiedC.group().reduceSum(function(d) {
      return d.occupancy + 1;
    });

    //Bar Chart - rooms calculations
    barChartRC = dc.barChart("#hiddenBarChartRooms");
    
    barChartRC.width(800 * 0.75)
          .height(350 * 0.75)
          .dimension(roomsRC)
          .group(roomsRCG)
          .valueAccessor(function (d) {
            if (d.key == 0) {
              textForWriting = "";
            }

            if (d.value != 0) {
              textForWriting += roomArray[d.key] + ", ";
            }

            if (d.key == roomArray.length - 1) {
              if (textForWriting.split(",").length == roomArray.length + 1 - smallDataArray.length) {
                selectedRoomsText = "All locations"
              } else {
                selectedRoomsText = textForWriting.substring(0, textForWriting.length - 2);
              }
              document.getElementById("sublocationNav").innerHTML = selectedRoomsText;
            }
            return d.value;
          })
          .x(d3.scale.ordinal().domain([0, roomArray.length - 1]))
          .xUnits(dc.units.ordinal)
          .transitionDuration(700);

    //Bar Chart - equipment
    barChartEC = dc.barChart("#hiddenBarChartEquip");
    
    barChartEC.width(800 * 0.75)
          .height(350 * 0.75)
          .dimension(roomsEC)
          .group(roomsECG)
          .valueAccessor(function (d) {
            if (d.key == 0) {
              textForWriting = "";
            }

            if (d.value != 0) {
              textForWriting += equipArray[d.key] + ", ";
            }

            if (d.key == equipArray.length - 1) {
              //Special case for Staples
              if (client_name == "Staples" && textForWriting.split(",").length == equipArray.length) {
                selectedEquipText = "All equipment"
              }
              else {
                if (textForWriting.split(",").length == equipArray.length + 1) {
                  selectedEquipText = "All equipment"
                } else {
                  selectedEquipText = textForWriting.substring(0, textForWriting.length - 2);
                }
              }
              document.getElementById("equipmentNav").innerHTML = selectedEquipText;
            }
            return d.value;
          })
          .x(d3.scale.ordinal().domain([0, equipArray.length - 1]))
          .xUnits(dc.units.ordinal)
          .transitionDuration(700);

    //Array for axis and label text
    var occupancyArray = []
    occupancyArray[0] = "Off hours";
    occupancyArray[1] = "Semi-working hours";
    occupancyArray[2] = "Working hours";

    //Pie Chart - types of hours calculations
    pieChart14 = dc.pieChart("#hiddenPieChart");
    
    pieChart14.width(800 * 0.75)
        .height(350 * 0.75)
        .dimension(occupiedC)
        .group(occupiedCG)
        .valueAccessor(function (d) {
          if (d.key == 0) {
            textForWriting = "";
          }

          if (d.value != 0) {
            textForWriting += occupancyArray[d.key * 2] + ", ";
          }

          if (d.key == 1) {
            if(textForWriting.split(",").length == occupancyArray.length + 1) {
              selectedTHoursText = "All types of hours"
            } else {
              selectedTHoursText = textForWriting.substring(0, textForWriting.length - 2);
            }
            
            document.getElementById("hourTypeNav").innerHTML = selectedTHoursText;
          }
          return d.value;
        })
        .transitionDuration(700);

    //Row Chart - calculations
    rowChart12 = dc.rowChart("#hiddenRowChart");

    rowChart12.width(800 * 0.75)
          .height(350 * 0.75)
          .margins({top: 10, right: 50, bottom: 30, left: 40})
          .dimension(daysOfWeek1)
          .group(DOW1)
          .valueAccessor(function (d) {
            if (d.key == 0) {
              textForWriting = "";
            }

            if (d.value != 0) {
              textForWriting += moment().day(d.key).format("dddd") + ", ";
            }

            if (d.key == 6) {
              if (textForWriting.length == 64) {
                selectedDaysText = "Everyday"
              } else {
                selectedDaysText = textForWriting.substring(0, textForWriting.length - 2);
              }
              document.getElementById("dayNav").innerHTML = selectedDaysText;
            }
            return d.value;
          })
          .elasticX(true)
          .gap(1)
          .x(d3.scale.linear().domain([-1, 8]))
          .transitionDuration(700);

    dc.renderAll();

    //Helper functions
    function addXAxis(chartToUpdate, displayText) {
        chartToUpdate.svg()
            .append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", chartToUpdate.width() / 2)
            .attr("y", chartToUpdate.height())
            .text(displayText);
    }
    addXAxis(rowChart, "kWh");

    function occupancy (hour, day, arrayForOccupancy) {
      for (var i = 0; i < arrayForOccupancy.length; i++) {
        if (day == arrayForOccupancy[i].day) {
          if (hour >= arrayForOccupancy[i].workingStart && hour < arrayForOccupancy[i].workingEnd) {
            return 1;
          }
          else if (hour >= arrayForOccupancy[i].semiStart && hour < arrayForOccupancy[i].semiEnd) {
            return 0.5;
          }
          else {
            return 0;
          }
        }
        else if (i == arrayForOccupancy.length - 1) {
          return 0;
        }
      }
    }

    //Write to the html page
    totalCostText = "Total cost: $" + totalCostSum.toFixed(2);

    document.getElementById("summaryTextA").innerHTML = totalCostText + ",";

    totalKWText = "Total usage: " + totalKWSum.toFixed(2) + " kWh";

    document.getElementById("summaryTextB").innerHTML = totalKWText;

    //Helper function that fills in the data
    function fillInData (dataForGraphs, roomName, roomsForUsage, equipmentName, equipForUsage, output, day, cost, hour,
      arrayForOccupancy) {
      if (occupancy(hour, day, arrayForOccupancy) == 1) {
        dataForGraphs.push({  room: roomName,
                           index: roomsForUsage[roomName],
                           equip: equipmentName,
                           indexE: equipForUsage[equipmentName],
                           valueE: output,
                           value: output,
                           cost: cost,
                           costE: cost,
                           valueOcc: output,
                           valueSemi: 0,
                           valueOff: 0,
                           valueEOcc: output,
                           valueESemi: 0,
                           valueEOff: 0,
                           day: day,
                           hour: hour,
                           occupancy: 1
                        });
      }
      else if (occupancy(hour, day, arrayForOccupancy) == 0.5) {
        dataForGraphs.push({  room: roomName,
                           index: roomsForUsage[roomName],
                           equip: equipmentName,
                           indexE: equipForUsage[equipmentName],
                           valueE: output,
                           value: output,
                           cost: cost,
                           costE: cost,
                           valueOcc: 0,
                           valueSemi: output,
                           valueOff: 0,
                           valueEOcc: 0,
                           valueESemi: output,
                           valueEOff: 0,
                           day: day,
                           hour: hour,
                           occupancy: 0.5
                        });
      }
      else {
        dataForGraphs.push({  room: roomName,
                           index: roomsForUsage[roomName],
                           equip: equipmentName,
                           indexE: equipForUsage[equipmentName],
                           valueE: output,
                           value: output,
                           cost: cost,
                           costE: cost,
                           valueOcc: 0,
                           valueSemi: 0,
                           valueOff: output,
                           valueEOcc: 0,
                           valueESemi: 0,
                           valueEOff: output,
                           day: day,
                           hour: hour,
                           occupancy: 0
                        });
      }
    }

    //Adjust the size of the graphs on resize
    window.onresize = function(event) {
      if ($(window).width() > 992) {      
        var newWidth = document.getElementById("well").offsetWidth;
        heatmapChart.width(newWidth)
          .transitionDuration(0);
        heatmapChart1.width(newWidth)
          .transitionDuration(0);
        barChart2.width(newWidth)
          .transitionDuration(0);
        barChart.width(newWidth / 2)
          .height(0.4775 * (newWidth / 2))
          .transitionDuration(0);
        barChartE.width(newWidth / 2)
          .height(0.4775 * (newWidth / 2))
          .transitionDuration(0);
        rowChart.width(newWidth / 2)
          .height(0.4775 * (newWidth / 2))
          .transitionDuration(0);
        pieChart1.width(newWidth / 2)
          .height(newWidth / 4.5)
          .innerRadius(newWidth / 16)
          .radius(newWidth / 10)
          .transitionDuration(0);
         dc.renderAll();
          heatmapChart.transitionDuration(0);
          heatmapChart1.transitionDuration(750);
          barChart2.transitionDuration(750);
          barChart.transitionDuration(750);
          barChartE.transitionDuration(750);
          rowChart.transitionDuration(750);
          pieChart1.transitionDuration(750);
      }
      else {
        var newWidth = document.getElementById("well").offsetWidth;
        heatmapChart.width(newWidth)
          .transitionDuration(0);
        heatmapChart1.width(newWidth)
          .transitionDuration(0);
        barChart2.width(newWidth)
          .transitionDuration(0);
        barChart.width(newWidth)
          .height(0.4775 * (newWidth))
          .transitionDuration(0);
        barChartE.width(newWidth)
          .height(0.4775 * (newWidth))
          .transitionDuration(0);
        rowChart.width(newWidth)
          .height(0.4775 * (newWidth))
          .transitionDuration(0);
        pieChart1.width(newWidth)
          .height(newWidth / 2.25)
          .innerRadius(newWidth / 8)
          .radius(newWidth / 5)
          .transitionDuration(0);
        dc.renderAll();
          heatmapChart.transitionDuration(0);
          heatmapChart1.transitionDuration(750);
          barChart2.transitionDuration(750);
          barChart.transitionDuration(750);
          barChartE.transitionDuration(750);
          rowChart.transitionDuration(750);
          pieChart1.transitionDuration(750);
      }

      //Show less x-axis labels on the heat map if the screen is small
      if (window.innerWidth <= 760) {
        heatmapChart.colsLabel(function(d) {
          if (d % 2 == 0) {
            return moment().hour(d).format("h a");
          }
          else {
            return "";
          }
        });

        heatmapChart1.colsLabel(function(d) {
          if (d % 2 == 0) {
            return heatArr[d].val.toFixed(0);
          }
          else {
            return "";
          }
        });
      }
      else {
        heatmapChart.colsLabel(function(d) {
          return moment().hour(d).format("h a");
        })

        heatmapChart1.colsLabel(function(d) {
          return heatArr[d].val.toFixed(0);
        })
      }
    };
  });

  dc.renderAll();
};