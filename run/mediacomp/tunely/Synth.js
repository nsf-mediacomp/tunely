//built on top of wad.min.js (https://github.com/rserota/wad)
Synth.playing_sounds = {};
Synth.samples_collection = {};
Synth.indexed_samples_collection = {};
Synth.sounds = {};

Synth.ResetSound = function(name){
	try{
		var source = Synth.playing_sounds[name];
		if (!source.start)
			source.noteOff(0);
		else
			source.stop(0);
		delete Synth.playing_sounds[name];
	}catch(e){}
	
	delete Synth.samples_collection[name]; //???
	delete Synth.indexed_samples_collection[name]; //??
	
	Synth.sounds[name] = Synth.CloneSound(Synth.originalSounds[name]);
	Synth.sounds[name].name = name;
	Synth.GetSamples(Synth.sounds[name]);
}

Synth.Stop = function(){
	for (var key in Synth.playing_sounds){
		if (Synth.playing_sounds.hasOwnProperty(key)){
			var source = Synth.playing_sounds[key];
			if(!source.start) {
				source.noteOff(0);
			} else {
				source.stop(0);
			}
		}
	}
	Synth.playing_sounds = {};
}

Synth.SetInstrument = function(sound){
	Synth.curr_sound = sound;
}

Synth.samples_collection = {};
Synth.GetSamples = function(sound, ignore_cache){	
	if (ignore_cache === undefined) ignore_cache = false;
	if (sound === null || sound === undefined) return null;
	var name = sound.name;
	if (Synth.samples_collection[name] !== undefined && !ignore_cache){
		return Synth.samples_collection[name].samples;
	}
	
	var raw_samples = sound.getChannelData(0);
	var samples = [];
	var samples_container = {};
	
	//now set the raw_samples of channel 1 to the combination of all channels
	var other_channel_raw_samples = [];
	for (var i = 1; i < sound.numberOfChannels; i++){
		other_channel_raw_samples.push(sound.getChannelData(i));
	}
	for (var j = 0; j < raw_samples.length; j++){					
		//and additionally add it to the 'smart' samples array
		samples.push({
			ref: samples_container,
			sound_name: name,
			index: j,
			value: raw_samples[j],
			getValue: function(){ return this.value; },
			setValue: function(value){
				this.value = value;
				//now actually set the raw sample value so that it's updated in the audio buffer!!
				this.ref.raw_samples[this.index] = this.value;
				/*if (this.ref.explorer === undefined){
					for (var i in Synth.EXPLORER.Selector.explorers){
						var explorer = Synth.EXPLORER.Selector.explorers[i];
						if (explorer.name === this.sound_name){
							this.ref.explorer = explorer.explorer;
							break;
						}
					}
				}
				//this.ref.explorer.ExploreSample(this.index);*/
				//set it the same for the rest of the channels' samples!!! (if there are any)
				for (var i = 0; i < this.ref.other_channel_raw_samples.length; i++){
					this.ref.other_channel_raw_samples[i][this.index] = this.value;
				}
			},
		});
	}
	
	samples_container.raw_samples = raw_samples;
	samples_container.samples = samples;
	samples_container.other_channel_raw_samples = other_channel_raw_samples;
	if (!ignore_cache)
		Synth.samples_collection[name] = samples_container;
	return samples;
}
Synth.indexed_samples_collection = {};
Synth.GetSamplesIndexed = function(sound, channel_index){
	if (sound === null || sound === undefined) return null;	
	if (channel_index === null || channel_index === undefined) channel_index = 1;
	channel_index -= 1;
	var name = sound.name;
	if (Synth.samples_collection[name] !== undefined && Synth.samples_collection[name][channel_index] !== undefined)
		return Synth.samples_collection[name][channel_index].samples;
	
	var raw_samples = sound.getChannelData(channel_index);
	var samples = [];
	for (var i = 0; i < raw_samples.length; i++){
		samples.push({
			sound_name: name,
			channel_index: channel_index,
			index: i,
			value: raw_samples[i],
			getValue: function(){ return this.value; },
			setValue: function(value){
				this.value = value;
				//now actually set the raw sample value so that it's updated in the audio buffer!!
				Synth.samples_collection[this.sound_name][this.channel_index].raw_samples[this.index] = this.value;
			},
		});
	}
	
	if (Synth.samples_collection[name] === undefined)
		Synth.samples_collection[name] = {};	
	Synth.samples_collection[name][channel_index] = { raw_samples: raw_samples, samples: samples };
	return samples;
}

Synth.BlockPlaySound = function(sound){
	if (sound === null || sound === undefined) return null;
	var source = Synth.PlaySound(sound);
	var duration = source.buffer.duration;
	return {"sleep" : (duration * 1000)};
}
Synth.PlaySound = function(sound){	
	if (sound === null || sound === undefined) return null;
	var source = Synth.createSource(sound);
	
	source.connect(Synth.context.destination);
	
	if(!source.start) {
		source.noteOn(0);
	} else {
		source.start(0);
	}
	
    var key = new Date().getTime() - Synth.appstart_time;
	Synth.playing_sounds[key] = source;
	
	window.setTimeout(function(){
		source.disconnect(0);
		
		if(!source.start) {
			source.noteOff(0);
		} else {
			source.stop(0);
		}
		delete Synth.playing_sounds[key];
	}, source.buffer.duration*1000*4);	//give it some time (TODO: just fix pitch shift delay)
	
	return source;
}

Synth.BlockPlayNote = function(note){
	if (note === null || note === undefined) return null;
	var source = Synth.PlayNote(note);
	var duration = source.buffer.duration;
	return {"sleep" : (duration * 1000)};
}
//note will be in "C4", "C#6", "Bb2" format (make a block for this)
Synth.PlayNote = function(note){
	if (note === null || note === undefined) return null;
	var c4_freq = 261.6255653005986;
	var desired_freq = Synth.GetFreqFromNote(note);
	var pitch_scale =  desired_freq / c4_freq;
	console.log(pitch_scale);
	
	var source = Synth.createSource(Synth.curr_sound);
	
	if (pitch_scale !== 1.0){
		var shifter = Synth.createProcessingNode(Synth.context, pitch_scale);
		source.connect(shifter);
		shifter.connect(Synth.context.destination);
	}else{
		source.connect(Synth.context.destination);
	}
	
	if(!source.start) {
		source.noteOn(0);
	} else {
		source.start(0);
	}
	
    var key = new Date().getTime() - Synth.appstart_time;
	Synth.playing_sounds[key] = source;
	
	window.setTimeout(function(){
		source.disconnect(0)
		if (pitch_scale !== 1.0)
			shifter.disconnect(0)
		
		if(!source.start) {
			source.noteOff(0);
		} else {
			source.stop(0);
		}
		delete Synth.playing_sounds[key];
	}, source.buffer.duration*1000*4);	//give it some time (TODO: just fix pitch shift delay)
	
	return source;
}