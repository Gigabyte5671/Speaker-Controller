import { load, type Store } from '@tauri-apps/plugin-store';

interface SettingsData {
	autoEnable: boolean;
	device: string;
	name: string;
}

export class Settings {
	private static store: Store | undefined;
	public static readonly defaults = {
		'device-name': 'Speakers',
		'device-port': 'None',
		'auto-enable': false
	};

	public static async load (): Promise<SettingsData> {
		this.store = await load('settings.json', { autoSave: false, defaults: this.defaults });
		const autoEnable = await this.store.get<boolean>('auto-enable');
		const device = await this.store.get<string>('device-port');
		const name = await this.store.get<string>('device-name');
		return {
			autoEnable: autoEnable ?? this.defaults['auto-enable'],
			device: device || this.defaults['device-port'],
			name: name || this.defaults['device-name']
		};
	}

	public static async save (settings: SettingsData): Promise<void> {
		await this.store?.set('auto-enable', settings.autoEnable);
		await this.store?.set('device-port', settings.device);
		await this.store?.set('device-name', settings.name);
	}
}
