//Block Iterator extensions to Blockly's default blocks for execution w/o string evaluation
BlockIt['colour_picker'] = function(block){
	return block.getFieldValue('COLOUR');
}
BlockIt['colour_random'] = function(block){
	var num = Math.floor(Math.random() * Math.pow(2, 24));
	return '#' + ('00000' + num.toString(16)).substr(-6);
}
BlockIt['colour_rgb'] = function(block, r, g, b){
	if (r === undefined) r = 0;
	if (g === undefined) g = 0;
	if (b === undefined) b = 0;
	r = Math.max(Math.min(Number(r), 100), 0) * 2.55;
	g = Math.max(Math.min(Number(g), 100), 0) * 2.55;
	b = Math.max(Math.min(Number(b), 100), 0) * 2.55;
	r = ('0' + (Math.round(r) || 0).toString(16)).slice(-2);
	g = ('0' + (Math.round(g) || 0).toString(16)).slice(-2);
	b = ('0' + (Math.round(b) || 0).toString(16)).slice(-2);
	return '#' + r + g + b;
}
BlockIt['colour_blend'] = function(block, c1, c2, ratio){
	if (c1 === undefined) c1 = '#000000';
	if (c2 === undefined) c2 = '#000000';
	if (ratio === undefined) ratio = 0.5;
	var r1 = parseInt(c1.substring(1, 3), 16);
    var g1 = parseInt(c1.substring(3, 5), 16);
    var b1 = parseInt(c1.substring(5, 7), 16);
    var r2 = parseInt(c2.substring(1, 3), 16);
    var g2 = parseInt(c2.substring(3, 5), 16);
    var b2 = parseInt(c2.substring(5, 7), 16);
    var r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    var g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    var b = Math.round(b1 * (1 - ratio) + b2 * ratio);
    r = ('0' + (r || 0).toString(16)).slice(-2);
    g = ('0' + (g || 0).toString(16)).slice(-2);
    b = ('0' + (b || 0).toString(16)).slice(-2);
    return '#' + r + g + b;
}