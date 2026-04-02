import { moods } from '$lib/data/diary';
import type { DiaryEntry, MoodValue } from '$lib/types/diary';

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
	day: '2-digit',
	month: 'long',
	year: 'numeric'
});

const monthFormatter = new Intl.DateTimeFormat('id-ID', {
	month: 'long',
	year: 'numeric'
});

const weekdayFormatter = new Intl.DateTimeFormat('id-ID', {
	weekday: 'short'
});

const timeFormatter = new Intl.DateTimeFormat('id-ID', {
	hour: '2-digit',
	minute: '2-digit'
});

export function getGreeting(date = new Date()) {
	const hour = date.getHours();

	if (hour < 5) return 'Malam yang sunyi';
	if (hour < 11) return 'Selamat Pagi';
	if (hour < 15) return 'Selamat Siang';
	if (hour < 18) return 'Selamat Sore';
	return 'Selamat Malam';
}

export function getMoodMeta(mood: MoodValue) {
	return moods.find((item) => item.value === mood) ?? moods[1];
}

export function formatMonthLabel(value: string) {
	return monthFormatter.format(new Date(value));
}

export function formatDay(value: string) {
	return new Date(value).getDate().toString().padStart(2, '0');
}

export function formatWeekday(value: string) {
	return weekdayFormatter.format(new Date(value)).replace('.', '');
}

export function formatFullDate(value: string) {
	return dateFormatter.format(new Date(value));
}

export function formatTime(value: string) {
	return timeFormatter.format(new Date(value));
}

export function groupEntriesByMonth(entries: DiaryEntry[]) {
	const groups = new Map<string, DiaryEntry[]>();

	for (const entry of entries) {
		const monthKey = monthFormatter.format(new Date(entry.createdAt));
		const current = groups.get(monthKey) ?? [];
		current.push(entry);
		groups.set(monthKey, current);
	}

	return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

export function buildInsight(entries: DiaryEntry[], mood: MoodValue, content: string) {
	const moodCount = entries.filter((entry) => entry.mood === mood).length;
	const lines = content.split(/[.!?]/).filter(Boolean).length;

	if (mood === 'tired') return 'Nada tulisanmu menunjukkan kamu sedang butuh jeda yang lembut.';
	if (mood === 'sad') return 'Tulisan ini terasa seperti permintaan untuk dipeluk, bukan diperbaiki.';
	if (mood === 'happy') return 'Ada energi lega di tulisanmu. Momen seperti ini layak kamu simpan.';
	if (mood === 'frustrated') return 'Kamu sedang banyak menahan tekanan. Menyederhanakan satu prioritas bisa membantu.';
	if (moodCount >= 2) return 'Pola emosi ini muncul beberapa kali. Mungkin ada benang merah yang sedang berulang.';
	if (lines >= 4) return 'Tulisanmu mengalir panjang hari ini. Biasanya itu tanda ada banyak yang ingin dikeluarkan.';
	return 'Ada banyak kejujuran di entri ini, dan itu sudah sangat berarti.';
}

export function countStreak(entries: DiaryEntry[]) {
	const uniqueDates = Array.from(
		new Set(entries.map((entry) => new Date(entry.createdAt).toISOString().slice(0, 10)))
	).sort((a, b) => (a < b ? 1 : -1));

	if (uniqueDates.length === 0) return 0;

	let streak = 1;

	for (let index = 1; index < uniqueDates.length; index += 1) {
		const current = new Date(uniqueDates[index - 1]);
		const next = new Date(uniqueDates[index]);
		const diff = Math.round((current.getTime() - next.getTime()) / 86_400_000);

		if (diff === 1) {
			streak += 1;
			continue;
		}

		break;
	}

	return streak;
}

export function createId(prefix: string) {
	return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
