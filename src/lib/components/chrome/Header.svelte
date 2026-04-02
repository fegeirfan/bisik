<script lang="ts">
	import type { AppView, PersonaOption } from '$lib/types/diary';
	import Icons from '$lib/components/icons/Icons.svelte';

	let {
		activeView,
		persona,
		personas,
		isPersonaOpen,
		onTogglePersona,
		onSelectPersona,
		onOpenTimeline,
		authLabel,
		authActionText = 'Keluar',
		showTimeline = true,
		onSignOut
	} = $props<{
		activeView: AppView;
		persona: PersonaOption;
		personas: PersonaOption[];
		isPersonaOpen: boolean;
		onTogglePersona: () => void;
		onSelectPersona: (persona: PersonaOption) => void;
		onOpenTimeline?: () => void;
		authLabel?: string;
		authActionText?: string;
		showTimeline?: boolean;
		onSignOut?: () => void;
	}>();
</script>

<header class="header">
	<div class="logo">bisik<span>.</span></div>

	<div class="header-actions">
		<div class="persona-shell">
			<button class="persona-pill" type="button" onclick={onTogglePersona} aria-expanded={isPersonaOpen}>
				<span>{persona.icon}</span>
				<span>{persona.name}</span>
				<Icons name="chevron" size={10} />
			</button>

			{#if isPersonaOpen}
				<div class="persona-dropdown">
					{#each personas as option}
						<button
							type="button"
							class:selected={option.id === persona.id}
							class="persona-item"
							onclick={() => onSelectPersona(option)}
						>
							<span>{option.icon}</span>
							<span>{option.name}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		{#if showTimeline && onOpenTimeline}
			<button
				type="button"
				class:active={activeView === 'timeline'}
				class="nav-btn"
				title="Timeline"
				onclick={onOpenTimeline}
			>
				<Icons name="history" size={18} />
			</button>
		{/if}

		{#if onSignOut}
			<button class="session-chip" type="button" onclick={onSignOut}>
				<span class="session-chip-label">{authLabel ?? 'Akun'}</span>
				<span>{authActionText}</span>
			</button>
		{/if}
	</div>
</header>
