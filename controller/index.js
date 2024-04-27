import { exec } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { SerialPort } from 'serialport';
import SysTray from 'systray';
import { config } from './config.js';
import { activeIcon, inactiveIcon } from './icons.js';

const audioDevices = { active: [], inactive: [] };
const registryPath = 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\MMDevices\\Audio\\Render\\';
const updateFrequency = 250;
const baudRate = 9600;
let previousState;
let port;
const logs = [];
const menu = {
	icon: inactiveIcon,
	title: 'Speaker Controller',
	tooltip: 'Speaker Controller',
	items: [
		{ title: 'Enable Speaker', enabled: true },
		{ title: 'Disable Speaker', enabled: true },
		{ title: 'Exit', enabled: true }
	]
};
const systray = new SysTray.default({ menu });

systray.onClick(action => {
	switch (action.seq_id) {
		case 0:	{
			setSwitchState(true, true);
			break;
		}
		case 1:	{
			setSwitchState(false, true);
			break;
		}
		case 2:	{
			systray.kill();
			break;
		}
	}
});

function log (message) {
	const date = new Date();
	const year = date.getFullYear();
	const month = date.getMonth().toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');
	const hour = date.getHours().toString().padStart(2, '0');
	const minute = date.getMinutes().toString().padStart(2, '0');
	const second = date.getSeconds().toString().padStart(2, '0');
	const logTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
	logs.push(`[${logTime}] ${message}`);
	void writeFile('./log.txt', logs.join('\n'), { encoding: 'utf-8' });
}

async function getAudioDeviceKeys () {
	log('  Loading audio devices...');
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
		log('! Missing specified audio devices.');
	} else {
		log('+ Devices loaded.');
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
		log('  Searching for switch...');
		const interval = setInterval(async () => {
			const arduino = await getSwitchDevice();
			if (arduino && arduino.path) {
				clearInterval(interval);
				port = new SerialPort({ path: arduino.path, baudRate });
				log('+ Switch connected.');
				resolve();
			}
		}, updateFrequency);
	});
}

function sendHeartbeat () {
	port.write('2');
}

function setSwitchState (state, manual) {
	if (!manual) previousState = state;
	port.write(String(Number(state)));
	systray.sendAction({
		type: 'update-menu',
		menu: {
			...menu,
			icon: state ? activeIcon : inactiveIcon,
			tooltip: `Speakers are ${state ? 'on' : 'off'}`
		}
	});
	log(`  Switch ${state ? 'opened' : 'closed'}.`);
}

async function update () {
	if (!await getSwitchDevice()) {
		log('! Switch is no longer connected.');
		await connect();
	}
	sendHeartbeat();
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
		log(`  Default audio device changed to ${newState ? 'Speakers' : 'Headset'}.`);
		setSwitchState(newState);
	}
	setTimeout(update, updateFrequency);
}


await getAudioDeviceKeys();
await connect();
await update();
