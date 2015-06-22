var makeSliders = makeSliders || {};

makeSliders.slide = function (selected, ratio) {
	//Slider
    d3.select("#slider").select("svg").remove();
    var sum = selected;

    //Parameters
    var margin = {
        top: -40,
        right: 80,
        bottom: 50,
        left: 50
      },
      width = 960 - margin.left - margin.right,
      height = 300 - margin.bottom - margin.top;


    //Scale function
    var scale = d3.scale.linear()
      .domain([0, sum.toFixed(0)])
      .range([0, width])
      .clamp(true);


    //Initial value
    var startValue = scale(sum.toFixed(0));
    startingValue = sum.toFixed(0);

    //Defines brush
    var brush = d3.svg.brush()
      .x(scale)
      .extent([startingValue, startingValue])
      .on("brush", brushed);

    var svg = d3.select("#slider").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
      .attr("class", "x axis")
    //Put in middle of screen
    .attr("transform", "translate(0," + height / 2 + ")")
    //Inroduce axis
    .call(d3.svg.axis()
      .scale(scale)
      .orient("bottom")
      .tickFormat(function(d) {
        return d.toFixed(0) + " kWh";
      })
      .tickSize(0)
      .tickPadding(12)
      .tickValues([scale.domain()[0], scale.domain()[1]]))
      .select(".domain")
      .select(function() {
        return this.parentNode.appendChild(this.cloneNode(true));
      })
      .attr("class", "halo");

    var slider = svg.append("g")
      .attr("class", "slider")
      .call(brush);

    slider.selectAll(".extent,.resize")
      .remove();

    slider.select(".background")
      .attr("height", height);

    var handle = slider.append("g")
      .attr("class", "handle")

    handle.append("path")
      .attr("transform", "translate(0," + height / 2 + ")")
      .attr("d", "M 0 -20 V 20")

    handle.append('text')
      .text(startingValue)
      .attr("transform", "translate(" + (-18) + " ," + (height / 2 - 25) + ")");

    slider
      .call(brush.event)

    function brushed() {
      var value = brush.extent()[0];

      if (d3.event.sourceEvent) {
        value = scale.invert(d3.mouse(this)[0]);
        brush.extent([value, value]);
      }

      document.getElementById("savingsNum").innerHTML = "$" + ((sum.toFixed(0) - value) / ratio).toFixed(0);
      
      handle.attr("transform", "translate(" + scale(value) + ",0)");
      handle.select('text').text(parseInt(value) + " kWh");
    }
};