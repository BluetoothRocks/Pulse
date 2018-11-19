
var heart = document.getElementById('heart');
var heartbeat = document.getElementById('heartbeat');

var heartRates = [];


/* Update heart animation */

var rate = 0;
var previous = 1;

heart.addEventListener('animationiteration', function() {
	if (rate != previous) {
		previous = rate;
		heart.style.animationDuration = rate ? rate + 's' : '';
	}
});


/* Draw graph */

var canvas = document.getElementById('graph');

function resizeGraph() {
	let s = getComputedStyle(canvas);
	canvas.width = parseInt(s.width) * devicePixelRatio;
	canvas.height = parseInt(s.height) * devicePixelRatio;	

}

function drawGraph() {
	requestAnimationFrame(() => {
	    var context = canvas.getContext('2d');
	    var margin = 0;
	    var max = Math.max(0, Math.round(canvas.width / 11));
	    var offset = Math.max(0, heartRates.length - max);
	    context.clearRect(0, 0, canvas.width, canvas.height);

		context.strokeStyle = '#666666';
		context.lineWidth = 9;
	
		for (var i = 0; i < Math.max(heartRates.length, max); i++) {
			var barHeight = Math.round(heartRates[i + offset ] * canvas.height / 200);

			context.beginPath();
			context.moveTo(5 + 11 * i, canvas.height - barHeight);
			context.lineTo(5 + 11 * i, canvas.height);
			context.stroke();
		}
		
		
	});	
}

resizeGraph();
drawGraph();

window.onresize = () => {
	resizeGraph();
	drawGraph();
}

document.addEventListener("visibilitychange", () => {
	if (!document.hidden) {
		resizeGraph();
		drawGraph();
	}
});


(function() {
	'use strict';

	const REAL_TIME_FREQUENCY = 900;

	class Beep {
		constructor() {
			this.running = false;
			this.created = false;
		}
		
		create() {
			this.created = true;

			let audioContext = new AudioContext();
			this.oscillator = audioContext.createOscillator();
			this.oscillator.frequency.value = REAL_TIME_FREQUENCY;
			this.oscillator.connect(audioContext.destination);
		}
		
		start() {
			if (!this.created) {
				this.create();
			}
			
			if (!this.running) {
				this.running = true;
				this.oscillator.start();
			}
		}
		
		stop() {
			if (this.running) {
				this.running = false;
				this.oscillator.stop();
				
				this.oscillator = null;
				this.created = false;
			}
		}
	}

	window.Beep = new Beep();
})();





/* Connect to device */

document.getElementById('connect')
	.addEventListener('click', () => {
		BluetoothPulseMonitor.connect()
			.then(() => {
				document.body.classList.add('connected');
				
				Beep.stop();
				
				BluetoothPulseMonitor.addEventListener('disconnected', () => {
					document.body.classList.remove('connected');
					rate = 0;
					heartbeat.innerText = '';
					
					heartRates = [];
				    drawGraph();
				    
				    Beep.start();
				});

				BluetoothPulseMonitor.addEventListener('change', (value) => {
					if (rate == 0) {
						heart.style.animationDuration = (Math.round((60 / value) * 10) / 10) + 's';
					}
					
					rate = value ? (Math.round((60 / value) * 10) / 10) : 0;
					heartbeat.innerText = value ? value : '';

					if (value) {
						Beep.stop();
					} else {
						Beep.start();
					}

				    heartRates.push(value);
					heartRates = heartRates.slice(-250);
				    drawGraph();
				});
			});
	});

document.getElementById('emulate')
	.addEventListener('click', () => {
	    emulateState = true;
		document.body.classList.add('connected');
		
		function emulate() {
			var value = parseInt(60 + (Math.random() * 60));
			rate = value ? (Math.round((60 / value) * 10) / 10) : 0;
			heartbeat.innerText = value ? value : '';

			heartRates.push(value);
			heartRates = heartRates.slice(-250);
		    drawGraph();
			
			setTimeout(emulate, 500);
		}

		var value = parseInt(60 + (Math.random() * 60));
		heart.style.animationDuration = (Math.round((60 / value) * 10) / 10) + 's';
		heartbeat.innerText = value ? value : '';

	    heartRates.push(value);
	    drawGraph();

		emulate();
	});



