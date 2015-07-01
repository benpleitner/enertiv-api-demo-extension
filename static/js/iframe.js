// var data = [
//   { index: 1, val: 1 },
//   { index: 2, val: 2 }
// ]

// var ndx = crossfilter(data);

// //Days of the week row chart
// var daysOfWeek = ndx.dimension(function(d) {
//   return d.index;
// });

// var kW2 = daysOfWeek.group().reduceSum(function(d) {
//   return d.val;
// });

// var width = document.getElementById("exampleChart").offsetWidth;

// //Bar Chart - rooms
// barChart = dc.barChart("#exampleChart");

// barChart.width(width)
//       .height(480)
//       .margins({top: 10, right: 50, bottom: 30, left: 40})
//       .dimension(daysOfWeek)
//       .group(kW2)
//       .elasticY(true)
//       .gap(1)
//       .x(d3.scale.ordinal().domain([1, 2]))
//       .xUnits(dc.units.ordinal)
//       .yAxisLabel("kWh")
//       .xAxisLabel("Room")
//       .renderHorizontalGridLines(true)
//       .transitionDuration(700);

// dc.renderAll();

// window.onresize = function(event) {
//   var newWidth = document.getElementById("exampleChart").offsetWidth;
//   barChart.width(newWidth)
//     .transitionDuration(0);
//    dc.renderAll();
//     barChart.transitionDuration(750);
// };

var width = document.getElementById("heatmap").offsetWidth;


console.log("Hello");
var iframe = iframe || {};

iframe.makeIframe = function (maxHeat, minHeat, sumHeat, numPoints, bool, hoursDaysHeatmap, kWHeatmap) {
    /* Heatmap */
    var maxHeat = 0;
    var sumHeat = 0;
    var numPoints = 0;
    var minHeat = 10000;
    var bool = true;

    var heatmapChart = dc.heatMap("#heatmap");

    var heatColorMapping = function(d) {
      if (d < 0.1) {
        return d3.scale.linear().domain([0, 0]).range(["rgba(235, 234, 237, 0.1)", "rgba(235, 234, 237, 0.1)"])(d); //#bbbabb #ccc
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

    heatmapChart.xBorderRadius(0);
    heatmapChart.yBorderRadius(0);

    dc.renderAll();

    window.onresize = function(event) {
      var newWidth = document.getElementById("exampleChart").offsetWidth;
      barChart.width(newWidth)
        .transitionDuration(0);
       dc.renderAll();
        barChart.transitionDuration(750);
    };
};