import { type PortInfo, SerialPort } from "tauri-plugin-serialplugin";

export type Device = PortInfo & { port: string };

export class Serial {
	private static buffer?: string;
	private static heartbeatInterval = -1;
	private static connectCallback: (() => void) | undefined;
	private static disconnectCallback: (() => void) | undefined;
	private static errorCallback: (() => void) | undefined;
	private static serialPort?: SerialPort;

	private static async listAllDevices (): Promise<Array<Device>> {
		try {
			const portInfo = new Array<Device>();
			const ports = await SerialPort.available_ports();
			for (const [port, value] of Object.entries(ports)) {
				portInfo.push({ ...value, port });
			}
			return portInfo;
		} catch (error) {
			console.error(error);
			Serial.errorCallback?.();
			return [];
		}
	}

	public static async getCompatibleDevices (): Promise<Array<Device>> {
		try {
			const allPorts = await Serial.listAllDevices();
			return allPorts.filter(port => {
				return port.type === 'USB'
					&& port.manufacturer.includes('Arduino')
					&& port.product.includes('Arduino Leonardo')
					&& /^(?:com|\/dev\/cu.)/i.test(port.path);
			});
		} catch (error) {
			console.error(error);
			Serial.errorCallback?.();
			return [];
		}
	}

	public static async connect (port: string): Promise<void> {
		try {
			Serial.serialPort = new SerialPort({
				path: port,
				baudRate: 9600
			});
			await Serial.serialPort.open();
			Serial.startHeartbeat();
			Serial.connectCallback?.();
		} catch (error) {
			console.error(error);
			Serial.errorCallback?.();
		}
	}

	public static async disconnect (): Promise<void> {
		globalThis.clearInterval(Serial.heartbeatInterval);
		await Serial.serialPort?.write('0');
		await Serial.serialPort?.close();
		Serial.disconnectCallback?.();
	}

	private static startHeartbeat (): void {
		globalThis.clearInterval(Serial.heartbeatInterval);
		Serial.sendHeartbeat();
		Serial.heartbeatInterval = globalThis.setInterval(Serial.sendHeartbeat, 250);
	}

	private static async sendHeartbeat (): Promise<void> {
		try {
			await Serial.serialPort?.write(Serial.buffer || '2');
			Serial.buffer = undefined;
		} catch (error) {
			console.error(error);
			Serial.buffer = undefined;
			void Serial.disconnect();
			Serial.errorCallback?.();
		}
	}

	public static disable (): void {
		try {
			Serial.buffer = '0';
		} catch (error) {
			console.error(error);
			void Serial.disconnect();
			Serial.errorCallback?.();
		}
	}

	public static enable (): void {
		try {
			Serial.buffer = '1';
		} catch (error) {
			console.error(error);
			void Serial.disconnect();
			Serial.errorCallback?.();
		}
	}

	public static onConnect (callback: () => void): void {
		Serial.connectCallback = callback;
	}

	public static onDisconnect (callback: () => void): void {
		Serial.disconnectCallback = callback;
	}

	public static onError (callback: () => void): void {
		Serial.errorCallback = callback;
	}
}
