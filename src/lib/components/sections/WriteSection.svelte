<script lang="ts">
	import type { MoodOption, MoodValue } from '$lib/types/diary';
	import Icons from '$lib/components/icons/Icons.svelte';

	let {
		title,
		content,
		selectedMood,
		moods,
		charCount,
		showHint,
		onTitleInput,
		onContentInput,
		onMoodSelect,
		onSubmit
	} = $props<{
		title: string;
		content: string;
		selectedMood?: MoodValue;
		moods: MoodOption[];
		charCount: number;
		showHint: boolean;
		onTitleInput: (value: string) => void;
		onContentInput: (value: string) => void;
		onMoodSelect: (mood: MoodValue) => void;
		onSubmit: () => void;
	}>();

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && event.ctrlKey) {
			onSubmit();
		}
	}
</script>

<section class="page page-write active">
	<div class="write-container">
		<input
			class="write-title-input"
			placeholder="Judul (opsional)..."
			maxlength="80"
			value={title}
			oninput={(event) => onTitleInput((event.currentTarget as HTMLInputElement).value)}
		/>

		<div class="divider-line"></div>

		<textarea
			class="write-textarea"
			placeholder="Tulis apa saja yang ingin kamu ceritakan..."
			rows="12"
			value={content}
			oninput={(event) => onContentInput((event.currentTarget as HTMLTextAreaElement).value)}
			onkeydown={handleKeydown}
		></textarea>

		<div class="write-footer">
			<span class="char-count">{charCount} karakter</span>
		</div>

		<div class="divider-line"></div>

		<div class="mood-bar">
			<span class="mood-bar-label">Mood:</span>
			{#each moods as mood}
				<button
					type="button"
					class:selected={mood.value === selectedMood}
					class="mood-emoji"
					onclick={() => onMoodSelect(mood.value)}
				>
					{mood.emoji}
				</button>
			{/each}

			<button class="submit-btn" type="button" onclick={onSubmit}>
				Kirim
				<Icons name="send" size={14} />
			</button>
		</div>
	</div>

	<div class:show={showHint} class="floating-hint">Tidak perlu sempurna, tulis saja dulu.</div>
</section>
