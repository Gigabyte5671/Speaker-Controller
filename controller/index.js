import { exec } from 'node:child_process';
import { SerialPort } from 'serialport';
import { config } from './config.js';

const audioDevices = { active: [], inactive: [] };
const registryPath = 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\MMDevices\\Audio\\Render\\';
const updateFrequency = 250;
const baudRate = 9600;
let previousState;
let port;


async function getAudioDeviceKeys () {
	console.info('Loading audio devices...');
	const allDeviceKeys = await new Promise(resolve => {
		exec(`reg query ${registryPath}`, (error, stdout) => {
			const output = [];
			if (error || !stdout) return resolve(output);
			for (const device of stdout.split('\n')) {
				output.push(/{[a-z0-9-]+}/i.exec(device)?.[0]);
			}
			resolve(output.filter(Boolean));
		});
	});
	for (const deviceKey of allDeviceKeys) {
		const deviceType = await new Promise(resolve => {
			exec(`reg query "${registryPath}${deviceKey}\\Properties" /f "{a45c254e-df1c-4efd-8020-67d146a850e0}"`, (error, stdout) => {
				if (error || !stdout) return resolve('');
				for (const deviceName of config.activeDevices) {
					if (stdout.includes(deviceName)) {
						return resolve('active');
					}
				}
				for (const deviceName of config.inactiveDevices) {
					if (stdout.includes(deviceName)) {
						return resolve('inactive');
					}
				}
				resolve('');
			});
		});
		if (deviceType === 'active') {
			audioDevices.active.push(deviceKey);
		} else if (deviceType === 'inactive') {
			audioDevices.inactive.push(deviceKey);
		}
	}
	if (audioDevices.active.length <= 0 || audioDevices.inactive.length <= 0) {
		console.warn('\x1b[31mMissing specified audio devices.\x1b[0m');
	} else {
		console.info('\x1b[32mDevices loaded.\x1b[0m');
	}
}

function getSwitchDevice () {
	return new Promise(resolve => {
		exec('serialport-list -f json', (error, stdout) => {
			if (error || !stdout) return resolve(undefined);
			const ports = JSON.parse(stdout);
			resolve(ports.find(({ friendlyName }) => friendlyName?.includes('Arduino Leonardo')));
		});
	});
}

async function connect () {
	await new Promise(resolve => {
		console.info('Searching for switch...');
		const interval = setInterval(async () => {
			const arduino = await getSwitchDevice();
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
	if (!await getSwitchDevice()) {
		console.warn('\x1b[31mSwitch is no longer connected.\x1b[0m');
		await connect();
	}
	// Query the active devices.
	let activeLevel = 0;
	for (const device of audioDevices.active) {
		const level = await new Promise(resolve => {
			exec(`reg query "${registryPath}${device}" /f Level:0`, (error, stdout) => {
				if (error || !stdout) return resolve(0);
				resolve(parseInt(stdout.split('0x')[1].padStart(6, '0'), 16));
			});
		});
		activeLevel = Math.max(activeLevel, level);
	}
	// Query the inactive devices.
	let inactiveLevel = 0;
	for (const device of audioDevices.inactive) {
		const level = await new Promise(resolve => {
			exec(`reg query "${registryPath}${device}" /f Level:0`, (error, stdout) => {
				if (error || !stdout) return resolve(0);
				resolve(parseInt(stdout.split('0x')[1].padStart(6, '0'), 16));
			});
		});
		inactiveLevel = Math.max(inactiveLevel, level);
	}
	const newState = activeLevel > inactiveLevel;
	// Send the new state to the Arduino.
	if (newState !== previousState) {
		console.info('Default audio device changed to', newState ? 'Speakers.' : 'Headset.');
		port.write(String(Number(newState)));
		previousState = newState;
	}
	setTimeout(update, updateFrequency);
}


await getAudioDeviceKeys();
await connect();
await update();
