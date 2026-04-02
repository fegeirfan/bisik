<script lang="ts" module>
	export type AdminIconName = 'grid' | 'users' | 'book' | 'persona' | 'spark' | 'settings' | 'search' | 'check' | 'chevron';
</script>

<script lang="ts">
	let { name, size = 16 } = $props<{ name: AdminIconName; size?: number }>();
</script>

{#if name === 'grid'}
	<svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>
{:else if name === 'users'}
	<svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="6" cy="4.5" r="2.5"/><path d="M1 13c0-2.8 2.2-5 5-5s5 2.2 5 5"/><circle cx="12" cy="5" r="2"/><path d="M12 9a4 4 0 0 1 3 4"/></svg>
{:else if name === 'book'}
	<svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M5 5h6M5 8h4M5 11h3"/></svg>
{:else if name === 'persona'}
	<svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-2 2-4 6-4s6 2 6 4"/><path d="M11 3l1 1-4 4-2-2 1-1 1 1z" fill="currentColor" stroke="none"/></svg>
{:else if name === 'spark'}
	<svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 1l1.5 3 3.5.5-2.5 2.5.6 3.5L8 9l-3.1 1.5.6-3.5L3 4.5 6.5 4z"/><circle cx="8" cy="8" r="2.5"/></svg>
{:else if name === 'settings'}
	<svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/></svg>
{:else if name === 'search'}
	<svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="6" cy="6" r="4"/><path d="M10 10l2.5 2.5"/></svg>
{:else if name === 'check'}
	<svg width={size} height={size} viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="6.5" cy="6.5" r="5.5"/><path d="M4 6.5l2 2 3-3"/></svg>
{:else}
	<svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 5l5 4 5-4"/></svg>
{/if}
