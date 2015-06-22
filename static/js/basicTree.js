
// This file provided by Enertiv is for non-commercial testing and evaluation purposes only.
// Enertiv reserves all rights not expressly granted.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// ENERTIV BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var basicTree = basicTree || {}; // JS Namespace

// function in_level (data, target){
// 	for (var index in data) {
// 		var row = data[index];
// 		if (target == row.name){
// 			return index;
// 		}
// 	}
// 	return null;
// }

// var levels_obj = {1: "sublocation_name",
// 				  2: "equipment_type",
// 				  3: "name"}

// function build_tree_i(tree_i, sub_name, equip_type, equip_name){
// 		// console.log(tree_i);
// 		if (Object.keys(tree_i).indexOf(sub_name) >= 0  &&
// 			  Object.keys(tree_i[sub_name]).indexOf(equip_type) >= 0 &&
// 			  Object.keys(tree_i[sub_name][equip_type]).indexOf(equip_name) >= 0) {
// 			tree_i[sub_name][equip_type][equip_name] += 1;
// 		} else if (Object.keys(tree_i).indexOf(sub_name) >= 0 &&
// 			  			  Object.keys(tree_i[sub_name]).indexOf(equip_type) >= 0){
// 			tree_i[sub_name][equip_type][equip_name] = 1;
// 		} else if (Object.keys(tree_i).indexOf(sub_name) >= 0) { 
// 			tree_i[sub_name][equip_type] = {};
// 			tree_i[sub_name][equip_type][equip_name] = 1;
// 		} else {
// 			tree_i[sub_name] = {};
// 			tree_i[sub_name][equip_type] = {};
// 			tree_i[sub_name][equip_type][equip_name] = 1;
// 		}
// }

// function nested (tree, data, level, suffix, id) {
// 	var level_name = levels_obj[level],
// 			target = data[level_name],
// 			data_index = in_level(tree, target),
// 			total = data["total"];
// 	// console.log(id);
// 	if (data_index === null) {
// 		append = level == 3 
// 						 ? {name: data[level_name] + suffix, size: data["total"], equipment_id: data["equipment_id"]} 
// 						 : {name: data[level_name], children: [], size: total}
// 		tree.push(append);
// 		// console.log("i",tree,target)
// 		// console.log("in_level",in_level(tree, target));
// 		if (in_level(tree, target) !== null && Object.keys(tree[in_level(tree, target)]).indexOf("children") >= 0){
// 			nested(tree[in_level(tree, target)]["children"], data, level + 1, suffix, id);
// 		}
// 	}
// 	 //} else if {} 
// 	else {
// 		// console.log("nah")
// 		if (in_level(tree, target) !== null && Object.keys(tree[in_level(tree, target)]).indexOf("children") >= 0) {
// 			// console.log(data["total"]);
// 			// console.log(tree[in_level(tree, target)]);
// 			tree[in_level(tree, target)]["size"] += total;
// 			nested(tree[in_level(tree, target)]["children"], data, level + 1, suffix, id);
// 		}
// 	}
// }

var maxIndex = 0;
    var maxIndex1= 0;

        var totalKWSum = 0;
        var totalCostSum = 0;
        var smallArray = [];

