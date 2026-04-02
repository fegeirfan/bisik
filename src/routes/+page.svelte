<script lang="ts">
	import AdminShell from '$lib/components/admin/AdminShell.svelte';
	import ModeSwitcher from '$lib/components/dev/ModeSwitcher.svelte';
	import UserApp from '$lib/components/user/UserApp.svelte';
	import type { DevMode } from '$lib/types/admin';

	let mode = $state<DevMode>('user');
</script>

<ModeSwitcher {mode} onChange={(nextMode) => (mode = nextMode)} />

{#if mode === 'admin'}
	<AdminShell />
{:else}
	<UserApp />
{/if}
