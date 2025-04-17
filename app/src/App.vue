<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window';
import { load, Store } from '@tauri-apps/plugin-store';
import { onBeforeMount, ref, watch } from 'vue';
import { type Device, Serial } from './serial';
import Led from './Led.vue';
import Switch from './Switch.vue';
import Toggle from './Toggle.vue';

const autoEnable = ref(false);
const availableDevices = ref(new Array<Device>());
const connected = ref(false);
const defaultName = 'Speakers';
const device = ref<string>('None');
const enabled = ref(false);
const error = ref(false);
const name = ref(defaultName);
const showSettings = ref(false);
let store: Store | undefined;

async function loadSettings (): Promise<void> {
	const store = await load('settings.json', { autoSave: false });
	name.value = (await store.get<string>('device-name')) || defaultName;
	device.value = (await store.get<string>('device-port')) || 'None';
	autoEnable.value = (await store.get<boolean>('auto-enable')) ?? false;
	await updateWindowTitle();
}

async function saveSettings (): Promise<void> {
	await store?.set('device-name', name.value);
	await store?.set('device-port', device.value);
	await store?.set('auto-enable', autoEnable.value);
	await updateWindowTitle();
}

async function loadDevices (): Promise<void> {
	error.value = false;
	availableDevices.value = await Serial.getCompatibleDevices();
	if (device.value.startsWith('COM')) {
		await Serial.connect(device.value);
	}
}

function handleConnect (): void {
	error.value = false;
	connected.value = true;
	if (enabled.value || autoEnable.value) {
		enabled.value = true;
		globalThis.setTimeout(Serial.enable, 100);
	}
}

function handleDisconnect (): void {
	enabled.value = false;
	connected.value = false;
}

function handleError (): void {
	error.value = true;
	enabled.value = false;
	connected.value = false;
}

function togglePower (on: boolean): void {
	enabled.value = on;
	if (on) {
		void Serial.enable();
	} else {
		void Serial.disable();
	}
}

async function updateWindowTitle (): Promise<void> {
	const state = connected.value
		? enabled.value ? 'On' : 'Off'
		: 'Disconnected';
	await getCurrentWindow().setTitle(`${name.value} | ${state}`);
}

watch(connected, updateWindowTitle, { immediate: true });
watch(enabled, updateWindowTitle, { immediate: true });

watch(device, (current, previous) => {
	if (previous.startsWith('COM')) {
		void Serial.disconnect();
	}
	if (current.startsWith('COM')) {
		void Serial.connect(current);
	}
});

onBeforeMount(async () => {
	await loadSettings();
	await loadDevices();
	Serial.onConnect(handleConnect);
	Serial.onDisconnect(handleDisconnect);
	Serial.onError(handleError);
});
</script>

<template>
	<main :class="{ showSettings }">
		<div class="background">
			<div class="layer-1"></div>
			<div class="layer-2"></div>
		</div>

		<Switch
			:connected
			name="switch"
			:model-value="enabled"
			@update:model-value="togglePower"
		/>

		<div
			class="error-indicator"
			:class="{ error }"
			:title="error ? 'An error has occurred. Please check the USB connection.' : ''"
		>
			<img src="./assets/warning_24dp_FFFFFF_FILL1_wght400_GRAD0_opsz24.svg" alt="">
		</div>

		<div class="status">
			<Led :on="connected" />
			<span class="text">Connected</span>
		</div>

		<button
			class="settings-toggle"
			:class="{ on: showSettings }"
			@click="showSettings = !showSettings"
		>
			<img src="./assets/settings_24dp_FFFFFF_FILL1_wght400_GRAD0_opsz24.svg" alt="">
		</button>

		<section class="settings-panel">
			<label for="device-name">
				<span class="text">Name:</span>
				<input
					type="text"
					name="device-name"
					id="device-name"
					autocomplete="off"
					@input="saveSettings()"
					v-model="name"
				>
			</label>
			<label for="device">
				<span class="text">Device:</span>
				<button
					class="refresh-button on"
					title="Refresh the list of available devices."
					@click="loadDevices()"
				>
					<img src="./assets/cached_24dp_FFFFFF_FILL1_wght400_GRAD0_opsz24.svg" alt="">
				</button>
				<select name="device" id="device" v-model="device">
					<option value="None">None</option>
					<option
						v-for="device of availableDevices"
						:key="device.port"
						:value="device.port"
					>{{ device.port }}</option>
				</select>
			</label>
			<label for="auto-enable" title="Turn on the device as soon as it's connected.">
				<span class="text">Auto-On:</span>
				<Led :on="autoEnable" />
				<Toggle
					name="auto-enable"
					title="Turn on the device as soon as it's connected."
					@input="saveSettings()"
					v-model="autoEnable"
				/>
			</label>
		</section>

		<a
			href="https://github.com/Gigabyte5671/Speaker-Controller"
			target="_blank"
			rel="noreferrer"
			title="View the source code for this app."
			class="text source-link"
		>
			<img src="./assets/code_24dp_FFFFFF_FILL1_wght400_GRAD0_opsz24.svg" alt="">
			Source
		</a>

		<div class="lighting">
			<div class="layer-1"></div>
			<div class="layer-2" :class="{ connected, enabled }"></div>
		</div>
	</main>
