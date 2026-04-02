<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;700&display=swap"
		rel="stylesheet"
	/>
	<title>Bisik — Ruang Ceritamu</title>
	<meta
		name="description"
		content="Jurnal reflektif berbasis Svelte dengan alur menulis, insight, dan timeline yang siap dikembangkan."
	/>
</svelte:head>

{@render children()}
