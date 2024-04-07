import { exec } from 'node:child_process';
import { SerialPort } from 'serialport';

const speakerDeviceRegistryKey = '{5cf845cf-49ab-4644-95c1-d679b9bb265f}';
const headsetDeviceRegistryKey = '{d6dee2b2-a01e-4b5f-aabc-8ec28996d45e}';
const registryPath = 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\MMDevices\\Audio\\Render\\';
const updateFrequency = 250;
const baudRate = 9600;
let previousState = false;
let port;


function getDevice () {
	return new Promise(resolve => {
		exec('serialport-list -f json', (error, stdout) => {
			if (error) return resolve(undefined);
			const ports = JSON.parse(stdout);
			resolve(ports.find(({ friendlyName }) => friendlyName?.includes('Arduino Leonardo')));
		});
	});
}

async function createPort () {
	await new Promise(resolve => {
		console.info('Searching for switch...');
		const interval = setInterval(async () => {
			const arduino = await getDevice();
			if (arduino && arduino.path) {
				clearInterval(interval);
				port = new SerialPort({ path: arduino.path, baudRate });
				console.info('\x1b[32mSwitch connected.\x1b[0m');
				resolve();
			}
		}, updateFrequency);
	});
}

async function update () {
	if (!await getDevice()) {
		console.warn('\x1b[31mSwitch is no longer connected.\x1b[0m');
		await createPort();
	}
	// Query the speaker device.
	exec(`reg query ${registryPath}${speakerDeviceRegistryKey} /f Level:0`, (error1, stdout1) => {
		if (error1) return;
		// Query the headset device.
		exec(`reg query ${registryPath}${headsetDeviceRegistryKey} /f Level:0`, async (error2, stdout2) => {
			if (error2) return;
			// Get the relative "levels" (these are not audio levels, they're priority levels or something).
			const speakerLevel = parseInt(stdout1.split('0x')[1].padStart(6, '0'), 16);
			const headsetLevel = parseInt(stdout2.split('0x')[1].padStart(6, '0'), 16);
			const newState = speakerLevel > headsetLevel;
			// Send the new state to the Arduino.
			if (newState !== previousState) {
				console.info('Default audio device changed to', newState ? 'Speakers.' : 'Headset.');
				port.write(String(Number(newState)));
				previousState = newState;
			}
		});
	});
	setTimeout(update, updateFrequency);
}


await createPort();
await update();