</template>

<style scoped>
main {
	--settings-translation: calc(-100vw + 62px) 0;
	--settings-toggle-column-width: 0;

	display: grid;
	grid-template-columns: calc(100vw - 62px) 62px calc(100vw - 62px);
	grid-template-rows: 38px 1fr 48px;
	grid-template-areas:
		'.      error  settings'
		'switch switch settings'
		'status toggle source';
	place-items: center;
	width: 200vw;
	height: 100vh;
	transition: 0.2s ease translate;
	user-select: none;

	&.showSettings {
		translate: var(--settings-translation);
	}
}

.background {
	position: absolute;
	inset: 0;
	overflow: hidden;

	& > * {
		position: absolute;
		inset: 0;
	}

	& .layer-1 {
		background: url('./assets/Poliigon_MetalPaintedMatte_7037/Poliigon_MetalPaintedMatte_7037_Normal.png');
		background-position: center;
		background-size: 350%;
		filter: grayscale(1) brightness(0.29) contrast(1.3);
	}

	& .layer-2 {
		background: url('./assets/Poliigon_MetalPaintedMatte_7037/Poliigon_MetalPaintedMatte_7037_BaseColor.png');
		background-position: center;
		background-size: 350%;
		mix-blend-mode: color-dodge;
	}
}

.lighting {
	position: absolute;
	inset: 0;
	overflow: hidden;
	pointer-events: none;

	& > * {
		position: absolute;
		inset: 0;
	}

	& .layer-1 {
		background: linear-gradient(180deg, #eeeb, #444b);
		mix-blend-mode: soft-light;
		opacity: 0.5;
	}

	& .layer-2.connected.enabled {
		background: radial-gradient(circle at 50vw 115px, #f97 20%, #f974 50%, transparent 90%);
		mix-blend-mode: soft-light;
		opacity: 0.15;
	}
}

.text {
	color: #ddd;
	font-family: inherit;
	font-size: 13px;
	font-style: italic;
	letter-spacing: 1px;
	text-shadow:
		0 -1px 0 #fff,
		0 2px 1px #000;
	white-space: nowrap;
	opacity: 0.3;
}

.switch {
	grid-area: switch;
	align-self: flex-start;
	margin-top: 12px;
}

.status {
	grid-area: status;
	justify-self: flex-start;
	display: flex;
	align-items: center;
	gap: 5px;
	margin: 0 0 16px 20px;

	& .text {
		text-transform: uppercase;
	}
}

.error-indicator {
	grid-area: error;
	width: 34px;
	height: 34px;
	padding: 5px;
	filter: drop-shadow(0 1px 3px #0008);

	& img {
		filter: brightness(0.1);
	}

	&.error img {
		opacity: 0.9;
		filter: drop-shadow(0 1000px 0 #ffc34a) drop-shadow(0 0 3px #ddf7);
		transform: translateY(-1000px);
	}
}

.settings-panel {
	grid-area: settings;
	display: flex;
	flex-flow: column nowrap;
	gap: 30px;
	width: 100%;
	height: 100%;
	margin-top: 40px;
	padding: 24px 24px 0 4px;

	& label {
		display: flex;
		flex-flow: row nowrap;
		justify-content: space-between;
		align-items: center;
		gap: 10px;

		& .text {
			min-width: 9ch;
		}
	}

	& input[type="text"], select {
		width: 12ch;
		height: 34px;
		padding: 5px;
		color: #ddd;
		background: linear-gradient(180deg, #0a0a0a, #060606);
		border: 2px solid #555;
		border-radius: 6px;
		outline: unset;
		box-shadow:
			0 3px 0 0 #080808,
			0 4px 8px -4px #000;
	}
}

.source-link {
	grid-area: source;
	display: flex;
	flex-flow: row nowrap;
	justify-self: flex-end;
	gap: 5px;
	margin: 0 24px 16px 0;
	color: #fff;
	text-underline-offset: 3px;
	opacity: 1;
	mix-blend-mode: soft-light;
}

button {
	display: grid;
	place-items: center;
	flex-shrink: 0;
	align-self: flex-start;
	width: 34px;
	height: 34px;
	padding: 5px;
	text-align: center;
	background: linear-gradient(180deg, #262626, #202020);
	border: unset;
	border-radius: 6px;
	box-shadow:
		0 3px 0 0 #080808,
		0 4px 8px -4px #000;
	outline: unset;
	overflow: hidden;

	&:is(:hover, :focus-visible) img {
		opacity: 0.4;
	}

	&:active {
		box-shadow:
			0 1px 0 0 #080808,
			0 4px 8px -4px #000;
		translate: 0 2px;
	}

	& img {
		opacity: 0.3;
	}

	&.on img {
		opacity: 1;
		filter: drop-shadow(0 1000px 0 #4acfff) drop-shadow(0 0 3px #ddf7);
			transform: translateY(-1000px);
	}

	&.settings-toggle {
		grid-area: toggle;
	}

	&.refresh-button {
		margin-left: -18px;
	}
}
</style>
