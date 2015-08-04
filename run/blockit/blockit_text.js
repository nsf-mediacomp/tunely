//Block Iterator extensions to Blockly's default blocks for execution w/o string evaluation
BlockIt['text'] = function(block){
	return Blockly.JavaScript.quote_(block.getFieldValue('TEXT'));
}
BlockIt['text_join'] = function(block){
	var text = '';
	for (var i = 1; i < arguments.length; i++){
		text += String(arguments[i]);
	}
	return text;
}
BlockIt['text_append'] = function(block, t){
	if (t === undefined) t = '';
	var var_name = block.getFieldValue('VAR');
	BlockIt.sandbox[var_name] = String(BlockIt.sandbox[var_name]) + String(t);
}
BlockIt['text_length'] = function(block, t){
	if (t === undefined) t = '';
	return t.length;
}
BlockIt['text_isEmpty'] = function(block, t){
	if (t === undefined) t = '';
	return !t;
}
BlockIt['text_indexOf'] = function(block, t, v){
	var op = block.getFieldValue('END') == 'FIRST' ? 0 : 1;
	if (t === undefined) t = '';
	if (v === undefined) v = '';
	
	if (op === 0)
		return t.indexOf(v) + 1;
	return t.lastIndexOf(v) + 1;
}
BlockIt['text_charAt'] = function(block, at, t){
	// Note: Until January 2013 this block did not have the WHERE input.
	var where = block.getFieldValue('WHERE') || 'FROM_START';
	if (at === undefined) at = 1;
	if (t === undefined) t = '';
	
	switch (where){
		case 'FIRST':
			return t.charAt(0);
		case 'LAST':
			return t.slice(-1);
		case 'FROM_START':
			//Blockly uses one-based indices.
			at = parseFloat(at) - 1;
			return t.charAt(at);
		case 'FROM_END':
			return text.slice(-1*at).charAt(0);
		case 'RANDOM':
			var x = Math.floor(Math.random() * t.length);
			return t[x];
		default:
			throw 'Unhandled option (text_charAt): ' + where;
	}
}
BlockIt['text_getSubstring'] = function(block, text, at1, at2){
	if (text === undefined) text = '';
	if (at1 === undefined) at1 = 1;
	if (at2 === undefined) at2 = 1;
	var where1 = block.getFieldValue('WHERE1');
	var where2 = block.getFieldValue('WHERE2');
	if (where1 == 'FIRST' && where2 == 'LAST')
		return text;
	function getAt(where, at){
		if (where == 'FROM_START')
			at--;
		else if (where == 'FROM_END')
			at = text.length - at;
		else if (where == 'FIRST')
			at = 0;
		else if (where == 'LAST')
			at = text.length - 1;
		else
			throw 'Unhandled option (text_getSubstring): ' + where;
		return at;
	}
	at1 = getAt(where1, at1);
	at2 = getAt(where2, at2) + 1;
	return text.slice(at1, at2);
}
BlockIt['text_changeCase'] = function(block, text){
	var op = block.getFieldValue('CASE');
	if (text === undefined) text = '';
	switch (op){
		case 'UPPERCASE':
			return text.toUpperCase();
		case 'LOWERCASE':
			return text.toLowerCase();
		case 'TITLECASE':
			return text.replace(/\S+/g,
				function(txt){ 
					return txt[0].toUpperCase() + txt.substring(1).toLowerCase();
				}
			)
		default: throw 'Unhandled option (text_changeCase).';
	}
}
BlockIt['text_trim'] = function(block, text){
	if (text === undefined) text = '';
	var op = block.getFieldValue('MODE');
	switch (op){
		case 'LEFT':
			return text.trimLeft();
		case 'RIGHT':
			return text.trimRight();
		case 'BOTH':
			return text.trim();
		default: throw 'Unhandled option (text_trim).';
	}
}
BlockIt['text_print'] = function(block, text){
	if (text === undefined) text = '';
	window.alert(text);
}