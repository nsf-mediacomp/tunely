BlockIt.disabled_blocks = [];
BlockIt.DisableFloatingBlocks = function(valid_block_types){
	if (valid_block_types === undefined){
		valid_block_types = BlockIt.valid_block_types;
	}
	
	if (!Array.isArray(valid_block_types)){
		valid_block_types = [valid_block_types];
	}
	valid_block_types.push("procedures_defnoreturn");
	valid_block_types.push("procedures_defreturn");
	var blocks = BlockIt.workspace.getAllBlocks().sort();
	
	for (var i in blocks){
		var block = blocks[i];
		var topmostParent = block.parentBlock_;
		while (topmostParent !== null && topmostParent.parentBlock_ !== null){
			topmostParent = topmostParent.parentBlock_;
		}
		
		if (valid_block_types.indexOf(block.type) < 0 && (topmostParent === null || topmostParent.disabled == true)){
			block.setDisabled(true);
			BlockIt.disabled_blocks.push(block);
		}
	}
}

BlockIt.EnableFloatingBlocks = function(){
	for (var i in BlockIt.disabled_blocks){
		var block = BlockIt.disabled_blocks[i];
		block.setDisabled(false);
	}
	BlockIt.disabled_blocks = [];
}

//returns valid (wrapped) top level blocks
BlockIt.ReturnValidBlocksAndCacheFunctions = function(valid_block_types){
	if (valid_block_types === undefined){
		valid_block_types = BlockIt.valid_block_types;
	}
	
	if (!Array.isArray(valid_block_types)){
		valid_block_types = [valid_block_types];
	}
	var blocks	= BlockIt.workspace.getAllBlocks().sort();
	
	var valid_blocks = [];
		
	for (i in blocks){
		var block = blocks[i];
		//The block is valid!!!
		if (!block.disabled && valid_block_types.indexOf(block.type) >= 0){
			valid_blocks.push(block);
		}
		else if (!block.disabled && (block.type === "procedures_defreturn" || block.type === "procedures_defnoreturn")){
			var funcName = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
			
			//add the function to the blockly sandbox!
			//(note that blockly's arguments are scoped to the function
			//but other variables mentioned are all in global scope)
			BlockIt.sandbox.funcs[funcName] = block;
		}
	}
	return valid_blocks;
}

BlockIt.LoadBlocks = function(defaultXml, workspace){
  if (!workspace) workspace = Blockly.mainWorkspace;
  try {
    var loadOnce = window.sessionStorage.loadOnceBlocks;
  } catch(e) {
    // Firefox sometimes throws a SecurityError when accessing sessionStorage.
    // Restarting Firefox fixes this, so it looks like a bug.
    var loadOnce = null;
  }
  if ('BlocklyStorage' in window && window.location.hash.length > 1) {
    // An href with #key trigers an AJAX call to retrieve saved blocks.
    BlocklyStorage.retrieveXml(window.location.hash.substring(1));
  } else if (loadOnce) {
    // Language switching stores the blocks during the reload.
    delete window.sessionStorage.loadOnceBlocks;
    var xml = Blockly.Xml.textToDom(loadOnce);
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
  } else if (defaultXml) {
    // Load the editor with default starting blocks.
    var xml = Blockly.Xml.textToDom(defaultXml);
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
  } else if ('BlocklyStorage' in window) {
    // Restore saved blocks in a separate thread so that subsequent
    // initialization is not affected from a failed load.
    window.setTimeout(BlocklyStorage.restoreBlocks, 0);
  }
}

BlockIt.FreezeWorkspace = function(){
	var blocks = Blockly.mainWorkspace.getAllBlocks();
	for (var i = 0; i < blocks.length; i++){
		blocks[i].editable_originally_ = blocks[i].editable_;
		blocks[i].setEditable(false);
		blocks[i].deletable_originally_ = blocks[i].deletable_;
		blocks[i].setDeletable(false);
		blocks[i].movable_originally_ = blocks[i].movable_;
		blocks[i].setMovable(false);
	}
}

BlockIt.UnfreezeWorkspace = function(){
	var blocks = Blockly.mainWorkspace.getAllBlocks();
	for (var i = 0; i < blocks.length; i++){
		if (blocks[i].editable_originally_ !== undefined){
			blocks[i].setEditable(blocks[i].editable_originally_);
			delete blocks[i].editable_originally_;
		}
		if (blocks[i].deletable_originally_ !== undefined){
			blocks[i].setDeletable(blocks[i].deletable_originally_);
			delete blocks[i].deletable_originally_;
		}
		if (blocks[i].movable_originally_ !== undefined){
			blocks[i].setMovable(blocks[i].movable_originally_);
			delete blocks[i].movable_originally_;
		}
	}
}

BlockIt.HardUnfreezeWorkspace = function(){
	var blocks = Blockly.mainWorkspace.getAllBlocks();
	for (var i = 0; i < blocks.length; i++){
		blocks[i].setEditable(true);		
		blocks[i].setDeletable(true);
		blocks[i].setMovable(true);
	}
}