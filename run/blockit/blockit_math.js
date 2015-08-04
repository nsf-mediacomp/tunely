//Block Iterator extensions to Blockly's default blocks for execution w/o string evaluation
BlockIt["math_number"] = function(block){
	return parseFloat(block.getFieldValue('NUM'));
}
BlockIt["math_arithmetic"] = function(block, x, y){
	if (x === undefined) x = 0;
	if (y === undefined) y = 0;
	var op = block.getFieldValue('OP');
	switch (op){
		case "ADD":
			return (x+y);
		case "MINUS":
			return (x-y);
		case "MULTIPLY":
			return (x*y);
		case "DIVIDE":
			return (x/y);
		case "POWER":
			return Math.pow(x, y);
		default:
			throw 'Unknown math operator: ' + op;
	}
}
BlockIt['math_single'] = function(block, x){
	if (x === undefined) x = 0;
	var op = block.getFieldValue('OP');
	switch (op){
		case "NEG":
			return x*-1;
		case "ABS":
			return Math.abs(x);
		case "ROOT":
			return Math.sqrt(x);
		case "LN":
			return Math.log(x);
		case "EXP":
			return Math.exp(x);
		case "POW10":
			return Math.pow(10, x);
		case "ROUND":
			return Math.round(x);
		case "ROUNDUP":
			return Math.ceil(x);
		case "ROUNDDOWN":
			return Math.floor(x);
		case "SIN":
			return Math.sin(x/180*Math.PI);
		case "COS":
			return Math.sin(x/180*Math.PI);
		case "TAN":
			return Math.tan(x/180*Math.PI);
		case "LOG10":
			return Math.log(x)/Math.log(10);
		case "ASIN":
			return Math.asin(x) / Math.PI * 180;
		case "ACOS":
			return Math.acos(x) / Math.PI * 180;
		case "ATAN":
			return Math.atan(x) / Math.PI * 180;
		default:
			throw 'Unknown math operator: ' + op;
	}
}
BlockIt['math_constant'] = function(block){
	var constant = block.getFieldValue('CONSTANT');
	switch (constant){
		case "PI":
			return Math.PI;
		case "E":
			return Math.E;
		case "GOLDEN_RATIO":
			return (1 + Math.sqrt(5)) / 2;
		case "SQRT2":
			return Math.SQRT2;
		case "SQRT1_2":
			return Math.SQRT1_2;
		case "INFINITY":
			return Infinity;
		default:
			throw 'Unknown math constant: ' + constant;
	}
}
BlockIt['math_number_property'] = function(block, x, y){
	if (x === undefined) x = 0;
	var prop = block.getFieldValue('PROPERTY');
	switch (prop){
		case 'PRIME':
			// https://en.wikipedia.org/wiki/Primality_test#Naive_methods
			function isPrime(n){
				if (n == 2 || n ==3) 
					return true;
				if (isNaN(n) || n <= 1 || n % 1 != 0 || n % 2 == 0 || n % 3 == 0)
					return false;
				for (var l = 6; l < Math.sqrt(n) + 1; l += 6){
					if (n % (l-1) == 0 || n % (l+1) == 0)
						return false;
				}
				return true;
			}
			return isPrime(x);
		case "EVEN":
			return x % 2 == 0;
		case "ODD":
			return x % 2 == 1;
		case "WHOLE":
			return x % 1 == 0;
		case "POSITIVE":
			return x > 0;
		case "NEGATIVE":
			return x < 0;
		case "DIVISIBLE_BY":
			if (y === undefined) y = 0;
			return x % y == 0;
		default:
			throw 'Unknown math property: ' + prop;
	}
}
BlockIt["math_change"] = function(block, delta){
	if (delta === undefined) delta = 0;
	var var_name = block.getFieldValue('VAR');
	//refers to the BlockIt sandbox defined in the blockit_variable.js
	BlockIt.sandbox[var_name] += delta;
}
BlockIt['math_round'] = BlockIt['math_single'];
BlockIt['math_trig'] = BlockIt['math_single'];

BlockIt['math_on_list'] = function(block, list){
	if (list === undefined) list = [];
	var op = block.getFieldValue('OP');
	switch (op){
		case 'SUM':
			return list.reduce(function(x, y){ return x + y; });
		case 'MIN':
			return Math.min.apply(null, list);
		case 'MAX':
			return Math.max.apply(null, list);
		case 'AVERAGE':
			return (list.reduce(function(x, y){ return x + y;}) / list.length);
		case 'MEDIAN':
			var localList = list.filter(function(x){ return typeof x == 'number';});
			if (!localList.length) return null;
			localList.sort(function(a, b){ return b - a;});
			if (localList.length % 2 == 0){
					return (localList[localList.length/2 - 1] + 
							localList[localList.length / 2]) / 2;
			}else{
				return localList[(localList.length - 1) / 2];
			}
		case 'MODE':
			var modes = [];
			var counts = [];
			var maxCount = 0;
			for (var i = 0; i < list.length; i++){
				var value = list[i];
				var found = false;
				var thisCount;
				for (var j = 0; j < counts.length; j++){
					if (counts[j][0] === value){
						thisCount = ++counts[j][1];
						found = true;
						break;
					}
				}
				if (!found){
					counts.push([value, 1]);
					thisCount = 1;
				}
				maxCount = Math.max(thisCount, maxCount);
			}
			for (var j = 0; j < counts.length; j++){
				if (counts[j][1] == maxCount){
					modes.push(counts[j][0]);
				}
			}
			return modes;
		case 'STD_DEV':
			var n = lists.length;
			if (!n) return null;
			var mean = list.reduce(function(x, y){ return x + y; });
			var variance = 0;
			for (var j = 0; j < n; j++){
				variance += Math.pow(number[j] - mean, 2);
			}
			variance = variance / n;
			return Math.sqrt(variance);
		case 'RANDOM':
			var x = Math.floor(Math.random() * list.length);
			return list[x];
		default:
			throw 'Unknown operator: ' + op;
	}
}
BlockIt['math_modulo'] = function(block, x, y){
	if (x === undefined) x = 0;
	if (y === undefined) y = 0;
	return x % y;
}
BlockIt['math_constrain'] = function(block, x, y, z){
	if (x === undefined) x = 0;
	if (y === undefined) y = 0;
	if (z === undefined) z = Infinity;
	return Math.min(Math.max(x, y), z);
}
BlockIt['math_random_int'] = function(block, x, y){
	if (x === undefined) x = 0;
	if (y === undefined) y = 0;
	if (x > y){
		//swap x and y to ensure x is smaller
		var z = x;
		x = y;
		y = z;
	}
	return Math.floor(Math.random() * (y - x + 1) + x);
}
BlockIt['math_random_float'] = function(block){
	return Math.random();
}