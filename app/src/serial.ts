import { type PortInfo, SerialPort } from "tauri-plugin-serialplugin";

let heartbeatInterval = -1;
let connectCallback: ((serialPort: SerialPort) => void) | undefined;
let disconnectCallback: (() => void) | undefined;

export type Port = PortInfo & { port: string };

// List available ports
export async function listPorts (): Promise<Array<Port>> {
	const ports = await SerialPort.available_ports();
	const portInfo = new Array<Port>();
	for (const [port, value] of Object.entries(ports)) {
		portInfo.push({ ...value, port });
	}
	return portInfo;
}

export async function getCompatibleDevices (): Promise<Array<Port>> {
	const allPorts = await listPorts();
	return allPorts.filter(port => {
		return port.type === 'USB'
			&& port.manufacturer.includes('Arduino')
			&& port.product.includes('Arduino Leonardo');
	});
}

export async function getDevice (port: string): Promise<Port | undefined> {
	const devices = await getCompatibleDevices();
	return devices.find(device => device.port === port);
}

export async function connect (port: string): Promise<SerialPort> {
	const serialPort = new SerialPort({
		path: port,
		baudRate: 9600
	});
	await serialPort.open();
	globalThis.clearInterval(heartbeatInterval);
	heartbeatInterval = globalThis.setInterval(() => sendHeartbeat(serialPort), 100);
	connectCallback?.(serialPort);
	return serialPort;
}

export async function disable (serialPort: SerialPort): Promise<void> {
	try {
		await serialPort.write('0');
	} catch (error) {
		console.error(error);
		void disconnect(serialPort);
	}
}

export async function enable (serialPort: SerialPort): Promise<void> {
	try {
		await serialPort.write('1');
	} catch (error) {
		console.error(error);
		void disconnect(serialPort);
	}
}

async function sendHeartbeat (serialPort: SerialPort): Promise<void> {
	try {
		await serialPort.write('2');
	} catch (error) {
		console.error(error);
		void disconnect(serialPort);
	}
}

export function onConnect (callback: (serialPort: SerialPort) => void): void {
	connectCallback = callback;
}

export function onDisconnect (callback: () => void): void {
	disconnectCallback = callback;
}

export async function disconnect (serialPort: SerialPort): Promise<void> {
	globalThis.clearInterval(heartbeatInterval);
	await serialPort.close();
	disconnectCallback?.();
}
