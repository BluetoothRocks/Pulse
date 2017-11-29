# BluetoothRocks! Pulse
See your own pulse using a hearbeat monitor using WebBluetooth


## What do you need?

A browser that support WebBluetooth and a heart rate monitor or sportsband that supports Bluetooth LE, like:

- Any heart beat monitor that supports the standard heartrate characteristic, like the Polar H7 sensor which you can strap on your chest
- [HPLUS Watch](http://www.hpluswatch.com)


## How does this work?

The browser can connect to a Bluetooth LE device like the heart rate monitor using the WebBluetooth API. Each Bluetooth device has a number of services and characteristics. Think of them like objects with properties. Once connected to the device, the API then exposes these services and characteristics and you can read from and write to those characteristics. 

A heart rate monitor usually exposes a number of standard characteristics for reading out the current value of the heartbeat. 


## Why??

What do you mean? Because it's fun, of course!