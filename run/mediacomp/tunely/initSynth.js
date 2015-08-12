function Synth(){}

Synth.appstart_time = new Date().getTime();

Synth.defaultSounds = {};
Synth.originalSounds = {};
Synth.sounds = {};

Synth.uploaded_sounds = [];


Synth.context = null;
if (typeof AudioContext !== "undefined") {
  Synth.context = new AudioContext();
} else if (typeof webkitAudioContext !== "undefined") {
  Synth.context = new webkitAudioContext();
} else {
  domready(function() {
    alert("No WebAudio");
  })
  throw new Error("No WebAudio!");
}

Synth.CreateSound = function(sound_name, samples){
	if (Synth.sounds[sound_name] !== undefined)
		return Synth.GetSound(sound_name);
	
	var channels = [], numChannels = 1;

    //clone the underlying Float32Arrays
    for (var i = 0; i < numChannels; i++){
    	channels[i] = new Float32Array(samples);
    }

    //create the new AudioBuffer (assuming AudioContext variable is in scope)
    var newBuffer = Synth.context.createBuffer(
                        numChannels,
                        audioBuffer.length,
                        audioBuffer.sampleRate
                    );

    //copy the cloned arrays to the new AudioBuffer
    for (var i = 0; i < numChannels; i++){
        newBuffer.getChannelData(i).set(channels[i]);
    }
	newBuffer.name = audioBuffer.name + "__" + (Synth.name_counter);
	Synth.name_counter++;

    return newBuffer;
}

Synth.GetSound = function(sound_name){
	var buffer = Synth.sounds[sound_name];
	if (buffer === undefined || buffer === null) return;
	buffer.name = sound_name;
	return buffer;
};

//http://stackoverflow.com/questions/12484052/how-can-i-reverse-playback-in-web-audio-api-but-keep-a-forward-version-as-well
Synth.CloneSound = function(audioBuffer){
    var channels = [],
        numChannels = audioBuffer.numberOfChannels;

    //clone the underlying Float32Arrays
    for (var i = 0; i < numChannels; i++){
        channels[i] = new Float32Array(audioBuffer.getChannelData(i));
    }

    //create the new AudioBuffer (assuming AudioContext variable is in scope)
    var newBuffer = Synth.context.createBuffer(
                        audioBuffer.numberOfChannels,
                        audioBuffer.length,
                        audioBuffer.sampleRate
                    );

    //copy the cloned arrays to the new AudioBuffer
    for (var i = 0; i < numChannels; i++){
        newBuffer.getChannelData(i).set(channels[i]);
    }
	newBuffer.name = audioBuffer.name + "__" + (Synth.name_counter);
	Synth.name_counter++;

    return newBuffer;
}

Synth.distributeSampleValuesEvenlyAcrossChannels = function(sound){
	if (sound === null || sound === undefined || sound.numberOfChannels === 1)
		return;
	var channel0 = sound.getChannelData(0);
	var other_channels = [];
	for (var i = 1; i < sound.numberOfChannels; i++){
		other_channels.push(sound.getChannelData(i));
	}
	
	for (var i = 0; i < channel0.length; i++){
		for (var j = 1; j < sound.numberOfChannels; j++){
			channel0[i] += other_channels[j-1][i];
		}
		//average the samples (so later we can distribute the values
		//amongst all channels)
		channel0[i] /= sound.numberOfChannels;
	}
	
	//distribute the averaged sample across all channels!
	for (var i = 0; i < other_channels.length; i++){
		other_channels[i].set(channel0);
	}
}

Synth.loadFileIntoVoiceBuffer = function(url, name, callback){
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';
	request.onload = function(){
		Synth.addToOriginalSounds(request.response, name, function(buffer){
			Synth.defaultSounds[name] = Synth.originalSounds[name];
			if (callback !== undefined)
				callback(buffer);
		});
	}
	request.send();
}

Synth.LoadSound = function(obj){
	Synth.uploaded_sounds.push(obj);
	var name = obj.name;
	var sound = Synth.context.createBuffer(obj.numberOfChannels, obj.length, obj.sampleRate);
	
	for (var i = 0; i < obj.numberOfChannels; i++){
		var channel = sound.getChannelData(i);
		var mem_channel = obj["channel" + i];
		mem_channel = new Float32Array(mem_channel);
		channel.set(mem_channel);
	}
	
	sound.name = name;
	Synth.originalSounds[name] = sound;
	Synth.sounds[name] = Synth.CloneSound(sound);
	
	//OPEN UP THE EXPLORER WINDOW (should add to canvas select as well)
	Synth.EXPLORER.CreateSoundExploration(sound);
	
	//refresh blocks
	BlockIt.RefreshWorkspace();
}

Synth.addToOriginalSounds = function(audiobuffer, name, callback){
	Synth.context.decodeAudioData(audiobuffer, function(buffer){
		Synth.distributeSampleValuesEvenlyAcrossChannels(buffer);
		Synth.originalSounds[name] = buffer;
		Synth.sounds[name] = Synth.CloneSound(buffer);
		Synth.sounds[name].name = name;
		
		//OPEN UP THE EXPLORER WINDOW (should add to canvas select as well)
		Synth.EXPLORER.CreateSoundExploration(Synth.sounds[name]);
		
		if (callback !== undefined)
			callback(buffer);
	}, function(err){
		console.log("Error loading sound", name, ":", err);
	});
}

Synth.createSource = function(buffer){
	buffer = eval(buffer);
	var source = Synth.context.createBufferSource();
	source.buffer = buffer;
	return source;
}

///////////////SYNTH UTILS/////////////////////////////
//from http://en.wikipedia.org/wiki/Piano_key_frequencies
Synth.GetNFromNoteOctave = function(note, octave){
	//default to middle octave C
	if (note === undefined) note = 'C';
	if (octave === undefined) octave = 4;
	
	var n = 0;
	switch (note){
		case 'A': case 'a':
			n = 1; break;
		case 'A#': case 'a#': case 'Bb': case 'bb':
			n = 2; break;
		case 'B': case 'b':
			n = 3; break;
		case 'C': case 'c':
			n = 4; break;
		case 'C#': case 'c#': case 'Db': case 'db':
			n = 5; break;
		case 'D': case 'd':
			n = 6; break;
		case 'D#': case 'd#': case 'Eb': case 'eb':
			n = 7; break;
		case 'E': case 'e': case 'Fb': case 'fb':
			n = 8; break;
		case 'F': case 'f': case 'E#': case 'e#':
			n = 9; break;
		case 'F#': case 'f#': case 'Gb': case 'gb':
			n = 10; break;
		case 'G': case 'g':
			n = 11; break;
		case 'G#': case 'g#': case 'Ab': case 'ab':
			n = 12; break;
		default: break;
	}
	//because octaves start with C but our freq equation depends on A::
	//if we're on C or above, octave is (multiplicative - 1) of 12
	if (n >= 4){
		n += (octave-1)*12;
	}
	//if we're below C, octave is multiplicative of 12
	else{
		n += (octave)*12;
	}
	return n;
}
// from http://en.wikipedia.org/wiki/Piano_key_frequencies
Synth.GetNthNoteFreq = function(n){
	return Math.pow(2, (n - 49)/12) * 440;
}

Synth.GetFreqFromNote = function(note){
	var octave = parseInt(note.slice(-1));
	note = note.slice(0, note.length-1);
	
	var n = Synth.GetNFromNoteOctave(note, octave);
	return Synth.GetNthNoteFreq(n);
}