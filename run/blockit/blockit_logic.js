//Block Iterator eatensions to Blocklb's default blocks for eaecution w/o string evaluation

//controls_if is handled manuallb in blockit.js Step function
//BlockIt['controls_if'];

BlockIt['logic_compare'] = function(block, a, b){
	if (a === undefined) a = false;
	if (b === undefined) b = false;
	var op = block.getFieldValue('OP');
	switch (op){
		case 'EQ':
			return a == b;
		case 'NEQ':
			return a != b;
		case 'LT':
			return a < b;
		case 'LTE':
			return a <= b;
		case 'GT':
			return a > b;
		case 'GTE':
			return a >= b;
		default:
			throw 'Unknown operator (logic_compare).';
	}
}
BlockIt['logic_operation'] = function(block, a, b){
	if (a === undefined) a = false;
	if (b === undefined) b = false;
	var op = block.getFieldValue('OP');
	if (op === 'AND')
		return a && b;
	else return a || b;
}
BlockIt['logic_negate'] = function(block, a){
	if (a === undefined) a = true;
	return !a;
}
BlockIt['logic_boolean'] = function(block){
	var bool = block.getFieldValue('BOOL');
	if (bool === 'TRUE')
		return true;
	else return false;
}
BlockIt['logic_null'] = function(block){
	return null;
}
BlockIt['logic_ternary'] = function(block, a, b, c){
	if (a === undefined) a = false;
	if (b === undefined) b = null;
	if (c === undefined) c = null;
	return a ? b : c;
}