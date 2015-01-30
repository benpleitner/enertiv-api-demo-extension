var basicTree = basicTree || {}; // JS Namespace

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
	var level_name = levels_obj[level],
			target = data[level_name],
			data_index = in_level(tree, target),
			total = data["total"];
	// console.log(id);
	if (data_index === null) {
		append = level == 3 
						 ? {name: data[level_name] + suffix, size: data["total"], equipment_id: data["equipment_id"]} 
						 : {name: data[level_name], children: [], size: total}
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
			// console.log(data["total"]);
			// console.log(tree[in_level(tree, target)]);
			tree[in_level(tree, target)]["size"] += total;
			nested(tree[in_level(tree, target)]["children"], data, level + 1, suffix, id);
		}
	}
}

basicTree.combine_tree = function  (reading_data, client_name, location_name) {	
	var tree = [],
			tree_i = {},
			total_usage = 0;
	for (var index in reading_data) {
		// console.log(index, "hats");
		var row = reading_data[index],
				sub_name = row.sublocation_name,
				equip_type = row.equipment_type
				equip_name = row.name,
				total = row.total, 
		build_tree_i(tree_i, sub_name, equip_type, equip_name);
		total_usage += total;
		i = tree_i[sub_name][equip_type][equip_name]
		suffix = i == 1 ? " " : " " + i
		// console.log(suffix)
		nested(tree, row, 1, suffix, index)
	}
	return {name: client_name, size: total_usage, children: [{name: location_name, children: tree, size: total_usage}]}
}