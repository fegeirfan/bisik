<script lang="ts">
	import type { DevMode } from '$lib/types/admin';

	let { mode, onChange } = $props<{ mode: DevMode; onChange: (mode: DevMode) => void }>();
</script>

<div class="dev-switcher">
	<div class="dev-switcher-label">Dev Mode</div>
	<div class="dev-switcher-actions">
		<button type="button" class:active={mode === 'user'} onclick={() => onChange('user')}>User</button>
		<button type="button" class:active={mode === 'admin'} onclick={() => onChange('admin')}>Admin</button>
	</div>
</div>
