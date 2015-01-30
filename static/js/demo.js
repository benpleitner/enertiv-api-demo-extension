var client_name = "Enertiv Demo - Office",
		location_name = "Office Demo",
		deagg_uri = "/location/data?location_uuid=8639f0e6-1623-4e60-8164-a853fb807917&q_string=fromTime%3D2015-01-01%2000:05:00.000Z%26toTime%3D2015-01-02%2000:05:00.000Z%26interval%3Dhour%26aggregate%3dfalse%26data_format%3Drickshaw",
		agg_uri = "/location/data?location_uuid=8639f0e6-1623-4e60-8164-a853fb807917&q_string=fromTime%3D2015-01-01 00:05:00.000Z%26toTime%3D2015-01-02 00:05:00.000Z%26interval%3Dhour%26data_format%3Drickshaw";

var width = 960,
    height = 700,
    radius = Math.min(width, height) / 2 - 30
    padding = 5,
    duration = 1000;

var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.sqrt()
    .range([0, radius]);

var color = d3.scale.category20c();

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

var svg = d3.select("#graph").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");

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

function in_level (data, target){
	for (var index in data) {
		var row = data[index];
		if (target == row.name){
			return index;
		}
	}
	return null;
}

var levels_obj = {1: "sublocation_name",
									2: "equipment_type",
									3: "name"}

function build_tree_i(tree_i, sub_name, equip_type, equip_name){
		// console.log(tree_i);
		if (Object.keys(tree_i).indexOf(sub_name) >= 0  &&
			  Object.keys(tree_i[sub_name]).indexOf(equip_type) >= 0 &&
			  Object.keys(tree_i[sub_name][equip_type]).indexOf(equip_name) >= 0) {
			tree_i[sub_name][equip_type][equip_name] += 1;
		} else if (Object.keys(tree_i).indexOf(sub_name) >= 0 &&
			  			  Object.keys(tree_i[sub_name]).indexOf(equip_type) >= 0){
			tree_i[sub_name][equip_type][equip_name] = 1;
		} else if (Object.keys(tree_i).indexOf(sub_name) >= 0) { 
			tree_i[sub_name][equip_type] = {};
			tree_i[sub_name][equip_type][equip_name] = 1;
		} else {
			tree_i[sub_name] = {};
			tree_i[sub_name][equip_type] = {};
			tree_i[sub_name][equip_type][equip_name] = 1;
		}
}

function nested (tree, data, level, suffix, id) {
	level_name = levels_obj[level]
	target = data[level_name]
	data_index = in_level(tree, target)
	// console.log(id);
	if (data_index === null) {
		append = level == 3 
						 ? {name: data[level_name] + " " + suffix, size: data["total"], equipment_id: data["equipment_id"]} 
						 : {name: data[level_name], children: []}
		tree.push(append);
		// console.log("i",tree,target)
		// console.log("in_level",in_level(tree, target));
		if (in_level(tree, target) !== null && Object.keys(tree[in_level(tree, target)]).indexOf("children") >= 0){
			nested(tree[in_level(tree, target)]["children"], data, level + 1, suffix, id);
		}
	}
	 //} else if {} 
	else {
		// console.log("nah")
		if (in_level(tree, target) !== null && Object.keys(tree[in_level(tree, target)]).indexOf("children") >= 0) {
			nested(tree[in_level(tree, target)]["children"], data, level + 1, suffix, id);
		}
	}
}

function combine_tree (reading_data) {
	var tree = [],
			tree_i = {};
	for (var index in reading_data) {
		// console.log(index, "hats");
		var row = reading_data[index],
				sub_name = row.sublocation_name,
				equip_type = row.equipment_type
				equip_name = row.name,
				total = row.total, 
		build_tree_i(tree_i, sub_name, equip_type, equip_name);
		suffix = String(tree_i[sub_name][equip_type][equip_name])
		// console.log(suffix)
		nested(tree, row, 1, suffix, index)
	}
	return {name: client_name, children: [{name: location_name, children: tree}]}
}

var client_info = {};
d3.json("/client", function (json) {
	// console.log("Client Information")
	// console.log(json);   										// client information
})

var location_info = {};
d3.json("/client/location?uuid=15b87da5-5465-476f-b211-397b0280b609", function (data) {
	// console.log("Location Information")  
	// console.log(data);												// location information
});


d3.json(deagg_uri, function (error,json) {
	// var data = json.data,
	// 		names = json.names;
	root = combine_tree(json);


  node = root;
  // console.log(node);
  var path = svg.datum(root).selectAll("path")
      .data(partition.nodes)
    .enter().append("path")
      .attr("d", arc)
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
      // .on("hover", te)
      .on("click", textClick)
      .attr("data-toggle","tooltip")
      .attr("data-placement", "top")
      .attr("data-original-title", "Lies!!!")
      .attr("title", "Lies!!!")
      // data-placement="top" title="" data-original-title="Tooltip on top"
      ;

  text.append("tspan")
      .attr("x", 0)
      .text(function(d) { return d.depth ? d.name.split(" ")[0] : ""; });
  text.append("tspan")
      .attr("x", 0)
      .attr("dy", "1em")
      .text(function(d) { return d.depth ? d.name.split(" ")[1] || "" : ""; });
    	
      // .attr("d", arc)
      // .style("fill", function(d) {return color((d.children ? d : d.parent).name); })
      // .on("click", click)
      // .each(stash)
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
  	// console.log(d);
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

// $("text").each(function () {
//     $(this).tooltip({
//         'container': 'body',
//     });
// });

$(".text").tooltip({
    'container': 'body',
    'placement': 'bottom'
}); // this works!

$(function () { 
  $("[data-toggle='tooltip']").tooltip();
  console.log("cats");
});
// $("text").tooltip()