<script lang="ts" module>
	export type IconName = 'chevron' | 'history' | 'edit' | 'chat' | 'home' | 'send' | 'menu';
</script>

<script lang="ts">
	let { name, size = 18 } = $props<{ name: IconName; size?: number }>();
</script>

{#if name === 'chevron'}
	<svg width={size} height={size} viewBox="0 0 10 10" fill="none" aria-hidden="true">
		<path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
	</svg>
{:else if name === 'history'}
	<svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
		<path d="M9 2.5A6.5 6.5 0 1 0 9 15.5A6.5 6.5 0 0 0 9 2.5Z" stroke="currentColor" stroke-width="1.3" />
		<path d="M9 5.5V9L11.5 11.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
	</svg>
{:else if name === 'edit'}
	<svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
		<path d="M4 16l3-1 8-8-2-2-8 8-1 3z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
		<path d="M13 5l2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
	</svg>
{:else if name === 'chat'}
	<svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
		<path d="M4 4h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H7l-4 3V5a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.3" />
	</svg>
{:else if name === 'home'}
	<svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
		<path d="M3 9.5L10 3l7 6.5V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" stroke="currentColor" stroke-width="1.3" />
		<path d="M7 18v-6h6v6" stroke="currentColor" stroke-width="1.3" />
	</svg>
{:else if name === 'send'}
	<svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
		<path d="M2 8H14M10 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
{:else}
	<svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
		<path d="M4 6h12M4 10h8M4 14h6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
	</svg>
{/if}
