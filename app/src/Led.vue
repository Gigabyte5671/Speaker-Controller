<script setup lang="ts">
defineProps<{
	on: boolean;
}>();
</script>

<template>
	<span class="led" :class="{ on }"></span>
</template>

<style scoped>
& .led {
	width: 18px;
	height: 18px;
	background: radial-gradient(circle at center, #fff, #ff85a1 30%, #000 50%);
	border-radius: 50%;
	filter: grayscale(0.85) brightness(0.7);

	&.on {
		filter: grayscale(0) brightness(1);
	}
}
</style>
