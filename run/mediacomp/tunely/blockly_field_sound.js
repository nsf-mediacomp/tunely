/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Sound input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldSound');

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('goog.string');


/**
 * Class for a sounds's dropdown field.
 * @param {?string} varname The default name for the sound.  If null,
 *     a unique sound name will be generated.
 * @param {Function} opt_changeHandler A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.  Its
 *     return value is ignored.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldSound = function(varname, opt_changeHandler) {
  var changeHandler;
  if (opt_changeHandler) {
    // Wrap the user's change handler together with the sound rename handler.
    var thisObj = this;
    changeHandler = function(value) {
      var retVal = Blockly.FieldSound.dropdownChange.call(thisObj, value);
      var newVal;
      if (retVal === undefined) {
        newVal = value;  // Existing sound selected.
      } else if (retVal === null) {
        newVal = thisObj.getValue();  // Abort, no change.
      } else {
        newVal = retVal;  // Sound name entered.
      }
      opt_changeHandler.call(thisObj, newVal);
      return retVal;
    };
  } else {
    changeHandler = Blockly.FieldSound.dropdownChange;
  }

  Blockly.FieldSound.superClass_.constructor.call(this,
      Blockly.FieldSound.dropdownCreate, changeHandler);

  this.setValue(varname || '');
};
goog.inherits(Blockly.FieldSound, Blockly.FieldDropdown);

/**
 * Install this dropdown on a block.
 * @param {!Blockly.Block} block The block containing this text.
 */
Blockly.FieldSound.prototype.init = function(block) {
  if (this.sourceBlock_) {
    // Dropdown has already been initialized once.
    return;
  }

  if (!this.getValue()) {
    // Sounds without names get uniquely named
    if (block.isInFlyout) {
      var workspace = block.workspace.targetWorkspace;
    } else {
      var workspace = block.workspace;
    }
    this.setValue(Synth.generateUniqueName());
  }
  Blockly.FieldSound.superClass_.init.call(this, block);
};

/**
 * Clone this FieldSound.
 * @return {!Blockly.FieldSound} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldSound.prototype.clone = function() {
  return new Blockly.FieldSound(this.getValue(), this.changeHandler_);
};

/**
 * Get the sound's name (use a variableDB to convert into a real name).
 * Unline a regular dropdown, sounds are literal and have no neutral value.
 * @return {string} Current text.
 */
Blockly.FieldSound.prototype.getValue = function() {
  return this.getText();
};

/**
 * Set the sound name.
 * @param {string} text New text.
 */
Blockly.FieldSound.prototype.setValue = function(text) {
  this.value_ = text;
  this.setText(text);
};

/**
 * Return a sorted list of sound names for sound dropdown menus.
 * Include a special option at the end for creating a new sound name.
 * @return {!Array.<string>} Array of sound names.
 * @this {!Blockly.FieldSound}
 */
Blockly.FieldSound.dropdownCreate = function() {
  if (this.sourceBlock_ && this.sourceBlock_.workspace) {
    var soundList = Object.keys(Synth.originalSounds);
  } else {
    var soundList = [];
  }
  // Ensure that the currently selected sound is an option.
  var name = this.getText();
  if (name && soundList.indexOf(name) == -1) {
    soundList.push(name);
  }
  soundList.sort(goog.string.caseInsensitiveCompare);
  soundList.push(Blockly.Msg.RENAME_SOUND);
  soundList.push(Blockly.Msg.NEW_SOUND);
  // Sounds are not language-specific, use the name as both the user-facing
  // text and the internal representation.
  var options = [];
  for (var x = 0; x < soundList.length; x++) {
    options[x] = [soundList[x], soundList[x]];
  }
  return options;
};

/**
 * Event handler for a change in sound name.
 * Special case the 'New sound...' and 'Rename sound...' options.
 * In both of these special cases, prompt the user for a new name.
 * @param {string} text The selected dropdown menu option.
 * @return {null|undefined|string} An acceptable new sound name, or null if
 *     change is to be either aborted (cancel button) or has been already
 *     handled (rename), or undefined if an existing sound was chosen.
 * @this {!Blockly.FieldSound}
 */
Blockly.FieldSound.dropdownChange = function(text) {
  function promptName(promptText, defaultText) {
    Blockly.hideChaff();
    var newVar = window.prompt(promptText, defaultText);
    // Merge runs of whitespace.  Strip leading and trailing whitespace.
    // Beyond this, all names are legal.
    if (newVar) {
      newVar = newVar.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
      if (newVar == Blockly.Msg.RENAME_SOUND ||
          newVar == Blockly.Msg.NEW_SOUND) {
        // Ok, not ALL names are legal...
        newVar = null;
      }
    }
    return newVar;
  }
  var workspace = this.sourceBlock_.workspace;
  if (text == Blockly.Msg.RENAME_SOUND) {
    var oldVar = this.getText();
	if (Synth.isDefaultSoundName(oldVar)){
		Blockly.hideChaff();
		alert("can't rename default sound");
		return oldVar;
	}
    text = promptName(Blockly.Msg.RENAME_SOUND_TITLE.replace('%1', oldVar),
                      oldVar);
    if (text) {
      Synth.renameSound(oldVar, text, workspace);
    }
    return null;
  } else if (text == Blockly.Msg.NEW_SOUND) { 
    text = promptName(Blockly.Msg.NEW_SOUND_TITLE, '');
	var duration = prompt(Blockly.Msg.NEW_SOUND_DURATION_TITLE, '');
	while (isNaN(duration)){
		duration = prompt(Blockly.Msg.NEW_SOUND_DURATION_TITLE_ERROR, '');
	}
	duration = Number(duration);
    // Since sounds are case-insensitive, ensure that if the new sound
    // matches with an existing sound, the new case prevails throughout.
    if (text) {
		Synth.newSoundName(text, duration, workspace);
		Synth.renameSound(text, text, workspace);
		return text; //TODO why no select?
    }
    return null;
  }
  return undefined;
};