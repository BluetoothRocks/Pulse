
(function() {
	'use strict';


	const PULSEMONITORS = [

		/* Standard service */
		{
			'filter':	{ services: [ 0x180d ] },
			'services':	[ 0x180d ],

			'notify':	{
				'listen':	{
					'service':			0x180d,
					'characteristic':	0x2a37,
					'interpret':		(buffer) => buffer.getUint8(0) & 0x02 && buffer.getUint8(0) & 0x03 ? (buffer.getUint8(0) & 0x1 ? buffer.getUint16(1, true) : buffer.getUint8(1)) : 0
				}
			}
		},


		/* HPLUS */
		{
			'filter':	{ namePrefix: 'HPLUS' },
			'services':	[ '14701820-620a-3973-7c78-9cfff0876abd' ],

			'notify':	{
				'listen':	{
					'service':			'14701820-620a-3973-7c78-9cfff0876abd',
					'characteristic':	'14702853-620a-3973-7c78-9cfff0876abd',
					'interpret':		(buffer) => buffer.byteLength == 15 ? buffer.getUint8(11) : null
				}
			}
		}
	]


	class BluetoothPulseMonitor {
		constructor() {
			this._EVENTS = {}
			this._SERVER = null;
			this._PULSEMONITOR = null;
			this._HEARTBEAT = null;
		}
		
		connect() {
            console.log('Requesting Bluetooth Device...');
            
            return new Promise((resolve, reject) => {
            
	            navigator.bluetooth.requestDevice({
		            filters: PULSEMONITORS.map(item => item.filter),
					optionalServices: PULSEMONITORS.map(i => i.services).reduce((a, b) => a.concat(b))
				})
		            .then(device => {
		                console.log('Connecting to GATT Server...');

		                device.addEventListener('gattserverdisconnected', this._disconnect.bind(this));
		                return device.gatt.connect();
		            })
		            .then(server => {
						this._inspect(server)
							.then(pulsemonitor => {
				                this._SERVER = server;
								this._PULSEMONITOR = pulsemonitor;
	
								if (this._PULSEMONITOR.notify) {
									this._SERVER.getPrimaryService(this._PULSEMONITOR.notify.listen.service)
										.then(service => {
											return service.getCharacteristic(this._PULSEMONITOR.notify.listen.characteristic)
										})
										.then(characteristic => {

											/* Workaround, notifications stop without assigning the characteristic to the window */																				window.__NO_GC = characteristic;
											
											/* Start listening for status notifications */
											characteristic.startNotifications().then((characteristic) => {
												characteristic.addEventListener('characteristicvaluechanged', event => {
													this._HEARTBEAT = this._PULSEMONITOR.notify.listen.interpret(event.target.value);
													
													if (this._HEARTBEAT !== null) {	
														if (this._EVENTS['change']) {
															this._EVENTS['change'](this._HEARTBEAT);
														}
													}
												});
											});

											
										});

									resolve();
								} else {
						            this._HEARTBEAT = null;
									resolve();
								}
							})
							.catch(() => {
							});
		            })
		            .catch(error => {
		                console.log('Could not connect! ' + error);
						reject();
		            });			
			});
			
		}
		
		addEventListener(e, f) {
			this._EVENTS[e] = f;
		}

		isConnected() {
			return !! this._SERVER;
		}
					
		get heartbeat() {
			return this._HEARTBEAT;
		}
		
		_disconnect() {
            console.log('Disconnected from GATT Server...');

			this._SERVER = null;
			
			if (this._EVENTS['disconnected']) {
				this._EVENTS['disconnected']();
			}
		}

		_inspect(server) {
			return new Promise((resolve, reject) => {
                console.log('Retrieving Primary Services');

				server.getPrimaryServices()
					.then(services => { 
						let found = services.map(service => this._normalizeGuid(service.uuid));
						
						let result = PULSEMONITORS.some(pulsemonitor => {
							if (pulsemonitor.services.length == found.length && 
								pulsemonitor.services
									.map(item => this._normalizeGuid(item))
									.filter(item => found.includes(item)).length == found.length) 
							{
								resolve(pulsemonitor);
								return true;
							}
						});
						
						if (!result) {
							reject();
						}
					})
		            .catch(error => {
		                console.log('Could not retrieve Primary Services! ' + error);
						reject();
		            });			
			});
		}
				
		_normalizeGuid(guid) {
			if (typeof guid == "number") {
				guid = ("0000" + guid.toString(16)).slice(-4);
			}
			
			if (typeof guid == "string") {
				if (guid.length == 4) {
					return "0000" + guid.toLowerCase() + "-0000-1000-8000-00805f9b34fb";
				}
				
				if (guid.length == 36) {
					return guid.toLowerCase();
				}
			}
		}
	}

	window.BluetoothPulseMonitor = new BluetoothPulseMonitor();
})();


/*
window.setInterval(function() {
	window.__NO_GC;
}, 500)
*/
