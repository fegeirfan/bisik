<script lang="ts">
	import type { DiaryEntry, MoodOption } from '$lib/types/diary';
	import { formatDay, formatMonthLabel, formatWeekday, getMoodMeta } from '$lib/utils/diary';

	let {
		entries,
		trail,
		expandedIds,
		onToggleEntry
	} = $props<{
		entries: DiaryEntry[];
		trail: MoodOption[];
		expandedIds: Set<string>;
		onToggleEntry: (id: string) => void;
	}>();

	const monthGroups = $derived.by(() => {
		const grouped = new Map<string, DiaryEntry[]>();

		for (const entry of entries) {
			const label = formatMonthLabel(entry.createdAt);
			grouped.set(label, [...(grouped.get(label) ?? []), entry]);
		}

		return Array.from(grouped.entries()).map(([label, items]) => ({ label, items }));
	});
</script>

<section class="page page-timeline active">
	<div class="timeline-container">
		<div class="timeline-header">
			<h2 class="timeline-title">Jejak Ceritamu</h2>
			<p class="timeline-sub">Setiap entri adalah versi dirimu yang berbeda.</p>
		</div>

		<div class="emotion-trail" aria-label="Ringkasan mood">
			{#each trail as mood}
				<div class="trail-bar" style:height={`${mood.energy}%`} style:background={mood.color}></div>
			{/each}
		</div>

		{#each monthGroups as group}
			<div class="month-group">
				<div class="month-label">{group.label}</div>

				{#each group.items as entry}
					<button class="entry-card" type="button" onclick={() => onToggleEntry(entry.id)}>
						<div class="entry-date-col">
							<div class="entry-day">{formatDay(entry.createdAt)}</div>
							<div class="entry-weekday">{formatWeekday(entry.createdAt)}</div>
						</div>

						<div class="entry-card-inner">
							<div class="entry-mood-row">
								<span class="entry-mood">{getMoodMeta(entry.mood).emoji}</span>
								{#if entry.tag}
									<span class="entry-tag">{entry.tag}</span>
								{/if}
							</div>

							<p class="entry-preview">{entry.content}</p>
							<div class="entry-insight">✦ <span>AI: {entry.insight}</span></div>

							{#if expandedIds.has(entry.id)}
								<div class="entry-expand open">
									<div class="entry-expand-inner">
										{#if entry.title}
											<strong>{entry.title}</strong><br />
										{/if}
										{entry.content}
										{#if entry.refinedJournal}
											<br /><br />
											<strong>Refined journal</strong><br />
											{entry.refinedJournal.content}
										{/if}
									</div>
								</div>
							{/if}
						</div>
					</button>
				{/each}
			</div>
		{/each}
	</div>
</section>
