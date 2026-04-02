<script lang="ts">
	import Icons from '$lib/components/icons/Icons.svelte';
	import type { AppView } from '$lib/types/diary';

	const items: { id: AppView; label: string; icon: 'home' | 'edit' | 'chat' | 'menu' }[] = [
		{ id: 'home', label: 'Beranda', icon: 'home' },
		{ id: 'write', label: 'Tulis', icon: 'edit' },
		{ id: 'chat', label: 'Chat', icon: 'chat' },
		{ id: 'timeline', label: 'Jejak', icon: 'menu' }
	];

	let { activeView, hidden = false, onNavigate } = $props<{
		activeView: AppView;
		hidden?: boolean;
		onNavigate: (view: AppView) => void;
	}>();
</script>

{#if !hidden}
	<nav class="bottom-nav" aria-label="Navigasi utama">
		{#each items as item}
			<button
				type="button"
				class:active={item.id === activeView}
				class="bnav-item"
				onclick={() => onNavigate(item.id)}
			>
				<Icons name={item.icon} size={20} />
				<span class="bnav-label">{item.label}</span>
			</button>
		{/each}
	</nav>
{/if}