basicTree.combine_tree = function  (rawData, client_name, location_name) {	
    //Totals
    var totals = {},
        // costs = {},
        maxTotal = 0,
        forGraph = [];
        // totalKWSum = 0,
        // totalCostSum = 0;

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
        totalKWSum += total;
        totalCostSum += totalC;
        if (totals[name] > maxTotal) {
          maxTotal = totals[name];
        }
      } else {
        totals[name] = total;
        totalKWSum += total;
        totalCostSum += totalC;
        if (totals[name] > maxTotal) {
          maxTotal = totals[name];
        }
      }

      // if (Object.keys(costs).indexOf("" + name) != -1) {
      //   costs[name] += totalC;
      // } else {
      //   costs[name] = totalC;
      // }
    });

    // var maxIndex = 0;

    var arr = Object.keys(totals);
    for (var i = 0; i < arr.length; i++) {
      maxIndex = arr.length - 1;

      forGraph.push({ name: arr[i],
                      index: i,
                      value: totals[arr[i]]
                      // cost: costs[arr[i]]
                    });   
    }

    if (client_name == "Eataly") {
      smallArray = [];
      for (var y = 0; y < forGraph.length; y++) {
        if (forGraph[y].value / totalKWSum < 0.04) {
          smallArray.push(forGraph[y].name);
        }
      }
    } else {
      smallArray = [];
      for (var y = 0; y < forGraph.length; y++) {
        if (forGraph[y].value / totalKWSum < 0.015) {
          smallArray.push(forGraph[y].name);
        }
      }
    }

    //Store the day of the week for each data point
    rawData.forEach(function(d) {
      d.data.forEach(function (d, i) {
        var d_date = moment(d.x * 1000).day(); //format("dddd")
        d.day = d_date

        var d_date1 = moment(d.x * 1000).format("H:mm:ss");
        d.hour = d_date1;
      });
    });

    //Declare variables for data calculations
    var forGraphWeekdays = [];
    var roomsForUsage = [];
    var indexing = 0;
    var maxIndex = 0;
    var equipForUsage = [];
    var indexing1 = 0;
    // var maxIndex1= 0;

    rawData.forEach(function(e) {
      var roomName = e.sublocation_name;
      var equipmentName = e.equipment_type;

      if (Object.keys(roomsForUsage).indexOf("" + roomName) == -1) {
        roomsForUsage[roomName] = indexing;
        maxIndex = indexing;
        indexing++;
      }

      if (Object.keys(equipForUsage).indexOf("" + equipmentName) == -1) {
        equipForUsage[equipmentName] = indexing1;
        maxIndex1 = indexing1;
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

        if (forGraphWeekdays.length == 0) {
          if ($.inArray(roomName, smallArray) == -1) {
            forGraphWeekdays.push({  room: roomName,
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
                               occupancy: occupancy(parseInt(d.hour.split(":")[0]), d.day, arrayForOccupancy)
                            });
          }
        } else {
          for (var z = 0; z < forGraphWeekdays.length; z++) {
            if (d.hour == forGraphWeekdays[z].hour && d.day == forGraphWeekdays[z].day && roomName == forGraphWeekdays[z].room &&
              equipmentName == forGraphWeekdays[z].equip) {

              if (occupancy(parseInt(d.hour.split(":")[0]), WOStart, WOEnd, PWOStart, PWOEnd) == 1) {
                forGraphWeekdays[z].valueEOcc += output;
                forGraphWeekdays[z].valueOcc += output;

              }
              else if (occupancy(parseInt(d.hour.split(":")[0]), WOStart, WOEnd, PWOStart, PWOEnd) == 0.5) {
                forGraphWeekdays[z].valueESemi += output;
                forGraphWeekdays[z].valueSemi += output;
              }
              else {
                forGraphWeekdays[z].valueEOff += output;
                forGraphWeekdays[z].valueOff += output;
              }

              forGraphWeekdays[z].value += output;
              forGraphWeekdays[z].valueE += output;
              forGraphWeekdays[z].cost += cost;
              forGraphWeekdays[z].costE += cost;
              break;
            } else if (z == forGraphWeekdays.length - 1) {
                if ($.inArray(roomName, smallArray) == -1) {
                  fillInData(forGraphWeekdays, roomName, roomsForUsage, equipmentName, equipForUsage, output, d.day,
                    cost, parseInt(d.hour.split(":")[0]), arrayForOccupancy)
                }
                break;
            }
            else {

            }
          }
        }
      }); 
    });

	return forGraphWeekdays;
}




    function occupancy (hour, day, arrayForOccupancy) {
      // arrayForOccupancy.forEach(function (d, i) {
      for (var i = 0; i < arrayForOccupancy.length; i++) {
        if (day == arrayForOccupancy[i].day) {
          if (hour >= arrayForOccupancy[i].workingStart && hour < arrayForOccupancy[i].workingEnd) {
            return 1
          }
          else if (hour >= arrayForOccupancy[i].semiStart && hour < arrayForOccupancy[i].semiEnd) {
            return 0.5
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

    //Helper function that fills in the data
    function fillInData (forGraphWeekdays, roomName, roomsForUsage, equipmentName, equipForUsage, output, day, cost, hour,
      arrayForOccupancy) {
      if (occupancy(hour, day, arrayForOccupancy) == 1) {
        forGraphWeekdays.push({  room: roomName,
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
        forGraphWeekdays.push({  room: roomName,
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
        forGraphWeekdays.push({  room: roomName,
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

basicTree.getMaxIndex = function () {
	return maxIndex;
}

basicTree.getMaxIndex1 = function () {
	return maxIndex1;
}

basicTree.totalKWSum = function () {
	return totalKWSum;
}

basicTree.totalCostSum = function () {
	return totalCostSum;
}

basicTree.getSmallArray = function () {
	return smallArray;
}