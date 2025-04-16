<script setup lang="ts">
import { ref } from 'vue';
import Switch from './Switch.vue';

const connected = ref(false);
const enabled = ref(false);
const showSettings = ref(false);
</script>

<template>
	<main>
		<div class="background">
			<div class="layer-1"></div>
			<div class="layer-2"></div>
		</div>

		<Switch :connected v-model="enabled" />

		<div class="row">
			<div class="status">
				<span class="led" :class="{ connected }"></span>
				<span class="text">Connected</span>
			</div>
			<button class="settings" :class="{ showSettings }" @click="showSettings = !showSettings">
				<img src="./assets/settings_24dp_FFFFFF_FILL1_wght400_GRAD0_opsz24.svg" alt="">
			</button>
		</div>

		<div class="lighting">
			<div class="layer-1"></div>
			<div class="layer-2" :class="{ connected, enabled }"></div>
		</div>
	</main>
</template>

<style scoped>
main {
	display: flex;
	flex-flow: column nowrap;
	gap: 20px;
	width: 100vw;
	height: 100vh;
	text-align: center;
	user-select: none;
}

main > .background {
	position: absolute;
	width: 100%;
	height: 100%;
	overflow: hidden;

	& > * {
		position: absolute;
		width: 100%;
		height: 100%;
	}

	& .layer-1 {
		background: url('./assets/Poliigon_MetalPaintedMatte_7037/Poliigon_MetalPaintedMatte_7037_Normal.png');
		background-position: center;
		background-size: 700%;
		filter: grayscale(1) brightness(0.29) contrast(1.3);
	}

	& .layer-2 {
		background: url('./assets/Poliigon_MetalPaintedMatte_7037/Poliigon_MetalPaintedMatte_7037_BaseColor.png');
		background-position: center;
		background-size: 700%;
		mix-blend-mode: color-dodge;
	}
}

.lighting {
	position: absolute;
	width: 100%;
	height: 100%;
	overflow: hidden;
	pointer-events: none;

	& > * {
		position: absolute;
		width: 100%;
		height: 100%;
	}

	& .layer-1 {
		background: linear-gradient(180deg, #eeeb, #444b);
		mix-blend-mode: soft-light;
		opacity: 0.5;
	}

	& .layer-2.connected.enabled {
		background: radial-gradient(circle at 50% 115px, #f97 20%, transparent 90%);
		mix-blend-mode: soft-light;
		opacity: 0.2;
	}
}

.row {
	display: flex;
	justify-content: space-between;
	padding: 0 14px 16px 20px;
}

.status {
	display: flex;
	align-items: center;
	gap: 5px;

	& .led {
		width: 18px;
		height: 18px;
		background: radial-gradient(circle at center, #fff, #f46 30%, #000 50%);
		border-radius: 50%;
		filter: grayscale(0.85) brightness(0.7);

		&.connected {
			filter: grayscale(0) brightness(1);
		}
	}

	& .text {
		font-size: 14px;
		font-style: italic;
		letter-spacing: 1px;
		text-shadow: 0 1px 1px currentColor;
		text-transform: uppercase;
		mix-blend-mode: soft-light;
	}
}

button {
	display: grid;
	place-items: center;
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

	&.settings {
		padding: 5px;
		background-color: transparent;

		&.showSettings img {
			opacity: 1;
			filter: drop-shadow(0 1000px 0 #4acfff) drop-shadow(0 0 3px #ddf7);
  			transform: translateY(-1000px);
		}
	}

	& img {
		opacity: 0.3;
	}
}
</style>
