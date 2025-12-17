<script setup lang="ts">
defineProps<{
	on: boolean;
}>();
</script>

<template>
	<div class="led" :class="{ on }">
		<div class="bulb"></div>
	</div>
</template>

<style scoped>
& .led {
	--ring-offset: 4px;

	display: grid;
	place-items: center;
	width: 20px;
	height: 20px;

	&::before {
		content: '';
		position: absolute;
		inset: calc(var(--ring-offset) * -1);
		display: block;
		width: calc(100% + var(--ring-offset) * 2);
		height: calc(100% + var(--ring-offset) * 2);
		border: 2px solid white;
		border-radius: 50%;
		opacity: 0.35;
		mix-blend-mode: soft-light;
	}

	&::after {
		content: '';
		position: absolute;
		left: calc(100% + var(--ring-offset));
		display: block;
		width: 10px;
		height: 2px;
		background: #fff;
		opacity: 0.35;
		mix-blend-mode: soft-light;
	}

	& .bulb {
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at center, #fff, #ff8571 30%, #3a3a3a 50%);
		border-radius: 50%;
		filter: grayscale(0.8) brightness(0.55);
	}

	&.on .bulb {
		background: radial-gradient(circle at center, #fff, #ff8571 30%, #282222 50%);
		filter: grayscale(0) brightness(1);
	}
}
</style>
