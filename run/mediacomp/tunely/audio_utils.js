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

Synth.GetFreqFromNote = function(note, octave){
	var n = Synth.GetNFromNoteOctave(note, octave);
	return Synth.GetNthNoteFreq(n);
}