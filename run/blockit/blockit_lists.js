//Block Iterator extensions to Blockly's default blocks for execution w/o string evaluation
BlockIt['lists_create_empty'] = function(block){
	return [];
}
BlockIt['lists_create_with'] = function(block){
	var list = [];
	for (var i = 1; i < arguments.length; i++){
		list.push(arguments[i]);
	}
	return list;
}
BlockIt['lists_repeat'] = function(block, item, x){
	if (item === undefined) item = null;
	if (x === undefined) x = 0;
	var list = [];
	for (var i = 0; i < x; i++){
		list.push(item);
	}
	return list;
}
BlockIt['lists_length'] = function(block, list){
	if (list === undefined) list = [];
	return list.length;
}
BlockIt['lists_isEmpty'] = function(block, list){
	if (list === undefined) list = [];
	return list.length === 0;
}
BlockIt['lists_indexOf'] = function(block, list, x){
	if (list === undefined) list = [];
	if (x === undefined) x = '';
	
	var op = block.getFieldValue('END');
	if (op === "FIRST")
		return list.indexOf(x) + 1;
	return list.lastIndexOf(x) + 1;
}
BlockIt['lists_getIndex'] = function(block, list, at){
	if (list === undefined) list = [];
	if (at === undefined) at = 1;
	
	var mode = block.getFieldValue('MODE') || 'GET';
	var where = block.getFieldValue('WHERE') || 'FROM_START';
	
	if (where == 'FIRST'){
		if (mode == 'GET')	return list[0];
		if (mode == 'GET_REMOVE') return list.shift();
		if (mode == 'REMOVE') list.shift();
	}else if (where == 'LAST'){
		if (mode == 'GET') return list.slice(-1)[0];
		if (mode == 'GET_REMOVE') return list.pop();
		if (mode == 'REMOVE') list.pop();
	}else if (where == 'FROM_START'){
		at -= 1;
		if (mode == 'GET') return list[at];
		if (mode == 'GET_REMOVE') return list.splice(at, 1)[0];
		if (mode == 'REMOVE') list.splice(at, 1);
	}else if (where == 'FROM_END'){
		if (mode == 'GET') return list.slice((-1*at));
		
		at = list.length - at;
		if (mode == 'GET_REMOVE'){
			return list.splice(at, 1)[0];
		}
		if (mode == 'REMOVE'){
			list.splice(at, 1);
		}
	}else if (where == 'RANDOM'){
		function randomItem(list, remove){
			var x = Math.floor(Math.random() * list.length);
			if (remove){
				return list.splice(x, 1)[0];
			}else return list[x];
		}
		if (mode == 'GET' || mode == 'GET_REMOVE')
			return randomItem(list, (mode != 'GET'));
		randomItem(list, true);
	}else{
		throw 'Unhandled combination (lists_getIndex).';
	}
}
BlockIt['lists_setIndex'] = function(block, list, at, value){
	if (list === undefined) list = [];
	if (at === undefined) at = 1;
	if (value === undefined) value = null;
	//Blockly uses 1-based indices
	at -= 1;
	
	var mode = block.getFieldValue('MODE') || 'GET';
	var where = block.getFieldValue('WHERE') || 'FROM_START';
	if (where == 'FIRST'){
		if (mode == 'SET'){
			list[0] = value;
		}else if (mode == 'INSERT'){
			list.unshift(value);
		}
	}else if (where == 'LAST'){
		if (mode == 'SET'){
			list[list.length-1] = value;
		}else if (mode == 'INSERT'){
			list.push(value);
		}
	}else if (where == 'FROM_START'){
		if (mode == 'SET'){
			list[at] = value;
		}else if (mode == 'INSERT'){
			list.splice(at, 0, value);
		}
	}else if (where == 'FROM_END'){
		if (mode == 'SET'){
			list[list.length - at] = value;
		}else if (mode == 'INSERT'){
			list.splice(list.length - at, 0, value);
		}
	}else if (where == 'RANDOM'){
		var x = Math.floor(Math.random() * list.length);
		if (mode == 'SET'){
			list[x] = value;
		}else if (mode == 'INSERT'){
			list.splice(x, 0, value);
		}
	}else{
		throw 'Unhandled combination (lists_setIndex).';
	}
}
BlockIt['lists_getSublist'] = function(block, list, at1, at2){
	if (list === undefined) list = [];
	if (at1 === undefined) at1 = 1;
	if (at2 === undefined) at2 = 1;
	var where1 = block.getFieldValue('WHERE1');
	var where2 = block.getFieldValue('WHERE2');
	//Blockly uses 1-based indices
	at1 -= 1;
	at2 -= 1;
	
	if (where1 == 'FIRST' && where2 == 'LAST'){
		return list.concat();
	}else{
		function getAt(where, at){
			if (where == 'FROM_START')
				at--;
			else if (where == 'FROM_END')
				at = list.length - at;
			else if (where == 'FIRST')
				at = 0;
			else if (where == 'LAST')
				at = list.length - 1;
			else
				throw 'Unhandled option (lists_getSublist).';
			return at;
		}
		at1 = getAt(where1, at1);
		at2 = getAt(where2, at2) + 1;
		return list.slice(at1, at2);
	}
}
BlockIt['lists_split'] = function(block, value, delim){
	if (delim === undefined) delim = '';
	var mode = block.getFieldValue('MODE');
	if (mode == 'SPLIT'){
		if (value === undefined) value = '';
		return value.split(delim);
	}else if (mode == 'JOIN'){
		if (value === undefined) value = [];
		return value.join(delim);
	}else{
		throw 'Unknown mode: ' + mode;
	}
}