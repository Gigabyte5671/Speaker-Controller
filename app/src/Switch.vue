<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
	connected: boolean;
	name: string;
	modelValue: boolean;
}>();

const emit = defineEmits<{
	'update:modelValue': [ boolean ];
}>();

const enabled = ref(false);

watch(enabled, value => emit('update:modelValue', value));
watch(() => props.modelValue, value => (enabled.value = value));
</script>

<template>
	<label :for="name" class="switch" :class="{ connected, enabled }">
		<input type="checkbox" :id="name" :name="name" v-model="enabled">
		<span class="light"></span>
		<span class="bulb"></span>
		<span class="rocker">
			<span class="texture"></span>
			<span class="off"></span>
			<span class="on"></span>
		</span>
		<span class="ring"></span>
		<span class="text">⚡Power</span>
	</label>
</template>

<style scoped>
.switch {
	display: grid;
	place-items: center;
	width: 150px;
	height: 150px;
	background:
		url('./assets/noise.png'),
		radial-gradient(circle at 50% 75%, transparent, #fff1),
		radial-gradient(circle at center, #000 53.5%, #222 calc(53.5% + 1px), #222 61%, #030303 calc(61% + 1px));
	background-size:
		cover,
		auto,
		auto;
	background-blend-mode: difference;
	border-radius: 50%;
	box-shadow:
		0 4px 8px -4px #000,
		0 3px 12px -3px #0006;

	& > * {
		position: absolute;
	}

	& input {
		display: none;
	}

	& .light {
		width: calc(100% - 40px);
		height: calc(100% - 40px);
		background:
			url('./assets/noise.png'),
			radial-gradient(circle at center, #fdd, #fba 10%, #f97 50%, transparent),
			radial-gradient(circle at 50% 10%, transparent 50%, #f55 calc(50% + 1px));
		border-radius: 50%;
		filter: brightness(0.2) grayscale(0.4);
	}

	& .bulb {
		width: 22px;
		height: 22px;
		background: radial-gradient(circle at center, #fdd, #fba 10%, #f97 50%, transparent);
		border-radius: 50%;
		filter: blur(3px) brightness(0.4) grayscale(0.6);
	}

	& .rocker {
		display: flex;
		flex-flow: column nowrap;
		justify-content: center;
		align-items: center;
		grid-template-rows: 1fr 1fr;
		gap: 30px;
		width: calc(100% - 50px);
		height: calc(100% - 55px);
		background:
			url('./assets/noise.png'),
			radial-gradient(circle at 50% 100%, #0002 30%, #ddd2),
			radial-gradient(circle at 50% 130%, #0003 60%, #ddd3);
		border-radius: 50%;
		box-shadow:
			0 0 4px 0 #fff4,
			0 0 2px 0 #fff6 inset;
		scale: 1 0.95;
		translate: 0 -6.5px;

		& .texture {
			position: absolute;
			width: 87%;
			height: 87%;
			background: radial-gradient(2px 2px at 2px 2px, #fff2, transparent);
			background-position: -1px -1px;
			background-size: 4px 4px;
			border-radius: inherit;
			clip-path: polygon(
				0 0,
				100% 0,
				100% calc(50% - 6px),
				calc(100% - 6px) calc(50% - 6px),
				calc(100% - 6px) calc(50% + 6px),
				100% calc(50% + 6px),
				100% 100%,
				0 100%,
				0 calc(50% + 6px),
				6px calc(50% + 6px),
				6px calc(50% - 6px),
				0 calc(50% - 6px)
			);
			mix-blend-mode: overlay;
		}

		& .on {
			width: 4px;
			height: 22px;
			background-color: #fffe;
			border-radius: 2px;
			mix-blend-mode: overlay;
		}

		& .off {
			width: 20px;
			height: 20px;
			border: 4px solid #fffe;
			border-radius: 50%;
			mix-blend-mode: overlay;
		}
	}

	& .ring {
		inset: -21px;
		border: 3px solid #fff;
		border-radius: 50%;
		opacity: 0.3;
		mix-blend-mode: soft-light;
		mask-image: linear-gradient(25deg, #000 70%, transparent 120%);
		pointer-events: none;
		clip-path: polygon(
			0 0,
			100% 0,
			100% 100%,
			80% 100%,
			50% 50%,
			20% 100%,
			0 100%
		);
	}

	& .text {
		bottom: -2em;
		margin-left: -11px;
		color: inherit;
		font-family: inherit;
		font-size: 14px;
		font-style: italic;
		letter-spacing: 1px;
		text-shadow: 0 1px 1px currentColor;
		text-transform: uppercase;
		white-space: nowrap;
		filter: brightness(3) grayscale(1);
		mix-blend-mode: soft-light;
		pointer-events: none;
	}

	&.enabled {
		& .light {
			background:
				url('./assets/noise.png'),
				radial-gradient(circle at 50% 55%, transparent 69%, #fff1 10%),
				radial-gradient(25% 7% at 50% 6%, #fdc5 40%, transparent),
				radial-gradient(circle at center, #fdd, #fba 10%, #f97 50%, transparent),
				radial-gradient(circle at 50% 90%, transparent 50%, #f556 calc(50% + 1px));
		}

		& .rocker {
			background:
				url('./assets/noise.png'),
				radial-gradient(circle at 50% 0%, #0002 30%, #ddd1),
				radial-gradient(circle at 50% -30%, #0003 60%, #ddd1);
			translate: 0 6.5px;
		}
	}

	&.connected.enabled {
		background:
			url('./assets/noise.png'),
			radial-gradient(circle at center, transparent 51%, #fba4 calc(51% + 1px), transparent 62%),
			radial-gradient(circle at 50% 75%, transparent, #fff1),
			radial-gradient(circle at center, #000 53.5%, #222 calc(53.5% + 1px), #222 61%, #030303 calc(61% + 1px));
		background-size:
			cover,
			auto,
			auto,
			auto;
		box-shadow:
			0 4px 8px -4px #000,
			0 3px 12px -3px #000b;

		& .light {
			background:
				url('./assets/noise.png'),
				radial-gradient(circle at 50% 55%, transparent 69%, #fff1 10%),
				radial-gradient(25% 7% at 50% 6%, #fdc1 40%, transparent),
				radial-gradient(circle at center, #fdd, #fba 10%, #f97 50%, transparent),
				radial-gradient(circle at 50% 50%, transparent 50%, #d007 calc(50% + 1px));
			filter: brightness(0.8) grayscale(0);
		}

		& .bulb {
			filter: blur(3px) brightness(1.2) grayscale(0);
		}

		& .rocker {
			background:
				radial-gradient(circle at 50% 0%, #0002 65%, #ddd2);
		}
	}
}
</style>
