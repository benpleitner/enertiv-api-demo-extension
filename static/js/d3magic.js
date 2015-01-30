var d3Magic = d3Magic || {};

d3Magic.generateFromURI = function (uri, client_name, location_name) {
	var width = 1100,
	    height = 1100,
	    radius = Math.min(width, height) / 2 - 30
	    padding = 5,
	    duration = 1000;

	var x = d3.scale.linear()
	    .range([0, 2 * Math.PI]);

	var y = d3.scale.sqrt()
	    .range([0, radius]);

	var color = d3.scale.category20c();
	// var color = d3.scale.category20c();

	function colour(d) {
	  if (d.children) {
	    // There is a maximum of two children!
	    var colours = d.children.map(colour),
	        a = d3.hsl(colours[0]),
	        b = d3.hsl(colours[1]);
	    // L*a*b* might be better here...
	    return d3.hsl((a.h + b.h) / 2, a.s * 1.2, a.l / 1.2);
	  }
	  return d.colour || "#fff";
	}

	var tip = d3.tip()
	  .attr('class', 'd3-tip fade')
	  // .attr('class', "fade")
	  .offset([-25,0])
	  .html(function(d) {
	  	// console.log(color((d.children ? d : d.parent).name));
	    return "<p class='light'>" + d.name + "</p><p class='light'><span class='big''>" + d.size.toFixed(1)  + "</span> kWh<p>";
	  })

	var svg = d3.select("#graph").append("svg")
	    .attr("width", width)
	    .attr("height", height)
	  .append("g")
	    .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");

	svg.call(tip);

	var partition = d3.layout.partition()
	    .sort(null)
	    .value(function(d) { 
	    	return d.size; // size default
	    	// return 1;  // count default
	    });

	var arc = d3.svg.arc()
	    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
	    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
	    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
	    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

	// Keep track of the node that is currently being displayed as the root.
	var node;

	d3.json(uri, function (error,json) {
		root = basicTree.combine_tree(json, client_name, location_name); // transform into tree format
	  node = root;
	  var path = svg.datum(root).selectAll("path")
	      .data(partition.nodes)
	    .enter().append("path")
	      .attr("d", arc)
	      .attr("fill-opacity", function (d){return 1 - d.depth / 7; })
	      .style("fill", function(d) {return color((d.children ? d : d.parent).name); })
	      .on("click", click)
	      .each(stash);

	  var text = svg.selectAll("text")
	      .data(partition.nodes)
	      .enter().append("text")
	      .style("fill-opacity", 1)
	      .style("fill", function(d) {
	        return brightness(d3.rgb(colour(d))) < 125 ? "#eee" : "#555";
	      })
	      .attr("text-anchor", function(d) {
	        return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
	      })
	      .attr("dy", ".2em")
	      .attr("transform", function(d) {
	        var multiline = (d.name || "").split(" ").length > 1,
	            angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
	            rotate = angle + (multiline ? -.5 : 0);
	        return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
	      })
	      .on('mouseover', tip.show)
	      .on('mouseout', tip.hide);

	  text.append("tspan")
	      .attr("x", 0)
	      .text(function(d) { return d.depth ? d.name.split(" ")[0] : ""; });
	  text.append("tspan")
	      .attr("x", 0)
	      .attr("dy", "1em")
	      .text(function(d) { return d.depth ? d.name.split(" ")[1] || "" : ""; });
	      ;

	  d3.selectAll("input").on("change", function change() {
	    var value = this.value === "count"
	        ? function() { return 1; }
	        : function(d) { return d.size; };

	    path
	        .data(partition.value(value).nodes)
	      .transition()
	        .duration(1000)
	        .attrTween("d", arcTweenData);
	    text
	        .data(partition.value(value).nodes)
	      .transition()
	        .duration(1000)
	        .attrTween("d", arcTweenData);
	  });

	  function click(d) { // place to put click actions
	    node = d;
	    path.transition()
	      .duration(1000)
	      .attrTween("d", arcTweenZoom(d));
	        // Somewhat of a hack as we rely on arcTween updating the scales.
	    text.style("visibility", function(e) {
	          return isParentOf(d, e) ? null : d3.select(this).style("visibility");
	        })
	      .transition()
	        .duration(duration)
	        .attrTween("text-anchor", function(d) {
	          return function() {
	            return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
	          };
	        })
	        .attrTween("transform", function(d) {
	          var multiline = (d.name || "").split(" ").length > 1;
	          return function() {
	            var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
	                rotate = angle + (multiline ? -.5 : 0);
	            return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
	          };
	        })
	        .style("fill-opacity", function(e) { return isParentOf(d, e) ? 1 : 1e-6; })
	        .each("end", function(e) {
	          d3.select(this).style("visibility", isParentOf(d, e) ? null : "hidden");
	        });
	  }
	});

	function textClick(d) {
		// "cursor", "pointer"
		console.log(d.size);
	}

	d3.select(self.frameElement).style("height", height + "px");

	// Setup for switching data: stash the old values for transition.
	function stash(d) {
		// console.log("clicked",d);
	  d.x0 = d.x;
	  d.dx0 = d.dx;
	}

	// When switching data: interpolate the arcs in data space.
	function arcTweenData(a, i) {
	  var oi = d3.interpolate({x: a.x0, dx: a.dx0}, a);
	  function tween(t) {
	    var b = oi(t);
	    a.x0 = b.x;
	    a.dx0 = b.dx;
	    return arc(b);
	  }
	  if (i == 0) {
	  	// console.log(node)
	   // If we are on the first arc, adjust the x domain to match the root node
	   // at the current zoom level. (We only need to do this once.)
	    var xd = d3.interpolate(x.domain(), [node.x, node.x + node.dx]);
	    return function(t) {
	      x.domain(xd(t));
	      return tween(t);
	    };
	  } else {
	    return tween;
	  }
	}

	function isParentOf(p, c) {
	  if (p === c) return true;
	  if (p.children) {
	    return p.children.some(function(d) {
	      return isParentOf(d, c);
	    });
	  }
	  return false;
	}

	// When zooming: interpolate the scales.
	function arcTweenZoom(d) {
	  var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
	      yd = d3.interpolate(y.domain(), [d.y, 1]),
	      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
	  return function(d, i) {
	    return i
	        ? function(t) { return arc(d); }
	        : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
	  };
	}

	// http://www.w3.org/WAI/ER/WD-AERT/#color-contrast
	function brightness(rgb) {
	  return rgb.r * .299 + rgb.g * .587 + rgb.b * .114;
	}
}