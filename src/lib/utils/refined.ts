import type { DiaryEntry, MoodValue, RefinedJournal } from '$lib/types/diary';
import { createId } from '$lib/utils/diary';

const moodOpeners: Record<MoodValue, string> = {
	happy: 'Hari ini terasa lebih ringan dari biasanya.',
	neutral: 'Hari ini terasa penuh dan cukup rumit untuk diproses.',
	sad: 'Hari ini menyisakan rasa berat yang pelan-pelan ingin dipahami.',
	tired: 'Tubuh dan pikiran sama-sama sedang meminta jeda.',
	frustrated: 'Ada tekanan yang terasa menumpuk dan butuh ruang untuk dilepas.'
};

export function buildRefinedJournal(entry: Pick<DiaryEntry, 'id' | 'title' | 'content' | 'mood' | 'insight'>): RefinedJournal {
	const sanitizedContent = entry.content.trim().replace(/\s+/g, ' ');
	const summary = entry.insight;
	const title = entry.title?.trim() || 'Refined Journal';
	const content = `${moodOpeners[entry.mood]}\n\n${sanitizedContent}\n\nCatatan refleksi: ${summary}`;

	return {
		id: createId('refined'),
		diaryEntryId: entry.id,
		title,
		content,
		summary,
		createdAt: new Date().toISOString()
	};
}
