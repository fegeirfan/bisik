<script lang="ts">
	import type { DiaryEntry, MoodOption } from '$lib/types/diary';
	import { formatFullDate, getMoodMeta } from '$lib/utils/diary';
	import Icons from '$lib/components/icons/Icons.svelte';

	let {
		greeting,
		entryCount,
		streak,
		currentMood,
		moods,
		recentEntry,
		recentInsight,
		onStartWriting,
		onQuickMood,
		onOpenChat
	} = $props<{
		greeting: string;
		entryCount: number;
		streak: number;
		currentMood: MoodOption;
		moods: MoodOption[];
		recentEntry?: DiaryEntry;
		recentInsight: string;
		onStartWriting: () => void;
		onQuickMood: (mood: MoodOption['value']) => void;
		onOpenChat: () => void;
	}>();
</script>

<section class="page page-home active">
	<div class="home-shell">
		<p class="greeting-eyebrow">{greeting}</p>
		<h1 class="greeting-title">Apa yang ingin kamu <em>ceritakan</em> hari ini?</h1>
		<p class="greeting-sub">
			Tidak perlu sempurna. Tulis saja apa yang ada di pikiranmu, lalu biarkan ruang ini menampungnya.
		</p>

		<button class="cta-btn" type="button" onclick={onStartWriting}>
			<Icons name="edit" size={16} />
			Mulai Menulis
		</button>

		<div class="stats-strip">
			<div class="stat-item">
				<div class="stat-val">{entryCount}</div>
				<div class="stat-label">Entri</div>
			</div>
			<div class="stat-divider"></div>
			<div class="stat-item">
				<div class="stat-val">{streak}</div>
				<div class="stat-label">Hari berturut</div>
			</div>
			<div class="stat-divider"></div>
			<div class="stat-item">
				<div class="stat-val">{currentMood.emoji}</div>
				<div class="stat-label">Mood terkini</div>
			</div>
		</div>

		<div class="mood-quick">
			<p class="mood-quick-label">Bagaimana perasaanmu sekarang?</p>
			<div class="mood-quick-row">
				{#each moods as mood}
					<button class="mood-quick-item" type="button" onclick={() => onQuickMood(mood.value)}>
						{mood.emoji}
					</button>
				{/each}
			</div>
		</div>

		{#if recentEntry}
			<button class="recent-card" type="button" onclick={onOpenChat}>
				<div class="recent-card-eyebrow">✦ Insight terakhir</div>
				<p class="recent-card-text">{recentInsight}</p>
				<div class="recent-card-meta">
					<span>{getMoodMeta(recentEntry.mood).emoji}</span>
					<span>{formatFullDate(recentEntry.createdAt)}</span>
				</div>
			</button>
		{/if}
	</div>
</section>
