(function() {
	'use strict';

	const REAL_TIME_FREQUENCY = 900;

	class Beep {
		constructor() {
			let audioContext = new AudioContext();
			
			this.running = false;

			this.oscillator = audioContext.createOscillator();
			this.oscillator.frequency.value = REAL_TIME_FREQUENCY;
			this.oscillator.connect(audioContext.destination);
		}
		
		start() {
			if (!this.running) {
				this.oscillator.start();
			}
		}
		
		stop() {
			if (this.running) {
				this.oscillator.stop();
			}
		}
	}

	window.Beep = new Beep();
})();