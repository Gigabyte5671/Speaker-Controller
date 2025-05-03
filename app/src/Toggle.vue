<script setup lang="ts">
defineProps<{
	name: string;
}>();

const model = defineModel({ default: false });
</script>

<template>
	<div class="toggle" :class="{ enabled: model }">
		<input type="checkbox" :id="name" :name="name" v-model="model">
		<span class="ring"></span>
		<span class="nut"></span>
		<span class="body"></span>
		<span class="ball"></span>
		<span class="lever"></span>
	</div>
</template>

<style scoped>
.toggle {
	--ball-size: 17px;
	display: grid;
	place-items: center;
	width: 45px;
	height: 45px;
	margin: auto;
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
	pointer-events: all;

	& > * {
		position: absolute;
	}

	& input {
		display: none;
		inset: -15px;
	}

	& .nut {
		inset: 3px 0;
		background: radial-gradient(circle at center, transparent 40%, #8b8b8b 50%, #999 62%, #666 calc(62% + 1px));
		border-radius: 15px;
		rotate: 7deg;
		clip-path: polygon(
			25% 0,
			75% 0,
			100% 50%,
			75% 100%,
			25% 100%,
			0 50%
		);
	}

	& .body {
		inset: 10px;
		background: radial-gradient(circle at center, #000 45%, #555 55%, #999 65%, #666 calc(65% + 1px));
		border-radius: 50%;
	}

	& .ball {
		width: var(--ball-size);
		height: var(--ball-size);
		background: radial-gradient(circle at center, #ccc, #5c5c5c calc(var(--ball-size) / 2), transparent calc(var(--ball-size) / 2 + 1px));
		border-radius: 50%;
	}

	& .lever {
		width: var(--ball-size);
		height: 38px;
		filter: drop-shadow(0 -6px 4px #000);

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			background: linear-gradient(180deg, #4c4c4c, #999 7px, #555 calc(100% - var(--ball-size) / 2), #a4a4a4);
			border-radius: 3px 3px var(--ball-size) var(--ball-size);
			translate: 0 -19px;
			clip-path: polygon(
				0 0,
				100% 0,
				80% 100%,
				70% 100%,
				60% 90%,
				40% 90%,
				30% 100%,
				20% 100%
			);
		}
	}

	& .ring {
		inset: -10px;
		border: 3px solid #fff;
		border-radius: 50%;
		opacity: 0.3;
		mix-blend-mode: soft-light;
	}

	&.enabled .lever {
		filter: drop-shadow(0 6px 4px #000);

		&::after {
			background: linear-gradient(0deg, #4c4c4c, #999 7px, #555 calc(100% - var(--ball-size) / 2), #a4a4a4);
			border-radius: var(--ball-size) var(--ball-size) 3px 3px;
			translate: 0 20px;
			clip-path: polygon(
				20% 0,
				30% 0,
				40% 10%,
				60% 10%,
				70% 0,
				80% 0,
				100% 100%,
				0 100%
			);
		}
	}
}
</style>
