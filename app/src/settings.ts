import { load, type Store } from '@tauri-apps/plugin-store';

enum Setting {
	AutoEnable = 'auto-enable',
	DeviceName = 'device-name',
	DevicePort = 'device-port'
}

interface SettingsData {
	autoEnable: boolean;
	device: string;
	name: string;
}

export class Settings {
	private static store: Store | undefined;
	public static readonly defaults = {
		[Setting.DeviceName]: 'Speakers',
		[Setting.DevicePort]: 'None',
		[Setting.AutoEnable]: false
	};

	public static async load (): Promise<SettingsData> {
		this.store = await load('settings.json', { autoSave: false, defaults: this.defaults });
		const autoEnable = await this.store.get<boolean>(Setting.AutoEnable);
		const device = await this.store.get<string>(Setting.DevicePort);
		const name = await this.store.get<string>(Setting.DeviceName);
		return {
			autoEnable: autoEnable ?? this.defaults[Setting.AutoEnable],
			device: device || this.defaults[Setting.DevicePort],
			name: name || this.defaults[Setting.DeviceName]
		};
	}

	public static async save (settings: SettingsData): Promise<void> {
		await this.store?.set(Setting.AutoEnable, settings.autoEnable);
		await this.store?.set(Setting.DevicePort, settings.device);
		await this.store?.set(Setting.DeviceName, settings.name);
	}
}
